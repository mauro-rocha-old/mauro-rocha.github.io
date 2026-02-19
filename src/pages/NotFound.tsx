import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MagneticButton } from '../components/MagneticButton';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <p className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">
          Erro 404
        </p>
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
          Página não encontrada
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10">
          O caminho que você tentou acessar não existe. Volte para a página inicial.
        </p>
        <MagneticButton onClick={() => navigate('/')}>
          <button className="px-8 py-4 rounded-full bg-white text-black font-bold uppercase text-sm tracking-widest hover:bg-gray-200 transition-colors">
            Voltar para Home
          </button>
        </MagneticButton>
      </div>
    </div>
  );
};
