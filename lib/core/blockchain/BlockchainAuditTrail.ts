// @ts-nocheck
import { Block, Transaction, AuditBlock, BlockchainConfig } from './types';
import { MerkleTree } from './MerkleTree';

export class BlockchainAuditTrail {
  private chain: AuditBlock[] = [];
  private pendingTransactions: Transaction[] = [];
  private config: BlockchainConfig;
  private validators: Set<string> = new Set();

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.validators = new Set(config.validators);
    this.createGenesisBlock();
  }

  /**
   * Creates the genesis block
   */
  private createGenesisBlock(): void {
    const genesisBlock: AuditBlock = {
      index: 0,
      timestamp: Date.now(),
      data: {
        transactions: [],
        auditMetadata: {
          riskScore: 0,
          complianceFlags: [],
          anomalyScore: 0
        }
      },
      previousHash: '0',
      hash: this.calculateHash(0, '0', Date.now(), 'Genesis Block'),
      nonce: 0,
      merkleRoot: ''
    };

    this.chain.push(genesisBlock);
  }

  /**
   * Adds a new transaction to the pending pool
   */
  public addTransaction(transaction: Transaction): void {
    // Validate transaction
    if (this.validateTransaction(transaction)) {
      this.pendingTransactions.push(transaction);
    } else {
      throw new Error('Invalid transaction');
    }
  }

  /**
   * Creates a new block with pending transactions
   */
  public createBlock(): AuditBlock {
    if (this.pendingTransactions.length === 0) {
      throw new Error('No transactions to create block');
    }

    const previousBlock = this.getLatestBlock();
    const newBlockIndex = previousBlock.index + 1;
    const timestamp = Date.now();

    // Create Merkle tree for transactions
    const merkleTree = new MerkleTree(this.pendingTransactions);
    const merkleRoot = merkleTree.getRoot();

    // Calculate audit metadata
    const auditMetadata = this.calculateAuditMetadata(this.pendingTransactions);

    const newBlock: AuditBlock = {
      index: newBlockIndex,
      timestamp,
      data: {
        transactions: [...this.pendingTransactions],
        auditMetadata
      },
      previousHash: previousBlock.hash,
      hash: '',
      nonce: 0,
      merkleRoot
    };

    // Mine the block (simplified)
    newBlock.hash = this.mineBlock(newBlock);

    // Clear pending transactions
    this.pendingTransactions = [];

    return newBlock;
  }

  /**
   * Adds a block to the chain after validation
   */
  public addBlock(block: AuditBlock): boolean {
    const previousBlock = this.getLatestBlock();

    // Validate block
    if (this.validateBlock(block, previousBlock)) {
      this.chain.push(block);
      return true;
    }

    return false;
  }

  /**
   * Gets the entire blockchain
   */
  public getChain(): AuditBlock[] {
    return [...this.chain];
  }

  /**
   * Gets the latest block
   */
  public getLatestBlock(): AuditBlock {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Gets a block by index
   */
  public getBlock(index: number): AuditBlock | null {
    return this.chain[index] || null;
  }

  /**
   * Gets a transaction by ID
   */
  public getTransaction(transactionId: string): Transaction | null {
    for (const block of this.chain) {
      const transaction = block.data.transactions.find(tx => tx.id === transactionId);
      if (transaction) {
        return transaction;
      }
    }
    return null;
  }

  /**
   * Verifies the integrity of the blockchain
   */
  public verifyChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!this.validateBlock(currentBlock, previousBlock)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets audit statistics
   */
  public getAuditStatistics(): {
    totalBlocks: number;
    totalTransactions: number;
    averageRiskScore: number;
    complianceViolations: number;
    anomaliesDetected: number;
  } {
    let totalTransactions = 0;
    let totalRiskScore = 0;
    let complianceViolations = 0;
    let anomaliesDetected = 0;

    for (const block of this.chain) {
      totalTransactions += block.data.transactions.length;
      totalRiskScore += block.data.auditMetadata.riskScore;
      complianceViolations += block.data.auditMetadata.complianceFlags.length;
      anomaliesDetected += block.data.auditMetadata.anomalyScore > 0.5 ? 1 : 0;
    }

    return {
      totalBlocks: this.chain.length,
      totalTransactions,
      averageRiskScore: totalTransactions > 0 ? totalRiskScore / this.chain.length : 0,
      complianceViolations,
      anomaliesDetected
    };
  }

  /**
   * Generates a transaction proof
   */
  public generateTransactionProof(transactionId: string): {
    transaction: Transaction;
    blockIndex: number;
    merkleProof: string[];
  } | null {
    const transaction = this.getTransaction(transactionId);
    if (!transaction) {
      return null;
    }

    // Find the block containing this transaction
    let blockIndex = -1;
    for (let i = 0; i < this.chain.length; i++) {
      if (this.chain[i].data.transactions.some(tx => tx.id === transactionId)) {
        blockIndex = i;
        break;
      }
    }

    if (blockIndex === -1) {
      return null;
    }

    const block = this.chain[blockIndex];
    const merkleTree = new MerkleTree(block.data.transactions);
    const merkleProof = merkleTree.getProof(transaction);

    return {
      transaction,
      blockIndex,
      merkleProof
    };
  }

  // Private helper methods
  private validateTransaction(transaction: Transaction): boolean {
    // Check required fields
    if (!transaction.id || !transaction.timestamp || !transaction.userId ||
        !transaction.action || !transaction.resource || !transaction.signature) {
      return false;
    }

    // Check timestamp is not in the future
    if (transaction.timestamp > Date.now() + 60000) { // 1 minute tolerance
      return false;
    }

    // Validate signature (simplified)
    return this.verifyTransactionSignature(transaction);
  }

  private validateBlock(block: AuditBlock, previousBlock: AuditBlock): boolean {
    // Check block index
    if (block.index !== previousBlock.index + 1) {
      return false;
    }

    // Check previous hash
    if (block.previousHash !== previousBlock.hash) {
      return false;
    }

    // Check block hash
    const expectedHash = this.calculateHash(
      block.index,
      block.previousHash,
      block.timestamp,
      JSON.stringify(block.data)
    );
    if (block.hash !== expectedHash) {
      return false;
    }

    // Check Merkle root
    const merkleTree = new MerkleTree(block.data.transactions);
    if (block.merkleRoot !== merkleTree.getRoot()) {
      return false;
    }

    // Validate consensus
    return this.validateConsensus(block);
  }

  private calculateHash(index: number, previousHash: string, timestamp: number, data: string): string {
    const dataString = `${index}${previousHash}${timestamp}${data}`;
    return this.hashString(dataString);
  }

  private hashString(data: string): string {
    // Simple hash function - in production use SHA-256 or similar
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  private mineBlock(block: AuditBlock): string {
    // Simplified mining - in production use proper Proof of Work
    let hash = '';
    let nonce = 0;

    do {
      nonce++;
      hash = this.calculateHash(block.index, block.previousHash, block.timestamp, JSON.stringify(block.data) + nonce);
    } while (hash.substring(0, this.config.difficulty) !== '0'.repeat(this.config.difficulty));

    block.nonce = nonce;
    return hash;
  }

  private calculateAuditMetadata(transactions: Transaction[]): {
    riskScore: number;
    complianceFlags: string[];
    anomalyScore: number;
  } {
    let totalRiskScore = 0;
    const complianceFlags: string[] = [];
    let totalAnomalyScore = 0;

    for (const tx of transactions) {
      // Calculate risk score
      totalRiskScore += tx.metadata?.riskScore || 0.1;

      // Collect compliance flags
      if (tx.metadata?.complianceFlags) {
        complianceFlags.push(...tx.metadata.complianceFlags);
      }

      // Calculate anomaly score
      totalAnomalyScore += tx.metadata?.anomalyScore || 0;
    }

    return {
      riskScore: transactions.length > 0 ? totalRiskScore / transactions.length : 0,
      complianceFlags: [...new Set(complianceFlags)], // Remove duplicates
      anomalyScore: transactions.length > 0 ? totalAnomalyScore / transactions.length : 0
    };
  }

  private verifyTransactionSignature(transaction: Transaction): boolean {
    // Simplified signature verification
    // In production, use proper cryptographic signature verification
    return transaction.signature.length > 10;
  }

  private validateConsensus(block: AuditBlock): boolean {
    // Simplified consensus validation
    // In production, implement proper consensus algorithm (PoA, PoS, etc.)
    return true;
  }
}
