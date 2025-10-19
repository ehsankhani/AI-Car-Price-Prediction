import React from 'react';
import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="glass rounded-3xl p-8 shadow-2xl mb-8 max-w-4xl mx-auto"
      >
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-5xl md:text-6xl font-bold text-center"
        >
          <span className="text-white block mb-2">AI Car</span>
          <span className="text-white/90 block text-4xl md:text-5xl font-semibold">Predictor</span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex justify-center items-center space-x-6 mt-6"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-white/70 text-sm">AI-Powered</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-white/70 text-sm">Instant Results</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <span className="text-white/70 text-sm">Sports Cars</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="text-xl text-white/80 mb-8 max-w-2xl mx-auto font-medium text-center"
      >
        Get instant, accurate price predictions for sports cars using cutting-edge AI technology
      </motion.p>
    </motion.header>
  );
};

export default Header;
