import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData } from '../types/resume';

// PDF Generation using html2canvas and jsPDF
export const generatePDF = async (elementId: string, filename: string = 'resume') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Create canvas from HTML element - reduced scale for smaller file size
    const canvas = await html2canvas(element, {
      scale: 1.5, // Reduced from 2 for smaller file size
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // Use JPEG instead of PNG for smaller file size
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    
    // Create PDF with compression enabled
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page with JPEG compression
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'MEDIUM');
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'MEDIUM');
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// DOC Generation using docx library
export const generateDOC = async (data: ResumeData, filename: string = 'resume') => {
  try {
    const doc = new Document({
      sections: [
        {
          children: [
            // Header with name
            new Paragraph({
              children: [
                new TextRun({
                  text: data.contact?.name || 'Your Name',
                  bold: true,
                  size: 32,
                  color: '1f4e79',
                }),
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 200 },
            }),

            // Contact Information
            new Paragraph({
              children: [
                new TextRun({
                  text: `Mobile: ${data.contact?.phone || ''} | `,
                  size: 20,
                }),
                new TextRun({
                  text: `Email: ${data.contact?.email || ''}`,
                  size: 20,
                  color: '0066cc',
                }),
                ...(data.contact?.github ? [
                  new TextRun({
                    text: ` | GitHub: ${data.contact.github}`,
                    size: 20,
                    color: '0066cc',
                  })
                ] : []),
                ...(data.contact?.linkedin ? [
                  new TextRun({
                    text: ` | LinkedIn: ${data.contact.linkedin}`,
                    size: 20,
                    color: '0066cc',
                  })
                ] : []),
              ],
              spacing: { after: 300 },
            }),

            // Objective Section
            ...(data.objective ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'OBJECTIVE',
                    bold: true,
                    size: 24,
                    color: '1f4e79',
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.objective,
                    size: 20,
                  }),
                ],
                spacing: { after: 300 },
              }),
            ] : []),

            // Skills Section
            ...(data.skills && data.skills.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'SKILLS',
                    bold: true,
                    size: 24,
                    color: '1f4e79',
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.skills.join(', '),
                    size: 20,
                  }),
                ],
                spacing: { after: 300 },
              }),
            ] : []),

            // Experience Section
            ...(data.experience && data.experience.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'EXPERIENCE',
                    bold: true,
                    size: 24,
                    color: '1f4e79',
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              ...data.experience.flatMap(exp => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${exp.company || ''} | ${exp.location || ''}`,
                      bold: true,
                      size: 20,
                      color: '1f4e79',
                    }),
                    new TextRun({
                      text: `\t${exp.year || ''}`,
                      bold: true,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 50 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.position || '',
                      italics: true,
                      bold: true,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${exp.description || ''}`,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              ]),
            ] : []),

            // Education Section
            ...(data.education && data.education.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'EDUCATION',
                    bold: true,
                    size: 24,
                    color: '1f4e79',
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              ...data.education.flatMap(edu => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${edu.institution || ''} | ${edu.year || ''}`,
                      bold: true,
                      size: 20,
                      color: '1f4e79',
                    }),
                  ],
                  spacing: { after: 50 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.course || '',
                      italics: true,
                      bold: true,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                ...(edu.description ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `• ${edu.description}`,
                        size: 20,
                      }),
                    ],
                    spacing: { after: 100 },
                  }),
                ] : []),
              ]),
            ] : []),

            // Certifications Section
            ...(data.certifications && data.certifications.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'CERTIFICATIONS',
                    bold: true,
                    size: 24,
                    color: '1f4e79',
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              ...data.certifications.map(cert => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${cert.course || ''} - ${cert.institution || ''}`,
                      bold: true,
                      size: 20,
                    }),
                    new TextRun({
                      text: `\t${cert.year || ''}`,
                      bold: true,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 50 },
                })
              ),
            ] : []),

            // Projects Section
            ...(data.projects && data.projects.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'PROJECTS',
                    bold: true,
                    size: 24,
                    color: '1f4e79',
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              ...data.projects.map(project => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${project.title || ''}: ${project.description || ''}`,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 50 },
                })
              ),
            ] : []),
          ],
        },
      ],
    });

    // Generate and save the document
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
  } catch (error) {
    console.error('Error generating DOC:', error);
    throw new Error('Failed to generate DOC');
  }
};



// Print function (for browser's print dialog)
export const printResume = () => {
  window.print();
};