import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Car, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import PredictionResult from './PredictionResult';
import FormField from './FormField';

interface CarData {
  car_make: string;
  car_model: string;
  year: number;
  engine_size: number;
  horsepower: number;
  torque: number;
  zero_to_sixty_time: number;
}

interface PredictionResponse {
  predicted_price_usd: number;
  error?: string;
}

const CarPredictionForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CarData>();

  const carMakes = [
    'Porsche', 'Lamborghini', 'Ferrari', 'Audi', 'McLaren', 'BMW',
    'Mercedes-Benz', 'Chevrolet', 'Ford', 'Nissan', 'Aston Martin',
    'Bugatti', 'Dodge', 'Jaguar', 'Koenigsegg', 'Lexus', 'Lotus',
    'Maserati', 'Tesla', 'Rimac'
  ];

  const onSubmit = async (data: CarData) => {
    setIsLoading(true);
    setShowResult(false);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Process form data to handle empty strings and convert to proper types
      const processedData: any = {};
      
      // Handle string fields
      if (data.car_make && data.car_make.trim() !== '') {
        processedData.car_make = data.car_make.trim();
      }
      if (data.car_model && data.car_model.trim() !== '') {
        processedData.car_model = data.car_model.trim();
      }
      
      // Handle numeric fields - only include if they have valid values
      if (data.year && data.year.toString().trim() !== '') {
        processedData.year = parseInt(data.year.toString());
      }
      if (data.engine_size && data.engine_size.toString().trim() !== '') {
        processedData.engine_size = parseFloat(data.engine_size.toString());
      }
      if (data.horsepower && data.horsepower.toString().trim() !== '') {
        processedData.horsepower = parseInt(data.horsepower.toString());
      }
      if (data.torque && data.torque.toString().trim() !== '') {
        processedData.torque = parseInt(data.torque.toString());
      }
      if (data.zero_to_sixty_time && data.zero_to_sixty_time.toString().trim() !== '') {
        processedData.zero_to_sixty_time = parseFloat(data.zero_to_sixty_time.toString());
      }
      
      console.log('API URL:', apiUrl);
      console.log('Original data:', data);
      console.log('Processed data:', processedData);
      
      const response = await axios.post<PredictionResponse>(
        `${apiUrl}/predict`,
        processedData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setPrediction(response.data.predicted_price_usd);
      setShowResult(true);
      toast.success('Prediction completed successfully!');
    } catch (error: any) {
      console.error('Prediction error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      let errorMessage = 'Failed to get prediction. Please try again.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    reset();
    setPrediction(null);
    setShowResult(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="glass rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
          >
            <Car className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Car Price Predictor</h2>
          <p className="text-white/70">Enter your car specifications to get an AI-powered price prediction</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Car Make"
              error={errors.car_make?.message}
            >
              <select
                {...register('car_make')}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              >
                <option value="" className="text-gray-800">Select Car Make</option>
                {carMakes.map((make) => (
                  <option key={make} value={make} className="text-gray-800">
                    {make}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Car Model"
              error={errors.car_model?.message}
            >
              <input
                type="text"
                {...register('car_model')}
                placeholder="e.g., 911, Huracan, 488 GTB"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </FormField>

            <FormField
              label="Year"
              error={errors.year?.message}
            >
              <input
                type="number"
                {...register('year', { 
                  min: { value: 2015, message: 'Year must be 2015 or later' },
                  max: { value: 2024, message: 'Year must be 2024 or earlier' }
                })}
                placeholder="e.g., 2022"
                min="2015"
                max="2024"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </FormField>

            <FormField
              label="Engine Size (L)"
              error={errors.engine_size?.message}
            >
              <select
                {...register('engine_size')}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              >
                <option value="" className="text-gray-800">Select Engine Size</option>
                <option value="0" className="text-gray-800">Electric (0L)</option>
                <option value="1.5" className="text-gray-800">1.5L</option>
                <option value="2.0" className="text-gray-800">2.0L</option>
                <option value="2.5" className="text-gray-800">2.5L</option>
                <option value="3.0" className="text-gray-800">3.0L</option>
                <option value="3.5" className="text-gray-800">3.5L</option>
                <option value="3.8" className="text-gray-800">3.8L</option>
                <option value="3.9" className="text-gray-800">3.9L</option>
                <option value="4.0" className="text-gray-800">4.0L</option>
                <option value="4.4" className="text-gray-800">4.4L</option>
                <option value="4.7" className="text-gray-800">4.7L</option>
                <option value="5.0" className="text-gray-800">5.0L</option>
                <option value="5.2" className="text-gray-800">5.2L</option>
                <option value="6.2" className="text-gray-800">6.2L</option>
                <option value="8.0" className="text-gray-800">8.0L</option>
              </select>
            </FormField>

            <FormField
              label="Horsepower"
              error={errors.horsepower?.message}
            >
              <input
                type="number"
                {...register('horsepower', { 
                  min: { value: 100, message: 'Horsepower must be at least 100' },
                  max: { value: 2000, message: 'Horsepower must be at most 2000' }
                })}
                placeholder="e.g., 500"
                min="100"
                max="2000"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </FormField>

            <FormField
              label="Torque (lb-ft)"
              error={errors.torque?.message}
            >
              <input
                type="number"
                {...register('torque', { 
                  min: { value: 100, message: 'Torque must be at least 100' },
                  max: { value: 2000, message: 'Torque must be at most 2000' }
                })}
                placeholder="e.g., 400"
                min="100"
                max="2000"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </FormField>

            <FormField
              label="0-60 MPH Time (seconds)"
              error={errors.zero_to_sixty_time?.message}
            >
              <input
                type="number"
                step="0.1"
                {...register('zero_to_sixty_time', { 
                  min: { value: 1, message: '0-60 time must be at least 1 second' },
                  max: { value: 10, message: '0-60 time must be at most 10 seconds' }
                })}
                placeholder="e.g., 3.5"
                min="1"
                max="10"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </FormField>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Car className="w-5 h-5 mr-2" />
                  Predict Price
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={resetForm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
            >
              Reset Form
            </motion.button>
          </div>
        </form>

        <AnimatePresence>
          {showResult && prediction && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <PredictionResult 
                price={prediction} 
                onClose={() => setShowResult(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CarPredictionForm;
