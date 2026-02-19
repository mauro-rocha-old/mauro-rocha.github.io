import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Project } from "../types";
import { MagneticButton } from "./MagneticButton";
import { ProjectCard } from "./Works/ProjectCard";

export const Projects: React.FC = () => {
  const { projects, language } = useData();

  if (!projects || projects.length === 0) {
    return null;
  }

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="work"
      className="py-20 relative bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10"
      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 1400px" }}
    >
      <div className="container mx-auto px-6 mb-16">
        <h2 className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-4">
          {language === "pt-BR" ? "Trabalhos Selecionados" : "Selected Works"}
        </h2>
      </div>

      <div className="flex flex-col">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
      <div className="container mx-auto flex justify-center md:mb-12 md:mt-4 -mt-4 mb-8">
        <MagneticButton onClick={scrollToContact}>
          <button
            type="button"
            className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3 rounded-full font-bold uppercase text-sm tracking-widest bg-white text-black transition-colors interactive"
          >
            {language === "pt-BR" ? "Fale comigo" : "Let’s Talk"}
          </button>
        </MagneticButton>
      </div>
      <div className="border-b border-white/10 w-full"></div>
    </section>
  );
};
