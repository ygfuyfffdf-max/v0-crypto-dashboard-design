// 🚀 KOCMOK ANIMATED LOGO - CHRONOS INFINITY
// Logo animado con efectos de rotación y pulso para el sistema CHRONOS

import React from 'react';
import { motion } from 'framer-motion';

interface KocmokAnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const KocmokAnimatedLogo: React.FC<KocmokAnimatedLogoProps> = ({ 
  size = 'lg', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const ringSizes = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
    xl: 'w-64 h-64'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer rotating ring */}
      <motion.div
        className={`absolute inset-0 ${ringSizes[size]} border-4 border-purple-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
          <div className="w-3 h-3 bg-pink-400 rounded-full shadow-lg shadow-pink-400/50" />
        </div>
      </motion.div>

      {/* Middle rotating ring */}
      <motion.div
        className={`absolute inset-0 ${ringSizes[size]} border-2 border-blue-500 rounded-full`}
        animate={{ rotate: -360 }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute top-1/2 left-0 transform -translate-x-2 -translate-y-1/2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50" />
        </div>
        <div className="absolute top-1/2 right-0 transform translate-x-2 -translate-y-1/2">
          <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50" />
        </div>
      </motion.div>

      {/* Center logo with pulse effect */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50`}>
          <div className="text-white font-bold text-center">
            <div className={`${
              size === 'sm' ? 'text-xs' :
              size === 'md' ? 'text-sm' :
              size === 'lg' ? 'text-lg' :
              'text-2xl'
            }`}>
              KOC
            </div>
            <div className={`${
              size === 'sm' ? 'text-[8px]' :
              size === 'md' ? 'text-[10px]' :
              size === 'lg' ? 'text-xs' :
              'text-sm'
            } opacity-80`}>
              MOK
            </div>
          </div>
        </div>
      </motion.div>

      {/* Orbiting elements */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 ${
          size === 'sm' ? 'w-2 h-2' :
          size === 'md' ? 'w-3 h-3' :
          size === 'lg' ? 'w-4 h-4' :
          'w-6 h-6'
        } bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg`} />
        <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 ${
          size === 'sm' ? 'w-2 h-2' :
          size === 'md' ? 'w-3 h-3' :
          size === 'lg' ? 'w-4 h-4' :
          'w-6 h-6'
        } bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg`} />
      </motion.div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            "0 0 20px rgba(168, 85, 247, 0.5)",
            "0 0 40px rgba(168, 85, 247, 0.8)",
            "0 0 20px rgba(168, 85, 247, 0.5)"
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default KocmokAnimatedLogo;