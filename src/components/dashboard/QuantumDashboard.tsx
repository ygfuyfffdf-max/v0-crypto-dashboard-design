import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Brain, 
  Infinity,
  Activity,
  Eye,
  Sparkles,
  Waves,
  Atom,
  Orbit,
  Galaxy
} from 'lucide-react';
import { useQuantumStore } from '../../hooks/useQuantumStore';
import { QuantumMetricsPanel } from './QuantumMetricsPanel';
import { DimensionalChart } from './DimensionalChart';
import { ConsciousnessMeter } from './ConsciousnessMeter';
import { InfinityScoreDisplay } from './InfinityScoreDisplay';
import { GlassmorphismCard } from '../ui/GlassmorphismCard';
import { QuantumAnimation } from '../animations/QuantumAnimation';
import { CrystalLiquidButton } from '../ui/CrystalLiquidButton';
import { HolographicDisplay } from '../ui/HolographicDisplay';
import { TemporalFlowVisualization } from './TemporalFlowVisualization';

export interface QuantumDashboardProps {
  className?: string;
  theme?: 'quantum-dark' | 'dimensional-light' | 'crystal-liquid' | 'holographic';
  density?: 'compact' | 'comfortable' | 'spacious';
  animationLevel?: 'minimal' | 'balanced' | 'spectacular';
}

export const QuantumDashboard: React.FC<QuantumDashboardProps> = ({
  className = '',
  theme = 'quantum-dark',
  density = 'comfortable',
  animationLevel = 'spectacular'
}) => {
  const { 
    quantumState, 
    dimensionalMetrics, 
    consciousnessLevel,
    infinityScore,
    isEternalMode,
    updateQuantumState 
  } = useQuantumStore();

  const [selectedDimension, setSelectedDimension] = useState<number>(3);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [temporalFlow, setTemporalFlow] = useState<number>(0);

  // Efectos cuánticos de tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setTemporalFlow(prev => (prev + 0.1) % 360);
      if (isEternalMode) {
        updateQuantumState();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isEternalMode, updateQuantumState]);

  // Memorización de métricas para máxima eficiencia
  const quantumMetrics = useMemo(() => ({
    coherence: quantumState.coherence,
    stability: quantumState.stability,
    resonance: quantumState.resonance,
    dimensionalIntegrity: quantumState.dimensionalIntegrity,
    consciousness: consciousnessLevel,
    infinity: infinityScore
  }), [quantumState, consciousnessLevel, infinityScore]);

  // Paleta de colores cuánticos adaptativos
  const quantumColors = useMemo(() => {
    const base = {
      primary: '#00D4FF',
      secondary: '#FF00FF',
      accent: '#FFD700',
      quantum: '#9400D3',
      dimensional: '#00FF7F'
    };

    switch (theme) {
      case 'dimensional-light':
        return {
          ...base,
          background: 'rgba(255, 255, 255, 0.05)',
          glass: 'rgba(255, 255, 255, 0.1)',
          text: '#1a1a1a'
        };
      case 'crystal-liquid':
        return {
          ...base,
          background: 'rgba(0, 212, 255, 0.03)',
          glass: 'rgba(255, 255, 255, 0.15)',
          text: '#E6F7FF'
        };
      case 'holographic':
        return {
          ...base,
          background: 'rgba(255, 215, 0, 0.02)',
          glass: 'rgba(255, 255, 255, 0.2)',
          text: '#FFFACD'
        };
      default:
        return {
          ...base,
          background: 'rgba(0, 0, 0, 0.3)',
          glass: 'rgba(0, 0, 0, 0.4)',
          text: '#FFFFFF'
        };
    }
  }, [theme]);

  // Configuración de densidad para máxima eficiencia
  const layoutConfig = useMemo(() => {
    switch (density) {
      case 'compact':
        return { spacing: 'space-y-2', padding: 'p-3', gap: 'gap-2', text: 'text-sm' };
      case 'spacious':
        return { spacing: 'space-y-8', padding: 'p-8', gap: 'gap-8', text: 'text-lg' };
      default:
        return { spacing: 'space-y-4', padding: 'p-6', gap: 'gap-4', text: 'text-base' };
    }
  }, [density]);

  // Variantes de animación según nivel
  const animationVariants = useMemo(() => {
    if (animationLevel === 'minimal') return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } };
    if (animationLevel === 'balanced') return { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: 'easeOut' } };
    
    return {
      initial: { opacity: 0, scale: 0.8, rotateY: -15 },
      animate: { opacity: 1, scale: 1, rotateY: 0 },
      transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] }
    };
  }, [animationLevel]);

  // Componente de tarjeta métrica cuántica
  const QuantumMetricCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    trend?: number;
    dimension?: number;
  }> = ({ title, value, icon, color, trend, dimension }) => (
    <GlassmorphismCard
      className={`relative overflow-hidden transition-all duration-300 ${
        hoveredCard === title ? 'scale-105 shadow-2xl' : 'hover:scale-102'
      }`}
      onMouseEnter={() => setHoveredCard(title)}
      onMouseLeave={() => setHoveredCard(null)}
      backgroundColor={quantumColors.glass}
      borderColor={color}
      borderWidth={2}
      borderRadius={16}
      blur={20}
    >
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
            {icon}
          </div>
          {trend && (
            <motion.div
              className={`flex items-center space-x-1 text-sm ${
                trend > 0 ? 'text-green-400' : 'text-red-400'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </motion.div>
          )}
        </div>
        
        <h3 className="text-sm font-medium opacity-80 mb-2" style={{ color: quantumColors.text }}>
          {title}
        </h3>
        
        <div className="flex items-baseline space-x-2">
          <motion.span
            className="text-3xl font-bold"
            style={{ color }}
            key={value}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {value.toFixed(dimension === 5 ? 3 : 2)}
          </motion.span>
          {dimension && (
            <span className="text-xs opacity-60" style={{ color: quantumColors.text }}>
              {dimension}D
            </span>
          )}
        </div>
      </div>
      
      {animationLevel === 'spectacular' && (
        <QuantumAnimation
          color={color}
          intensity={value / 100}
          temporalFlow={temporalFlow}
          className="absolute inset-0 opacity-30"
        />
      )}
    </GlassmorphismCard>
  );

  // Panel de control dimensional
  const DimensionalControlPanel: React.FC = () => (
    <GlassmorphismCard
      className="p-6"
      backgroundColor={quantumColors.glass}
      borderColor={quantumColors.quantum}
      borderWidth={2}
      borderRadius={20}
      blur={25}
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2" style={{ color: quantumColors.text }}>
        <Galaxy className="w-5 h-5" style={{ color: quantumColors.quantum }} />
        <span>Dimensional Control</span>
      </h3>
      
      <div className="space-y-4">
        {[3, 4, 5].map(dimension => (
          <CrystalLiquidButton
            key={dimension}
            onClick={() => setSelectedDimension(dimension)}
            active={selectedDimension === dimension}
            color={quantumColors.primary}
            size="md"
            className="w-full justify-start"
          >
            <div className="flex items-center space-x-3">
              <Orbit className="w-4 h-4" />
              <span>Dimensión {dimension}D</span>
              {selectedDimension === dimension && (
                <motion.div
                  className="ml-auto w-2 h-2 rounded-full"
                  style={{ backgroundColor: quantumColors.accent }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </div>
          </CrystalLiquidButton>
        ))}
      </div>
    </GlassmorphismCard>
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${className}`}>
      {/* Fondo cuántico animado */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${quantumColors.primary}40, transparent 70%),
                         conic-gradient(from ${temporalFlow}deg, ${quantumColors.primary}20, ${quantumColors.secondary}20, ${quantumColors.accent}20, ${quantumColors.primary}20)`
          }}
        />
        {animationLevel === 'spectacular' && (
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-full h-px opacity-30"
                style={{
                  background: `linear-gradient(90deg, transparent, ${quantumColors.primary}, transparent)`,
                  top: `${20 + i * 15}%`
                }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                  repeat: Infinity,
                  duration: 10 + i * 2,
                  ease: 'linear'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Header cuántico */}
      <motion.header 
        className={`${layoutConfig.padding} pt-8`}
        variants={animationVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.div
              className="relative"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            >
              <Atom className="w-12 h-12" style={{ color: quantumColors.primary }} />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
              >
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: quantumColors.accent }} />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                CHRONOS INFINITY
              </h1>
              <p className="text-sm opacity-70" style={{ color: quantumColors.text }}>
                Quantum Control Dashboard • {selectedDimension}D Universe
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <InfinityScoreDisplay 
              score={infinityScore}
              color={quantumColors.accent}
              size="lg"
            />
            <HolographicDisplay
              data={{ 
                consciousness: consciousnessLevel,
                dimension: selectedDimension,
                temporal: temporalFlow 
              }}
              color={quantumColors.quantum}
            />
          </div>
        </div>
      </motion.header>

      {/* Grid principal de métricas cuánticas */}
      <div className={`${layoutConfig.padding} ${layoutConfig.spacing}`}>
        <motion.div 
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${layoutConfig.gap}`}
          variants={animationVariants}
          initial="initial"
          animate="animate"
        >
          <QuantumMetricCard
            title="Quantum Coherence"
            value={quantumMetrics.coherence}
            icon={<Waves className="w-6 h-6" style={{ color: quantumColors.primary }} />}
            color={quantumColors.primary}
            trend={2.3}
            dimension={selectedDimension}
          />
          
          <QuantumMetricCard
            title="Dimensional Stability"
            value={quantumMetrics.stability}
            icon={<Shield className="w-6 h-6" style={{ color: quantumColors.secondary }} />}
            color={quantumColors.secondary}
            trend={1.8}
            dimension={selectedDimension}
          />
          
          <QuantumMetricCard
            title="Consciousness Level"
            value={quantumMetrics.consciousness}
            icon={<Brain className="w-6 h-6" style={{ color: quantumColors.quantum }} />}
            color={quantumColors.quantum}
            trend={5.2}
            dimension={selectedDimension}
          />
          
          <QuantumMetricCard
            title="Multiversal Resonance"
            value={quantumMetrics.resonance}
            icon={<Sparkles className="w-6 h-6" style={{ color: quantumColors.accent }} />}
            color={quantumColors.accent}
            trend={3.7}
            dimension={selectedDimension}
          />
        </motion.div>

        {/* Sección de visualizaciones dimensionales */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 ${layoutConfig.gap}`}>
          <motion.div 
            className="lg:col-span-2"
            variants={animationVariants}
            initial="initial"
            animate="animate"
          >
            <GlassmorphismCard
              className="h-96 p-6"
              backgroundColor={quantumColors.glass}
              borderColor={quantumColors.dimensional}
              borderWidth={2}
              borderRadius={24}
              blur={30}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2" style={{ color: quantumColors.text }}>
                <Eye className="w-5 h-5" style={{ color: quantumColors.dimensional }} />
                <span>Dimensional Visualization</span>
              </h3>
              <DimensionalChart
                data={dimensionalMetrics}
                dimensions={selectedDimension}
                color={quantumColors.dimensional}
                animationLevel={animationLevel}
              />
            </GlassmorphismCard>
          </motion.div>

          <motion.div variants={animationVariants} initial="initial" animate="animate">
            <DimensionalControlPanel />
          </motion.div>
        </div>

        {/* Panel de métricas avanzadas y flujo temporal */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 ${layoutConfig.gap}`}>
          <motion.div variants={animationVariants} initial="initial" animate="animate">
            <QuantumMetricsPanel
              metrics={quantumMetrics}
              colors={quantumColors}
              animationLevel={animationLevel}
              className="h-80"
            />
          </motion.div>

          <motion.div variants={animationVariants} initial="initial" animate="animate">
            <GlassmorphismCard
              className="h-80 p-6"
              backgroundColor={quantumColors.glass}
              borderColor={quantumColors.primary}
              borderWidth={2}
              borderRadius={24}
              blur={30}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2" style={{ color: quantumColors.text }}>
                <Activity className="w-5 h-5" style={{ color: quantumColors.primary }} />
                <span>Temporal Flow</span>
              </h3>
              <TemporalFlowVisualization
                flow={temporalFlow}
                color={quantumColors.primary}
                dimension={selectedDimension}
                animationLevel={animationLevel}
              />
            </GlassmorphismCard>
          </motion.div>
        </div>

        {/* Panel de consciencia e integridad dimensional */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={animationVariants}
          initial="initial"
          animate="animate"
        >
          <ConsciousnessMeter
            level={consciousnessLevel}
            color={quantumColors.quantum}
            size="lg"
            animationLevel={animationLevel}
          />
          
          <div className="space-y-4">
            <GlassmorphismCard
              className="p-6"
              backgroundColor={quantumColors.glass}
              borderColor={quantumColors.dimensional}
              borderWidth={2}
              borderRadius={20}
              blur={25}
            >
              <h4 className="font-semibold mb-3 flex items-center space-x-2" style={{ color: quantumColors.text }}>
                <Infinity className="w-4 h-4" style={{ color: quantumColors.accent }} />
                <span>Eternal Status</span>
              </h4>
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: isEternalMode ? '#00FF00' : '#FF6B6B' }}
                  animate={{ scale: isEternalMode ? [1, 1.3, 1] : 1 }}
                  transition={{ repeat: isEternalMode ? Infinity : 0, duration: 2 }}
                />
                <span className="text-sm" style={{ color: quantumColors.text }}>
                  {isEternalMode ? 'Eternal Mode Active' : 'Temporal Mode'}
                </span>
              </div>
            </GlassmorphismCard>
            
            <CrystalLiquidButton
              onClick={() => setIsAnimating(!isAnimating)}
              active={isAnimating}
              color={quantumColors.secondary}
              size="md"
              className="w-full"
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>{isAnimating ? 'Disable Animations' : 'Enable Quantum Animations'}</span>
              </div>
            </CrystalLiquidButton>
          </div>
        </motion.div>
      </div>

      {/* Footer cuántico */}
      <motion.footer 
        className={`${layoutConfig.padding} pb-8 text-center`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm opacity-60" style={{ color: quantumColors.text }}>
          CHRONOS INFINITY 2026 • Quantum Consciousness Dashboard • Operating in {selectedDimension}D
        </p>
      </motion.footer>
    </div>
  );
};

export default QuantumDashboard;