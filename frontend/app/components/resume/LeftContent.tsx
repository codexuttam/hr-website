import React from "react";
import Contact from "./sections/Contact";
import Skills from "./sections/Skills";
import Languages from "./sections/Languages";
import References from "./sections/References";
import Interests from "./sections/Interests";
import Tools from "./sections/Tools";
import { ResumeData, ResumeColor } from "../../types/resume";

interface LeftContentProps {
  data: ResumeData;
  color: ResumeColor;
}

const LeftContent: React.FC<LeftContentProps> = ({ data, color }) => {
  const hasContent = (item?: any[] | string | null) =>
    Array.isArray(item) ? item.length > 0 : !!item;

  return (
    <div
      className="left-content"
      style={{
        backgroundColor: color.background,
        padding: ".5rem",
        color: "#fff",
      }}
    >
      {/* Contact always visible */}
      <Contact data={data} color={color} />

      {/* Conditional sections */}
      {hasContent(data.skills) && <Skills data={data} color={color} />}
      {hasContent(data.tools) && <Tools data={data} color={color} />}
      {hasContent(data.languages) && <Languages data={data} color={color} />}
      {hasContent(data.interests) && <Interests data={data} color={color} />}
      {hasContent(data.references) && <References data={data} color={color} />}
    </div>
  );
};

export default LeftContent;
