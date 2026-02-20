import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import React from "react";
import { useData } from "../context/DataContext";
import { MagneticButton } from "./MagneticButton";

export const Hero: React.FC = () => {
  const { content, language } = useData();
  const t = content.hero;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 100, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const titleParts = t.title[language].split(" ");
  const titleFirst = titleParts[0];
  const titleSecond = titleParts.slice(1).join(" ");
  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex flex-col justify-center relative px-6 pt-20 overflow-hidden">
      {/* Strong gradient overlay for text readability against 3D elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent z-0 pointer-events-none" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container mx-auto relative z-10"
      >
        <div className="overflow-hidden">
          <motion.h2
            variants={item}
            className="text-xl md:text-2xl font-light text-blue-400 mb-4 tracking-widest uppercase drop-shadow-md"
          >
            {t.role[language]}
          </motion.h2>
        </div>

        <div className="">
          <motion.h1
            variants={item}
            className="text-7xl md:text-[10rem] font-display font-bold leading-[1] tracking-tighter mb-6 drop-shadow-2xl text-white"
          >
            <MagneticButton className="inline-block">
              <span className="text-white hover:text-blue-300 interactive drop-shadow-md">
                {titleFirst}
              </span>
            </MagneticButton>
            <br />
            <MagneticButton className="inline-block">
              <span className="text-white hover:text-blue-300 transition-colors interactive drop-shadow-md">
                {titleSecond}
              </span>
            </MagneticButton>
          </motion.h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mt-12 md:mt-24">
          <motion.div
            variants={item}
            className="max-w-md p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 shadow-2xl"
          >
            <p className="text-lg md:text-xl text-gray-100 leading-relaxed shadow-black drop-shadow-md font-medium interactive">
              {t.subtitle[language]}
            </p>
            <div className="mt-6 w-fit">
              <MagneticButton onClick={scrollToContact}>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 border border-white/40 px-5 py-2.5 rounded-full font-bold uppercase text-xs tracking-widest bg-white text-black hover:bg-gray-200 hover:text-black transition-colors interactive"
                >
                  {language === "pt-BR" ? "Fale comigo" : "Let’s Talk"}
                </button>
              </MagneticButton>
            </div>
          </motion.div>

          <motion.div variants={item} className="mt-12 md:mt-0">
            <MagneticButton
              onClick={scrollToContact}
              className="group flex items-center gap-4 interactive"
            >
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300 bg-black/40 backdrop-blur-md">
                <ArrowDown className="w-6 h-6 animate-bounce" />
              </div>
              <span className="uppercase tracking-widest text-sm drop-shadow-md font-bold">
                {t.cta[language]}
              </span>
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
