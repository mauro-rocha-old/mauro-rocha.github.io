import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';

const skills = [
  "React", "TypeScript", "Next.js", "Node.js", 
  "WebGL", "Three.js", "Framer Motion", "Tailwind CSS",
  "UI/UX Design", "Accessibility", "Performance", 
  "Conversational AI", "AI Integration"
];

export const About: React.FC = () => {
  const { content, language } = useData();
  const t = content.about;

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-16 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="flex flex-col gap-8">
              {/* Title - Moved to top */}
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-display font-bold text-white drop-shadow-md leading-tight"
              >
                {t.title[language]}
              </motion.h2>

              {/* Profile Picture - Moved below title */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                viewport={{ once: true }}
                className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl group"
              >
                 <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay z-10 group-hover:bg-transparent transition-colors duration-500" />
                 <img 
                   src={t.profileImage || "../images/profile.JPG"} 
                   alt="Mauro Rocha" 
                   className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                 />
                 {/* Modern scanline overlay effect */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20 group-hover:opacity-10 transition-opacity" />
              </motion.div>
            </div>
            
            <div className="space-y-8 md:pt-8">
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-xl text-gray-200 font-light leading-relaxed"
              >
                {t.p1[language]}
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-xl text-gray-300 font-light leading-relaxed"
              >
                {t.p2[language]}
              </motion.p>
              
              <div className="pt-8">
                <motion.h3 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                  className="text-sm font-mono uppercase tracking-widest mb-6 text-accent"
                >
                  {t.skillsTitle[language]}
                </motion.h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <motion.span 
                      key={skill} 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + idx * 0.05 }}
                      viewport={{ once: true }}
                      className="px-4 py-2 border border-white/20 rounded-full text-sm hover:bg-white hover:text-black transition-colors duration-300 cursor-default bg-white/5 backdrop-blur-md text-gray-200"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Infinite Scrolling Text */}
      <div className="mt-24 w-full overflow-hidden py-12 border-t border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl">
        <motion.div 
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12 px-6 items-center">
              <span className="text-7xl md:text-9xl font-display font-bold text-outline drop-shadow-sm">DISRUPTIVE</span>
              <span className="text-7xl md:text-9xl font-display font-bold text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">CREATIVE</span>
              <span className="text-7xl md:text-9xl font-display font-bold text-outline drop-shadow-sm">INNOVATIVE</span>
              <span className="text-7xl md:text-9xl font-display font-bold text-white drop-shadow-lg">BOLD</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};