import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { useAuth } from '../../contexts/AuthContext';
import { ResumeService } from '../../services/resumeService';
import { ResumeData, ResumeColor } from '../../types/resume';

interface DownloadDropdownProps {
  data: ResumeData;
  templateId?: number;
  color?: ResumeColor;
  resumeId?: number;
}

const DownloadDropdown: React.FC<DownloadDropdownProps> = ({
  data,
  templateId = 0,
  color,
  resumeId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Save resume to Supabase
  const saveResumeToDatabase = async () => {
    if (!user) {
      console.log('User not authenticated, skipping database save');
      return;
    }

    try {
      console.log('Saving resume before download...');
      const savedResume = await ResumeService.autoSave(
        data,
        templateId,
        color || { primary: '#000000', background: '#ffffff' },
        user.user_id.toString(),
        resumeId
      );
      console.log('Resume saved successfully:', savedResume);
    } catch (error) {
      console.error('Failed to save resume:', error);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setIsOpen(false);

    // Save to database when downloading
    await saveResumeToDatabase();

    try {
      // Wait a bit for dropdown to close
      await new Promise(resolve => setTimeout(resolve, 100));

      const element = document.getElementById('resume-preview');
      if (!element) {
        console.error('Resume element not found');
        alert('Resume element not found. Please try again.');
        return;
      }

      // Temporarily hide borders and shadows for PDF
      const resumeContent = element.querySelector('.right-content') as HTMLElement;
      const originalBoxShadow = resumeContent?.style.boxShadow || '';
      const originalBorder = resumeContent?.style.border || '';

      if (resumeContent) {
        resumeContent.style.boxShadow = 'none';
        resumeContent.style.border = 'none';
      }

      console.log('Getting resume HTML...');
      const html = element.outerHTML;

      // Restore original styles
      if (resumeContent) {
        resumeContent.style.boxShadow = originalBoxShadow;
        resumeContent.style.border = originalBorder;
      }

      // Get all stylesheets
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n');

      // Remove lab() color functions from styles (not supported by html2canvas)
      const cleanedStyles = styles.replace(/lab\([^)]+\)/g, '#000000');

      // Create complete HTML document
      const completeHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              ${cleanedStyles}
              body { margin: 0; padding: 0; }
              #resume-preview { background: white !important; }
              .right-content { box-shadow: none !important; border: none !important; }
              * { color: #000000 !important; border-color: #000000 !important; }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `;

      console.log('Generating PDF using html2canvas and jsPDF...');

      // Create a temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = completeHTML;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '850px';
      document.body.appendChild(tempContainer);

      try {
        // Wait for fonts and images to load
        await new Promise(resolve => setTimeout(resolve, 100));

        // Use html2canvas to capture the content
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          foreignObjectRendering: false
        });

        // Create PDF with jsPDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // Download the PDF
        pdf.save(`${data.contact?.name?.replace(/\s+/g, '_') || 'resume'}.pdf`);
        console.log('PDF downloaded successfully');
      } finally {
        // Clean up
        document.body.removeChild(tempContainer);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDOC = async () => {
    setIsDownloading(true);
    setIsOpen(false);

    // Save to database when downloading
    await saveResumeToDatabase();

    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Header - Name
              new Paragraph({
                text: data.contact?.name || 'Your Name',
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
              }),

              // Contact Info
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${data.contact?.phone || ''} | ${data.contact?.email || ''} | ${data.contact?.address || ''}`,
                    size: 20,
                  }),
                ],
                spacing: { after: 400 },
              }),

              // Objective
              ...(data.objective ? [
                new Paragraph({
                  text: 'ABOUT ME',
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: data.objective,
                  spacing: { after: 400 },
                }),
              ] : []),

              // Education
              ...(data.education && data.education.length > 0 ? [
                new Paragraph({
                  text: 'EDUCATION',
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                ...data.education.flatMap((edu: any) => [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${edu.year || edu.duration || ''} - ${edu.course || edu.degree || ''}`,
                        bold: true,
                      }),
                    ],
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    text: edu.institution || '',
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    text: edu.achievements || edu.description || '',
                    spacing: { after: 300 },
                  }),
                ]),
              ] : []),

              // Experience
              ...(data.experience && data.experience.length > 0 ? [
                new Paragraph({
                  text: 'EXPERIENCE',
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                ...data.experience.flatMap((exp: any) => [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${exp.year || exp.duration || ''} - ${exp.position || ''}`,
                        bold: true,
                      }),
                    ],
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    text: exp.company || '',
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    text: exp.description || '',
                    spacing: { after: 300 },
                  }),
                ]),
              ] : []),

              // Skills
              ...(data.skills && data.skills.length > 0 ? [
                new Paragraph({
                  text: 'SKILLS',
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: data.skills.join(', '),
                  spacing: { after: 400 },
                }),
              ] : []),

              // References
              ...(data.references && data.references.length > 0 ? [
                new Paragraph({
                  text: 'REFERENCES',
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                ...data.references.flatMap((ref: any) => [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: ref.name || '',
                        bold: true,
                      }),
                    ],
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    text: `${ref.desig || ref.position || ''}`,
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    text: `${ref.phone || ''} | ${ref.email || ''}`,
                    spacing: { after: 300 },
                  }),
                ]),
              ] : []),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${data.contact?.name || 'resume'}.docx`);
    } catch (error) {
      console.error('Error generating DOC:', error);
      alert('Failed to generate DOC. Please try again.');
    } finally {
      setIsDownloading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-pink-500 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDownloading}
      >
        {isDownloading ? '⏳ Downloading...' : '📥 Download'}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] overflow-hidden z-[100] min-w-[200px] animate-slideDown">
          <button
            className="block w-full px-5 py-3 text-left bg-white border-none text-[15px] font-medium text-gray-800 cursor-pointer transition-colors duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-200"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            📄 Download as PDF
          </button>

        </div>
      )}
    </div>
  );
};

export default DownloadDropdown;
