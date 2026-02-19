import { motion } from "framer-motion";
import React from "react";
import { useData } from "../context/DataContext";
import { MagneticButton } from "./MagneticButton";

export const Services: React.FC = () => {
  const { services, language } = useData();
  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="services"
      className="py-24 bg-[#0a0a0a]/95 backdrop-blur-xl relative border-b border-white/10"
      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 1000px" }}
    >
      <div className="container mx-auto px-6">
        <h2 className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-16">
          {language === "pt-BR" ? "O Que Eu Faço" : "What I Do"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="group p-10 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors duration-300 bg-white/5 backdrop-blur-sm"
            >
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-4 group-hover:text-accent transition-colors text-white">
                {service.title[language]}
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {service.description[language]}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <MagneticButton onClick={scrollToContact}>
            <button
              type="button"
              className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3 rounded-full font-bold uppercase text-sm tracking-widest bg-white text-black transition-colors interactive"
            >
              {language === "pt-BR" ? "Solicitar Orçamento" : "Get a Quote"}
            </button>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
};
