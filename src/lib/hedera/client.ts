// Hedera SDK imports disabled for build
import { HederaConfig, HederaTransaction, HederaTokenInfo } from '@/types';

export class HederaClient {
  // Disabled for build - Hedera integration not available
  private config: HederaConfig;

  constructor(config: HederaConfig) {
    this.config = config;
    throw new Error('Hedera integration disabled for production build');
  }

  async createTopic(): Promise<string> {
    throw new Error('Hedera integration disabled');
  }

  async submitMessage(): Promise<HederaTransaction> {
    throw new Error('Hedera integration disabled');
  }

  async getTopicInfo() {
    throw new Error('Hedera integration disabled');
  }

  async createToken(): Promise<HederaTokenInfo> {
    throw new Error('Hedera integration disabled');
  }

  async createNftToken(): Promise<HederaTokenInfo> {
    throw new Error('Hedera integration disabled');
  }

  async transferTokens(): Promise<string> {
    throw new Error('Hedera integration disabled');
  }

  async getAccountBalance(): Promise<unknown> {
    throw new Error('Hedera integration disabled');
  }

  close(): void {
    // No-op
  }

  getClient(): unknown {
    throw new Error('Hedera integration disabled');
  }

  getOperatorAccountId(): string {
    return this.config.accountId;
  }

  async validateConnection(): Promise<boolean> {
    return false;
  }
}