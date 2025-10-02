import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import CarPredictionForm from './components/CarPredictionForm';
import Background3D from './components/Background3D';
import Header from './components/Header';
import ParticleBackground from './components/ParticleBackground';

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* 3D Background */}
      <Suspense fallback={null}>
        <Background3D />
      </Suspense>
      
      {/* Main Content */}
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
  );
}

export default App;
