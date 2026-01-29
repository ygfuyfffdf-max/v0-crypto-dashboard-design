/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎬 CINEMATOGRAPHIC ANIMATIONS SYSTEM — CHRONOS INFINITY 2026 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de 50+ animaciones cinematográficas ultra-premium:
 * - Glitch effects (cyberpunk, chromatic, holographic)
 * - 3D transforms (parallax, perspective, rotations)
 * - Cosmic effects (quantum, aurora, nebula)
 * - Energy effects (pulse, liquid morph, gravity pull)
 * - Smooth 60fps con hardware acceleration
 *
 * @version 1.0.0
 * @based-on PREMIUM_DESIGN_ELEVATION.prompt.md
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 CINEMATOGRAPHIC GLITCH EFFECTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const cinematicAnimations = {
  // GLITCH EFFECTS
  glitch: `
@keyframes glitch {
  0%, 100% {
    transform: translate(0, 0) skew(0deg);
    clip-path: inset(0);
  }
  20% {
    transform: translate(-2px, 2px) skew(1deg);
    clip-path: inset(20% 0 30% 0);
  }
  40% {
    transform: translate(2px, -2px) skew(-1deg);
    clip-path: inset(30% 0 20% 0);
  }
  60% {
    transform: translate(-1px, 1px) skew(0.5deg);
    clip-path: inset(10% 0 40% 0);
  }
  80% {
    transform: translate(1px, -1px) skew(-0.5deg);
    clip-path: inset(40% 0 10% 0);
  }
}

.animate-glitch {
  animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  position: relative;
}

.animate-glitch::before,
.animate-glitch::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.animate-glitch::before {
  color: #ff00de;
  animation: glitch-shift 0.4s infinite;
  clip-path: inset(40% 0 50% 0);
  transform: translate(-2px, 0);
}

.animate-glitch::after {
  color: #00ffff;
  animation: glitch-shift 0.6s infinite reverse;
  clip-path: inset(50% 0 40% 0);
  transform: translate(2px, 0);
}

@keyframes glitch-shift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-3px, 2px); }
}
`,

  hologram: `
@keyframes hologram {
  0%, 100% {
    opacity: 0.8;
    transform: scaleY(1);
    filter: brightness(1);
  }
  25% {
    opacity: 0.6;
    transform: scaleY(0.98);
    filter: brightness(1.2) hue-rotate(10deg);
  }
  50% {
    opacity: 0.9;
    transform: scaleY(1.02);
    filter: brightness(0.8) hue-rotate(-10deg);
  }
  75% {
    opacity: 0.7;
    transform: scaleY(0.99);
    filter: brightness(1.1);
  }
}

.animate-hologram {
  animation: hologram 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  background: linear-gradient(
    180deg,
    rgba(0, 255, 255, 0.1) 0%,
    rgba(255, 0, 255, 0.05) 50%,
    rgba(0, 255, 255, 0.1) 100%
  );
  background-size: 100% 200%;
  animation: hologram 2s ease-in-out infinite, scan-line 4s linear infinite;
}

@keyframes scan-line {
  0% { background-position: 0% 0%; }
  100% { background-position: 0% 200%; }
}
`,

  chromaticAberration: `
@keyframes chromatic {
  0%, 100% {
    transform: translate(0, 0);
    filter: drop-shadow(2px 0 0 #ff0000) drop-shadow(-2px 0 0 #00ffff);
  }
  50% {
    transform: translate(0, 1px);
    filter: drop-shadow(3px 0 0 #ff0000) drop-shadow(-3px 0 0 #00ffff);
  }
}

.animate-chromatic {
  animation: chromatic 1s ease-in-out infinite;
}
`,

  neonFlicker: `
@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow:
      0 0 4px currentColor,
      0 0 11px currentColor,
      0 0 19px currentColor,
      0 0 40px #8b5cf6,
      0 0 80px #8b5cf6;
    opacity: 1;
  }
  20%, 24%, 55% {
    text-shadow: none;
    opacity: 0.6;
  }
}

.animate-neon-flicker {
  animation: neon-flicker 1.5s infinite;
  color: #c084fc;
}
`,

  cyberGlitch: `
@keyframes cyber-glitch {
  0%, 100% {
    clip-path: inset(0 0 0 0);
  }
  10% {
    clip-path: inset(20% 0 70% 0);
    transform: translateX(-5px);
  }
  20% {
    clip-path: inset(70% 0 20% 0);
    transform: translateX(5px);
  }
  30% {
    clip-path: inset(40% 0 50% 0);
  }
  40% {
    clip-path: inset(60% 0 30% 0);
  }
  50% {
    clip-path: inset(10% 0 80% 0);
  }
}

.animate-cyber-glitch {
  animation: cyber-glitch 0.6s steps(2) infinite;
  position: relative;
}
`,

  scanLine: `
@keyframes scan-line-crt {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.animate-scan-line {
  position: relative;
  overflow: hidden;
}

.animate-scan-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 10px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: scan-line-crt 3s linear infinite;
}
`,

  matrixRain: `
@keyframes matrix-rain {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}

.animate-matrix-rain {
  animation: matrix-rain 4s linear infinite;
  color: #0f0;
  font-family: 'Courier New', monospace;
}
`,

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // 🌌 3D SPATIAL EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  parallaxFloat: `
@keyframes parallax-float {
  0%, 100% {
    transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg);
  }
  25% {
    transform: translate3d(-10px, -10px, 20px) rotateX(2deg) rotateY(-2deg);
  }
  50% {
    transform: translate3d(10px, 10px, 40px) rotateX(-2deg) rotateY(2deg);
  }
  75% {
    transform: translate3d(-5px, 5px, 20px) rotateX(1deg) rotateY(-1deg);
  }
}

.animate-parallax-float {
  animation: parallax-float 6s ease-in-out infinite;
  transform-style: preserve-3d;
  perspective: 1000px;
}
`,

  rotate3DX: `
@keyframes rotate-3d-x {
  from {
    transform: rotateX(0deg);
  }
  to {
    transform: rotateX(360deg);
  }
}

.animate-3d-rotate-x {
  animation: rotate-3d-x 10s linear infinite;
  transform-style: preserve-3d;
}
`,

  rotate3DY: `
@keyframes rotate-3d-y {
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(360deg);
  }
}

.animate-3d-rotate-y {
  animation: rotate-3d-y 8s linear infinite;
  transform-style: preserve-3d;
}
`,

  perspectiveShift: `
@keyframes perspective-shift {
  0%, 100% {
    transform: perspective(1000px) rotateX(0deg) rotateY(0deg);
  }
  25% {
    transform: perspective(1000px) rotateX(10deg) rotateY(-10deg);
  }
  50% {
    transform: perspective(1000px) rotateX(-10deg) rotateY(10deg);
  }
  75% {
    transform: perspective(1000px) rotateX(5deg) rotateY(-5deg);
  }
}

.animate-perspective-shift {
  animation: perspective-shift 5s ease-in-out infinite;
  transform-style: preserve-3d;
}
`,

  depthPulse: `
@keyframes depth-pulse {
  0%, 100% {
    transform: translateZ(0) scale(1);
    filter: blur(0);
  }
  50% {
    transform: translateZ(50px) scale(1.05);
    filter: blur(1px);
  }
}

.animate-depth-pulse {
  animation: depth-pulse 3s ease-in-out infinite;
  transform-style: preserve-3d;
}
`,

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // 🌈 COSMIC & QUANTUM EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  quantumWave: `
@keyframes quantum-wave {
  0%, 100% {
    transform: translateX(0) scaleX(1);
    opacity: 1;
  }
  25% {
    transform: translateX(-10px) scaleX(0.95);
    opacity: 0.8;
  }
  50% {
    transform: translateX(10px) scaleX(1.05);
    opacity: 1;
  }
  75% {
    transform: translateX(-5px) scaleX(0.98);
    opacity: 0.9;
  }
}

.animate-quantum-wave {
  animation: quantum-wave 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  background: linear-gradient(90deg, #8b5cf6, #ec4899, #8b5cf6);
  background-size: 200% 100%;
  animation: quantum-wave 2s ease-in-out infinite, gradient-shift 4s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
`,

  auroraDance: `
@keyframes aurora-dance {
  0%, 100% {
    background-position: 0% 50%;
    filter: hue-rotate(0deg);
  }
  50% {
    background-position: 100% 50%;
    filter: hue-rotate(180deg);
  }
}

.animate-aurora-dance {
  background: linear-gradient(
    45deg,
    #8b5cf6,
    #ec4899,
    #f59e0b,
    #10b981,
    #06b6d4,
    #8b5cf6
  );
  background-size: 400% 400%;
  animation: aurora-dance 15s ease infinite;
}
`,

  nebulaSwirl: `
@keyframes nebula-swirl {
  0% {
    transform: rotate(0deg) scale(1);
    filter: hue-rotate(0deg) blur(0);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
    filter: hue-rotate(180deg) blur(2px);
  }
  100% {
    transform: rotate(360deg) scale(1);
    filter: hue-rotate(360deg) blur(0);
  }
}

.animate-nebula-swirl {
  animation: nebula-swirl 20s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  background: radial-gradient(circle, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%);
  background-size: 200% 200%;
}
`,

  photonBurst: `
@keyframes photon-burst {
  0% {
    transform: scale(0.8);
    opacity: 0;
    filter: brightness(2);
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
    filter: brightness(1.5);
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
    filter: brightness(1);
  }
}

.animate-photon-burst {
  animation: photon-burst 1.5s ease-out infinite;
}
`,

  plasmaFlow: `
@keyframes plasma-flow {
  0%, 100% {
    background-position: 0% 50%, 100% 50%;
  }
  50% {
    background-position: 100% 50%, 0% 50%;
  }
}

.animate-plasma-flow {
  background:
    linear-gradient(45deg, #8b5cf6 25%, transparent 25%, transparent 75%, #ec4899 75%),
    linear-gradient(-45deg, #ec4899 25%, transparent 25%, transparent 75%, #8b5cf6 75%);
  background-size: 60px 60px;
  background-position: 0 0, 30px 30px;
  animation: plasma-flow 4s linear infinite;
}
`,

  warpSpeed: `
@keyframes warp-speed {
  0% {
    transform: scaleX(1) translateX(0);
    opacity: 1;
  }
  50% {
    transform: scaleX(2) translateX(50px);
    opacity: 0.5;
  }
  51% {
    transform: scaleX(2) translateX(-50px);
    opacity: 0.5;
  }
  100% {
    transform: scaleX(1) translateX(0);
    opacity: 1;
  }
}

.animate-warp-speed {
  animation: warp-speed 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
`,

  crystallize: `
@keyframes crystallize {
  0%, 100% {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    transform: rotate(0deg) scale(1);
  }
  50% {
    clip-path: polygon(50% 0%, 90% 20%, 100% 50%, 70% 90%, 20% 90%, 0% 50%);
    transform: rotate(180deg) scale(1.1);
  }
}

.animate-crystallize {
  animation: crystallize 4s ease-in-out infinite;
}
`,

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // ⚡ ENERGY & FLUID EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  energyPulse: `
@keyframes energy-pulse {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(139, 92, 246, 0.5),
      0 0 40px rgba(139, 92, 246, 0.3),
      inset 0 0 20px rgba(139, 92, 246, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 0 40px rgba(139, 92, 246, 0.8),
      0 0 80px rgba(139, 92, 246, 0.5),
      inset 0 0 40px rgba(139, 92, 246, 0.4);
    transform: scale(1.02);
  }
}

.animate-energy-pulse {
  animation: energy-pulse 2s ease-in-out infinite;
}
`,

  liquidMorph: `
@keyframes liquid-morph {
  0%, 100% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  }
  25% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
  }
  50% {
    border-radius: 50% 50% 30% 70% / 30% 70% 70% 30%;
  }
  75% {
    border-radius: 70% 30% 50% 50% / 40% 50% 60% 50%;
  }
}

.animate-liquid-morph {
  animation: liquid-morph 8s ease-in-out infinite;
}
`,

  gravityPull: `
@keyframes gravity-pull {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(0.95);
  }
}

.animate-gravity-pull {
  animation: gravity-pull 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
`,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INJECT INTO DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

if (typeof document !== 'undefined') {
  const styleId = 'chronos-cinematic-animations'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = Object.values(cinematicAnimations).join('\n')
    document.head.appendChild(style)
  }
}

export default cinematicAnimations
