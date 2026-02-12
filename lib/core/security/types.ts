export interface PermissionMatrix {
  allowed: string[];
  denied: string[];
  conditions: Record<string, any>;
  fields?: {
    allowed: string[];
    denied: string[];
    masked: string[];
    encrypted: string[];
  };
  actions?: Record<string, boolean>;
}

export interface RoleNode {
  name: string;
  parents: string[];
  children: string[];
  permissions: string[];
}

export interface AuditTrail {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  riskScore: number;
  metadata: Record<string, any>;
}

export interface User {
  id: string;
  role: string;
  location: string;
  device: string;
  behavior: any;
}

export interface Action {
  type: string;
  name: string;
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Resource {
  type: string;
  id: string;
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskScore {
  total: number;
  factors: {
    userRisk: number;
    actionRisk: number;
    resourceRisk: number;
    contextualRisk: number;
    timeRisk: number;
    locationRisk: number;
    deviceRisk: number;
    behaviorRisk: number;
  };
}
