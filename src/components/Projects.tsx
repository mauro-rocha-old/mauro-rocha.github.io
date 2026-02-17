import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Project } from "../types";
import { MagneticButton } from "./MagneticButton";

const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const { language } = useData();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      viewport={{ once: true }}
      onClick={() => navigate(`/work/${project.id}`)}
      className="group relative w-full border-t border-white/10 py-12 md:py-24 cursor-pointer interactive hover:bg-white/5 transition-colors duration-300"
    >
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
        <div className="w-full md:w-1/2">
          <span className="text-sm font-mono text-accent mb-2 block">
            {project.year} — {project.category[language]}
          </span>
          <h3 className="text-4xl md:text-6xl font-display font-bold uppercase transition-colors duration-300 text-white group-hover:text-blue-300 drop-shadow-md">
            {project.title}
          </h3>
          <p className="mt-4 text-gray-300 max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0 text-lg">
            {project.description[language]}
          </p>
        </div>

        <div className="w-full md:w-1/3 relative overflow-hidden rounded-lg aspect-video md:aspect-[4/3] transform transition-transform duration-700 md:scale-0 md:group-hover:scale-100 md:origin-center md:absolute md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:opacity-0 md:group-hover:opacity-100 z-10 pointer-events-none shadow-2xl border border-white/10">
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            width={1200}
            height={900}
            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
          />
        </div>

        <div className="hidden md:block">
          <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300 bg-black/40 backdrop-blur-md">
            <ArrowUpRight className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

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
      <div className="container mx-auto px-6 mt-16 flex justify-center my-4">
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
