// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { motion, MotionProps } from 'framer-motion';

export interface GlassmorphismCardProps extends Omit<MotionProps, 'children'> {
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  blur?: number;
  opacity?: number;
  shadowIntensity?: 'subtle' | 'medium' | 'intense' | 'quantum';
  hoverEffect?: boolean;
  shimmerEffect?: boolean;
  pulseEffect?: boolean;
  crystalLiquidEffect?: boolean;
  dimensionalEffect?: boolean;
  quantumEntanglement?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  className = '',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  borderColor = 'rgba(255, 255, 255, 0.2)',
  borderWidth = 1,
  borderRadius = 16,
  blur = 20,
  opacity = 1,
  shadowIntensity = 'quantum',
  hoverEffect = true,
  shimmerEffect = true,
  pulseEffect = false,
  crystalLiquidEffect = true,
  dimensionalEffect = false,
  quantumEntanglement = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  ...motionProps
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Configuración de sombras cuánticas
  const shadowConfig = useMemo(() => {
    switch (shadowIntensity) {
      case 'subtle':
        return '0 4px 20px rgba(0, 0, 0, 0.1)';
      case 'medium':
        return '0 8px 32px rgba(0, 0, 0, 0.15)';
      case 'intense':
        return '0 16px 64px rgba(0, 0, 0, 0.25)';
      case 'quantum':
        return `
          0 0 40px rgba(0, 212, 255, 0.3),
          0 0 80px rgba(255, 0, 255, 0.2),
          0 0 120px rgba(255, 215, 0, 0.1),
          inset 0 0 20px rgba(255, 255, 255, 0.1)
        `;
      default:
        return '0 8px 32px rgba(0, 0, 0, 0.15)';
    }
  }, [shadowIntensity]);

  // Efectos de hover cuánticos
  const hoverVariants = useMemo(() => {
    if (!hoverEffect) return {};
    
    return {
      hover: {
        scale: 1.02,
        y: -5,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20
        }
      },
      tap: {
        scale: 0.98,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 10
        }
      }
    };
  }, [hoverEffect]);

  // Efecto de pulso dimensional
  const pulseVariants = useMemo(() => {
    if (!pulseEffect) return {};
    
    return {
      animate: {
        boxShadow: [
          shadowConfig,
          '0 0 60px rgba(0, 212, 255, 0.6), 0 0 120px rgba(255, 0, 255, 0.4)',
          shadowConfig
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }
    };
  }, [pulseEffect, shadowConfig]);

  // Efecto de brillo cuántico
  const shimmerStyle = useMemo(() => {
    if (!shimmerEffect) return {};
    
    return {
      position: 'relative' as const,
      overflow: 'hidden' as const,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `linear-gradient(
          45deg,
          transparent 30%,
          rgba(255, 255, 255, 0.1) 50%,
          transparent 70%
        )`,
        transform: `translateX(${mousePosition.x - 50}%) translateY(${mousePosition.y - 50}%)`,
        transition: 'transform 0.6s ease-out',
        pointerEvents: 'none' as const
      }
    };
  }, [shimmerEffect, mousePosition]);

  // Manejadores de eventos con efectos cuánticos
  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave?.();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shimmerEffect) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  // Efecto de cristal líquido
  const crystalLiquidStyle = useMemo(() => {
    if (!crystalLiquidEffect) return {};
    
    return {
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      background: isHovered 
        ? `linear-gradient(135deg, ${backgroundColor}, rgba(255, 255, 255, 0.2))`
        : backgroundColor,
      border: `${borderWidth}px solid ${isHovered ? 'rgba(255, 255, 255, 0.4)' : borderColor}`,
      boxShadow: isHovered 
        ? `${shadowConfig}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
        : shadowConfig,
      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
    };
  }, [crystalLiquidEffect, blur, backgroundColor, borderColor, borderWidth, isHovered, shadowConfig]);

  // Efecto dimensional
  const dimensionalStyle = useMemo(() => {
    if (!dimensionalEffect) return {};
    
    return {
      transformStyle: 'preserve-3d' as const,
      perspective: '1000px',
      transform: isHovered 
        ? 'rotateX(5deg) rotateY(5deg) translateZ(20px)'
        : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
      transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
    };
  }, [dimensionalEffect, isHovered]);

  // Entrelazamiento cuántico
  const quantumEntanglementStyle = useMemo(() => {
    if (!quantumEntanglement) return {};
    
    return {
      position: 'relative' as const,
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: `${borderRadius}px`,
        background: `conic-gradient(from 0deg, transparent, ${borderColor}, transparent, ${borderColor}, transparent)`,
        animation: 'quantum-spin 4s linear infinite',
        zIndex: -1,
        padding: '2px'
      },
      '@keyframes quantum-spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' }
      }
    };
  }, [quantumEntanglement, borderColor, borderRadius]);

  // Estilos base combinados
  const combinedStyles = {
    ...crystalLiquidStyle,
    ...dimensionalStyle,
    ...quantumEntanglementStyle,
    borderRadius: `${borderRadius}px`,
    opacity,
    cursor: onClick ? 'pointer' : 'default'
  };

  return (
    <motion.div
      className={`relative ${className}`}
      style={combinedStyles}
      variants={hoverVariants}
      whileHover={hoverVariants.hover}
      whileTap={hoverVariants.tap}
      animate={pulseVariants.animate}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      {...motionProps}
    >
      {/* Efecto de brillo interior */}
      {shimmerEffect && isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)`,
            mixBlendMode: 'overlay' as const,
            opacity: 0.6
          }}
        />
      )}
      
      {/* Partículas cuánticas flotantes */}
      {quantumEntanglement && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white opacity-60"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="relative z-10 h-full">
        {children}
      </div>
      
      {/* Reflejo de cristal */}
      {crystalLiquidEffect && (
        <div 
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
            opacity: isHovered ? 0.8 : 0.4,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </motion.div>
  );
};

// Variantes predefinidas para uso rápido
export const QuantumCard = (props: Omit<GlassmorphismCardProps, 'crystalLiquidEffect' | 'dimensionalEffect'>) => (
  <GlassmorphismCard
    crystalLiquidEffect={true}
    dimensionalEffect={true}
    shadowIntensity="quantum"
    {...props}
  />
);

export const DimensionalCard = (props: Omit<GlassmorphismCardProps, 'dimensionalEffect' | 'quantumEntanglement'>) => (
  <GlassmorphismCard
    dimensionalEffect={true}
    quantumEntanglement={true}
    shadowIntensity="quantum"
    {...props}
  />
);

export const CrystalLiquidCard = (props: Omit<GlassmorphismCardProps, 'crystalLiquidEffect' | 'shimmerEffect'>) => (
  <GlassmorphismCard
    crystalLiquidEffect={true}
    shimmerEffect={true}
    shadowIntensity="intense"
    {...props}
  />
);

export default GlassmorphismCard;