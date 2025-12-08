import React from "react";
import { ResumeData, ResumeColor } from "../../types/resume";

// Template Imports (Tailwind-based)
import Template0 from "./templates/Template1";
import Template1 from "./templates/Template2";
import Template2 from "./templates/Template3";
import Template3 from "./templates/Template4";
import Template4 from "./templates/Template5";
import Template5 from "./templates/Template6";
import Template6 from "./templates/Template7";
import Template7 from "./templates/Template8";
import Template8 from "./templates/Template9";
import Template9 from "./templates/Template10";
import Template10 from "./templates/Template11";

interface ResumeProps {
  data: ResumeData;
  color: ResumeColor;
  selectedTemplate?: number;
}

const Resume: React.FC<ResumeProps> = ({
  data,
  color,
  selectedTemplate = 0,
}) => {
  // ✅ Dynamic template rendering
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 0:
        return <Template0 data={data} color={color} />;
      case 1:
        return <Template1 data={data} color={color} />;
      case 2:
        return <Template2 data={data} color={color} />;
      case 3:
        return <Template3 data={data} color={color} />;
      case 4:
        return <Template4 data={data} color={color} />;
      case 5:
        return <Template5 data={data} color={color} />;
      case 6:
        return <Template6 data={data} color={color} />;
      case 7:
        return <Template7 data={data} color={color} />;
      case 8:
        return <Template8 data={data} color={color} />;
      case 9:
        return <Template9 data={data} color={color} />;
      case 10:
        return <Template10 data={data} color={color} />;
      default:
        return <Template0 data={data} color={color} />;
    }
  };

  return (
    <div
      id="resume-preview"
      className="w-full flex justify-center bg-white min-h-full overflow-auto print:bg-white print:p-0"
    >
      {renderTemplate()}
    </div>
  );
};

export default Resume;
