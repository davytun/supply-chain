// Hedera SDK imports disabled for build
import { HederaConfig, HederaTransaction, HederaTokenInfo } from '@/types';

export class HederaClient {
  // Disabled for build - Hedera integration not available
  private config: HederaConfig;

  constructor(config: HederaConfig) {
    this.config = config;
    throw new Error('Hedera integration disabled for production build');
  }

  async createTopic(memo?: string): Promise<string> {
    throw new Error('Hedera integration disabled');
  }

  async submitMessage(topicId: string, message: string): Promise<HederaTransaction> {
    throw new Error('Hedera integration disabled');
  }

  async getTopicInfo(topicId: string) {
    throw new Error('Hedera integration disabled');
  }

  async createToken(name: string, symbol: string, decimals: number, initialSupply: number): Promise<HederaTokenInfo> {
    throw new Error('Hedera integration disabled');
  }

  async createNftToken(name: string, symbol: string): Promise<HederaTokenInfo> {
    throw new Error('Hedera integration disabled');
  }

  async transferTokens(tokenId: string, fromAccountId: string, toAccountId: string, amount: number): Promise<string> {
    throw new Error('Hedera integration disabled');
  }

  async getAccountBalance(accountId: string): Promise<any> {
    throw new Error('Hedera integration disabled');
  }

  close(): void {
    // No-op
  }

  getClient(): any {
    throw new Error('Hedera integration disabled');
  }

  getOperatorAccountId(): string {
    return this.config.accountId;
  }

  async validateConnection(): Promise<boolean> {
    return false;
  }
}