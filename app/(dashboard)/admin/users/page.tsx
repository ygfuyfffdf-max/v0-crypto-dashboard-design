// 🔐 USER CREATION ADMINISTRATOR DASHBOARD - CHRONOS INFINITY
// Panel de administración para creación de usuarios con permisos granulares

"use client"

import UserCreationWizard from "@/app/_components/admin/UserCreationWizard"
import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { Card } from "@/app/_components/ui/card"
import { Input } from "@/app/_components/ui/input"
import { Progress } from "@/app/_components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs"
import {
  AlertCircle,
  BarChart3,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Filter,
  Key,
  RefreshCw,
  Shield,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react"
import React, { useState } from "react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  status: "active" | "suspended" | "pending"
  riskScore: number
  lastLogin: Date
  permissions: {
    panels: string[]
    accessLevel: "view" | "manage" | "admin"
  }
  biometric: {
    fingerprint: boolean
    faceRecognition: boolean
    voicePrint: boolean
    behavioral: boolean
  }
  restrictions: {
    timeWindows: number
    locations: number
    devices: number
  }
  createdAt: Date
  createdBy: string
}

interface PermissionRequest {
  id: string
  userId: string
  userName: string
  requestedPermission: string
  reason: string
  urgency: "low" | "medium" | "high" | "critical"
  status: "pending" | "approved" | "denied"
  requestedAt: Date
  expiresAt?: Date
}

const UserCreationAdministrator: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [showWizard, setShowWizard] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterRole, setFilterRole] = useState("all")

  // Datos de ejemplo para usuarios
  const mockUsers: User[] = [
    {
      id: "user_001",
      firstName: "Carlos",
      lastName: "Rodriguez",
      email: "carlos.rodriguez@company.com",
      role: "bank_profit_manager",
      department: "Finanzas",
      status: "active",
      riskScore: 0.15,
      lastLogin: new Date(Date.now() - 1000 * 60 * 30),
      permissions: {
        panels: ["profit", "bancos", "reportes"],
        accessLevel: "admin",
      },
      biometric: {
        fingerprint: true,
        faceRecognition: true,
        voicePrint: false,
        behavioral: true,
      },
      restrictions: {
        timeWindows: 2,
        locations: 3,
        devices: 2,
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      createdBy: "admin_001",
    },
    {
      id: "user_002",
      firstName: "Ana",
      lastName: "Martinez",
      email: "ana.martinez@company.com",
      role: "user_admin",
      department: "TI",
      status: "active",
      riskScore: 0.25,
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
      permissions: {
        panels: ["usuarios", "seguridad", "reportes"],
        accessLevel: "admin",
      },
      biometric: {
        fingerprint: true,
        faceRecognition: false,
        voicePrint: true,
        behavioral: true,
      },
      restrictions: {
        timeWindows: 1,
        locations: 1,
        devices: 1,
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      createdBy: "admin_001",
    },
    {
      id: "user_003",
      firstName: "Luis",
      lastName: "Hernandez",
      email: "luis.hernandez@company.com",
      role: "security_monitor",
      department: "Seguridad",
      status: "pending",
      riskScore: 0.35,
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      permissions: {
        panels: ["seguridad", "reportes"],
        accessLevel: "view",
      },
      biometric: {
        fingerprint: false,
        faceRecognition: true,
        voicePrint: false,
        behavioral: false,
      },
      restrictions: {
        timeWindows: 3,
        locations: 2,
        devices: 1,
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      createdBy: "admin_002",
    },
  ]

  const mockPermissionRequests: PermissionRequest[] = [
    {
      id: "req_001",
      userId: "user_004",
      userName: "Maria Lopez",
      requestedPermission: "profit_panel_admin",
      reason: "Necesito acceso completo para gestionar las operaciones de cambio de divisas",
      urgency: "high",
      status: "pending",
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
    {
      id: "req_002",
      userId: "user_005",
      userName: "Juan Perez",
      requestedPermission: "user_creation_temporal",
      reason: "Solicito acceso temporal para crear usuarios de prueba en el ambiente de desarrollo",
      urgency: "medium",
      status: "approved",
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-600"
      case "suspended":
        return "bg-red-600"
      case "pending":
        return "bg-yellow-600"
      default:
        return "bg-gray-600"
    }
  }

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 0.3) return "text-green-400"
    if (riskScore < 0.6) return "text-yellow-400"
    return "text-red-400"
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-600"
      case "high":
        return "bg-orange-600"
      case "medium":
        return "bg-yellow-600"
      default:
        return "bg-green-600"
    }
  }

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesStatus && matchesRole
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">👥 User Creation Administrator</h1>
            <p className="text-purple-200">
              Gestión avanzada de usuarios con permisos granulares y seguridad cuántica
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowWizard(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Crear Usuario Avanzado
            </Button>
            <Button variant="outline" className="border-purple-500 text-purple-200">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-purple-500 bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Usuarios Activos</p>
                <p className="text-3xl font-bold text-white">
                  {mockUsers.filter((u) => u.status === "active").length}
                </p>
                <p className="flex items-center text-sm text-green-400">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  +5% este mes
                </p>
              </div>
              <Users className="h-12 w-12 text-green-400" />
            </div>
          </Card>

          <Card className="border-purple-500 bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Pendientes</p>
                <p className="text-3xl font-bold text-white">
                  {mockUsers.filter((u) => u.status === "pending").length}
                </p>
                <p className="flex items-center text-sm text-yellow-400">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  Requieren aprobación
                </p>
              </div>
              <Clock className="h-12 w-12 text-yellow-400" />
            </div>
          </Card>

          <Card className="border-purple-500 bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Solicitudes</p>
                <p className="text-3xl font-bold text-white">
                  {mockPermissionRequests.filter((r) => r.status === "pending").length}
                </p>
                <p className="flex items-center text-sm text-orange-400">
                  <Key className="mr-1 h-4 w-4" />
                  Por revisar
                </p>
              </div>
              <Key className="h-12 w-12 text-orange-400" />
            </div>
          </Card>

          <Card className="border-purple-500 bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Riesgo Promedio</p>
                <p className="text-3xl font-bold text-white">
                  {(
                    (mockUsers.reduce((acc, user) => acc + user.riskScore, 0) / mockUsers.length) *
                    100
                  ).toFixed(0)}
                  %
                </p>
                <p className="flex items-center text-sm text-green-400">
                  <Shield className="mr-1 h-4 w-4" />
                  Dentro del límite
                </p>
              </div>
              <Shield className="h-12 w-12 text-blue-400" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 border border-purple-500 bg-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              📊 Vista General
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
              👥 Gestión de Usuarios
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-purple-600">
              🔑 Solicitudes de Permisos
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <Card className="border-purple-500 bg-slate-800 p-6">
                <h3 className="mb-4 text-xl font-semibold text-white">Actividad Reciente</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 rounded-lg bg-slate-700 p-3">
                    <UserPlus className="h-5 w-5 text-green-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">Usuario creado: Carlos Rodriguez</p>
                      <p className="text-xs text-purple-200">Hace 2 horas</p>
                    </div>
                    <Badge className="bg-green-600 text-xs">ÉXITO</Badge>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg bg-slate-700 p-3">
                    <Key className="h-5 w-5 text-yellow-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        Permiso solicitado: Acceso a Profit Panel
                      </p>
                      <p className="text-xs text-purple-200">Hace 4 horas</p>
                    </div>
                    <Badge className="bg-yellow-600 text-xs">PENDIENTE</Badge>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg bg-slate-700 p-3">
                    <Shield className="h-5 w-5 text-red-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">Usuario bloqueado: Luis Hernandez</p>
                      <p className="text-xs text-purple-200">Hace 6 horas</p>
                    </div>
                    <Badge className="bg-red-600 text-xs">SEGURIDAD</Badge>
                  </div>
                </div>
              </Card>

              {/* Permission Distribution */}
              <Card className="border-purple-500 bg-slate-800 p-6">
                <h3 className="mb-4 text-xl font-semibold text-white">Distribución de Permisos</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-red-400" />
                      <span className="text-white">Profit Panel</span>
                    </div>
                    <span className="text-purple-200">
                      {mockUsers.filter((u) => u.permissions.panels.includes("profit")).length}{" "}
                      usuarios
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-orange-400" />
                      <span className="text-white">Bancos</span>
                    </div>
                    <span className="text-purple-200">
                      {mockUsers.filter((u) => u.permissions.panels.includes("bancos")).length}{" "}
                      usuarios
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-5 w-5 text-yellow-400" />
                      <span className="text-white">Ventas</span>
                    </div>
                    <span className="text-purple-200">
                      {mockUsers.filter((u) => u.permissions.panels.includes("ventas")).length}{" "}
                      usuarios
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-purple-400" />
                      <span className="text-white">Seguridad</span>
                    </div>
                    <span className="text-purple-200">
                      {mockUsers.filter((u) => u.permissions.panels.includes("seguridad")).length}{" "}
                      usuarios
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-400" />
                      <span className="text-white">Usuarios</span>
                    </div>
                    <span className="text-purple-200">
                      {mockUsers.filter((u) => u.permissions.panels.includes("usuarios")).length}{" "}
                      usuarios
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-purple-500 bg-slate-800 p-6">
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar usuarios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-purple-500 bg-slate-700 text-white"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded border-purple-500 bg-slate-700 px-3 py-2 text-white"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="pending">Pendientes</option>
                    <option value="suspended">Suspendidos</option>
                  </select>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="rounded border-purple-500 bg-slate-700 px-3 py-2 text-white"
                  >
                    <option value="all">Todos los roles</option>
                    <option value="bank_profit_manager">Bank Profit Manager</option>
                    <option value="user_admin">User Administrator</option>
                    <option value="security_monitor">Security Monitor</option>
                  </select>
                  <Button variant="outline" className="border-purple-500 text-purple-200">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                  </Button>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="py-3 text-left text-purple-200">Usuario</th>
                        <th className="py-3 text-left text-purple-200">Rol</th>
                        <th className="py-3 text-left text-purple-200">Departamento</th>
                        <th className="py-3 text-left text-purple-200">Estado</th>
                        <th className="py-3 text-left text-purple-200">Riesgo</th>
                        <th className="py-3 text-left text-purple-200">Último Acceso</th>
                        <th className="py-3 text-left text-purple-200">Permisos</th>
                        <th className="py-3 text-left text-purple-200">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-slate-700 hover:bg-slate-700/50"
                        >
                          <td className="py-3">
                            <div>
                              <p className="font-medium text-white">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-purple-200">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-3 text-white">
                            <Badge className="bg-purple-600 text-xs">
                              {user.role.replace("_", " ").toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 text-purple-200">{user.department}</td>
                          <td className="py-3">
                            <Badge className={`${getStatusColor(user.status)} text-xs`}>
                              {user.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${getRiskColor(user.riskScore)}`}>
                                {(user.riskScore * 100).toFixed(0)}%
                              </span>
                              <Progress value={user.riskScore * 100} className="h-2 w-16" />
                            </div>
                          </td>
                          <td className="py-3 text-purple-200">
                            {user.lastLogin.toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.panels.map((panel) => (
                                <Badge key={panel} className="bg-blue-600 text-xs">
                                  {panel}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-purple-500 text-purple-200"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-500 text-blue-400"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Permission Requests Tab */}
          <TabsContent value="requests">
            <Card className="border-purple-500 bg-slate-800 p-6">
              <h3 className="mb-4 text-xl font-semibold text-white">Solicitudes de Permisos</h3>
              <div className="space-y-4">
                {mockPermissionRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-lg border border-slate-600 bg-slate-700 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {request.urgency.toUpperCase()}
                        </Badge>
                        <Badge
                          className={
                            request.status === "approved"
                              ? "bg-green-600"
                              : request.status === "denied"
                                ? "bg-red-600"
                                : "bg-yellow-600"
                          }
                        >
                          {request.status.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-sm text-purple-200">
                        {request.requestedAt.toLocaleString()}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="font-medium text-white">{request.userName}</p>
                      <p className="text-sm text-purple-200">{request.requestedPermission}</p>
                    </div>
                    <p className="mb-4 text-sm text-white">{request.reason}</p>
                    {request.status === "pending" && (
                      <div className="flex items-center space-x-3">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprobar
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-900/30"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Denegar
                        </Button>
                        <Button variant="outline" className="border-blue-500 text-blue-400">
                          <Edit className="mr-2 h-4 w-4" />
                          Modificar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Creation Wizard Modal */}
        {showWizard && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-lg border border-purple-500 bg-slate-800">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Crear Usuario Avanzado</h2>
                  <Button
                    onClick={() => setShowWizard(false)}
                    variant="outline"
                    className="border-purple-500 text-purple-200"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
                <UserCreationWizard />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserCreationAdministrator
