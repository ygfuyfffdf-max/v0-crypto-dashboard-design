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
      saltRounds: 12,
    },
  },

  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 60,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    biometric: {
      enabled: false,
      methods: ['fingerprint', 'face'],
      confidenceThreshold: 0.9,
    },
    blockchain: {
      enabled: false,
      network: 'ethereum',
      auditContract: '',
    },
  },

  permissions: {
    quantumEngine: {
      enabled: true,
      riskWeights: {
        userRisk: 0.3,
        actionRisk: 0.3,
        resourceRisk: 0.2,
        contextualRisk: 0.1,
        timeRisk: 0.05,
        locationRisk: 0.05,
      },
      thresholds: {
        low: 0.3,
        medium: 0.6,
        high: 0.8,
        critical: 0.95,
      },
    },
    panels: {
      profit: { name: 'Profit', description: 'Panel de ganancias y rentabilidad', permissions: ['view', 'edit', 'export'] },
      bancos: { name: 'Bancos', description: 'Panel de bancos y cuentas', permissions: ['view', 'edit', 'admin'] },
      usuarios: { name: 'Usuarios', description: 'Panel de gestión de usuarios', permissions: ['view', 'edit', 'admin', 'delete'] },
      seguridad: { name: 'Seguridad', description: 'Panel de seguridad y auditoría', permissions: ['view', 'admin'] },
      ventas: { name: 'Ventas', description: 'Panel de ventas y pedidos', permissions: ['view', 'edit', 'export'] },
      almacen: { name: 'Almacén', description: 'Panel de inventario y almacén', permissions: ['view', 'edit'] },
      clientes: { name: 'Clientes', description: 'Panel de gestión de clientes', permissions: ['view', 'edit', 'export'] },
      ia: { name: 'IA', description: 'Panel de inteligencia artificial', permissions: ['view', 'interact'] },
      reportes: { name: 'Reportes', description: 'Panel de reportes y análisis', permissions: ['view', 'export'] },
    },
  },

  compliance: {
    sox: { enabled: false, auditRetention: 365 },
    gdpr: { enabled: true, dataRetention: 730 },
    pci: { enabled: false, encryptionRequired: true },
    hipaa: { enabled: false, accessLogging: true },
    soc2: { enabled: false, monitoringInterval: 60 },
  },

  monitoring: {
    realTime: {
      enabled: true,
      updateInterval: 30,
      metrics: ['cpu', 'memory', 'requests', 'errors', 'latency'],
    },
    forensics: {
      enabled: true,
      logLevel: 'info',
      retentionPeriod: 90,
    },
    alerts: {
      enabled: true,
      channels: ['email', 'slack', 'webhook'],
      severityLevels: ['low', 'medium', 'high', 'critical'],
    },
  },

  api: {
    rateLimiting: {
      enabled: true,
      windowMs: 900000,
      maxRequests: 100,
    },
    cors: {
      enabled: true,
      origins: ['*'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
    authentication: {
      jwt: {
        secret: process.env['JWT_SECRET'] ?? 'chronos-infinity-dev-secret-2026',
        expiresIn: '24h',
        algorithm: 'HS256',
      },
      clerk: {
        publishableKey: process.env['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'] ?? '',
        secretKey: process.env['CLERK_SECRET_KEY'] ?? '',
      },
    },
  },
}