export interface NetworkSegment {
  id: string;
  name: string;
  subnet: string;
  vlanId: number;
  securityLevel: 'critical' | 'high' | 'medium' | 'low';
  allowedServices: string[];
  deniedServices: string[];
  microPolicies: MicroPolicy[];
}

export interface MicroPolicy {
  id: string;
  name: string;
  source: string;
  destination: string;
  port: number;
  protocol: 'tcp' | 'udp' | 'icmp';
  action: 'allow' | 'deny' | 'monitor';
  conditions: PolicyCondition[];
}

export interface PolicyCondition {
  type: 'time' | 'location' | 'device' | 'user' | 'risk';
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'not_in';
  value: any;
  weight: number;
}

export interface NetworkFlow {
  id: string;
  source: string;
  destination: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  bytes: number;
  packets: number;
  startTime: Date;
  endTime?: Date;
  riskScore: number;
  policyMatches: string[];
}

export interface ZeroTrustSession {
  id: string;
  userId: string;
  deviceId: string;
  networkSegment: string;
  authenticationLevel: number;
  trustScore: number;
  createdAt: Date;
  expiresAt: Date;
  policies: string[];
}
