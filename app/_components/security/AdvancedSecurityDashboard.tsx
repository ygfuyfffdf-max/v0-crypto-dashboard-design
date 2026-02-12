// 🔐 ADVANCED SECURITY DASHBOARD - CHRONOS INFINITY
// Panel de monitoreo de seguridad con análisis forense en tiempo real

'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Activity,
  Users,
  AlertTriangle,
  Eye,
  Clock,
  MapPin,
  Smartphone,
  Fingerprint,
  Lock,
  Unlock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Bell,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity as ActivityIcon,
  UserCheck,
  UserX,
  Globe,
  Server,
  Database,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Calendar,
  Zap,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Pause,
  Play,
  X
} from 'lucide-react';
import { Card } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';
import { Progress } from '@/app/_components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs';
import { Input } from '@/app/_components/ui/input';
import { Select } from '@/app/_components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useRealtime } from '@/app/_hooks/useRealtime';
import { permissionEngine } from '@/app/_lib/permissions/QuantumPermissionEngine';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  result: 'granted' | 'denied' | 'flagged';
  riskScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    ip: string;
    country: string;
    city: string;
    coordinates: [number, number];
  };
  device: {
    type: string;
    os: string;
    browser: string;
    fingerprint: string;
  };
  metadata: {
    permissionsChecked: string[];
    conditionsEvaluated: string[];
    riskFactors: string[];
    anomalyScore: number;
    behavioralMatch: number;
  };
}

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  lastActivity: Date;
  duration: number;
  actions: number;
  riskScore: number;
  status: 'active' | 'suspicious' | 'blocked';
  location: string;
  device: string;
  ipAddress: string;
}

interface ThreatDetection {
  id: string;
  type: 'brute_force' | 'unusual_access' | 'permission_violation' | 'data_exfiltration' | 'insider_threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  affectedUsers: string[];
  description: string;
  riskScore: number;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  recommendations: string[];
}

interface ComplianceMetric {
  regulation: string;
  compliance: number;
  violations: number;
  lastAudit: Date;
  nextAudit: Date;
  criticalIssues: number;
  warnings: number;
}

const AdvancedSecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [threats, setThreats] = useState<ThreatDetection[]>([]);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [filter, setFilter] = useState({ severity: 'all', timeRange: '24h', search: '' });
  const [isRealTime, setIsRealTime] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Datos de ejemplo para el dashboard
  const generateMockData = useCallback(() => {
    const mockEvents: SecurityEvent[] = [
      {
        id: 'evt_001',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        userId: 'user_123',
        userName: 'Carlos Rodriguez',
        userRole: 'bank_profit_manager',
        action: 'view_profit_data',
        resource: 'profit_panel',
        result: 'granted',
        riskScore: 0.15,
        severity: 'low',
        location: {
          ip: '192.168.1.100',
          country: 'México',
          city: 'Ciudad de México',
          coordinates: [-99.1332, 19.4326]
        },
        device: {
          type: 'desktop',
          os: 'Windows 11',
          browser: 'Chrome 120.0',
          fingerprint: 'fp_abc123def456'
        },
        metadata: {
          permissionsChecked: ['view_profit', 'access_financial_data'],
          conditionsEvaluated: ['time_window', 'device_trusted', 'location_verified'],
          riskFactors: ['normal_behavior', 'trusted_device'],
          anomalyScore: 0.05,
          behavioralMatch: 0.95
        }
      },
      {
        id: 'evt_002',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        userId: 'user_456',
        userName: 'Ana Martinez',
        userRole: 'user_admin',
        action: 'create_user',
        resource: 'user_management',
        result: 'flagged',
        riskScore: 0.65,
        severity: 'medium',
        location: {
          ip: '10.0.0.50',
          country: 'México',
          city: 'Guadalajara',
          coordinates: [-103.3496, 20.6597]
        },
        device: {
          type: 'mobile',
          os: 'iOS 17.2',
          browser: 'Safari',
          fingerprint: 'fp_xyz789uvw012'
        },
        metadata: {
          permissionsChecked: ['create_users', 'manage_permissions'],
          conditionsEvaluated: ['time_window', 'device_verified', 'behavioral_analysis'],
          riskFactors: ['unusual_timing', 'new_device', 'permission_escalation'],
          anomalyScore: 0.35,
          behavioralMatch: 0.72
        }
      },
      {
        id: 'evt_003',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        userId: 'user_789',
        userName: 'Luis Hernandez',
        userRole: 'security_monitor',
        action: 'access_audit_logs',
        resource: 'security_panel',
        result: 'denied',
        riskScore: 0.85,
        severity: 'high',
        location: {
          ip: '45.123.67.89',
          country: 'Rusia',
          city: 'Moscú',
          coordinates: [37.6173, 55.7558]
        },
        device: {
          type: 'desktop',
          os: 'Linux',
          browser: 'Firefox',
          fingerprint: 'fp_suspicious_456'
        },
        metadata: {
          permissionsChecked: ['view_audit_logs', 'access_security_data'],
          conditionsEvaluated: ['geo_location', 'device_trust', 'behavioral_pattern'],
          riskFactors: ['geo_anomaly', 'untrusted_device', 'permission_violation'],
          anomalyScore: 0.78,
          behavioralMatch: 0.23
        }
      }
    ];

    const mockSessions: UserSession[] = [
      {
        id: 'session_001',
        userId: 'user_123',
        userName: 'Carlos Rodriguez',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
        lastActivity: new Date(Date.now() - 1000 * 60 * 2),
        duration: 7200000,
        actions: 45,
        riskScore: 0.15,
        status: 'active',
        location: 'Ciudad de México, MX',
        device: 'Windows Desktop',
        ipAddress: '192.168.1.100'
      },
      {
        id: 'session_002',
        userId: 'user_456',
        userName: 'Ana Martinez',
        startTime: new Date(Date.now() - 1000 * 60 * 30),
        lastActivity: new Date(Date.now() - 1000 * 60 * 5),
        duration: 1500000,
        actions: 12,
        riskScore: 0.65,
        status: 'suspicious',
        location: 'Guadalajara, MX',
        device: 'iPhone',
        ipAddress: '10.0.0.50'
      },
      {
        id: 'session_003',
        userId: 'user_789',
        userName: 'Luis Hernandez',
        startTime: new Date(Date.now() - 1000 * 60 * 45),
        lastActivity: new Date(Date.now() - 1000 * 60 * 20),
        duration: 1500000,
        actions: 3,
        riskScore: 0.85,
        status: 'blocked',
        location: 'Moscú, RU',
        device: 'Linux Desktop',
        ipAddress: '45.123.67.89'
      }
    ];

    const mockThreats: ThreatDetection[] = [
      {
        id: 'threat_001',
        type: 'geo_anomaly',
        severity: 'high',
        detectedAt: new Date(Date.now() - 1000 * 60 * 30),
        affectedUsers: ['user_789'],
        description: 'Acceso desde ubicación geográfica inusual (Rusia)',
        riskScore: 0.85,
        status: 'active',
        recommendations: [
          'Bloquear acceso temporal',
          'Requerir verificación adicional',
          'Notificar al equipo de seguridad',
          'Investigar origen del acceso'
        ]
      },
      {
        id: 'threat_002',
        type: 'permission_violation',
        severity: 'medium',
        detectedAt: new Date(Date.now() - 1000 * 60 * 15),
        affectedUsers: ['user_456'],
        description: 'Intento de crear usuario fuera del horario permitido',
        riskScore: 0.65,
        status: 'investigating',
        recommendations: [
          'Verificar identidad del usuario',
          'Revisar patrones de comportamiento',
          'Aplicar restricciones temporales adicionales'
        ]
      },
      {
        id: 'threat_003',
        type: 'brute_force',
        severity: 'critical',
        detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        affectedUsers: ['user_999'],
        description: 'Múltiples intentos fallidos de autenticación',
        riskScore: 0.95,
        status: 'resolved',
        recommendations: [
          'Bloquear IP temporalmente',
          'Implementar rate limiting',
          'Requerir CAPTCHA',
          'Notificar al usuario afectado'
        ]
      }
    ];

    const mockCompliance: ComplianceMetric[] = [
      {
        regulation: 'SOX',
        compliance: 94,
        violations: 3,
        lastAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        nextAudit: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
        criticalIssues: 1,
        warnings: 2
      },
      {
        regulation: 'GDPR',
        compliance: 89,
        violations: 7,
        lastAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
        nextAudit: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
        criticalIssues: 2,
        warnings: 5
      },
      {
        regulation: 'PCI-DSS',
        compliance: 97,
        violations: 1,
        lastAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
        nextAudit: new Date(Date.now() + 1000 * 60 * 60 * 24 * 70),
        criticalIssues: 0,
        warnings: 1
      }
    ];

    setSecurityEvents(mockEvents);
    setUserSessions(mockSessions);
    setThreats(mockThreats);
    setComplianceMetrics(mockCompliance);
  }, []);

  useEffect(() => {
    generateMockData();
    const interval = setInterval(() => {
      if (isRealTime) {
        setLastUpdate(new Date());
        // Aquí se actualizarían los datos en tiempo real
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [generateMockData, isRealTime]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-900/20 border-red-500';
      case 'high': return 'text-orange-500 bg-orange-900/20 border-orange-500';
      case 'medium': return 'text-yellow-500 bg-yellow-900/20 border-yellow-500';
      default: return 'text-green-500 bg-green-900/20 border-green-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'suspicious': return 'bg-yellow-500';
      case 'blocked': return 'bg-red-500';
      case 'investigating': return 'bg-blue-500';
      case 'resolved': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getThreatTypeColor = (type: string) => {
    switch (type) {
      case 'brute_force': return 'bg-red-600';
      case 'unusual_access': return 'bg-orange-600';
      case 'permission_violation': return 'bg-yellow-600';
      case 'data_exfiltration': return 'bg-purple-600';
      case 'insider_threat': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };

  // Datos para gráficos
  const riskDistribution = [
    { name: 'Bajo', value: securityEvents.filter(e => e.severity === 'low').length, color: '#10B981' },
    { name: 'Medio', value: securityEvents.filter(e => e.severity === 'medium').length, color: '#F59E0B' },
    { name: 'Alto', value: securityEvents.filter(e => e.severity === 'high').length, color: '#EF4444' },
    { name: 'Crítico', value: securityEvents.filter(e => e.severity === 'critical').length, color: '#DC2626' }
  ];

  const activityTimeline = [
    { time: '00:00', events: 12, granted: 10, denied: 2, flagged: 0 },
    { time: '04:00', events: 8, granted: 7, denied: 1, flagged: 0 },
    { time: '08:00', events: 45, granted: 40, denied: 3, flagged: 2 },
    { time: '12:00', events: 67, granted: 60, denied: 5, flagged: 2 },
    { time: '16:00', events: 52, granted: 48, denied: 2, flagged: 2 },
    { time: '20:00', events: 23, granted: 20, denied: 2, flagged: 1 }
  ];

  const complianceData = [
    { regulation: 'SOX', compliance: 94 },
    { regulation: 'GDPR', compliance: 89 },
    { regulation: 'PCI-DSS', compliance: 97 },
    { regulation: 'SOC2', compliance: 92 },
    { regulation: 'HIPAA', compliance: 88 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🔐 Advanced Security Dashboard
            </h1>
            <p className="text-purple-200">
              Monitoreo forense en tiempo real con análisis cuántico de riesgo
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-purple-200">{isRealTime ? 'Tiempo Real' : 'Pausado'}</span>
            </div>
            <Button
              onClick={() => setIsRealTime(!isRealTime)}
              variant="outline"
              className="border-purple-500 text-purple-200"
            >
              {isRealTime ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              onClick={generateMockData}
              variant="outline"
              className="border-purple-500 text-purple-200"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <div className="text-purple-200 text-sm">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Eventos Totales</p>
                <p className="text-3xl font-bold text-white">{securityEvents.length}</p>
                <p className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% vs ayer
                </p>
              </div>
              <Activity className="w-12 h-12 text-purple-400" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Usuarios Activos</p>
                <p className="text-3xl font-bold text-white">{userSessions.filter(s => s.status === 'active').length}</p>
                <p className="text-yellow-400 text-sm flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {userSessions.filter(s => s.status === 'suspicious').length} sospechosos
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Amenazas Activas</p>
                <p className="text-3xl font-bold text-white">{threats.filter(t => t.status === 'active').length}</p>
                <p className="text-red-400 text-sm flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  {threats.filter(t => t.severity === 'critical').length} críticas
                </p>
              </div>
              <Shield className="w-12 h-12 text-red-400" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Compliance Global</p>
                <p className="text-3xl font-bold text-white">
                  {Math.round(complianceMetrics.reduce((acc, curr) => acc + curr.compliance, 0) / complianceMetrics.length)}%
                </p>
                <p className="text-green-400 text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Dentro del objetivo
                </p>
              </div>
              <FileText className="w-12 h-12 text-green-400" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 bg-slate-800 border border-purple-500">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              📊 Vista General
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-600">
              🚨 Eventos de Seguridad
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
              👥 Usuarios y Sesiones
            </TabsTrigger>
            <TabsTrigger value="threats" className="data-[state=active]:bg-purple-600">
              ⚠️ Amenazas
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              📈 Análisis Avanzado
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-purple-600">
              📋 Compliance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Timeline */}
              <Card className="p-6 bg-slate-800 border-purple-500">
                <h3 className="text-xl font-semibold text-white mb-4">Línea de Tiempo de Actividad</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activityTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #7C3AED', borderRadius: '8px' }}
                      labelStyle={{ color: '#E5E7EB' }}
                    />
                    <Area type="monotone" dataKey="granted" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="denied" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="flagged" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Risk Distribution */}
              <Card className="p-6 bg-slate-800 border-purple-500">
                <h3 className="text-xl font-semibold text-white mb-4">Distribución de Riesgo</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card className="p-6 bg-slate-800 border-purple-500">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Eventos de Seguridad</h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Buscar eventos..."
                      value={filter.search}
                      onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                      className="bg-slate-700 border-purple-500 text-white"
                    />
                    <Select
                      value={filter.severity}
                      onValueChange={(value) => setFilter({ ...filter, severity: value })}
                    >
                      <option value="all">Todos</option>
                      <option value="low">Bajo</option>
                      <option value="medium">Medio</option>
                      <option value="high">Alto</option>
                      <option value="critical">Crítico</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {securityEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-slate-700 ${
                        getSeverityColor(event.severity)
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {event.result === 'granted' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : event.result === 'denied' ? (
                            <XCircle className="w-5 h-5 text-red-400" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                          )}
                          <div>
                            <p className="text-white font-medium">{event.action}</p>
                            <p className="text-purple-200 text-sm">{event.userName} - {event.userRole}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm">{event.timestamp.toLocaleTimeString()}</p>
                          <p className="text-purple-200 text-xs">{event.location.country}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <Progress value={event.riskScore * 100} className="w-24 h-2" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6 bg-slate-800 border-purple-500">
              <h3 className="text-xl font-semibold text-white mb-4">Sesiones de Usuario Activas</h3>
              <div className="space-y-3">
                {userSessions.map((session) => (
                  <div key={session.id} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                        <div>
                          <p className="text-white font-medium">{session.userName}</p>
                          <p className="text-purple-200 text-sm">{session.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm">{session.actions} acciones</p>
                        <p className="text-purple-200 text-xs">{Math.round(session.duration / 60000)} min</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-purple-200">
                        <span>{session.device}</span>
                        <span>{session.ipAddress}</span>
                      </div>
                      <Progress value={session.riskScore * 100} className="w-32 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Threats Tab */}
          <TabsContent value="threats">
            <Card className="p-6 bg-slate-800 border-purple-500">
              <h3 className="text-xl font-semibold text-white mb-4">Amenazas Detectadas</h3>
              <div className="space-y-4">
                {threats.map((threat) => (
                  <div key={threat.id} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={getThreatTypeColor(threat.type)}>
                          {threat.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(threat.status)}`} />
                    </div>
                    <p className="text-white mb-2">{threat.description}</p>
                    <p className="text-purple-200 text-sm mb-3">
                      Detectado: {threat.detectedAt.toLocaleString()}
                    </p>
                    <div className="space-y-2">
                      <p className="text-white text-sm font-medium">Recomendaciones:</p>
                      <ul className="space-y-1">
                        {threat.recommendations.map((rec, index) => (
                          <li key={index} className="text-purple-200 text-sm flex items-center">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-slate-800 border-purple-500">
                <h3 className="text-xl font-semibold text-white mb-4">Cumplimiento por Regulación</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complianceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="regulation" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #7C3AED', borderRadius: '8px' }}
                      labelStyle={{ color: '#E5E7EB' }}
                    />
                    <Bar dataKey="compliance" fill="#7C3AED" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 bg-slate-800 border-purple-500">
                <h3 className="text-xl font-semibold text-white mb-4">Métricas de Seguridad</h3>
                <div className="space-y-4">
                  {complianceMetrics.map((metric) => (
                    <div key={metric.regulation} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{metric.regulation}</span>
                        <span className="text-white">{metric.compliance}%</span>
                      </div>
                      <Progress value={metric.compliance} className="h-2" />
                      <div className="flex items-center justify-between text-sm text-purple-200">
                        <span>{metric.violations} violaciones</span>
                        <span>{metric.criticalIssues} críticas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <Card className="p-6 bg-slate-800 border-purple-500">
              <h3 className="text-xl font-semibold text-white mb-4">Reporte de Compliance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left text-purple-200 py-3">Regulación</th>
                      <th className="text-left text-purple-200 py-3">Compliance</th>
                      <th className="text-left text-purple-200 py-3">Violaciones</th>
                      <th className="text-left text-purple-200 py-3">Críticas</th>
                      <th className="text-left text-purple-200 py-3">Advertencias</th>
                      <th className="text-left text-purple-200 py-3">Próxima Auditoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceMetrics.map((metric) => (
                      <tr key={metric.regulation} className="border-b border-slate-700">
                        <td className="text-white py-3">{metric.regulation}</td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <Progress value={metric.compliance} className="w-20 h-2" />
                            <span className="text-white">{metric.compliance}%</span>
                          </div>
                        </td>
                        <td className="text-white py-3">{metric.violations}</td>
                        <td className="text-red-400 py-3">{metric.criticalIssues}</td>
                        <td className="text-yellow-400 py-3">{metric.warnings}</td>
                        <td className="text-purple-200 py-3">{metric.nextAudit.toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Event Detail Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Detalle del Evento</h3>
                  <Button
                    onClick={() => setSelectedEvent(null)}
                    variant="outline"
                    className="border-purple-500 text-purple-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-purple-200 text-sm">Usuario</p>
                      <p className="text-white font-medium">{selectedEvent.userName}</p>
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Rol</p>
                      <p className="text-white font-medium">{selectedEvent.userRole}</p>
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Acción</p>
                      <p className="text-white font-medium">{selectedEvent.action}</p>
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Recurso</p>
                      <p className="text-white font-medium">{selectedEvent.resource}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-purple-200 text-sm">Ubicación</p>
                    <div className="flex items-center space-x-2 text-white">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedEvent.location.city}, {selectedEvent.location.country}</span>
                      <span className="text-purple-200">({selectedEvent.location.ip})</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-purple-200 text-sm">Dispositivo</p>
                    <div className="flex items-center space-x-2 text-white">
                      <Smartphone className="w-4 h-4" />
                      <span>{selectedEvent.device.type} - {selectedEvent.device.os}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-purple-200 text-sm">Análisis de Riesgo</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Puntuación de Riesgo</span>
                        <Badge className={getSeverityColor(selectedEvent.severity)}>
                          {(selectedEvent.riskScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress value={selectedEvent.riskScore * 100} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <p className="text-purple-200 text-sm">Factores de Riesgo</p>
                    <div className="space-y-1">
                      {selectedEvent.metadata.riskFactors.map((factor, index) => (
                        <div key={index} className="text-white text-sm flex items-center">
                          <span className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdvancedSecurityDashboard;