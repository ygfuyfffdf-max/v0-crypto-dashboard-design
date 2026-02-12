// 🔐 CHRONOS LOGIN PAGE - CHRONOS INFINITY
// Página de inicio de sesión con logo KOCMOK animado y autenticación Clerk

'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { 
  SignIn, 
  SignUp, 
  SignedIn, 
  SignedOut, 
  RedirectToUserProfile 
} from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import KocmokAnimatedLogo from '@/app/_components/auth/KocmokAnimatedLogo';
import { 
  Shield, 
  Lock, 
  User, 
  Key, 
  Eye, 
  Fingerprint,
  Globe,
  Zap,
  Star,
  Sparkles,
  Activity
} from 'lucide-react';

const LoginPage: React.FC = () => {
  const router = useRouter();

  // Texto CHRONNOS en griego: ΧΡΟΝΝΟΣ
  const greekText = "ΧΡΟΝΝΟΣ";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20],
              x: [-10, 10],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Floating security icons */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 text-purple-400 opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Shield size={40} />
        </motion.div>
        <motion.div
          className="absolute top-40 right-32 text-cyan-400 opacity-20"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <Lock size={30} />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-32 text-indigo-400 opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <Fingerprint size={35} />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-20 text-pink-400 opacity-20"
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <Key size={32} />
        </motion.div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-6xl w-full">
          {/* Header with animated title */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent mb-4"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: "200% 200%",
                backgroundImage: "linear-gradient(45deg, #a855f7, #06b6d4, #ec4899, #a855f7)"
              }}
            >
              {greekText}
            </motion.div>
            
            <motion.div
              className="text-2xl md:text-3xl text-purple-200 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              CHRONOS INFINITY
            </motion.div>
            
            <motion.div
              className="text-lg text-purple-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              Sistema de Permisos Cuánticos Avanzados
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Logo and description */}
            <motion.div 
              className="text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            >
              <div className="flex justify-center lg:justify-start mb-8">
                <KocmokAnimatedLogo size="xl" />
              </div>
              
              <motion.div
                className="space-y-4 text-purple-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
              >
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span>Autenticación Multi-Factor Avanzada</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span>Permisos Cuánticos en Tiempo Real</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <Globe className="w-5 h-5 text-green-400" />
                  <span>Control de Acceso Global</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <Sparkles className="w-5 h-5 text-pink-400" />
                  <span>Seguridad de Nivel Enterprise</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <Activity className="w-5 h-5 text-orange-400" />
                  <span>Monitoreo Forense 24/7</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right side - Clerk Sign In */}
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
                <p className="text-purple-300">Accede al sistema de permisos cuánticos</p>
              </div>

              <SignedOut>
                <SignIn 
                  routing="hash"
                  redirectUrl="/admin"
                  appearance={{
                    elements: {
                      rootBox: "mx-auto",
                      card: "bg-slate-800 border border-purple-500 rounded-xl",
                      headerTitle: "text-white text-xl font-bold",
                      headerSubtitle: "text-purple-300",
                      socialButtonsBlockButton: "bg-purple-600 hover:bg-purple-700 text-white border-purple-500",
                      formButtonPrimary: "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold",
                      formFieldLabel: "text-purple-200",
                      formFieldInput: "bg-slate-700 border-purple-500 text-white placeholder-purple-400",
                      footerActionLink: "text-cyan-400 hover:text-cyan-300",
                      dividerLine: "bg-purple-600",
                      dividerText: "text-purple-300",
                      identityPreviewText: "text-white",
                      identityPreviewEditButton: "text-cyan-400 hover:text-cyan-300",
                      formFieldSuccessText: "text-green-400",
                      formFieldErrorText: "text-red-400",
                      logoBox: "flex justify-center mb-4",
                      logoImage: "w-16 h-16"
                    },
                    layout: {
                      socialButtonsPlacement: "bottom",
                      socialButtonsVariant: "blockButton",
                      helpPageUrl: "/help",
                      privacyPageUrl: "/privacy",
                      termsPageUrl: "/terms",
                      logoPlacement: "inside",
                      logoLinkUrl: "/"
                    }
                  }}
                />
              </SignedOut>

              <SignedIn>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">¡Autenticación Exitosa!</h3>
                  <p className="text-green-400 mb-4">Redirigiendo al panel de control...</p>
                  <div className="w-full bg-gradient-to-r from-green-500 to-emerald-500 h-1 rounded-full animate-pulse" />
                </motion.div>
              </SignedIn>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div 
            className="text-center mt-12 text-purple-300 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Monitoreado 24/7</span>
              </div>
              <div className="w-1 h-1 bg-purple-500 rounded-full" />
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Seguridad de Grado Militar</span>
              </div>
              <div className="w-1 h-1 bg-purple-500 rounded-full" />
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-4 h-4" />
                <span>Biometría Avanzada</span>
              </div>
            </div>
            <p>&copy; 2026 CHRONOS INFINITY. Todos los derechos reservados.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;