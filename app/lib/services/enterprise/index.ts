/**
 * 🌟 CHRONOS ENTERPRISE SUITE - BARREL EXPORTS
 *
 * Sistema completo de capacidades enterprise con IA.
 * NO REQUIERE AZURE - Usa GitHub Models (GRATIS).
 */

// Services
export { DashboardGeneratorService, dashboardGenerator } from './DashboardGeneratorService'
export { EnterpriseAuditService, enterpriseAudit } from './EnterpriseAuditService'
export { EnterpriseExportService, enterpriseExport } from './EnterpriseExportService'
export { GitHubModelsEnterpriseService, githubModels } from './GitHubModelsEnterpriseService'
export { PredictiveAnalyticsService, predictiveAnalytics } from './PredictiveAnalyticsService'

// Types
export type { AuditFinding, AuditMetrics, AuditResult } from './EnterpriseAuditService'

export type {
  DashboardFilter,
  DashboardPrompt,
  DashboardWidget,
  GeneratedDashboard,
} from './DashboardGeneratorService'

export type {
  ExportFormat,
  ExportOptions,
  ExportResult,
  ExportableData,
} from './EnterpriseExportService'

export type { AIModel, AIRequest, AIResponse, TaskType } from './GitHubModelsEnterpriseService'

export type {
  AnomalyDetectionResult,
  PredictionRequest,
  PredictionResult,
  TrendAnalysis,
} from './PredictiveAnalyticsService'
