import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, X, Car, Zap } from 'lucide-react';

interface PredictionResultProps {
  price: number;
  onClose: () => void;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ price, onClose }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPriceCategory = (price: number) => {
    if (price < 50000) return { category: 'Entry Level', color: 'text-green-400', icon: Car };
    if (price < 150000) return { category: 'Mid-Range', color: 'text-blue-400', icon: TrendingUp };
    if (price < 300000) return { category: 'High-End', color: 'text-purple-400', icon: Zap };
    return { category: 'Supercar', color: 'text-red-400', icon: TrendingUp };
  };

  const priceCategory = getPriceCategory(price);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl border border-green-400/30 backdrop-blur-sm"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-500/20 rounded-full">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Prediction Result</h3>
            <p className="text-white/70">AI-powered price estimate</p>
          </div>
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white/70" />
        </motion.button>
      </div>

      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-4"
        >
          <div className="text-6xl font-bold text-white mb-2">
            {formatPrice(price)}
          </div>
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 ${priceCategory.color}`}>
            <priceCategory.icon className="w-4 h-4" />
            <span className="font-medium">{priceCategory.category}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
        >
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-white">
              {Math.round(price / 1000)}K
            </div>
            <div className="text-white/70 text-sm">Estimated Value</div>
          </div>
          
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-green-400">
              ±{Math.round(price * 0.1 / 1000)}K
            </div>
            <div className="text-white/70 text-sm">Confidence Range</div>
          </div>
          
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-blue-400">
              AI
            </div>
            <div className="text-white/70 text-sm">Powered</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 bg-white/5 rounded-xl"
        >
          <p className="text-white/80 text-sm">
            This prediction is based on machine learning analysis of similar vehicles. 
            Actual market prices may vary based on condition, location, and market conditions.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PredictionResult;
