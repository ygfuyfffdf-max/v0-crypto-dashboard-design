// 🏛️ CHRONOS ADMIN DASHBOARD - CHRONOS INFINITY
// Panel de administración principal que integra todos los componentes del sistema

'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import KocmokAnimatedLogo from '@/app/_components/auth/KocmokAnimatedLogo';
import WelcomeDashboard from '@/app/_components/auth/WelcomeDashboard';
import UserCreationWizard from '@/app/_components/admin/UserCreationWizard';
import AdvancedSecurityDashboard from '@/app/_components/security/AdvancedSecurityDashboard';
import { QuantumPermissionEngine } from '@/app/_lib/permissions/QuantumPermissionEngine';
import {
  Shield,
  Users,
  DollarSign,
  Activity,
  Settings,
  BarChart3,
  Globe,
  Lock,
  Eye,
  Zap,
  Star,
  Sparkles,
  TrendingUp,
  Clock,
  MapPin,
  Smartphone,
  Fingerprint,
  Key,
  CheckCircle,
  User,
  AlertCircle,
  ArrowRight,
  Menu,
  X,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye as EyeIcon,
  UserPlus,
  FileText,
  Database,
  Server,
  Cloud,
  Wifi,
  Battery,
  Thermometer,
  Camera,
  Mic,
  Speaker
} from 'lucide-react';
import { Card } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';
import { Progress } from '@/app/_components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs';
import { Input } from '@/app/_components/ui/input';
import { Select } from '@/app/_components/ui/select';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'bank_profit_manager' | 'user_admin' | 'security_monitor' | 'super_admin';
  permissions: {
    panels: string[];
    accessLevel: 'view' | 'manage' | 'admin';
  };
  status: 'active' | 'suspended' | 'pending';
  riskScore: number;
  lastLogin: Date;
  biometric: {
    fingerprint: boolean;
    faceRecognition: boolean;
    voicePrint: boolean;
    behavioral: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingApprovals: number;
  totalSessions: number;
  activeSessions: number;
  securityAlerts: number;
  complianceViolations: number;
  systemHealth: number;
  databaseHealth: number;
  securityHealth: number;
}

interface RealTimeMetrics {
  loginAttempts: number;
  failedLogins: number;
  permissionRequests: number;
  securityEvents: number;
  systemLoad: number;
  memoryUsage: number;
  networkTraffic: number;
  databaseQueries: number;
}

const AdminDashboard: React.FC = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserWizard, setShowUserWizard] = useState(false);
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 156,
    activeUsers: 142,
    suspendedUsers: 8,
    pendingApprovals: 6,
    totalSessions: 2341,
    activeSessions: 89,
    securityAlerts: 3,
    complianceViolations: 1,
    systemHealth: 98,
    databaseHealth: 99,
    securityHealth: 97
  });
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    loginAttempts: 127,
    failedLogins: 12,
    permissionRequests: 456,
    securityEvents: 23,
    systemLoad: 45,
    memoryUsage: 67,
    networkTraffic: 234,
    databaseQueries: 1234
  });

  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'Carlos Rodriguez',
      email: 'carlos.profit@chronos.com',
      role: 'bank_profit_manager',
      permissions: {
        panels: ['profit', 'bancos', 'reportes'],
        accessLevel: 'admin'
      },
      status: 'active',
      riskScore: 0.15,
      lastLogin: new Date(),
      biometric: {
        fingerprint: true,
        faceRecognition: true,
        voicePrint: false,
        behavioral: true
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Maria Gonzalez',
      email: 'maria.admin@chronos.com',
      role: 'user_admin',
      permissions: {
        panels: ['usuarios', 'seguridad', 'reportes'],
        accessLevel: 'admin'
      },
      status: 'active',
      riskScore: 0.25,
      lastLogin: new Date(),
      biometric: {
        fingerprint: true,
        faceRecognition: false,
        voicePrint: true,
        behavioral: true
      },
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Juan Martinez',
      email: 'juan.security@chronos.com',
      role: 'security_monitor',
      permissions: {
        panels: ['seguridad', 'reportes'],
        accessLevel: 'view'
      },
      status: 'active',
      riskScore: 0.35,
      lastLogin: new Date(),
      biometric: {
        fingerprint: false,
        faceRecognition: true,
        voicePrint: false,
        behavioral: false
      },
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date()
    }
  ]);

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

  // Simular actualización de métricas en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        loginAttempts: prev.loginAttempts + Math.floor(Math.random() * 5),
        failedLogins: prev.failedLogins + Math.floor(Math.random() * 2),
        permissionRequests: prev.permissionRequests + Math.floor(Math.random() * 10),
        securityEvents: prev.securityEvents + Math.floor(Math.random() * 3),
        systemLoad: Math.min(100, prev.systemLoad + (Math.random() - 0.5) * 10),
        memoryUsage: Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5),
        networkTraffic: Math.min(1000, prev.networkTraffic + (Math.random() - 0.5) * 50),
        databaseQueries: prev.databaseQueries + Math.floor(Math.random() * 20)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'bank_profit_manager': return DollarSign;
      case 'user_admin': return Users;
      case 'security_monitor': return Shield;
      case 'super_admin': return Star;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'bank_profit_manager': return 'text-green-400';
      case 'user_admin': return 'text-blue-400';
      case 'security_monitor': return 'text-purple-400';
      case 'super_admin': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'suspended': return 'bg-red-600';
      case 'pending': return 'bg-yellow-600';
      default: return 'bg-gray-600';
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserCreated = (newUser: AdminUser) => {
    setUsers(prev => [...prev, newUser]);
    setShowUserWizard(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.header 
        className="bg-slate-800/50 backdrop-blur-lg border-b border-purple-500/30 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-purple-200 hover:text-white"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <KocmokAnimatedLogo size="sm" />
            <div>
              <h1 className="text-2xl font-bold text-white">CHRONOS INFINITY</h1>
              <p className="text-purple-200 text-sm">Panel de Administración Cuántica</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-purple-200">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono">{currentTime?.toLocaleTimeString()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm">Sistema Operativo</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-purple-200 hover:text-white relative"
            >
              <Bell className="w-5 h-5" />
              {systemStats.securityAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-white text-sm font-semibold">{user.fullName}</p>
                <p className="text-purple-200 text-xs">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              className="w-64 bg-slate-800/50 backdrop-blur-lg border-r border-purple-500/30 min-h-screen p-4"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="space-y-2">
                <Button
                  variant={activeTab === 'overview' ? 'default' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => setActiveTab('overview')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Vista General
                </Button>

                <Button
                  variant={activeTab === 'users' ? 'default' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => setActiveTab('users')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Gestión de Usuarios
                </Button>

                <Button
                  variant={activeTab === 'security' ? 'default' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => setActiveTab('security')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Seguridad y Monitoreo
                </Button>

                <Button
                  variant={activeTab === 'profit' ? 'default' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => setActiveTab('profit')}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Profit & Bancos
                </Button>

                <Button
                  variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => setActiveTab('analytics')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Análisis Avanzado
                </Button>

                <Button
                  variant={activeTab === 'system' ? 'default' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => setActiveTab('system')}
                >
                  <Server className="w-4 h-4 mr-2" />
                  Sistema
                </Button>

                <div className="border-t border-purple-500/30 pt-4 mt-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                    onClick={() => setShowUserWizard(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Crear Usuario
                  </Button>
                </div>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-slate-800 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Usuarios Totales</p>
                      <p className="text-3xl font-bold text-white">{systemStats.totalUsers}</p>
                      <p className="text-green-400 text-xs">+{Math.floor(Math.random() * 10)} esta semana</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-400" />
                  </div>
                </Card>

                <Card className="p-6 bg-slate-800 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Sesiones Activas</p>
                      <p className="text-3xl font-bold text-white">{systemStats.activeSessions}</p>
                      <p className="text-green-400 text-xs">En tiempo real</p>
                    </div>
                    <Activity className="w-12 h-12 text-green-400" />
                  </div>
                </Card>

                <Card className="p-6 bg-slate-800 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Alertas de Seguridad</p>
                      <p className="text-3xl font-bold text-white">{systemStats.securityAlerts}</p>
                      <p className="text-yellow-400 text-xs">Requiere atención</p>
                    </div>
                    <AlertCircle className="w-12 h-12 text-yellow-400" />
                  </div>
                </Card>

                <Card className="p-6 bg-slate-800 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Salud del Sistema</p>
                      <p className="text-3xl font-bold text-white">{systemStats.systemHealth}%</p>
                      <Progress value={systemStats.systemHealth} className="w-32 h-2 mt-2" />
                    </div>
                    <Server className="w-12 h-12 text-purple-400" />
                  </div>
                </Card>
              </div>

              {/* Real-time Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-slate-800 border-purple-500">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                    Métricas en Tiempo Real
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Intentos de Login</span>
                      <span className="text-white font-mono">{realTimeMetrics.loginAttempts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Logins Fallidos</span>
                      <span className="text-red-400 font-mono">{realTimeMetrics.failedLogins}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Peticiones de Permisos</span>
                      <span className="text-white font-mono">{realTimeMetrics.permissionRequests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Eventos de Seguridad</span>
                      <span className="text-yellow-400 font-mono">{realTimeMetrics.securityEvents}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-slate-800 border-purple-500">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Server className="w-5 h-5 mr-2 text-green-400" />
                    Estado del Sistema
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Carga del Sistema</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={realTimeMetrics.systemLoad} className="w-24 h-2" />
                        <span className="text-white text-sm">{realTimeMetrics.systemLoad.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Uso de Memoria</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={realTimeMetrics.memoryUsage} className="w-24 h-2" />
                        <span className="text-white text-sm">{realTimeMetrics.memoryUsage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Tráfico de Red</span>
                      <span className="text-white text-sm">{realTimeMetrics.networkTraffic} MB/s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Consultas DB</span>
                      <span className="text-white text-sm">{realTimeMetrics.databaseQueries}/s</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="p-6 bg-slate-800 border-purple-500">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-400" />
                  Actividad Reciente
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div className="flex-1">
                      <p className="text-white text-sm">Nuevo usuario creado: Ana López</p>
                      <p className="text-purple-200 text-xs">Hace 2 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <p className="text-white text-sm">Verificación biométrica completada</p>
                      <p className="text-purple-200 text-xs">Hace 5 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                    <Key className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-white text-sm">Permisos actualizados para Carlos Rodriguez</p>
                      <p className="text-purple-200 text-xs">Hace 8 minutos</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              {/* User Management */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                    <Input
                      type="text"
                      placeholder="Buscar usuarios..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-700 border-purple-500 text-white placeholder-purple-400"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <option value="all">Todos los roles</option>
                    <option value="bank_profit_manager">Profit Manager</option>
                    <option value="user_admin">Administrador</option>
                    <option value="security_monitor">Monitor Seguridad</option>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <option value="all">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="suspended">Suspendido</option>
                    <option value="pending">Pendiente</option>
                  </Select>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                </div>
              </div>

              {/* Users Table */}
              <Card className="bg-slate-800 border-purple-500">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Usuario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Rol</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Riesgo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Último Acceso</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/30">
                      {filteredUsers.map((user) => {
                        const RoleIcon = getRoleIcon(user.role);
                        return (
                          <tr key={user.id} className="hover:bg-slate-700/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-white text-sm font-bold">
                                    {user.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-white font-medium">{user.name}</div>
                                  <div className="text-purple-200 text-sm">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <RoleIcon className={`w-4 h-4 mr-2 ${getRoleColor(user.role)}`} />
                                <span className="text-purple-200 text-sm capitalize">
                                  {user.role.replace('_', ' ')}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Progress value={user.riskScore * 100} className="w-16 h-2 mr-2" />
                                <span className={`text-sm font-medium ${
                                  user.riskScore < 0.3 ? 'text-green-400' :
                                  user.riskScore < 0.6 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {(user.riskScore * 100).toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-purple-200 text-sm">
                              {user.lastLogin.toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                                  <EyeIcon className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Panel de Seguridad</h2>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowSecurityDashboard(true)}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Dashboard Avanzado
                </Button>
              </div>
              <AdvancedSecurityDashboard />
            </TabsContent>

            <TabsContent value="profit" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Profit & Bancos</h2>
                <div className="flex items-center space-x-2">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar Tasas
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Panel de Profit</h3>
                <p className="text-purple-200 mb-4">Accede al panel completo de gestión de profit y bancos</p>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => router.push('/profit')}
                >
                  Ir al Panel de Profit
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Análisis Avanzado</h3>
                <p className="text-purple-200 mb-4">Dashboard de análisis y reportes detallados</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <Card className="p-4 bg-slate-800 border-purple-500">
                    <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="text-white font-semibold">Análisis de Uso</h4>
                    <p className="text-purple-200 text-sm">Patrones de comportamiento</p>
                  </Card>
                  <Card className="p-4 bg-slate-800 border-purple-500">
                    <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="text-white font-semibold">Análisis de Seguridad</h4>
                    <p className="text-purple-200 text-sm">Riesgos y vulnerabilidades</p>
                  </Card>
                  <Card className="p-4 bg-slate-800 border-purple-500">
                    <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h4 className="text-white font-semibold">Análisis Financiero</h4>
                    <p className="text-purple-200 text-sm">Rendimiento y profit</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-slate-800 border-purple-500">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Server className="w-5 h-5 mr-2 text-blue-400" />
                    Estado del Sistema
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Servidor Principal</span>
                      <Badge className="bg-green-600">ONLINE</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Base de Datos</span>
                      <Badge className="bg-green-600">ONLINE</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">API Gateway</span>
                      <Badge className="bg-green-600">ONLINE</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Servicio de Auth</span>
                      <Badge className="bg-green-600">ONLINE</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-slate-800 border-purple-500">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-green-400" />
                    Recursos del Sistema
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">CPU Usage</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={realTimeMetrics.systemLoad} className="w-24 h-2" />
                        <span className="text-white text-sm">{realTimeMetrics.systemLoad.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Memoria</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={realTimeMetrics.memoryUsage} className="w-24 h-2" />
                        <span className="text-white text-sm">{realTimeMetrics.memoryUsage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Almacenamiento</span>
                      <span className="text-white text-sm">234 GB / 1 TB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Ancho de Banda</span>
                      <span className="text-white text-sm">{realTimeMetrics.networkTraffic} MB/s</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showUserWizard && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-800 rounded-2xl border border-purple-500 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Crear Nuevo Usuario</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowUserWizard(false)}
                    className="text-purple-200 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <UserCreationWizard onUserCreated={handleUserCreated} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSecurityDashboard && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 rounded-2xl border border-purple-500 w-full h-full max-w-[95vw] max-h-[95vh] overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Dashboard de Seguridad Avanzado</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSecurityDashboard(false)}
                    className="text-purple-200 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <AdvancedSecurityDashboard />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;