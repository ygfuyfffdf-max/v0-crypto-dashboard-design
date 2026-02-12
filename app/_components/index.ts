// 🚀 CHRONOS COMPONENTS INDEX - CHRONOS INFINITY
// Archivo de barril para exportar todos los componentes del sistema

// Authentication Components
export { default as KocmokAnimatedLogo } from './auth/KocmokAnimatedLogo';
export { default as WelcomeDashboard } from './auth/WelcomeDashboard';

// Admin Components
export { default as UserCreationWizard } from './admin/UserCreationWizard';
export { default as PermissionMatrix } from './admin/PermissionMatrix';
export { default as RoleManager } from './admin/RoleManager';

// Security Components
export { default as AdvancedSecurityDashboard } from './security/AdvancedSecurityDashboard';
export { default as SecurityEventMonitor } from './security/SecurityEventMonitor';
export { default as ThreatDetectionPanel } from './security/ThreatDetectionPanel';
export { default as BiometricAuthPanel } from './security/BiometricAuthPanel';
export { default as AuditTrailViewer } from './security/AuditTrailViewer';
export { default as ComplianceReporter } from './security/ComplianceReporter';

// Banking Components
export { default as BankProfitManager } from './bank/BankProfitManager';
export { default as CurrencyExchangePanel } from './bank/CurrencyExchangePanel';
export { default as TransactionHistory } from './bank/TransactionHistory';
export { default as AccountManager } from './bank/AccountManager';

// UI Components
export { Card } from './ui/card';
export { Button } from './ui/button';
export { Badge } from './ui/badge';
export { Progress } from './ui/progress';
export { Input } from './ui/input';
export { Label } from './ui/label';
export { Select } from './ui/select';
export { Slider } from './ui/slider';
export { Switch } from './ui/switch';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

// Layout Components
export { default as Header } from './layout/Header';
export { default as Sidebar } from './layout/Sidebar';
export { default as Footer } from './layout/Footer';
export { default as Navigation } from './layout/Navigation';

// Utility Components
export { default as LoadingSpinner } from './utils/LoadingSpinner';
export { default as ErrorBoundary } from './utils/ErrorBoundary';
export { default as NotificationManager } from './utils/NotificationManager';
export { default as ThemeProvider } from './utils/ThemeProvider';

// Hooks
export { useChronosAuth } from './hooks/useChronosAuth';
export { useChronosPermissions } from './hooks/useChronosPermissions';
export { useChronosSecurity } from './hooks/useChronosSecurity';
export { useChronosAudit } from './hooks/useChronosAudit';
export { useChronosBiometric } from './hooks/useChronosBiometric';

// Types
export type {
  UserRole,
  PermissionMatrix,
  SecurityEvent,
  AuditEvent,
  BiometricData,
  ComplianceReport,
  Transaction,
  ExchangeRate,
  BankAccount
} from '../_lib/types';

// Constants
export {
  USER_ROLES,
  PERMISSION_LEVELS,
  SECURITY_THRESHOLDS,
  COMPLIANCE_STANDARDS,
  BIOMETRIC_TYPES
} from '../_lib/constants';