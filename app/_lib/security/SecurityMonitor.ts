/**
 * CHRONOS INFINITY - Security Monitor
 * Real-time security monitoring and threat detection
 */

export interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'permission_denied' | 'suspicious_activity' | 'rate_limit' | 'data_access';
  severity: 'info' | 'warning' | 'critical';
  userId?: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private alertThreshold: number;

  constructor(alertThreshold = 10) {
    this.alertThreshold = alertThreshold;
  }

  async logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    this.events.push({
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    });
  }

  async getRecentEvents(limit = 50): Promise<SecurityEvent[]> {
    return this.events.slice(-limit);
  }

  async getThreatLevel(): Promise<'low' | 'medium' | 'high' | 'critical'> {
    const recentCritical = this.events
      .filter((e) => e.severity === 'critical')
      .filter((e) => Date.now() - e.timestamp.getTime() < 3600000).length;

    if (recentCritical >= this.alertThreshold) return 'critical';
    if (recentCritical >= this.alertThreshold / 2) return 'high';
    if (recentCritical > 0) return 'medium';
    return 'low';
  }

  getStats() {
    return {
      totalEvents: this.events.length,
      criticalCount: this.events.filter((e) => e.severity === 'critical').length,
    };
  }
}
