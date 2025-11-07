import React, { useState } from 'react';
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

// Landing content that stays hidden until the 3D intro completes
function LandingContentWrapper({ introDone }: { introDone: boolean }) {
  return (
    <div className="relative z-10">
      {introDone && (
        <>
          <header className="container mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-white font-bold text-xl">Car Studio</h1>
            <Link to="/predict" className="px-5 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">Predict</Link>
          </header>
          <main className="container mx-auto px-4 pb-16 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold text-white mb-6"
            >
              LOTUS ÉLISE
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-white/80 max-w-2xl mx-auto mb-10"
            >
              Local 3D model rendered in real-time. Hover to bring it to life.
            </motion.p>
          </main>
        </>
      )}
    </div>
  );
}
