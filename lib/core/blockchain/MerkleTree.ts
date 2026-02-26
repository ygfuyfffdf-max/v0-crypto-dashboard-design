// @ts-nocheck
import { MerkleNode, Transaction } from './types';

export class MerkleTree {
  private root: MerkleNode | null = null;
  private leaves: MerkleNode[] = [];

  constructor(transactions: Transaction[]) {
    this.buildTree(transactions);
  }

  /**
   * Builds the Merkle tree from transactions
   */
  private buildTree(transactions: Transaction[]): void {
    if (transactions.length === 0) {
      this.root = null;
      return;
    }

    // Create leaf nodes from transaction hashes
    this.leaves = transactions.map(tx => ({
      hash: this.hashTransaction(tx),
      left: undefined,
      right: undefined,
      parent: undefined
    }));

    // Build tree level by level
    let currentLevel = [...this.leaves];

    while (currentLevel.length > 1) {
      const nextLevel: MerkleNode[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1];

        const parent: MerkleNode = {
          hash: this.hashPair(left.hash, right?.hash || left.hash),
          left,
          right,
          parent: undefined
        };

        left.parent = parent;
        if (right) {
          right.parent = parent;
        }

        nextLevel.push(parent);
      }

      currentLevel = nextLevel;
    }

    this.root = currentLevel[0];
  }

  /**
   * Gets the Merkle root hash
   */
  public getRoot(): string {
    return this.root?.hash || '';
  }

  /**
   * Generates a proof for a specific transaction
   */
  public getProof(transaction: Transaction): string[] {
    const targetHash = this.hashTransaction(transaction);
    const leafIndex = this.leaves.findIndex(leaf => leaf.hash === targetHash);

    if (leafIndex === -1) {
      throw new Error('Transaction not found in Merkle tree');
    }

    const proof: string[] = [];
    let currentNode = this.leaves[leafIndex];

    while (currentNode.parent) {
      const parent = currentNode.parent;
      const isLeftChild = parent.left === currentNode;

      if (isLeftChild && parent.right) {
        proof.push(parent.right.hash);
      } else if (!isLeftChild && parent.left) {
        proof.push(parent.left.hash);
      }

      currentNode = parent;
    }

    return proof;
  }

  /**
   * Verifies a transaction proof
   */
  public verifyProof(transaction: Transaction, proof: string[]): boolean {
    const targetHash = this.hashTransaction(transaction);
    let computedHash = targetHash;

    for (const proofHash of proof) {
      computedHash = this.hashPair(computedHash, proofHash);
    }

    return computedHash === this.getRoot();
  }

  /**
   * Gets all transaction hashes
   */
  public getTransactionHashes(): string[] {
    return this.leaves.map(leaf => leaf.hash);
  }

  /**
   * Gets the number of transactions
   */
  public getTransactionCount(): number {
    return this.leaves.length;
  }

  /**
   * Verifies the integrity of the Merkle tree
   */
  public verifyIntegrity(): boolean {
    if (!this.root) return this.leaves.length === 0;

    return this.verifyNode(this.root);
  }

  private verifyNode(node: MerkleNode): boolean {
    if (!node.left && !node.right) {
      // Leaf node
      return true;
    }

    if (node.left && node.right) {
      const expectedHash = this.hashPair(node.left.hash, node.right.hash);
      if (node.hash !== expectedHash) return false;

      return this.verifyNode(node.left) && this.verifyNode(node.right);
    }

    if (node.left && !node.right) {
      const expectedHash = this.hashPair(node.left.hash, node.left.hash);
      if (node.hash !== expectedHash) return false;

      return this.verifyNode(node.left);
    }

    return false;
  }

  private hashTransaction(transaction: Transaction): string {
    const data = `${transaction.id}${transaction.timestamp}${transaction.userId}${transaction.action}${transaction.resource}${JSON.stringify(transaction.metadata)}`;
    return this.hashString(data);
  }

  private hashPair(left: string, right: string): string {
    return this.hashString(left + right);
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
}
