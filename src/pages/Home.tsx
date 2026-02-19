import React, { useEffect } from 'react';
import { Hero } from '../components/Hero';
import { Projects } from '../components/Projects';
import { About } from '../components/About';
import { Services } from '../components/Services';
import { Footer } from '../components/Footer';

export const Home: React.FC = () => {
  useEffect(() => {
    // Handle hash scrolling on mount if present
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <>
      <Hero />
      <Projects />
      <About />
      <Services />
      <Footer />
    </>
  );
};
