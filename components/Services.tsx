import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';

export const Services: React.FC = () => {
  const { services, language } = useData();

  return (
    <section id="services" className="py-24 bg-[#0a0a0a]/95 backdrop-blur-xl relative border-b border-white/10">
      <div className="container mx-auto px-6">
        <h2 className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-16">
          {language === 'pt-BR' ? 'O Que Eu Faço' : 'What I Do'}
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
      </div>
    </section>
  );
};