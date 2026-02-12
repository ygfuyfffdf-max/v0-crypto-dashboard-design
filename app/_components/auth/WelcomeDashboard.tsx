// 🎉 WELCOME DASHBOARD - CHRONOS INFINITY
// Panel de bienvenida post-autenticación con información del usuario y accesos rápidos

'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import KocmokAnimatedLogo from './KocmokAnimatedLogo';
import {
  User,
  Shield,
  DollarSign,
  Users,
  Activity,
  Clock,
  MapPin,
  Smartphone,
  Fingerprint,
  Eye,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  Star,
  Sparkles,
  Globe,
  Lock,
  Key,
  BarChart3,
  Brain,
  FileText
} from 'lucide-react';
import { Card } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';
import { Progress } from '@/app/_components/ui/progress';

interface UserRole {
  id: string;
  name: string;
  email: string;
  role: 'bank_profit_manager' | 'user_admin' | 'security_monitor';
  permissions: {
    panels: string[];
    accessLevel: 'view' | 'manage' | 'admin';
  };
  lastLogin: Date;
  riskScore: number;
  status: 'active' | 'suspended';
  biometric: {
    fingerprint: boolean;
    faceRecognition: boolean;
    voicePrint: boolean;
    behavioral: boolean;
  };
}

const WelcomeDashboard: React.FC = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  // Simulación de roles basados en el email del usuario
  const getUserRole = (): UserRole => {
    if (!user) return {} as UserRole;
    
    const email = user.emailAddresses[0]?.emailAddress || '';
    
    // Determinar rol basado en el email o datos del usuario
    if (email.includes('profit') || email.includes('bank')) {
      return {
        id: user.id,
        name: user.fullName || 'Usuario Profit',
        email: email,
        role: 'bank_profit_manager',
        permissions: {
          panels: ['profit', 'bancos', 'reportes'],
          accessLevel: 'admin'
        },
        lastLogin: new Date(),
        riskScore: 0.15,
        status: 'active',
        biometric: {
          fingerprint: true,
          faceRecognition: true,
          voicePrint: false,
          behavioral: true
        }
      };
    } else if (email.includes('admin') || email.includes('user')) {
      return {
        id: user.id,
        name: user.fullName || 'Administrador',
        email: email,
        role: 'user_admin',
        permissions: {
          panels: ['usuarios', 'seguridad', 'reportes'],
          accessLevel: 'admin'
        },
        lastLogin: new Date(),
        riskScore: 0.25,
        status: 'active',
        biometric: {
          fingerprint: true,
          faceRecognition: false,
          voicePrint: true,
          behavioral: true
        }
      };
    } else if (email.includes('security') || email.includes('monitor')) {
      return {
        id: user.id,
        name: user.fullName || 'Monitor de Seguridad',
        email: email,
        role: 'security_monitor',
        permissions: {
          panels: ['seguridad', 'reportes'],
          accessLevel: 'view'
        },
        lastLogin: new Date(),
        riskScore: 0.35,
        status: 'active',
        biometric: {
          fingerprint: false,
          faceRecognition: true,
          voicePrint: false,
          behavioral: false
        }
      };
    } else {
      return {
        id: user.id,
        name: user.fullName || 'Usuario',
        email: email,
        role: 'bank_profit_manager',
        permissions: {
          panels: ['profit', 'reportes'],
          accessLevel: 'view'
        },
        lastLogin: new Date(),
        riskScore: 0.20,
        status: 'active',
        biometric: {
          fingerprint: true,
          faceRecognition: false,
          voicePrint: false,
          behavioral: true
        }
      };
    }
  };

  const userRole = getUserRole();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'bank_profit_manager': return DollarSign;
      case 'user_admin': return Users;
      case 'security_monitor': return Shield;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'bank_profit_manager': return 'text-green-400';
      case 'user_admin': return 'text-blue-400';
      case 'security_monitor': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'bg-red-600';
      case 'manage': return 'bg-orange-600';
      case 'view': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const navigateToPanel = (panel: string) => {
    switch (panel) {
      case 'profit':
        router.push('/profit');
        break;
      case 'bancos':
        router.push('/bancos');
        break;
      case 'usuarios':
        router.push('/admin/users');
        break;
      case 'seguridad':
        router.push('/security');
        break;
      default:
        router.push(`/${panel}`);
    }
  };

  const getPanelIcon = (panel: string) => {
    switch (panel) {
      case 'profit': return DollarSign;
      case 'bancos': return Globe;
      case 'ventas': return BarChart3;
      case 'almacen': return FileText;
      case 'clientes': return User;
      case 'ia': return Brain;
      case 'seguridad': return Shield;
      case 'usuarios': return Users;
      case 'reportes': return FileText;
      default: return Settings;
    }
  };

  const getPanelColor = (panel: string) => {
    switch (panel) {
      case 'profit': return 'text-red-400';
      case 'bancos': return 'text-orange-400';
      case 'ventas': return 'text-yellow-400';
      case 'almacen': return 'text-yellow-400';
      case 'clientes': return 'text-yellow-400';
      case 'ia': return 'text-orange-400';
      case 'seguridad': return 'text-purple-400';
      case 'usuarios': return 'text-blue-400';
      case 'reportes': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <KocmokAnimatedLogo size="lg" />
          <p className="text-purple-200 mt-4">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Animation */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <KocmokAnimatedLogo size="xl" className="mx-auto mb-8" />
                <motion.h1
                  className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  ¡Bienvenido a CHRONOS!
                </motion.h1>
                <motion.p
                  className="text-xl text-purple-200 mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  {userRole.name}, has ingresado exitosamente al sistema de permisos cuánticos más avanzado.
                </motion.p>
                <motion.div
                  className="flex items-center justify-center space-x-2 text-green-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>Autenticación biométrica verificada</span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center space-x-4">
            <KocmokAnimatedLogo size="md" />
            <div>
              <h1 className="text-3xl font-bold text-white">Bienvenido, {userRole.name}</h1>
              <p className="text-purple-200">Sistema de permisos cuánticos CHRONOS INFINITY</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-purple-200 text-sm">Último acceso</p>
              <p className="text-white font-mono text-sm">{currentTime?.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="p-6 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {React.createElement(getRoleIcon(userRole.role), { className: `w-12 h-12 ${getRoleColor(userRole.role)}` })}
                <div>
                  <h2 className="text-2xl font-bold text-white">{userRole.name}</h2>
                  <p className="text-purple-200 capitalize">{userRole.role.replace('_', ' ')}</p>
                  <p className="text-purple-300 text-sm">{userRole.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${userRole.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-purple-200 text-sm">{userRole.status === 'active' ? 'Activo' : 'Suspendido'}</span>
                    </div>
                    <Badge className={getAccessLevelColor(userRole.permissions.accessLevel)}>
                      {userRole.permissions.accessLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-purple-200 text-sm">Nivel de Riesgo</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${
                    userRole.riskScore < 0.3 ? 'text-green-400' :
                    userRole.riskScore < 0.6 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {(userRole.riskScore * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={userRole.riskScore * 100} className="w-32 h-2" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Accessible Panels */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {userRole.permissions.panels.map((panel, index) => {
            const Icon = getPanelIcon(panel);
            const color = getPanelColor(panel);
            return (
              <motion.div
                key={panel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              >
                <Card 
                  className="p-6 bg-slate-800 border-purple-500 cursor-pointer hover:bg-slate-700 transition-all"
                  onClick={() => navigateToPanel(panel)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-8 h-8 ${color}`} />
                    <Badge className={getAccessLevelColor(userRole.permissions.accessLevel)}>
                      {userRole.permissions.accessLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {panel === 'profit' ? 'Profit Panel' :
                     panel === 'bancos' ? 'Panel de Bancos' :
                     panel === 'usuarios' ? 'Gestión de Usuarios' :
                     panel === 'seguridad' ? 'Monitoreo de Seguridad' :
                     panel.charAt(0).toUpperCase() + panel.slice(1)}
                  </h3>
                  <p className="text-purple-200 text-sm mb-4">
                    {panel === 'profit' ? 'Gestión de ganancias y operaciones de cambio' :
                     panel === 'bancos' ? 'Administración de cuentas bancarias' :
                     panel === 'usuarios' ? 'Creación y gestión de usuarios' :
                     panel === 'seguridad' ? 'Monitoreo forense y auditoría' :
                     'Panel de ' + panel}
                  </p>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToPanel(panel);
                    }}
                  >
                    Acceder
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Card className="p-6 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Permisos Activos</p>
                <p className="text-3xl font-bold text-white">{userRole.permissions.panels.length}</p>
                <p className="text-green-400 text-xs">Panel de acceso</p>
              </div>
              <Key className="w-12 h-12 text-green-400" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Biometría</p>
                <p className="text-3xl font-bold text-white">
                  {Object.values(userRole.biometric).filter(Boolean).length}/4
                </p>
                <p className="text-blue-400 text-xs">Métodos activos</p>
              </div>
              <Fingerprint className="w-12 h-12 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Sesión Activa</p>
                <p className="text-3xl font-bold text-white">{Math.floor(Math.random() * 59) + 1}</p>
                <p className="text-yellow-400 text-xs">Minutos</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-400" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Ubicación</p>
                <p className="text-3xl font-bold text-white">México</p>
                <p className="text-purple-400 text-xs">Verificada</p>
              </div>
              <MapPin className="w-12 h-12 text-purple-400" />
            </div>
          </Card>
        </motion.div>

        {/* Security Status */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {/* Security Status */}
          <Card className="p-6 bg-slate-800 border-purple-500">
            <h3 className="text-xl font-semibold text-white mb-4">Estado de Seguridad</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Fingerprint className="w-5 h-5 text-green-400" />
                  <span className="text-white">Autenticación Biométrica</span>
                </div>
                <Badge className="bg-green-600">ACTIVA</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Ventana de Tiempo</span>
                </div>
                <Badge className="bg-blue-600">DENTRO</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">Ubicación</span>
                </div>
                <Badge className="bg-yellow-600">VERIFICADA</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  <span className="text-white">Dispositivo</span>
                </div>
                <Badge className="bg-purple-600">CONFIABLE</Badge>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 bg-slate-800 border-purple-500">
            <h3 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">Acceso concedido a {userRole.permissions.panels[0]}</p>
                  <p className="text-purple-200 text-xs">Hace 2 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                <Activity className="w-5 h-5 text-blue-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">Sesión iniciada desde ubicación verificada</p>
                  <p className="text-purple-200 text-xs">Hace 5 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                <Shield className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">Verificación biométrica completada</p>
                  <p className="text-purple-200 text-xs">Hace 8 minutos</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center text-purple-300 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
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
  );
};

export default WelcomeDashboard;