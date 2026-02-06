import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CustomCursor } from './components/CustomCursor';
import { Header } from './components/Header';
import { AIChat } from './components/AIChat';
import { Background3D } from './components/Background3D';
import { Home } from './pages/Home';
import { WorkDetail } from './pages/WorkDetail';
import { Admin } from './pages/Admin';
import { DataProvider } from './context/DataContext';

// Scroll to top wrapper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <DataProvider>
      <Router>
        <div className="relative min-h-screen bg-transparent text-primary selection:bg-white selection:text-black">
          <ScrollToTop />
          {!isMobile && <CustomCursor />}
          
          <Background3D />
          <Header />
          
          <main className="relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work/:id" element={<WorkDetail />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          
          <AIChat />
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;