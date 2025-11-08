import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import CarPredictionForm from './components/CarPredictionForm';
import ImageBackground from './components/ImageBackground';
import ThreeBackground from './components/ThreeBackground';
import Header from './components/Header';
import ParticleBackground from './components/ParticleBackground';

function App() {
  const [introDone, setIntroDone] = useState(false);
  return (
    <BrowserRouter>
      <div className="min-h-screen relative overflow-hidden">
        {/* Particle Background */}
        <ParticleBackground />
        
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Fullscreen local GLB background */}
                <div className="fixed inset-0 z-0">
                  <ThreeBackground
                    modelUrl="/assets/lotus_elise.glb"
                    modelScale={8}
                    enableHover={true}
                    onIntroComplete={() => setIntroDone(true)}
                  />
                </div>
                <LandingContentWrapper introDone={introDone} />
              </>
            }
          />
          <Route
            path="/predict"
            element={
              <>
                <ImageBackground />
                <div className="relative z-10">
                  <Header />
                  <motion.main
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="container mx-auto px-4 py-8"
                  >
                    <CarPredictionForm />
                  </motion.main>
                </div>
              </>
            }
          />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;

function LandingContentWrapper({ introDone }: { introDone: boolean }) {
  return (
    <div className="relative z-10">
      {introDone && (
        <>
          <header className="container mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-white font-bold text-xl">Car Studio</h1>
            <Link to="/predict" className="px-5 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">Predict</Link>
          </header>
          <main className="container mx-auto px-4 pt-0 md:pt-2 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8 -mt-4 md:-mt-6"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-2 tracking-wider">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                  LOTUS
                </span>
                {' '}
                <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                ÉLISE
                </span>
              </h1>
            </motion.div>
            <DescriptionText />
          </main>
        </>
      )}
    </div>
  );
}

function DescriptionText() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
      transition={{ 
        duration: isVisible ? 0.8 : 1.2, 
        delay: isVisible ? 0.3 : 0,
        ease: "easeOut" 
      }}
      className="max-w-2xl mx-auto -mt-4"
    >
      <p className="text-sm md:text-base text-white/95 font-medium leading-relaxed mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] backdrop-blur-sm px-3 py-2 rounded-xl bg-black/20 border border-white/10 inline-block">
        Hover to bring life to the 3D model rendered in real-time
      </p>
    </motion.div>
  );
}
