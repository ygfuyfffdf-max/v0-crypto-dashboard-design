// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface CrystalLiquidButtonProps extends Omit<MotionProps, 'children'> {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'quantum' | 'dimensional' | 'crystal' | 'holographic';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'quantum';
  color?: string;
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  crystalEffect?: boolean;
  liquidEffect?: boolean;
  quantumRipple?: boolean;
  dimensionalShift?: boolean;
  holographicShimmer?: boolean;
  pulseAnimation?: boolean;
  glowIntensity?: 'subtle' | 'medium' | 'intense' | 'quantum';
  borderStyle?: 'solid' | 'gradient' | 'quantum' | 'none';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  soundEffect?: boolean;
  hapticFeedback?: boolean;
}

export const CrystalLiquidButton: React.FC<CrystalLiquidButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  color,
  active = false,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  crystalEffect = true,
  liquidEffect = true,
  quantumRipple = true,
  dimensionalShift = false,
  holographicShimmer = true,
  pulseAnimation = false,
  glowIntensity = 'quantum',
  borderStyle = 'quantum',
  icon,
  iconPosition = 'left',
  soundEffect = false,
  hapticFeedback = false,
  ...motionProps
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Configuración de colores cuánticos por variante
  const colorConfig = useMemo(() => {
    const baseColors = {
      primary: { main: '#00D4FF', secondary: '#0099CC', accent: '#66E6FF' },
      secondary: { main: '#FF00FF', secondary: '#CC00CC', accent: '#FF66FF' },
      quantum: { main: '#9400D3', secondary: '#7600A8', accent: '#B366E6' },
      dimensional: { main: '#00FF7F', secondary: '#00CC66', accent: '#66FFB3' },
      crystal: { main: '#E6F7FF', secondary: '#B3E6FF', accent: '#FFFFFF' },
      holographic: { main: '#FFD700', secondary: '#CCAA00', accent: '#FFE066' }
    };

    const config = baseColors[variant as keyof typeof baseColors] || baseColors.primary;
    return {
      main: color || config.main,
      secondary: config.secondary,
      accent: config.accent
    };
  }, [variant, color]);

  // Configuración de tamaños cuánticos
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          padding: 'py-2 px-3',
          text: 'text-sm',
          icon: 'w-4 h-4',
          minHeight: 'min-h-[32px]'
        };
      case 'lg':
        return {
          padding: 'py-4 px-6',
          text: 'text-lg',
          icon: 'w-6 h-6',
          minHeight: 'min-h-[56px]'
        };
      case 'xl':
        return {
          padding: 'py-5 px-8',
          text: 'text-xl',
          icon: 'w-7 h-7',
          minHeight: 'min-h-[64px]'
        };
      case 'quantum':
        return {
          padding: 'py-6 px-10',
          text: 'text-2xl',
          icon: 'w-8 h-8',
          minHeight: 'min-h-[80px]'
        };
      default:
        return {
          padding: 'py-3 px-4',
          text: 'text-base',
          icon: 'w-5 h-5',
          minHeight: 'min-h-[44px]'
        };
    }
  }, [size]);

  // Configuración de brillo cuántico
  const glowConfig = useMemo(() => {
    const mainColor = colorConfig.main;
    
    switch (glowIntensity) {
      case 'subtle':
        return `0 0 10px ${mainColor}40`;
      case 'medium':
        return `0 0 20px ${mainColor}60, 0 0 40px ${mainColor}30`;
      case 'intense':
        return `0 0 30px ${mainColor}80, 0 0 60px ${mainColor}40, 0 0 90px ${mainColor}20`;
      case 'quantum':
        return `
          0 0 20px ${mainColor}80,
          0 0 40px ${mainColor}60,
          0 0 80px ${mainColor}40,
          0 0 120px ${mainColor}20,
          inset 0 0 20px ${mainColor}20
        `;
      default:
        return `0 0 15px ${mainColor}50`;
    }
  }, [colorConfig.main, glowIntensity]);

  // Efectos de animación cuántica
  const buttonVariants = useMemo(() => {
    const baseVariants = {
      initial: {
        scale: 1,
        y: 0,
        boxShadow: active ? glowConfig : '0 4px 20px rgba(0, 0, 0, 0.1)'
      },
      hover: {
        scale: disabled ? 1 : 1.05,
        y: disabled ? 0 : -2,
        boxShadow: disabled 
          ? '0 4px 20px rgba(0, 0, 0, 0.1)' 
          : isHovered 
            ? `${glowConfig}, 0 8px 40px rgba(0, 0, 0, 0.2)`
            : glowConfig,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 25
        }
      },
      tap: {
        scale: disabled ? 1 : 0.95,
        y: disabled ? 0 : 0,
        transition: {
          type: 'spring',
          stiffness: 500,
          damping: 15
        }
      }
    };

    if (pulseAnimation) {
      baseVariants.pulse = {
        boxShadow: [
          glowConfig,
          `${glowConfig}, 0 0 60px ${colorConfig.main}90`,
          glowConfig
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      };
    }

    if (dimensionalShift) {
      baseVariants.hover.transform = 'scale(1.05) rotateX(5deg) rotateY(5deg) translateZ(10px)';
      baseVariants.hover.transformStyle = 'preserve-3d';
      baseVariants.hover.perspective = '1000px';
    }

    return baseVariants;
  }, [active, disabled, glowConfig, pulseAnimation, dimensionalShift, colorConfig.main, isHovered]);

  // Manejadores de eventos con efectos cuánticos
  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
      // Efecto háptico si está habilitado
      if (hapticFeedback && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const handleMouseDown = () => {
    if (!disabled) {
      setIsPressed(true);
      // Efecto de sonido si está habilitado
      if (soundEffect) {
        // Simular efecto de sonido cuántico
        console.log('🔮 Quantum sound effect activated');
      }
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Crear onda cuántica
    if (quantumRipple) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      const newRipple = {
        id: Date.now(),
        x,
        y
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 1000);
    }

    onClick?.();
  };

  // Limpiar ripple effects
  useEffect(() => {
    if (ripples.length > 5) {
      setRipples(prev => prev.slice(-5));
    }
  }, [ripples]);

  // Estilos base del botón
  const baseStyles = `
    relative overflow-hidden transition-all duration-300 ease-out
    ${sizeConfig.padding} ${sizeConfig.text} ${sizeConfig.minHeight}
    ${fullWidth ? 'w-full' : 'w-auto'}
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    ${loading ? 'cursor-wait' : ''}
    border-none outline-none
    font-semibold tracking-wide
    select-none
    transform-gpu
  `;

  // Estilos de fondo con efectos cuánticos
  const backgroundStyles = useMemo(() => {
    const mainColor = colorConfig.main;
    const secondaryColor = colorConfig.secondary;
    
    if (crystalEffect && liquidEffect) {
      return {
        background: active
          ? `linear-gradient(135deg, ${mainColor}40, ${secondaryColor}40)`
          : `linear-gradient(135deg, ${mainColor}20, ${secondaryColor}20)`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      };
    }
    
    if (crystalEffect) {
      return {
        background: active
          ? `${mainColor}30`
          : `${mainColor}20`,
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)'
      };
    }
    
    return {
      background: active
        ? `${mainColor}40`
        : `${mainColor}20`
    };
  }, [crystalEffect, liquidEffect, active, colorConfig]);

  // Estilos de borde cuántico
  const borderStyles = useMemo(() => {
    const mainColor = colorConfig.main;
    
    switch (borderStyle) {
      case 'gradient':
        return {
          border: `2px solid transparent`,
          backgroundImage: `linear-gradient(white, white), linear-gradient(45deg, ${mainColor}, ${colorConfig.accent})`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box'
        };
      case 'quantum':
        return {
          border: `2px solid ${mainColor}60`,
          boxShadow: `0 0 10px ${mainColor}40, inset 0 0 10px ${mainColor}20`
        };
      case 'none':
        return { border: 'none' };
      default:
        return {
          border: `1px solid ${mainColor}40`
        };
    }
  }, [borderStyle, colorConfig]);

  // Efecto holográfico
  const holographicStyle = useMemo(() => {
    if (!holographicShimmer) return {};
    
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
        background: `linear-gradient(45deg, transparent 30%, ${colorConfig.accent}40 50%, transparent 70%)`,
        transform: 'rotate(45deg)',
        transition: 'transform 0.6s ease-out',
        opacity: isHovered ? 0.8 : 0.4
      }
    };
  }, [holographicShimmer, colorConfig.accent, isHovered]);

  return (
    <motion.button
      className={baseStyles}
      style={{
        ...backgroundStyles,
        ...borderStyles,
        ...holographicStyle,
        color: active ? 'white' : colorConfig.main,
        textShadow: active ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none'
      }}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={pulseAnimation ? 'pulse' : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      disabled={disabled || loading}
      {...motionProps}
    >
      {/* Ondas cuánticas */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
              width: '10px',
              height: '10px',
              backgroundColor: colorConfig.accent,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 20, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Efecto de presión */}
      {isPressed && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${colorConfig.main}40 0%, transparent 70%)`,
            opacity: 0.6
          }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1.2 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Contenido del botón */}
      <div className={`relative z-10 flex items-center justify-center space-x-2 ${sizeConfig.text}`}>
        {loading && (
          <Loader2 className={`animate-spin ${sizeConfig.icon}`} />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className={sizeConfig.icon}>{icon}</span>
        )}
        
        <span className="relative z-10">{children}</span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span className={sizeConfig.icon}>{icon}</span>
        )}
      </div>

      {/* Efecto de brillo holográfico */}
      {holographicShimmer && isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${colorConfig.accent}40 50%, transparent 70%)`,
            mixBlendMode: 'overlay' as const
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  );
};

// Variantes predefinidas para uso rápido
export const QuantumButton = (props: Omit<CrystalLiquidButtonProps, 'variant' | 'crystalEffect' | 'liquidEffect'>) => (
  <CrystalLiquidButton
    variant="quantum"
    crystalEffect={true}
    liquidEffect={true}
    quantumRipple={true}
    glowIntensity="quantum"
    {...props}
  />
);

export const DimensionalButton = (props: Omit<CrystalLiquidButtonProps, 'variant' | 'dimensionalShift' | 'pulseAnimation'>) => (
  <CrystalLiquidButton
    variant="dimensional"
    dimensionalShift={true}
    pulseAnimation={true}
    glowIntensity="intense"
    {...props}
  />
);

export const HolographicButton = (props: Omit<CrystalLiquidButtonProps, 'variant' | 'holographicShimmer' | 'borderStyle'>) => (
  <CrystalLiquidButton
    variant="holographic"
    holographicShimmer={true}
    borderStyle="quantum"
    glowIntensity="quantum"
    {...props}
  />
);

export default CrystalLiquidButton;