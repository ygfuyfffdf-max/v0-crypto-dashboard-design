// 🔐 ADVANCED USER CREATION WIZARD - CHRONOS INFINITY
// Sistema de creación de usuarios con permisos granulares multi-dimensionales

"use client"

import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { Card } from "@/app/_components/ui/card"
import { Input } from "@/app/_components/ui/input"
import { Progress } from "@/app/_components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs"
import {
  ActionRestriction,
  DeviceRestriction,
  FieldPermissions,
  LocationRestriction,
  PermissionRestrictions,
  TimeWindow,
} from "@/app/_lib/permissions/QuantumPermissionEngine"
import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  AlertCircle,
  BarChart3,
  Building,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  DollarSign,
  Edit3,
  FileText,
  Fingerprint,
  Key,
  Lock,
  Plus,
  Save,
  Settings,
  Shield,
  ShieldAlert,
  Trash2,
  User,
  Users,
} from "lucide-react"
import React, { useEffect, useState } from "react"

interface UserData {
  basicInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    employeeId: string
    department: string
    position: string
    startDate: string
    manager: string
  }
  role: {
    primaryRole: string
    secondaryRoles: string[]
    seniorityLevel: "junior" | "mid" | "senior" | "executive"
    clearanceLevel: "basic" | "confidential" | "secret" | "top_secret"
  }
  permissions: {
    panelAccess: { [panelId: string]: PanelAccessConfig }
    globalPermissions: string[]
    restrictions: PermissionRestrictions
  }
  restrictions: {
    timeWindows: TimeWindow[]
    locations: LocationRestriction[]
    devices: DeviceRestriction[]
    actions: ActionRestriction[]
    riskThreshold: number
  }
  biometric: {
    fingerprint: boolean
    faceRecognition: boolean
    irisScan: boolean
    voicePrint: boolean
    behavioral: boolean
  }
  approvalChain: {
    managerApproval: boolean
    hrApproval: boolean
    securityApproval: boolean
    complianceApproval: boolean
    executiveApproval: boolean
  }
}

interface PanelAccessConfig {
  enabled: boolean
  accessLevel: "view" | "manage" | "admin"
  fieldPermissions: FieldPermissions
  customRestrictions?: PermissionRestrictions
  riskOverride?: number
}

interface StepProps {
  userData: UserData
  onUpdate: (data: Partial<UserData>) => void
  onNext: () => void
  onPrevious?: () => void
}

interface UserCreationWizardProps {
  onUserCreated?: (newUser: any) => void
}

const UserCreationWizard: React.FC<UserCreationWizardProps> = ({ onUserCreated }) => {
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState<UserData>({
    basicInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      employeeId: "",
      department: "",
      position: "",
      startDate: "",
      manager: "",
    },
    role: {
      primaryRole: "",
      secondaryRoles: [],
      seniorityLevel: "junior",
      clearanceLevel: "basic",
    },
    permissions: {
      panelAccess: {},
      globalPermissions: [],
      restrictions: {},
    },
    restrictions: {
      timeWindows: [],
      locations: [],
      devices: [],
      actions: [],
      riskThreshold: 0.7,
    },
    biometric: {
      fingerprint: false,
      faceRecognition: false,
      irisScan: false,
      voicePrint: false,
      behavioral: false,
    },
    approvalChain: {
      managerApproval: false,
      hrApproval: false,
      securityApproval: false,
      complianceApproval: false,
      executiveApproval: false,
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(
    null
  )

  const steps = [
    { id: 1, title: "Información Básica", icon: User },
    { id: 2, title: "Rol y Responsabilidades", icon: Shield },
    { id: 3, title: "Permisos Granulares", icon: Key },
    { id: 4, title: "Restricciones y Condiciones", icon: Lock },
    { id: 5, title: "Biometría y Seguridad", icon: Fingerprint },
    { id: 6, title: "Aprobaciones", icon: CheckCircle },
    { id: 7, title: "Revisión y Confirmación", icon: Save },
  ]

  const handleUpdate = (data: Partial<UserData>) => {
    setUserData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (step < steps.length) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Aquí se enviaría a la API
      console.log("Creating user with data:", userData)
      setSubmitResult({ success: true, message: "Usuario creado exitosamente" })

      // Llamar al callback si existe
      if (onUserCreated) {
        onUserCreated(userData)
      }
    } catch (error) {
      setSubmitResult({ success: false, message: "Error al crear usuario" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCurrentStep = () => {
    const stepProps: StepProps = {
      userData,
      onUpdate: handleUpdate,
      onNext: handleNext,
      onPrevious: handlePrevious,
    }

    switch (step) {
      case 1:
        return <BasicInfoStep {...stepProps} />
      case 2:
        return <RoleSelectionStep {...stepProps} />
      case 3:
        return <GranularPermissionsStep {...stepProps} />
      case 4:
        return <RestrictionsStep {...stepProps} />
      case 5:
        return <BiometricStep {...stepProps} />
      case 6:
        return <ApprovalChainStep {...stepProps} />
      case 7:
        return <ReviewStep {...stepProps} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">
            🔐 Sistema de Creación de Usuarios Avanzado
          </h1>
          <p className="text-purple-200">Configuración granular de permisos y seguridad cuántica</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon
              return (
                <div key={stepItem.id} className="flex items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                      step >= stepItem.id
                        ? "border-purple-400 bg-purple-600 text-white"
                        : "border-slate-600 bg-slate-700 text-slate-400"
                    } `}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p className="text-sm font-medium text-white">{stepItem.title}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-0.5 w-16 transition-all ${step > stepItem.id ? "bg-purple-600" : "bg-slate-600"} `}
                    />
                  )}
                </div>
              )
            })}
          </div>
          <Progress value={(step / steps.length) * 100} className="h-2" />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>

        {/* Result Modal */}
        {submitResult && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <Card className="max-w-md p-6">
              <div className="text-center">
                {submitResult.success ? (
                  <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                ) : (
                  <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
                )}
                <h3 className="mb-2 text-xl font-semibold">
                  {submitResult.success ? "¡Éxito!" : "Error"}
                </h3>
                <p className="mb-4 text-gray-600">{submitResult.message}</p>
                <Button onClick={() => setSubmitResult(null)}>Cerrar</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

// Step 1: Basic Information
const BasicInfoStep: React.FC<StepProps> = ({ userData, onUpdate, onNext }) => {
  const [formData, setFormData] = useState(userData.basicInfo)

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate({ basicInfo: updated })
  }

  return (
    <Card className="border-purple-500 bg-slate-800 p-8">
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Información Personal</h2>
          <p className="text-purple-200">Complete los datos básicos del usuario</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-purple-200">Nombre</label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="border-purple-500 bg-slate-700 text-white"
              placeholder="John"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-purple-200">Apellido</label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="border-purple-500 bg-slate-700 text-white"
              placeholder="Doe"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-purple-200">
              Email Corporativo
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="border-purple-500 bg-slate-700 text-white"
              placeholder="john.doe@company.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-purple-200">Teléfono</label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="border-purple-500 bg-slate-700 text-white"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-purple-200">ID de Empleado</label>
            <Input
              value={formData.employeeId}
              onChange={(e) => handleChange("employeeId", e.target.value)}
              className="border-purple-500 bg-slate-700 text-white"
              placeholder="EMP001"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-purple-200">Departamento</label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleChange("department", value)}
            >
              <option value="">Seleccionar departamento</option>
              <option value="finance">Finanzas</option>
              <option value="hr">Recursos Humanos</option>
              <option value="it">Tecnología</option>
              <option value="operations">Operaciones</option>
              <option value="compliance">Cumplimiento</option>
              <option value="security">Seguridad</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-purple-200">Posición</label>
            <Input
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              className="border-purple-500 bg-slate-700 text-white"
              placeholder="Financial Manager"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-purple-200">
              Fecha de Inicio
            </label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="border-purple-500 bg-slate-700 text-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-purple-200">Manager Directo</label>
          <Input
            value={formData.manager}
            onChange={(e) => handleChange("manager", e.target.value)}
            className="border-purple-500 bg-slate-700 text-white"
            placeholder="Jane Smith"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext} className="bg-purple-600 hover:bg-purple-700">
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Step 2: Role Selection
const RoleSelectionStep: React.FC<StepProps> = ({ userData, onUpdate, onNext, onPrevious }) => {
  const [roleData, setRoleData] = useState(userData.role)

  const handleChange = (field: string, value: any) => {
    const updated = { ...roleData, [field]: value }
    setRoleData(updated)
    onUpdate({ role: updated })
  }

  const availableRoles = [
    {
      value: "bank_profit_manager",
      label: "Bank Profit Manager",
      description: "Gestión bancaria y de ganancias",
    },
    {
      value: "user_admin",
      label: "User Administrator",
      description: "Administración de usuarios y permisos",
    },
    {
      value: "security_monitor",
      label: "Security Monitor",
      description: "Monitoreo de seguridad y auditoría",
    },
    {
      value: "financial_manager",
      label: "Financial Manager",
      description: "Gestión financiera general",
    },
    { value: "accountant", label: "Accountant", description: "Contabilidad y reportes" },
    { value: "analyst", label: "Analyst", description: "Análisis de datos y reportes" },
    { value: "ceo", label: "CEO", description: "Ejecutivo Principal" },
    { value: "cfo", label: "CFO", description: "Director Financiero" },
    { value: "admin", label: "System Admin", description: "Administrador del Sistema" },
  ]

  return (
    <Card className="border-purple-500 bg-slate-800 p-8">
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Rol y Responsabilidades</h2>
          <p className="text-purple-200">Defina el rol y nivel de acceso del usuario</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-purple-200">Rol Principal</label>
            <Select
              value={roleData.primaryRole}
              onValueChange={(value) => handleChange("primaryRole", value)}
            >
              <option value="">Seleccionar rol principal</option>
              {availableRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label} - {role.description}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-purple-200">
                Nivel de Seniority
              </label>
              <Select
                value={roleData.seniorityLevel}
                onValueChange={(value) => handleChange("seniorityLevel", value)}
              >
                <option value="junior">Junior</option>
                <option value="mid">Mid-Level</option>
                <option value="senior">Senior</option>
                <option value="executive">Executive</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-purple-200">
                Nivel de Clearance
              </label>
              <Select
                value={roleData.clearanceLevel}
                onValueChange={(value) => handleChange("clearanceLevel", value)}
              >
                <option value="basic">Basic</option>
                <option value="confidential">Confidential</option>
                <option value="secret">Secret</option>
                <option value="top_secret">Top Secret</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-purple-200">
              Roles Secundarios
            </label>
            <div className="space-y-2">
              {availableRoles.map((role) => (
                <label key={role.value} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={roleData.secondaryRoles.includes(role.value)}
                    onChange={(e) => {
                      const updatedRoles = e.target.checked
                        ? [...roleData.secondaryRoles, role.value]
                        : roleData.secondaryRoles.filter((r) => r !== role.value)
                      handleChange("secondaryRoles", updatedRoles)
                    }}
                    className="rounded border-purple-500 bg-slate-700"
                  />
                  <span className="text-white">{role.label}</span>
                  <span className="text-sm text-purple-300">({role.description})</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-purple-500 text-purple-200"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button onClick={onNext} className="bg-purple-600 hover:bg-purple-700">
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Step 3: Granular Permissions
const GranularPermissionsStep: React.FC<StepProps> = ({
  userData,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  const [permissions, setPermissions] = useState(userData.permissions)
  const [selectedPanels, setSelectedPanels] = useState<string[]>([])

  const panelOptions = [
    {
      id: "profit",
      label: "Panel de Profit",
      description: "Acceso a información de ganancias y utilidades",
      risk: "CRITICAL",
      icon: DollarSign,
      color: "text-red-400",
      bgColor: "bg-red-900/20",
    },
    {
      id: "bancos",
      label: "Panel de Bancos",
      description: "Gestión de cuentas bancarias y transferencias",
      risk: "HIGH",
      icon: Building,
      color: "text-orange-400",
      bgColor: "bg-orange-900/20",
    },
    {
      id: "ventas",
      label: "Panel de Ventas",
      description: "Información de ventas y clientes",
      risk: "MEDIUM",
      icon: BarChart3,
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
    },
    {
      id: "almacen",
      label: "Panel de Almacén",
      description: "Gestión de inventario y stock",
      risk: "MEDIUM",
      icon: FileText,
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
    },
    {
      id: "clientes",
      label: "Panel de Clientes",
      description: "Información de clientes y CRM",
      risk: "MEDIUM",
      icon: Users,
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
    },
    {
      id: "ia",
      label: "Panel de IA",
      description: "Análisis de inteligencia artificial",
      risk: "HIGH",
      icon: Cpu,
      color: "text-orange-400",
      bgColor: "bg-orange-900/20",
    },
    {
      id: "seguridad",
      label: "Panel de Seguridad",
      description: "Monitoreo de seguridad y auditoría",
      risk: "CRITICAL",
      icon: ShieldAlert,
      color: "text-red-400",
      bgColor: "bg-red-900/20",
    },
    {
      id: "usuarios",
      label: "Panel de Usuarios",
      description: "Gestión de usuarios y permisos",
      risk: "HIGH",
      icon: Settings,
      color: "text-orange-400",
      bgColor: "bg-orange-900/20",
    },
    {
      id: "reportes",
      label: "Panel de Reportes",
      description: "Generación de reportes y analytics",
      risk: "LOW",
      icon: Activity,
      color: "text-green-400",
      bgColor: "bg-green-900/20",
    },
  ]

  const handlePanelSelection = (panelId: string, selected: boolean) => {
    if (selected) {
      setSelectedPanels([...selectedPanels, panelId])
      // Initialize default permissions for the panel
      const defaultConfig: PanelAccessConfig = {
        enabled: true,
        accessLevel: "view",
        fieldPermissions: { allowed: [], denied: [], masked: [] },
        customRestrictions: {},
        riskOverride: undefined,
      }
      setPermissions({
        ...permissions,
        panelAccess: {
          ...permissions.panelAccess,
          [panelId]: defaultConfig,
        },
      })
    } else {
      setSelectedPanels(selectedPanels.filter((id) => id !== panelId))
      const { [panelId]: removed, ...remaining } = permissions.panelAccess
      setPermissions({
        ...permissions,
        panelAccess: remaining,
      })
    }
  }

  const configurePanelPermissions = (panelId: string) => {
    // This would open a detailed configuration modal
    console.log(`Configuring permissions for panel: ${panelId}`)
  }

  useEffect(() => {
    onUpdate({ permissions })
  }, [permissions])

  return (
    <Card className="border-purple-500 bg-slate-800 p-8">
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Permisos Granulares por Panel</h2>
          <p className="text-purple-200">
            Seleccione los paneles a los que este usuario tendrá acceso y configure los permisos
            específicos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {panelOptions.map((panel) => {
            const Icon = panel.icon
            const isSelected = selectedPanels.includes(panel.id)
            const currentConfig = permissions.panelAccess[panel.id]

            return (
              <div
                key={panel.id}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  isSelected
                    ? "border-purple-500 bg-purple-900/30"
                    : "border-slate-600 bg-slate-700/50 hover:bg-slate-700"
                } `}
                onClick={() => handlePanelSelection(panel.id, !isSelected)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`rounded-lg p-2 ${panel.bgColor}`}>
                    <Icon className={`h-6 w-6 ${panel.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{panel.label}</h3>
                    <p className="mb-2 text-sm text-purple-200">{panel.description}</p>
                    <Badge
                      className={` ${
                        panel.risk === "CRITICAL"
                          ? "bg-red-600"
                          : panel.risk === "HIGH"
                            ? "bg-orange-600"
                            : panel.risk === "MEDIUM"
                              ? "bg-yellow-600"
                              : "bg-green-600"
                      } `}
                    >
                      {panel.risk} RISK
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isSelected && <CheckCircle className="h-5 w-5 text-green-400" />}
                  </div>
                </div>

                {isSelected && currentConfig && (
                  <div className="mt-4 border-t border-slate-600 pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-purple-200">Nivel de Acceso:</span>
                      <select
                        value={currentConfig.accessLevel}
                        onChange={(e) => {
                          const updated = {
                            ...permissions,
                            panelAccess: {
                              ...permissions.panelAccess,
                              [panel.id]: {
                                ...currentConfig,
                                accessLevel: e.target.value as "view" | "manage" | "admin",
                              },
                            },
                          }
                          setPermissions(updated)
                        }}
                        className="rounded border-purple-500 bg-slate-700 px-2 py-1 text-sm text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="view">Ver</option>
                        <option value="manage">Gestionar</option>
                        <option value="admin">Administrar</option>
                      </select>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        configurePanelPermissions(panel.id)
                      }}
                      className="w-full border-purple-500 text-purple-200 hover:bg-purple-900/30"
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Configurar Permisos Detallados
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="rounded-lg bg-slate-700/50 p-4">
          <h3 className="mb-3 font-semibold text-white">Resumen de Permisos Seleccionados</h3>
          <div className="space-y-2">
            {selectedPanels.length === 0 ? (
              <p className="text-purple-200">No se han seleccionado paneles</p>
            ) : (
              selectedPanels.map((panelId) => {
                const panel = panelOptions.find((p) => p.id === panelId)
                const config = permissions.panelAccess[panelId]
                return (
                  <div
                    key={panelId}
                    className="flex items-center justify-between rounded bg-slate-800 p-2"
                  >
                    <div className="flex items-center space-x-2">
                      {panel && <panel.icon className={`h-4 w-4 ${panel.color}`} />}
                      <span className="text-white">{panel?.label}</span>
                    </div>
                    <Badge className="bg-purple-600">{config?.accessLevel.toUpperCase()}</Badge>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-purple-500 text-purple-200"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button onClick={onNext} className="bg-purple-600 hover:bg-purple-700">
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Step 4: Restrictions and Conditions
const RestrictionsStep: React.FC<StepProps> = ({ userData, onUpdate, onNext, onPrevious }) => {
  const [restrictions, setRestrictions] = useState(userData.restrictions)

  const addTimeWindow = () => {
    const newWindow: TimeWindow = {
      start: "09:00",
      end: "18:00",
      days: [1, 2, 3, 4, 5],
      timezone: "America/New_York",
    }
    setRestrictions({
      ...restrictions,
      timeWindows: [...restrictions.timeWindows, newWindow],
    })
  }

  const removeTimeWindow = (index: number) => {
    setRestrictions({
      ...restrictions,
      timeWindows: restrictions.timeWindows.filter((_, i) => i !== index),
    })
  }

  const updateTimeWindow = (index: number, field: keyof TimeWindow, value: any) => {
    const updated = [...restrictions.timeWindows]
    const currentWindow = updated[index]
    if (!currentWindow) return

    updated[index] = {
      start: currentWindow.start,
      end: currentWindow.end,
      days: currentWindow.days,
      timezone: currentWindow.timezone,
      [field]: value,
    }
    setRestrictions({ ...restrictions, timeWindows: updated })
  }

  useEffect(() => {
    onUpdate({ restrictions })
  }, [restrictions])

  return (
    <Card className="border-purple-500 bg-slate-800 p-8">
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Restricciones y Condiciones</h2>
          <p className="text-purple-200">
            Configure restricciones temporales, geográficas y de dispositivos
          </p>
        </div>

        {/* Time Windows */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center text-lg font-semibold text-white">
              <Clock className="mr-2 h-5 w-5" />
              Ventanas de Tiempo
            </h3>
            <Button onClick={addTimeWindow} size="sm" className="bg-purple-600">
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>

          {restrictions.timeWindows.map((window, index) => (
            <Card key={index} className="border-purple-500 bg-slate-700 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-purple-200">
                    Hora Inicio
                  </label>
                  <Input
                    type="time"
                    value={window.start}
                    onChange={(e) => updateTimeWindow(index, "start", e.target.value)}
                    className="border-purple-500 bg-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-purple-200">Hora Fin</label>
                  <Input
                    type="time"
                    value={window.end}
                    onChange={(e) => updateTimeWindow(index, "end", e.target.value)}
                    className="border-purple-500 bg-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-purple-200">
                    Zona Horaria
                  </label>
                  <Select
                    value={window.timezone}
                    onValueChange={(value) => updateTimeWindow(index, "timezone", value)}
                  >
                    <SelectTrigger className="border-purple-500 bg-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-purple-500 bg-slate-700">
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => removeTimeWindow(index)}
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-purple-200">
                  Días Permitidos
                </label>
                <div className="flex space-x-2">
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day, dayIndex) => (
                    <label key={dayIndex} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={window.days.includes(dayIndex)}
                        onChange={(e) => {
                          const updatedDays = e.target.checked
                            ? [...window.days, dayIndex]
                            : window.days.filter((d) => d !== dayIndex)
                          updateTimeWindow(index, "days", updatedDays.sort())
                        }}
                        className="rounded border-purple-500 bg-slate-600"
                      />
                      <span className="text-sm text-white">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Risk Threshold */}
        <div className="space-y-4">
          <h3 className="flex items-center text-lg font-semibold text-white">
            <ShieldAlert className="mr-2 h-5 w-5" />
            Umbral de Riesgo
          </h3>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-200">
              Nivel de Riesgo Máximo Permitido: {(restrictions.riskThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={restrictions.riskThreshold * 100}
              onChange={(e) =>
                setRestrictions({
                  ...restrictions,
                  riskThreshold: parseInt(e.target.value) / 100,
                })
              }
              className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-600"
            />
            <div className="flex justify-between text-xs text-purple-300">
              <span>0% (Sin Riesgo)</span>
              <span>50% (Riesgo Medio)</span>
              <span>100% (Riesgo Alto)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-purple-500 text-purple-200"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button onClick={onNext} className="bg-purple-600 hover:bg-purple-700">
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Step 5: Biometric Configuration
const BiometricStep: React.FC<StepProps> = ({ userData, onUpdate, onNext, onPrevious }) => {
  const [biometric, setBiometric] = useState(userData.biometric)

  useEffect(() => {
    onUpdate({ biometric })
  }, [biometric])

  return (
    <Card className="border-purple-500 bg-slate-800 p-8">
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Biometría y Seguridad</h2>
          <p className="text-purple-200">
            Configure los métodos de autenticación biométrica y de comportamiento
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="border-purple-500 bg-slate-700 p-6">
            <div className="mb-4 flex items-center">
              <Fingerprint className="mr-3 h-8 w-8 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Biometría Tradicional</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-white">Huella Digital</span>
                <input
                  type="checkbox"
                  checked={biometric.fingerprint}
                  onChange={(e) => setBiometric({ ...biometric, fingerprint: e.target.checked })}
                  className="rounded border-purple-500 bg-slate-600"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-white">Reconocimiento Facial</span>
                <input
                  type="checkbox"
                  checked={biometric.faceRecognition}
                  onChange={(e) =>
                    setBiometric({ ...biometric, faceRecognition: e.target.checked })
                  }
                  className="rounded border-purple-500 bg-slate-600"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-white">Escáner de Iris</span>
                <input
                  type="checkbox"
                  checked={biometric.irisScan}
                  onChange={(e) => setBiometric({ ...biometric, irisScan: e.target.checked })}
                  className="rounded border-purple-500 bg-slate-600"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-white">Impresión de Voz</span>
                <input
                  type="checkbox"
                  checked={biometric.voicePrint}
                  onChange={(e) => setBiometric({ ...biometric, voicePrint: e.target.checked })}
                  className="rounded border-purple-500 bg-slate-600"
                />
              </label>
            </div>
          </Card>

          <Card className="border-purple-500 bg-slate-700 p-6">
            <div className="mb-4 flex items-center">
              <Activity className="mr-3 h-8 w-8 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Biometría de Comportamiento</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-white">Patrones de Teclado</span>
                <input
                  type="checkbox"
                  checked={biometric.behavioral}
                  onChange={(e) => setBiometric({ ...biometric, behavioral: e.target.checked })}
                  className="rounded border-purple-500 bg-slate-600"
                />
              </label>
              <div className="space-y-1 text-sm text-purple-200">
                <p>• Ritmo de escritura</p>
                <p>• Presión de teclas</p>
                <p>• Tiempo de permanencia</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="rounded-lg bg-slate-700/50 p-4">
          <h3 className="mb-3 font-semibold text-white">Resumen de Seguridad</h3>
          <div className="space-y-2">
            {Object.entries(biometric).map(([key, value]) => {
              const labels = {
                fingerprint: "Huella Digital",
                faceRecognition: "Reconocimiento Facial",
                irisScan: "Escáner de Iris",
                voicePrint: "Impresión de Voz",
                behavioral: "Biometría de Comportamiento",
              }
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-purple-200">{labels[key as keyof typeof labels]}</span>
                  <Badge className={value ? "bg-green-600" : "bg-gray-600"}>
                    {value ? "Habilitado" : "Deshabilitado"}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-purple-500 text-purple-200"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button onClick={onNext} className="bg-purple-600 hover:bg-purple-700">
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Step 6: Approval Chain
const ApprovalChainStep: React.FC<StepProps> = ({ userData, onUpdate, onNext, onPrevious }) => {
  const [approvals, setApprovals] = useState(userData.approvalChain)

  useEffect(() => {
    onUpdate({ approvalChain: approvals })
  }, [approvals])

  const approvalTypes = [
    { key: "managerApproval", label: "Aprobación de Manager", icon: Users, required: true },
    { key: "hrApproval", label: "Aprobación de RRHH", icon: Users, required: false },
    { key: "securityApproval", label: "Aprobación de Seguridad", icon: Shield, required: false },
    {
      key: "complianceApproval",
      label: "Aprobación de Cumplimiento",
      icon: FileText,
      required: false,
    },
    { key: "executiveApproval", label: "Aprobación Ejecutiva", icon: Users, required: false },
  ]

  return (
    <Card className="border-purple-500 bg-slate-800 p-8">
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Cadena de Aprobaciones</h2>
          <p className="text-purple-200">
            Configure los niveles de aprobación requeridos para la creación de este usuario
          </p>
        </div>

        <div className="space-y-4">
          {approvalTypes.map((approval) => {
            const Icon = approval.icon
            const isEnabled = approvals[approval.key as keyof typeof approvals]

            return (
              <Card key={approval.key} className="border-purple-500 bg-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-white">{approval.label}</h3>
                      <p className="text-sm text-purple-200">
                        {approval.required ? "Requerido" : "Opcional"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {approval.required && <Badge className="bg-red-600">REQUERIDO</Badge>}
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={isEnabled || approval.required}
                        onChange={(e) =>
                          setApprovals({
                            ...approvals,
                            [approval.key]: e.target.checked || approval.required,
                          })
                        }
                        disabled={approval.required}
                        className="peer sr-only"
                      />
                      <div
                        className={`peer h-6 w-11 rounded-full bg-gray-600 peer-checked:bg-purple-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white ${approval.required ? "cursor-not-allowed opacity-50" : ""} `}
                      />
                    </label>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="rounded-lg bg-slate-700/50 p-4">
          <h3 className="mb-3 font-semibold text-white">Flujo de Aprobación</h3>
          <div className="space-y-2">
            {Object.entries(approvals).map(([key, value]) => {
              const approvalType = approvalTypes.find((a) => a.key === key)
              if (!value) return null
              return (
                <div key={key} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-purple-200">{approvalType?.label}</span>
                  {approvalType?.required && (
                    <Badge className="bg-red-600 text-xs">OBLIGATORIO</Badge>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-purple-500 text-purple-200"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button onClick={onNext} className="bg-purple-600 hover:bg-purple-700">
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Step 7: Review and Confirmation
const ReviewStep: React.FC<StepProps & { onSubmit: () => void; isSubmitting: boolean }> = ({
  userData,
  onSubmit,
  isSubmitting,
}) => {
  const [activeTab, setActiveTab] = useState("basic")

  const tabs = [
    { id: "basic", label: "Información Básica", icon: User },
    { id: "role", label: "Rol y Permisos", icon: Shield },
    { id: "security", label: "Seguridad", icon: Fingerprint },
    { id: "approvals", label: "Aprobaciones", icon: CheckCircle },
  ]

  return (
    <Card className="border-purple-500 bg-slate-800 p-8">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Revisión y Confirmación</h2>
          <p className="text-purple-200">Revise toda la configuración antes de crear el usuario</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid grid-cols-4 bg-slate-700">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <h3 className="mb-4 text-lg font-semibold text-white">Información Personal</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="text-purple-200">Nombre:</span>
                <p className="font-medium text-white">
                  {userData.basicInfo.firstName} {userData.basicInfo.lastName}
                </p>
              </div>
              <div>
                <span className="text-purple-200">Email:</span>
                <p className="font-medium text-white">{userData.basicInfo.email}</p>
              </div>
              <div>
                <span className="text-purple-200">Departamento:</span>
                <p className="font-medium text-white">{userData.basicInfo.department}</p>
              </div>
              <div>
                <span className="text-purple-200">Posición:</span>
                <p className="font-medium text-white">{userData.basicInfo.position}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="role" className="space-y-4">
            <h3 className="mb-4 text-lg font-semibold text-white">Rol y Permisos</h3>
            <div className="space-y-4">
              <div>
                <span className="text-purple-200">Rol Principal:</span>
                <p className="font-medium text-white">{userData.role.primaryRole}</p>
              </div>
              <div>
                <span className="text-purple-200">Paneles de Acceso:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.keys(userData.permissions.panelAccess).map((panelId) => {
                    const panelAccess = userData.permissions.panelAccess[panelId]
                    return panelAccess ? (
                      <Badge key={panelId} className="bg-purple-600">
                        {panelId} ({panelAccess.accessLevel})
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
              <div>
                <span className="text-purple-200">Nivel de Clearance:</span>
                <Badge className="ml-2 bg-orange-600">{userData.role.clearanceLevel}</Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <h3 className="mb-4 text-lg font-semibold text-white">Configuración de Seguridad</h3>
            <div className="space-y-2">
              {Object.entries(userData.biometric).map(([key, value]) => {
                const labels = {
                  fingerprint: "Huella Digital",
                  faceRecognition: "Reconocimiento Facial",
                  irisScan: "Escáner de Iris",
                  voicePrint: "Impresión de Voz",
                  behavioral: "Biometría de Comportamiento",
                }
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-purple-200">{labels[key as keyof typeof labels]}</span>
                    <Badge className={value ? "bg-green-600" : "bg-gray-600"}>
                      {value ? "Habilitado" : "Deshabilitado"}
                    </Badge>
                  </div>
                )
              })}
            </div>
            <div className="mt-4">
              <span className="text-purple-200">Umbral de Riesgo:</span>
              <Badge className="ml-2 bg-yellow-600">
                {(userData.restrictions.riskThreshold * 100).toFixed(0)}%
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <h3 className="mb-4 text-lg font-semibold text-white">Cadena de Aprobaciones</h3>
            <div className="space-y-2">
              {Object.entries(userData.approvalChain).map(([key, value]) => {
                const approvalType = [
                  { key: "managerApproval", label: "Manager Directo" },
                  { key: "hrApproval", label: "Recursos Humanos" },
                  { key: "securityApproval", label: "Seguridad" },
                  { key: "complianceApproval", label: "Cumplimiento" },
                  { key: "executiveApproval", label: "Aprobación Ejecutiva" },
                ].find((a) => a.key === key)
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-purple-200">{approvalType?.label}</span>
                    <Badge className={value ? "bg-green-600" : "bg-gray-600"}>
                      {value ? "Requerido" : "No Requerido"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 hover:from-purple-700 hover:to-pink-700"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Creando Usuario...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Crear Usuario Avanzado
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default UserCreationWizard
