import type { Config } from "tailwindcss"

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🌟 CHRONOS INFINITY GEN5 — TAILWIND CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════
// Sistema de diseño de próxima generación
// Glassmorphism Gen5 + Neumorphism + Shaders + Animaciones cuánticas
// ═══════════════════════════════════════════════════════════════════════════════════════

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ═══════════════════ GEN5 COLORS ═══════════════════
      colors: {
        // Semantic colors using CSS variables
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // CHRONOS GEN5 Aurora Spectrum
        c: {
          void: "var(--c-void)",
          "void-soft": "var(--c-void-soft)",
          "void-deep": "var(--c-void-deep)",
          surface: "var(--c-surface)",
          elevated: "var(--c-elevated)",
          subtle: "var(--c-subtle)",
          accent: "var(--c-accent)",
          "accent-hover": "var(--c-accent-hover)",
          "accent-light": "var(--c-accent-light)",
          gold: "var(--c-gold)",
          "gold-hover": "var(--c-gold-hover)",
          pink: "var(--c-pink)",
          "pink-hover": "var(--c-pink-hover)",
          cyan: "var(--c-cyan)",
          "cyan-hover": "var(--c-cyan-hover)",
          success: "var(--c-success)",
          warning: "var(--c-warning)",
          error: "var(--c-error)",
          info: "var(--c-info)",
        },

        // Aurora colors
        aurora: {
          1: "var(--aurora-1)",
          2: "var(--aurora-2)",
          3: "var(--aurora-3)",
          4: "var(--aurora-4)",
          5: "var(--aurora-5)",
        },

        // Bank colors
        bank: {
          monte: "var(--c-bank-monte)",
          usa: "var(--c-bank-usa)",
          utilidades: "var(--c-bank-utilidades)",
          fletes: "var(--c-bank-fletes)",
          azteca: "var(--c-bank-azteca)",
          leftie: "var(--c-bank-leftie)",
          profit: "var(--c-bank-profit)",
        },

        // Sidebar
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // Chart colors
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
      },

      // ═══════════════════ GEN5 BORDER RADIUS ═══════════════════
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
      },

      // ═══════════════════ SPACING ═══════════════════
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "18": "4.5rem",
        "22": "5.5rem",
      },

      // ═══════════════════ GEN5 BOX SHADOWS ═══════════════════
      boxShadow: {
        "depth-1": "var(--shadow-depth-1)",
        "depth-2": "var(--shadow-depth-2)",
        "depth-3": "var(--shadow-depth-3)",
        "depth-4": "var(--shadow-depth-4)",
        "glow-accent": "var(--glow-accent)",
        "glow-gold": "var(--glow-gold)",
        "glow-pink": "var(--glow-pink)",
        "glow-cyan": "var(--glow-cyan)",
        "glow-success": "var(--glow-success)",
        "glow-error": "var(--glow-error)",
        "neu-raised": "8px 8px 16px var(--neu-shadow-dark), -4px -4px 12px var(--neu-shadow-light)",
        "neu-pressed":
          "inset 4px 4px 8px var(--neu-shadow-dark), inset -2px -2px 6px var(--neu-shadow-light)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      },

      // ═══════════════════ GEN5 TRANSITIONS ═══════════════════
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
        slowest: "var(--duration-slowest)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        spring: "var(--ease-spring)",
        smooth: "var(--ease-smooth)",
        bounce: "var(--ease-bounce)",
        elastic: "var(--ease-elastic)",
      },

      // ═══════════════════ FONTS ═══════════════════
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", '"SF Mono"', "Menlo", "Monaco", '"Fira Code"', "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      // ═══════════════════ GEN5 BACKDROP BLUR ═══════════════════
      backdropBlur: {
        xs: "4px",
        sm: "var(--glass-blur-sm)",
        md: "var(--glass-blur-md)",
        lg: "var(--glass-blur-lg)",
        xl: "var(--glass-blur-xl)",
        "2xl": "var(--glass-blur-2xl)",
        "3xl": "80px",
      },

      // ═══════════════════ Z-INDEX ═══════════════════
      zIndex: {
        // Valores base que Tailwind auto-genera con prefijo negativo
        "5": "5",
        "15": "15",
        "20": "20",
        "25": "25",
        "30": "30",
        // Positivos personalizados
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
        max: "var(--z-max)",
      },

      // ═══════════════════ GEN5 ANIMATIONS ═══════════════════
      animation: {
        "fade-in": "fadeIn 0.3s var(--ease-out)",
        "slide-up": "slideUp 0.4s var(--ease-out)",
        "slide-down": "slideDown 0.4s var(--ease-out)",
        "scale-in": "scaleIn 0.25s var(--ease-spring)",
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out infinite 2s",
        // PREMIUM FLOAT para orbs de fondo - más dramático
        "premium-float": "premiumFloat 15s ease-in-out infinite",
        breathe: "breathe 4s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "spin-slower": "spin 15s linear infinite",
        // GEN5 Premium Animations
        blob: "blob 8s ease-in-out infinite",
        "blob-slow": "blob 12s ease-in-out infinite",
        gradient: "gradientShift 8s ease infinite",
        tilt: "tilt 10s infinite linear",
        spotlight: "spotlight 2s ease 0.75s 1 forwards",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
        "bounce-slow": "bounce 3s infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        morph: "morph 8s ease-in-out infinite",
        aurora: "auroraShift 15s ease-in-out infinite",
        "rotate-slow": "rotateSlow 20s linear infinite",
        ripple: "ripple 1s cubic-bezier(0, 0, 0.2, 1) forwards",
        "border-spin": "borderSpin 4s linear infinite",
        // 🚀 CHRONOS ULTRA ADVANCED CINEMATOGRAPHIC ANIMATIONS
        glitch: "glitch 0.5s ease-in-out infinite",
        "particles-rise": "particlesRise 3s ease-out forwards",
        hologram: "hologram 2s ease-in-out infinite",
        wave: "wave 2s ease-in-out infinite",
        "depth-pulse": "depthPulse 3s ease-in-out infinite",
        chromatic: "chromatic 1.5s ease-in-out infinite",
        "matrix-rain": "matrixRain 2s linear infinite",
        "scan-line": "scanLine 4s linear infinite",
        "neon-flicker": "neonFlicker 0.15s infinite alternate",
        "cyber-glitch": "cyberGlitch 2s steps(5) infinite",
        "parallax-float": "parallaxFloat 8s ease-in-out infinite",
        "3d-rotate-x": "rotate3DX 10s ease-in-out infinite",
        "3d-rotate-y": "rotate3DY 10s ease-in-out infinite",
        "perspective-shift": "perspectiveShift 6s ease-in-out infinite",
        "liquid-morph": "liquidMorph 10s ease-in-out infinite",
        "energy-pulse": "energyPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "quantum-wave": "quantumWave 3s ease-in-out infinite",
        "shimmer-sweep": "shimmerSweep 3s ease-in-out infinite",
        "aurora-dance": "auroraDance 20s ease-in-out infinite",
        "nebula-swirl": "nebulaSwirl 15s linear infinite",
        "photon-burst": "photonBurst 1.5s ease-out forwards",
        "plasma-flow": "plasmaFlow 8s ease-in-out infinite",
        "gravity-pull": "gravityPull 2s cubic-bezier(0.17, 0.67, 0.83, 0.67) infinite",
        "quantum-entangle": "quantumEntangle 4s ease-in-out infinite",
        "warp-speed": "warpSpeed 1s ease-in-out forwards",
        crystallize: "crystallize 2s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        pulseGlow: {
          "0%, 100%": {
            opacity: "0.7",
            boxShadow: "0 0 20px var(--c-accent-glow)",
          },
          "50%": {
            opacity: "1",
            boxShadow: "0 0 50px var(--c-accent-intense), 0 0 80px var(--c-accent-glow)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "33%": { transform: "translateY(-10px) rotate(1deg)" },
          "66%": { transform: "translateY(-5px) rotate(-1deg)" },
        },
        // PREMIUM FLOAT keyframe - movimiento suave para orbs grandes
        // ⚠️ IMPORTANTE: Opacidades ALTAS para garantizar visibilidad
        premiumFloat: {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
            opacity: "1",
          },
          "25%": {
            transform: "translate(30px, -40px) scale(1.05)",
            opacity: "1",
          },
          "50%": {
            transform: "translate(-20px, -60px) scale(0.95)",
            opacity: "0.9",
          },
          "75%": {
            transform: "translate(40px, -30px) scale(1.1)",
            opacity: "1",
          },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.03)", opacity: "1" },
        },
        // GEN5 Premium Keyframes
        blob: {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
          },
          "25%": {
            transform: "translate(20px, -30px) scale(1.1)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          },
          "50%": {
            transform: "translate(-10px, 20px) scale(0.95)",
            borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
          },
          "75%": {
            transform: "translate(15px, 10px) scale(1.05)",
            borderRadius: "50% 40% 50% 60% / 35% 55% 45% 65%",
          },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        tilt: {
          "0%, 50%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(1deg)" },
          "75%": { transform: "rotate(-1deg)" },
        },
        spotlight: {
          "0%": { opacity: "0", transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: "1", transform: "translate(-50%, -40%) scale(1)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        glow: {
          from: { boxShadow: "0 0 10px -10px var(--c-accent)" },
          to: { boxShadow: "0 0 30px 10px var(--c-accent)" },
        },
        morph: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "25%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "50%": { borderRadius: "50% 50% 50% 50% / 50% 50% 50% 50%" },
          "75%": { borderRadius: "70% 30% 50% 50% / 30% 70% 40% 60%" },
        },
        auroraShift: {
          "0%, 100%": {
            filter: "hue-rotate(0deg)",
            transform: "translateX(0) translateY(0)",
          },
          "25%": {
            filter: "hue-rotate(30deg)",
            transform: "translateX(2%) translateY(-2%)",
          },
          "50%": {
            filter: "hue-rotate(60deg)",
            transform: "translateX(0) translateY(-3%)",
          },
          "75%": {
            filter: "hue-rotate(30deg)",
            transform: "translateX(-2%) translateY(-1%)",
          },
        },
        rotateSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        ripple: {
          to: { transform: "scale(4)", opacity: "0" },
        },
        borderSpin: {
          to: { transform: "rotate(360deg)" },
        },
        // 🎨 CHRONOS ULTRA ADVANCED CINEMATOGRAPHIC KEYFRAMES
        glitch: {
          "0%, 100%": { transform: "translate(0)", filter: "hue-rotate(0deg)" },
          "20%": { transform: "translate(-5px, 2px)", filter: "hue-rotate(5deg)" },
          "40%": { transform: "translate(5px, -2px)", filter: "hue-rotate(-5deg)" },
          "60%": { transform: "translate(-3px, -3px)", filter: "hue-rotate(3deg)" },
          "80%": { transform: "translate(3px, 3px)", filter: "hue-rotate(-3deg)" },
        },
        particlesRise: {
          "0%": { transform: "translateY(0) scale(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(-100vh) scale(1.5)", opacity: "0" },
        },
        hologram: {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.7", filter: "brightness(1.3) contrast(1.2)" },
        },
        wave: {
          "0%, 100%": { transform: "translateY(0)" },
          "25%": { transform: "translateY(-10px)" },
          "50%": { transform: "translateY(0)" },
          "75%": { transform: "translateY(10px)" },
        },
        depthPulse: {
          "0%, 100%": {
            transform: "scale(1) translateZ(0)",
            boxShadow: "0 10px 40px rgba(139, 92, 246, 0.3)",
          },
          "50%": {
            transform: "scale(1.05) translateZ(20px)",
            boxShadow: "0 20px 60px rgba(139, 92, 246, 0.6)",
          },
        },
        chromatic: {
          "0%, 100%": {
            filter: "drop-shadow(0 0 0 rgba(255, 0, 0, 0))",
          },
          "50%": {
            filter:
              "drop-shadow(2px 0 0 rgba(255, 0, 0, 0.5)) drop-shadow(-2px 0 0 rgba(0, 255, 255, 0.5))",
          },
        },
        matrixRain: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        neonFlicker: {
          "0%, 100%": {
            textShadow: "0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.5)",
          },
          "50%": {
            textShadow: "0 0 20px rgba(139, 92, 246, 1), 0 0 40px rgba(139, 92, 246, 0.8)",
          },
        },
        cyberGlitch: {
          "0%": { clipPath: "inset(0 0 0 0)" },
          "20%": { clipPath: "inset(10% 0 85% 0)" },
          "40%": { clipPath: "inset(40% 0 55% 0)" },
          "60%": { clipPath: "inset(70% 0 20% 0)" },
          "80%": { clipPath: "inset(20% 0 70% 0)" },
          "100%": { clipPath: "inset(0 0 0 0)" },
        },
        parallaxFloat: {
          "0%, 100%": {
            transform: "translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)",
          },
          "25%": {
            transform: "translate3d(-10px, -10px, 20px) rotateX(5deg) rotateY(5deg)",
          },
          "50%": {
            transform: "translate3d(0, -20px, 40px) rotateX(10deg) rotateY(0deg)",
          },
          "75%": {
            transform: "translate3d(10px, -10px, 20px) rotateX(5deg) rotateY(-5deg)",
          },
        },
        rotate3DX: {
          "0%, 100%": { transform: "perspective(1000px) rotateX(0deg)" },
          "50%": { transform: "perspective(1000px) rotateX(360deg)" },
        },
        rotate3DY: {
          "0%, 100%": { transform: "perspective(1000px) rotateY(0deg)" },
          "50%": { transform: "perspective(1000px) rotateY(360deg)" },
        },
        perspectiveShift: {
          "0%, 100%": {
            transform: "perspective(800px) rotateX(0deg) rotateY(0deg)",
          },
          "25%": {
            transform: "perspective(800px) rotateX(10deg) rotateY(-10deg)",
          },
          "50%": {
            transform: "perspective(800px) rotateX(-10deg) rotateY(10deg)",
          },
          "75%": {
            transform: "perspective(800px) rotateX(5deg) rotateY(-5deg)",
          },
        },
        liquidMorph: {
          "0%, 100%": {
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            transform: "rotate(0deg) scale(1)",
          },
          "20%": {
            borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
            transform: "rotate(20deg) scale(1.05)",
          },
          "40%": {
            borderRadius: "50% 50% 50% 50% / 50% 50% 50% 50%",
            transform: "rotate(40deg) scale(0.95)",
          },
          "60%": {
            borderRadius: "70% 30% 50% 50% / 30% 70% 40% 60%",
            transform: "rotate(60deg) scale(1.1)",
          },
          "80%": {
            borderRadius: "40% 70% 60% 30% / 70% 40% 60% 30%",
            transform: "rotate(80deg) scale(0.9)",
          },
        },
        energyPulse: {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(139, 92, 246, 0.7), 0 0 0 0 rgba(139, 92, 246, 0.4)",
          },
          "50%": {
            boxShadow: "0 0 30px 10px rgba(139, 92, 246, 0), 0 0 60px 20px rgba(139, 92, 246, 0)",
          },
        },
        quantumWave: {
          "0%, 100%": {
            transform: "scaleX(1) scaleY(1) translateZ(0)",
            filter: "hue-rotate(0deg)",
          },
          "33%": {
            transform: "scaleX(1.1) scaleY(0.9) translateZ(10px)",
            filter: "hue-rotate(120deg)",
          },
          "66%": {
            transform: "scaleX(0.9) scaleY(1.1) translateZ(-10px)",
            filter: "hue-rotate(240deg)",
          },
        },
        shimmerSweep: {
          "0%": {
            backgroundPosition: "-200% center",
          },
          "100%": {
            backgroundPosition: "200% center",
          },
        },
        auroraDance: {
          "0%, 100%": {
            background: "linear-gradient(45deg, #8b5cf6, #ec4899, #3b82f6)",
            opacity: "0.7",
          },
          "25%": {
            background: "linear-gradient(90deg, #ec4899, #3b82f6, #10b981)",
            opacity: "0.9",
          },
          "50%": {
            background: "linear-gradient(135deg, #3b82f6, #10b981, #f59e0b)",
            opacity: "1",
          },
          "75%": {
            background: "linear-gradient(180deg, #10b981, #f59e0b, #8b5cf6)",
            opacity: "0.9",
          },
        },
        nebulaSwirl: {
          "0%": {
            transform: "rotate(0deg) scale(1)",
            filter: "hue-rotate(0deg) blur(0px)",
          },
          "50%": {
            transform: "rotate(180deg) scale(1.2)",
            filter: "hue-rotate(180deg) blur(2px)",
          },
          "100%": {
            transform: "rotate(360deg) scale(1)",
            filter: "hue-rotate(360deg) blur(0px)",
          },
        },
        photonBurst: {
          "0%": {
            transform: "scale(0)",
            opacity: "1",
            boxShadow: "0 0 0 0 rgba(139, 92, 246, 0.7)",
          },
          "100%": {
            transform: "scale(2.5)",
            opacity: "0",
            boxShadow: "0 0 80px 40px rgba(139, 92, 246, 0)",
          },
        },
        plasmaFlow: {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
            backgroundSize: "200% 200%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
            backgroundSize: "200% 200%",
          },
        },
        gravityPull: {
          "0%, 100%": {
            transform: "scale(1) translateY(0)",
          },
          "30%": {
            transform: "scale(0.8) translateY(-20px)",
          },
          "60%": {
            transform: "scale(1.1) translateY(5px)",
          },
        },
        quantumEntangle: {
          "0%, 100%": {
            transform: "rotate(0deg) translateX(0)",
            filter: "hue-rotate(0deg)",
          },
          "25%": {
            transform: "rotate(90deg) translateX(10px)",
            filter: "hue-rotate(90deg)",
          },
          "50%": {
            transform: "rotate(180deg) translateX(0)",
            filter: "hue-rotate(180deg)",
          },
          "75%": {
            transform: "rotate(270deg) translateX(-10px)",
            filter: "hue-rotate(270deg)",
          },
        },
        warpSpeed: {
          "0%": {
            transform: "translateZ(0) scale(1)",
            opacity: "1",
          },
          "100%": {
            transform: "translateZ(1000px) scale(2)",
            opacity: "0",
          },
        },
        crystallize: {
          "0%": {
            clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)",
            filter: "brightness(1)",
          },
          "100%": {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 50% 50%, 50% 50%)",
            filter: "brightness(1.5) saturate(1.5)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
