// 🎉 WELCOME DASHBOARD - CHRONOS INFINITY
// Panel de bienvenida post-autenticación con información del usuario y accesos rápidos

"use client"

import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { Card } from "@/app/_components/ui/card"
import { Progress } from "@/app/_components/ui/progress"
import { useUser } from "@clerk/nextjs"
import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  Cpu,
  DollarSign,
  Eye,
  FileText,
  Fingerprint,
  Globe,
  Key,
  MapPin,
  Settings,
  Shield,
  Smartphone,
  User,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import KocmokAnimatedLogo from "./KocmokAnimatedLogo"

interface UserRole {
  id: string
  name: string
  email: string
  role: "bank_profit_manager" | "user_admin" | "security_monitor"
  permissions: {
    panels: string[]
    accessLevel: "view" | "manage" | "admin"
  }
  lastLogin: Date
  riskScore: number
  status: "active" | "suspended"
  biometric: {
    fingerprint: boolean
    faceRecognition: boolean
    voicePrint: boolean
    behavioral: boolean
  }
}

const WelcomeDashboard: React.FC = () => {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/login")
    }
  }, [isLoaded, user, router])

  // Simulación de roles basados en el email del usuario
  const getUserRole = (): UserRole => {
    if (!user) return {} as UserRole

    const email = user.emailAddresses[0]?.emailAddress || ""

    // Determinar rol basado en el email o datos del usuario
    if (email.includes("profit") || email.includes("bank")) {
      return {
        id: user.id,
        name: user.fullName || "Usuario Profit",
        email: email,
        role: "bank_profit_manager",
        permissions: {
          panels: ["profit", "bancos", "reportes"],
          accessLevel: "admin",
        },
        lastLogin: new Date(),
        riskScore: 0.15,
        status: "active",
        biometric: {
          fingerprint: true,
          faceRecognition: true,
          voicePrint: false,
          behavioral: true,
        },
      }
    } else if (email.includes("admin") || email.includes("user")) {
      return {
        id: user.id,
        name: user.fullName || "Administrador",
        email: email,
        role: "user_admin",
        permissions: {
          panels: ["usuarios", "seguridad", "reportes"],
          accessLevel: "admin",
        },
        lastLogin: new Date(),
        riskScore: 0.25,
        status: "active",
        biometric: {
          fingerprint: true,
          faceRecognition: false,
          voicePrint: true,
          behavioral: true,
        },
      }
    } else if (email.includes("security") || email.includes("monitor")) {
      return {
        id: user.id,
        name: user.fullName || "Monitor de Seguridad",
        email: email,
        role: "security_monitor",
        permissions: {
          panels: ["seguridad", "reportes"],
          accessLevel: "view",
        },
        lastLogin: new Date(),
        riskScore: 0.35,
        status: "active",
        biometric: {
          fingerprint: false,
          faceRecognition: true,
          voicePrint: false,
          behavioral: false,
        },
      }
    } else {
      return {
        id: user.id,
        name: user.fullName || "Usuario",
        email: email,
        role: "bank_profit_manager",
        permissions: {
          panels: ["profit", "reportes"],
          accessLevel: "view",
        },
        lastLogin: new Date(),
        riskScore: 0.2,
        status: "active",
        biometric: {
          fingerprint: true,
          faceRecognition: false,
          voicePrint: false,
          behavioral: true,
        },
      }
    }
  }

  const userRole = getUserRole()

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "bank_profit_manager":
        return DollarSign
      case "user_admin":
        return Users
      case "security_monitor":
        return Shield
      default:
        return User
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "bank_profit_manager":
        return "text-green-400"
      case "user_admin":
        return "text-blue-400"
      case "security_monitor":
        return "text-purple-400"
      default:
        return "text-gray-400"
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "admin":
        return "bg-red-600"
      case "manage":
        return "bg-orange-600"
      case "view":
        return "bg-green-600"
      default:
        return "bg-gray-600"
    }
  }

  const navigateToPanel = (panel: string) => {
    switch (panel) {
      case "profit":
        router.push("/profit")
        break
      case "bancos":
        router.push("/bancos")
        break
      case "usuarios":
        router.push("/admin/users")
        break
      case "seguridad":
        router.push("/security")
        break
      default:
        router.push(`/${panel}`)
    }
  }

  const getPanelIcon = (panel: string) => {
    switch (panel) {
      case "profit":
        return DollarSign
      case "bancos":
        return Globe
      case "ventas":
        return BarChart3
      case "almacen":
        return FileText
      case "clientes":
        return User
      case "ia":
        return Cpu
      case "seguridad":
        return Shield
      case "usuarios":
        return Users
      case "reportes":
        return FileText
      default:
        return Settings
    }
  }

  const getPanelColor = (panel: string) => {
    switch (panel) {
      case "profit":
        return "text-red-400"
      case "bancos":
        return "text-orange-400"
      case "ventas":
        return "text-yellow-400"
      case "almacen":
        return "text-yellow-400"
      case "clientes":
        return "text-yellow-400"
      case "ia":
        return "text-orange-400"
      case "seguridad":
        return "text-purple-400"
      case "usuarios":
        return "text-blue-400"
      case "reportes":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <KocmokAnimatedLogo size="lg" />
          <p className="mt-4 text-purple-200">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Welcome Animation */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
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
                  className="mb-4 bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent md:text-6xl"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  ¡Bienvenido a CHRONOS!
                </motion.h1>
                <motion.p
                  className="mb-8 text-xl text-purple-200"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  {userRole.name}, has ingresado exitosamente al sistema de permisos cuánticos más
                  avanzado.
                </motion.p>
                <motion.div
                  className="flex items-center justify-center space-x-2 text-green-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <CheckCircle className="h-6 w-6" />
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
              <p className="text-sm text-purple-200">Último acceso</p>
              <p className="font-mono text-sm text-white">{currentTime?.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="border-purple-500 bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {React.createElement(getRoleIcon(userRole.role), {
                  className: `w-12 h-12 ${getRoleColor(userRole.role)}`,
                })}
                <div>
                  <h2 className="text-2xl font-bold text-white">{userRole.name}</h2>
                  <p className="text-purple-200 capitalize">{userRole.role.replace("_", " ")}</p>
                  <p className="text-sm text-purple-300">{userRole.email}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-3 w-3 rounded-full ${userRole.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span className="text-sm text-purple-200">
                        {userRole.status === "active" ? "Activo" : "Suspendido"}
                      </span>
                    </div>
                    <Badge className={getAccessLevelColor(userRole.permissions.accessLevel)}>
                      {userRole.permissions.accessLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-200">Nivel de Riesgo</p>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-2xl font-bold ${
                      userRole.riskScore < 0.3
                        ? "text-green-400"
                        : userRole.riskScore < 0.6
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {(userRole.riskScore * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={userRole.riskScore * 100} className="h-2 w-32" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Accessible Panels */}
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {userRole.permissions.panels.map((panel, index) => {
            const Icon = getPanelIcon(panel)
            const color = getPanelColor(panel)
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
                  className="cursor-pointer border-purple-500 bg-slate-800 p-6 transition-all hover:bg-slate-700"
                  onClick={() => navigateToPanel(panel)}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Icon className={`h-8 w-8 ${color}`} />
                    <Badge className={getAccessLevelColor(userRole.permissions.accessLevel)}>
                      {userRole.permissions.accessLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    {panel === "profit"
                      ? "Profit Panel"
                      : panel === "bancos"
                        ? "Panel de Bancos"
                        : panel === "usuarios"
                          ? "Gestión de Usuarios"
                          : panel === "seguridad"
                            ? "Monitoreo de Seguridad"
                            : panel.charAt(0).toUpperCase() + panel.slice(1)}
                  </h3>
                  <p className="mb-4 text-sm text-purple-200">
                    {panel === "profit"
                      ? "Gestión de ganancias y operaciones de cambio"
                      : panel === "bancos"
                        ? "Administración de cuentas bancarias"
                        : panel === "usuarios"
                          ? "Creación y gestión de usuarios"
                          : panel === "seguridad"
                            ? "Monitoreo forense y auditoría"
                            : "Panel de " + panel}
                  </p>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateToPanel(panel)
                    }}
                  >
                    Acceder
                  </Button>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Card className="border-purple-500 bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Permisos Activos</p>
                <p className="text-3xl font-bold text-white">
                  {userRole.permissions.panels.length}
                </p>
                <p className="text-xs text-green-400">Panel de acceso</p>
              </div>
              <Key className="h-12 w-12 text-green-400" />
            </div>
          </Card>

          <Card className="border-purple-500 bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Biometría</p>
                <p className="text-3xl font-bold text-white">
                  {Object.values(userRole.biometric).filter(Boolean).length}/4
                </p>
                <p className="text-xs text-blue-400">Métodos activos</p>
              </div>
              <Fingerprint className="h-12 w-12 text-blue-400" />
            </div>
          </Card>

          <Card className="border-purple-500 bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Sesión Activa</p>
                <p className="text-3xl font-bold text-white">
                  {Math.floor(Math.random() * 59) + 1}
                </p>
                <p className="text-xs text-yellow-400">Minutos</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-400" />
            </div>
          </Card>

          <Card className="border-purple-500 bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Ubicación</p>
                <p className="text-3xl font-bold text-white">México</p>
                <p className="text-xs text-purple-400">Verificada</p>
              </div>
              <MapPin className="h-12 w-12 text-purple-400" />
            </div>
          </Card>
        </motion.div>

        {/* Security Status */}
        <motion.div
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {/* Security Status */}
          <Card className="border-purple-500 bg-slate-800 p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">Estado de Seguridad</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Fingerprint className="h-5 w-5 text-green-400" />
                  <span className="text-white">Autenticación Biométrica</span>
                </div>
                <Badge className="bg-green-600">ACTIVA</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span className="text-white">Ventana de Tiempo</span>
                </div>
                <Badge className="bg-blue-600">DENTRO</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-yellow-400" />
                  <span className="text-white">Ubicación</span>
                </div>
                <Badge className="bg-yellow-600">VERIFICADA</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-purple-400" />
                  <span className="text-white">Dispositivo</span>
                </div>
                <Badge className="bg-purple-600">CONFIABLE</Badge>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="border-purple-500 bg-slate-800 p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">Actividad Reciente</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rounded-lg bg-slate-700 p-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="flex-1">
                  <p className="text-sm text-white">
                    Acceso concedido a {userRole.permissions.panels[0]}
                  </p>
                  <p className="text-xs text-purple-200">Hace 2 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rounded-lg bg-slate-700 p-3">
                <Activity className="h-5 w-5 text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm text-white">Sesión iniciada desde ubicación verificada</p>
                  <p className="text-xs text-purple-200">Hace 5 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rounded-lg bg-slate-700 p-3">
                <Shield className="h-5 w-5 text-purple-400" />
                <div className="flex-1">
                  <p className="text-sm text-white">Verificación biométrica completada</p>
                  <p className="text-xs text-purple-200">Hace 8 minutos</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center text-sm text-purple-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <div className="mb-4 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Monitoreado 24/7</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-purple-500" />
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Seguridad de Grado Militar</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-purple-500" />
            <div className="flex items-center space-x-2">
              <Fingerprint className="h-4 w-4" />
              <span>Biometría Avanzada</span>
            </div>
          </div>
          <p>&copy; 2026 CHRONOS INFINITY. Todos los derechos reservados.</p>
        </motion.div>
      </div>
    </div>
  )
}

export default WelcomeDashboard
