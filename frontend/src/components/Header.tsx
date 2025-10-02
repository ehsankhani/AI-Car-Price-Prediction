import React from 'react';
import { motion } from 'framer-motion';
import { Car, Zap, TrendingUp } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex justify-center items-center mb-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20"
          />
          <div className="relative bg-white/10 backdrop-blur-lg rounded-full p-6 border border-white/20">
            <Car className="w-12 h-12 text-white" />
          </div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-6xl md:text-7xl font-bold mb-4"
      >
        <span className="gradient-text text-3d">AI Car</span>
        <br />
        <span className="neon-glow text-3d">Predictor</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-xl text-white mb-8 max-w-2xl mx-auto font-medium"
        style={{
          textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.3)'
        }}
      >
        Get instant, accurate price predictions for sports cars using cutting-edge AI technology
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="flex justify-center items-center space-x-8 text-white/60"
      >
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="text-sm">Instant Results</span>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <span className="text-sm">AI-Powered</span>
        </div>
        <div className="flex items-center space-x-2">
          <Car className="w-5 h-5 text-blue-400" />
          <span className="text-sm">Sports Cars</span>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;
