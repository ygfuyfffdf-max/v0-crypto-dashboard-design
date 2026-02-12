// ⚙️ CHRONOS INFINITY CONFIGURATION
// Configuración global del sistema de permisos cuánticos

export interface ChronosConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    encryption: {
      algorithm: string;
      keySize: number;
      saltRounds: number;
    };
  };
  
  security: {
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    sessionTimeout: number; // minutes
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    biometric: {
      enabled: boolean;
      methods: string[];
      confidenceThreshold: number;
    };
    blockchain: {
      enabled: boolean;
      network: string;
      auditContract: string;
    };
  };

  permissions: {
    quantumEngine: {
      enabled: boolean;
      riskWeights: {
        userRisk: number;
        actionRisk: number;
        resourceRisk: number;
        contextualRisk: number;
        timeRisk: number;
        locationRisk: number;
      };
      thresholds: {
        low: number;
        medium: number;
        high: number;
        critical: number;
      };
    };
    
    panels: {
      profit: {
        name: string;
        description: string;
        permissions: string[];
      };
      bancos: {
        name: string;
        description: string;
        permissions: string[];
      };
      usuarios: {
        name: string;
        description: string;
        permissions: string[];
      };
      seguridad: {
        name: string;
        description: string;
        permissions: string[];
      };
      ventas: {
        name: string;
        description: string;
        permissions: string[];
      };
      almacen: {
        name: string;
        description: string;
        permissions: string[];
      };
      clientes: {
        name: string;
        description: string;
        permissions: string[];
      };
      ia: {
        name: string;
        description: string;
        permissions: string[];
      };
      reportes: {
        name: string;
        description: string;
        permissions: string[];
      };
    };
  };

  compliance: {
    sox: {
      enabled: boolean;
      auditRetention: number; // days
    };
    gdpr: {
      enabled: boolean;
      dataRetention: number; // days
    };
    pci: {
      enabled: boolean;
      encryptionRequired: boolean;
    };
    hipaa: {
      enabled: boolean;
      accessLogging: boolean;
    };
    soc2: {
      enabled: boolean;
      monitoringInterval: number; // minutes
    };
  };

  monitoring: {
    realTime: {
      enabled: boolean;
      updateInterval: number; // seconds
      metrics: string[];
    };
    forensics: {
      enabled: boolean;
      logLevel: 'debug' | 'info' | 'warn' | 'error';
      retentionPeriod: number; // days
    };
    alerts: {
      enabled: boolean;
      channels: string[];
      severityLevels: string[];
    };
  };

  api: {
    rateLimiting: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
    cors: {
      enabled: boolean;
      origins: string[];
      methods: string[];
      headers: string[];
    };
    authentication: {
      jwt: {
        secret: string;
        expiresIn: string;
        algorithm: string;
      };
      clerk: {
        publishableKey: string;
        secretKey: string;
      };
    };
  };
}

export const chronosConfig: ChronosConfig = {
  app: {
    name: 'CHRONOS INFINITY',
    version: '1.0.0',
    environment: 'development',
    encryption: {
      algorithm: 'AES-256-GCM',
      keySize: 256,
      saltRounds: 12
    }
  },

  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 60,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireSpecialChar: true,
    }
  },