export interface Block {
  index: number;
  timestamp: number;
  data: any;
  previousHash: string;
  hash: string;
  nonce: number;
  merkleRoot: string;
}

export interface Transaction {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  resource: string;
  metadata: any;
  signature: string;
}

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  parent?: MerkleNode;
}

export interface AuditBlock extends Block {
  data: {
    transactions: Transaction[];
    auditMetadata: {
      riskScore: number;
      complianceFlags: string[];
      anomalyScore: number;
    };
  };
}

export interface BlockchainConfig {
  difficulty: number;
  blockTime: number;
  maxBlockSize: number;
  consensusAlgorithm: 'poa' | 'pos' | 'pow';
  validators: string[];
}
