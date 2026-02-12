import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface QuantumAnimationProps {
  color?: string;
  intensity?: number;
  temporalFlow?: number;
  dimension?: number;
  className?: string;
  type?: 'particles' | 'waves' | 'spiral' | 'grid' | 'orbital' | 'dimensional';
  particleCount?: number;
  speed?: number;
  interactive?: boolean;
  responsive?: boolean;
  glowEffect?: boolean;
  trailEffect?: boolean;
  quantumEntanglement?: boolean;
  multiversal?: boolean;
}

export const QuantumAnimation: React.FC<QuantumAnimationProps> = ({
  color = '#00D4FF',
  intensity = 0.5,
  temporalFlow = 0,
  dimension = 3,
  className = '',
  type = 'particles',
  particleCount = 50,
  speed = 1,
  interactive = false,
  responsive = true,
  glowEffect = true,
  trailEffect = true,
  quantumEntanglement = false,
  multiversal = false
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
    duration: number;
    path: string;
  }>>([]);

  // Generar partículas cuánticas
  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
      path: generateQuantumPath(i)
    }));
    setParticles(newParticles);
  }, [particleCount, dimension]);

  // Generar trayectoria cuántica basada en dimensión
  const generateQuantumPath = (index: number): string => {
    const baseAngle = (index / particleCount) * Math.PI * 2;
    const dimensionalOffset = dimension * 0.2;
    
    switch (dimension) {
      case 4:
        return `M50,50 Q${50 + Math.cos(baseAngle) * 30},${50 + Math.sin(baseAngle) * 30} ${50 + Math.cos(baseAngle + dimensionalOffset) * 40},${50 + Math.sin(baseAngle + dimensionalOffset) * 40}`;
      case 5:
        return `M50,50 C${50 + Math.cos(baseAngle) * 20},${50 + Math.sin(baseAngle) * 20} ${50 + Math.cos(baseAngle * 2) * 30},${50 + Math.sin(baseAngle * 2) * 30} ${50 + Math.cos(baseAngle + dimensionalOffset) * 35},${50 + Math.sin(baseAngle + dimensionalOffset) * 35}`;
      default:
        return `M50,50 L${50 + Math.cos(baseAngle) * 30},${50 + Math.sin(baseAngle) * 30}`;
    }
  };

  // Manejar interacción del mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  // Configuración de animación por tipo
  const animationConfig = useMemo(() => {
    const baseConfig = {
      particles: {
        variants: {
          initial: { opacity: 0, scale: 0 },
          animate: {
            opacity: [0, intensity, intensity * 0.8, 0],
            scale: [0, 1, 0.8, 0],
            transition: {
              duration: 3 / speed,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        },
        style: {
          filter: glowEffect ? `blur(${intensity}px) drop-shadow(0 0 ${intensity * 2}px ${color})` : 'none'
        }
      },
      waves: {
        variants: {
          initial: { pathLength: 0, opacity: 0 },
          animate: {
            pathLength: 1,
            opacity: [0, intensity, intensity, 0],
            transition: {
              pathLength: { duration: 2 / speed, ease: "easeInOut" },
              opacity: { duration: 2 / speed, ease: "easeInOut" }
            }
          }
        },
        style: {
          stroke: color,
          strokeWidth: 2,
          fill: 'none',
          filter: glowEffect ? `drop-shadow(0 0 ${intensity * 3}px ${color})` : 'none'
        }
      },
      spiral: {
        variants: {
          initial: { rotate: 0, scale: 0.5 },
          animate: {
            rotate: 360,
            scale: [0.5, 1, 0.5],
            transition: {
              rotate: { duration: 10 / speed, repeat: Infinity, ease: "linear" },
              scale: { duration: 5 / speed, repeat: Infinity, ease: "easeInOut" }
            }
          }
        },
        style: {
          filter: glowEffect ? `blur(${intensity / 2}px) drop-shadow(0 0 ${intensity * 2}px ${color})` : 'none'
        }
      },
      orbital: {
        variants: {
          initial: { rotate: 0 },
          animate: {
            rotate: 360,
            transition: {
              duration: 15 / speed,
              repeat: Infinity,
              ease: "linear"
            }
          }
        },
        style: {
          filter: glowEffect ? `drop-shadow(0 0 ${intensity * 2}px ${color})` : 'none'
        }
      }
    };

    return baseConfig[type] || baseConfig.particles;
  }, [type, intensity, speed, glowEffect, color]);

  // Renderizar animación según tipo
  const renderAnimation = () => {
    switch (type) {
      case 'particles':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: color,
                  boxShadow: `0 0 ${particle.size * 2}px ${color}`,
                  ...animationConfig.style
                }}
                variants={animationConfig.variants}
                initial="initial"
                animate="animate"
                transition={{
                  ...animationConfig.variants.animate.transition,
                  delay: particle.delay / speed
                }}
              />
            ))}
          </div>
        );

      case 'waves':
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            {[...Array(3)].map((_, i) => (
              <motion.circle
                key={i}
                cx="50"
                cy="50"
                r={20 + i * 15}
                variants={animationConfig.variants}
                initial="initial"
                animate="animate"
                transition={{
                  ...animationConfig.variants.animate.transition,
                  delay: i * 0.5 / speed
                }}
                style={animationConfig.style}
              />
            ))}
          </svg>
        );

      case 'spiral':
        return (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              className="relative"
              variants={animationConfig.variants}
              initial="initial"
              animate="animate"
              style={animationConfig.style}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: color,
                    left: `${50 + Math.cos((i / 8) * Math.PI * 2) * 30}%`,
                    top: `${50 + Math.sin((i / 8) * Math.PI * 2) * 30}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 2 / speed,
                    repeat: Infinity,
                    delay: i * 0.2 / speed
                  }}
                />
              ))}
            </motion.div>
          </div>
        );

      case 'orbital':
        return (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              className="relative w-20 h-20"
              variants={animationConfig.variants}
              initial="initial"
              animate="animate"
              style={animationConfig.style}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: color,
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${i * 120}deg) translateX(40px) translateY(-50%)`,
                    transformOrigin: 'center'
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 3 / speed,
                    repeat: Infinity,
                    delay: i * 0.3 / speed
                  }}
                />
              ))}
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  // Efectos de rastro temporal
  const trailEffects = trailEffect && (
    <div className="absolute inset-0 pointer-events-none">
      {particles.slice(0, 10).map((particle, i) => (
        <motion.div
          key={`trail-${particle.id}`}
          className="absolute w-1 h-1 rounded-full opacity-30"
          style={{
            backgroundColor: color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            filter: `blur(${intensity}px)`
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: 1 / speed,
            repeat: Infinity,
            delay: i * 0.1 / speed
          }}
        />
      ))}
    </div>
  );

  // Efectos de entrelazamiento cuántico
  const quantumEntanglementEffect = quantumEntanglement && (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
      {particles.slice(0, 5).map((particle, i) => (
        <motion.line
          key={`entangle-${particle.id}`}
          x1="50"
          y1="50"
          x2={particle.x}
          y2={particle.y}
          stroke={color}
          strokeWidth="0.5"
          opacity={intensity * 0.5}
          animate={{
            opacity: [intensity * 0.3, intensity * 0.7, intensity * 0.3],
            strokeWidth: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2 / speed,
            repeat: Infinity,
            delay: i * 0.2 / speed
          }}
          filter={`drop-shadow(0 0 ${intensity}px ${color})`}
        />
      ))}
    </svg>
  );

  // Efectos multiversales
  const multiversalEffect = multiversal && (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(dimension)].map((_, i) => (
        <motion.div
          key={`multiverse-${i}`}
          className="absolute inset-0"
          style={{
            border: `1px solid ${color}`,
            borderRadius: '50%',
            opacity: intensity * (0.2 - i * 0.05)
          }}
          animate={{
            scale: [1, 1.2 + i * 0.1, 1],
            rotate: [0, 360, 720]
          }}
          transition={{
            duration: (10 + i * 2) / speed,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );

  // Interacción con el mouse
  const mouseInteractionEffect = interactive && (
    <motion.div
      className="absolute w-4 h-4 rounded-full pointer-events-none"
      style={{
        left: `${mousePosition.x}%`,
        top: `${mousePosition.y}%`,
        backgroundColor: color,
        boxShadow: `0 0 ${intensity * 10}px ${color}`,
        transform: 'translate(-50%, -50%)'
      }}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity
      }}
    />
  );

  return (
    <div 
      className={`relative w-full h-full ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Animación principal */}
      {renderAnimation()}
      
      {/* Efectos adicionales */}
      <AnimatePresence>
        {trailEffects}
        {quantumEntanglementEffect}
        {multiversalEffect}
        {mouseInteractionEffect}
      </AnimatePresence>

      {/* Overlay temporal */}
      {temporalFlow !== undefined && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `conic-gradient(from ${temporalFlow}deg, transparent, ${color}, transparent)`,
            mixBlendMode: 'overlay'
          }}
        />
      )}
    </div>
  );
};

// Variantes predefinidas
export const QuantumParticles = (props: Omit<QuantumAnimationProps, 'type'>) => (
  <QuantumAnimation type="particles" {...props} />
);

export const QuantumWaves = (props: Omit<QuantumAnimationProps, 'type'>) => (
  <QuantumAnimation type="waves" {...props} />
);

export const QuantumSpiral = (props: Omit<QuantumAnimationProps, 'type'>) => (
  <QuantumAnimation type="spiral" {...props} />
);

export const QuantumOrbital = (props: Omit<QuantumAnimationProps, 'type'>) => (
  <QuantumAnimation type="orbital" {...props} />
);

export default QuantumAnimation;