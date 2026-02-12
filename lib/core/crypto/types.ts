export interface PostQuantumKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  algorithm: 'KYBER' | 'DILITHIUM' | 'FALCON';
  securityLevel: 1 | 3 | 5;
}

export interface QuantumSignature {
  signature: Uint8Array;
  publicKey: Uint8Array;
  messageHash: string;
  timestamp: number;
  algorithm: string;
}

export interface HybridKeyPair {
  classical: {
    publicKey: string;
    privateKey: string;
    algorithm: 'ECDSA-P384' | 'RSA-4096';
  };
  quantum: PostQuantumKeyPair;
  migrationStatus: 'active' | 'transition' | 'quantum-only';
}

export interface CryptoConfig {
  keySize: number;
  securityLevel: 1 | 3 | 5;
  hybridMode: boolean;
  fallbackMode: 'classical' | 'quantum' | 'hybrid';
}
