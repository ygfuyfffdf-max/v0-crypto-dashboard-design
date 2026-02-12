// 🔐 CHRONOS REGISTER PAGE - CHRONOS INFINITY
// Página de registro con logo KOCMOK animado y autenticación Clerk

'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import {
  SignUp,
  SignedIn,
  SignedOut,
  RedirectToSignIn
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
  Activity,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

const RegisterPage: React.FC = () => {
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

      {/* Back button */}
      <motion.div
        className="absolute top-8 left-8 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/login"
          className="flex items-center space-x-2 text-purple-300 hover:text-white transition-colors bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-500/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Login</span>
        </Link>
      </motion.div>

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
              Registro de Acceso Cuántico Seguro
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
                  <span>Registro Biométrico Avanzado</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span>Verificación Cuántica en Tiempo Real</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <Globe className="w-5 h-5 text-green-400" />
                  <span>Acceso Global Seguro</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <Sparkles className="w-5 h-5 text-pink-400" />
                  <span>Encriptación de Grado Militar</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <Activity className="w-5 h-5 text-orange-400" />
                  <span>Monitoreo Forense desde el Primer Segundo</span>
                </div>
              </motion.div>

              <motion.div
                className="mt-8 p-4 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-purple-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">¿Por qué elegir CHRONOS?</h3>
                <ul className="text-sm text-purple-200 space-y-1">
                  <li>• Autenticación multi-factor con biometría</li>
                  <li>• Permisos granulares y control de acceso</li>
                  <li>• Auditoría completa de todas las acciones</li>
                  <li>• Cumplimiento con estándares internacionales</li>
                  <li>• Trazabilidad blockchain de todos los eventos</li>
                </ul>
              </motion.div>
            </motion.div>

            {/* Right side - Clerk Sign Up */}
            <motion.div
              className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Crear Cuenta</h2>
                <p className="text-purple-300">Únete al ecosistema de seguridad cuántica</p>
              </div>

              <SignedOut>
                <SignUp
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
                      logoImage: "w-16 h-16",
                      formFieldInputShowPasswordButton: "text-purple-400 hover:text-purple-300"
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
                  <h3 className="text-xl font-bold text-white mb-2">¡Registro Exitoso!</h3>
                  <p className="text-green-400 mb-4">Bienvenido a CHRONOS INFINITY</p>
                  <p className="text-purple-300 text-sm">Redirigiendo al panel de control...</p>
                  <div className="w-full bg-gradient-to-r from-green-500 to-emerald-500 h-1 rounded-full animate-pulse mt-4" />
                </motion.div>
              </SignedIn>
            </motion.div>
          </div>

          {/* Security badges */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-4 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-green-500/30">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-500/30">
              <Lock className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm">ISO 27001</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-500/30">
              <Fingerprint className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm">GDPR Ready</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-cyan-500/30">
              <Key className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm">Zero Trust</span>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center mt-8 text-purple-300 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <p>&copy; 2026 CHRONOS INFINITY. Todos los derechos reservados.</p>
            <p className="mt-2 text-xs">Al registrarte, aceptas nuestros términos de servicio y políticas de seguridad cuántica.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
