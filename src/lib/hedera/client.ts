import {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicInfoQuery,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,

  TransferTransaction,
  AccountBalance,
  AccountBalanceQuery
} from '@hashgraph/sdk';
import { HederaConfig, HederaTransaction, HederaTokenInfo } from '@/types';

export class HederaClient {
  private client: Client;
  private config: HederaConfig;
  private operatorAccountId: AccountId;
  private operatorPrivateKey: PrivateKey;

  constructor(config: HederaConfig) {
    this.config = config;
    this.operatorAccountId = AccountId.fromString(config.accountId);
    // Handle different private key formats
    try {
      this.operatorPrivateKey = PrivateKey.fromString(config.privateKey);
    } catch {
      try {
        this.operatorPrivateKey = PrivateKey.fromStringECDSA(config.privateKey);
      } catch {
        this.operatorPrivateKey = PrivateKey.fromStringED25519(config.privateKey);
      }
    }
    
    // Initialize client based on network
    if (config.network === 'testnet') {
      this.client = Client.forTestnet();
    } else {
      this.client = Client.forMainnet();
    }

    this.client.setOperator(this.operatorAccountId, this.operatorPrivateKey);
    this.client.setDefaultMaxTransactionFee(new Hbar(100));
  }

  /**
   * Create a new consensus topic for supply chain events
   */
  async createTopic(memo?: string): Promise<string> {
    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo(memo || 'Supply Chain Events Topic')
        .setAdminKey(this.operatorPrivateKey.publicKey)
        .setSubmitKey(this.operatorPrivateKey.publicKey);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      const topicId = receipt.topicId;
      if (!topicId) {
        throw new Error('Failed to create topic');
      }

      console.log(`Created topic with ID: ${topicId}`);
      return topicId.toString();
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  }

  /**
   * Submit a message to the consensus topic using ConsensusSubmitMessageTransactionBody
   */
  async submitMessage(topicId: string, message: string, chunkSize?: number): Promise<HederaTransaction> {
    try {
      const topicIdObj = topicId.includes('.') ? topicId : `0.0.${topicId}`;
      
      // Handle large messages by chunking if needed
      const maxChunkSize = chunkSize || 1024; // 1KB chunks
      const messageBytes = Buffer.from(message, 'utf8');
      
      if (messageBytes.length <= maxChunkSize) {
        // Single message
        return await this.submitSingleMessage(topicIdObj, message);
      } else {
        // Chunked message
        return await this.submitChunkedMessage(topicIdObj, message, maxChunkSize);
      }
    } catch (error) {
      console.error('Error submitting message:', error);
      throw error;
    }
  }

  private async submitSingleMessage(topicId: string, message: string): Promise<HederaTransaction> {
    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message);

    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    return {
      transactionId: txResponse.transactionId.toString(),
      topicId,
      sequenceNumber: receipt.topicSequenceNumber?.toNumber() || 0,
      timestamp: new Date().toISOString(),
      message,
      consensusTimestamp: receipt.status.toString()
    };
  }

  private async submitChunkedMessage(topicId: string, message: string, chunkSize: number): Promise<HederaTransaction> {
    const messageBuffer = Buffer.from(message, 'utf8');
    const chunks = [];
    
    // Split message into chunks
    for (let i = 0; i < messageBuffer.length; i += chunkSize) {
      chunks.push(messageBuffer.slice(i, i + chunkSize));
    }

    const chunkTransactions: HederaTransaction[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunkMessage = JSON.stringify({
        chunkIndex: i,
        totalChunks: chunks.length,
        data: chunks[i].toString('base64'),
        messageId: Date.now().toString()
      });

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(chunkMessage);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      chunkTransactions.push({
        transactionId: txResponse.transactionId.toString(),
        topicId,
        sequenceNumber: receipt.topicSequenceNumber?.toNumber() || 0,
        timestamp: new Date().toISOString(),
        message: chunkMessage,
        consensusTimestamp: receipt.status.toString()
      });
    }

    // Return the last chunk transaction as the main result
    return chunkTransactions[chunkTransactions.length - 1];
  }

  /**
   * Query topic information using ConsensusGetTopicInfoQuery
   */
  async getTopicInfo(topicId: string) {
    try {
      const topicIdObj = topicId.includes('.') ? topicId : `0.0.${topicId}`;
      
      const query = new TopicInfoQuery()
        .setTopicId(topicIdObj);

      const topicInfo = await query.execute(this.client);

      return {
        topicId: topicInfo.topicId.toString(),
        topicMemo: topicInfo.topicMemo,
        runningHash: topicInfo.runningHash,
        sequenceNumber: topicInfo.sequenceNumber.toString(),
        expirationTime: topicInfo.expirationTime,
        adminKey: topicInfo.adminKey?.toString(),
        submitKey: topicInfo.submitKey?.toString(),
        autoRenewPeriod: topicInfo.autoRenewPeriod,
        autoRenewAccount: topicInfo.autoRenewAccount?.toString()
      };
    } catch (error) {
      console.error('Error querying topic info:', error);
      throw error;
    }
  }

  /**
   * Create a fungible token for product batches using TokenCreateTransactionBody
   */
  async createToken(
    name: string,
    symbol: string,
    decimals: number,
    initialSupply: number
  ): Promise<HederaTokenInfo> {
    try {
      const transaction = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setDecimals(decimals)
        .setInitialSupply(initialSupply)
        .setTreasuryAccountId(this.operatorAccountId)
        .setAdminKey(this.operatorPrivateKey.publicKey)
        .setSupplyKey(this.operatorPrivateKey.publicKey)
        .setTokenType(TokenType.FungibleCommon)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(1000000); // 1 million max supply

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      const tokenId = receipt.tokenId;
      if (!tokenId) {
        throw new Error('Failed to create token');
      }

      console.log(`Created token with ID: ${tokenId}`);

      return {
        tokenId: tokenId.toString(),
        name,
        symbol,
        totalSupply: initialSupply.toString(),
        decimals,
        treasuryAccountId: this.operatorAccountId.toString()
      };
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  }

  /**
   * Create NFT token for unique product batches
   */
  async createNftToken(
    name: string,
    symbol: string
  ): Promise<HederaTokenInfo> {
    try {
      const transaction = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(10000) // Max 10k unique batches
        .setTreasuryAccountId(this.operatorAccountId)
        .setAdminKey(this.operatorPrivateKey.publicKey)
        .setSupplyKey(this.operatorPrivateKey.publicKey);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      const tokenId = receipt.tokenId;
      if (!tokenId) {
        throw new Error('Failed to create NFT token');
      }

      console.log(`Created NFT token with ID: ${tokenId}`);

      return {
        tokenId: tokenId.toString(),
        name,
        symbol,
        totalSupply: '0',
        decimals: 0,
        treasuryAccountId: this.operatorAccountId.toString()
      };
    } catch (error) {
      console.error('Error creating NFT token:', error);
      throw error;
    }
  }

  /**
   * Transfer tokens to represent batch ownership
   */
  async transferTokens(
    tokenId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number
  ): Promise<string> {
    try {
      const transaction = new TransferTransaction()
        .addTokenTransfer(tokenId, fromAccountId, -amount)
        .addTokenTransfer(tokenId, toAccountId, amount);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      console.log(`Transfer completed with status: ${receipt.status}`);
      return txResponse.transactionId.toString();
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }

  /**
   * Get account balance including token balances
   */
  async getAccountBalance(accountId: string): Promise<AccountBalance> {
    try {
      const query = new AccountBalanceQuery()
        .setAccountId(accountId);

      const balance = await query.execute(this.client);
      return balance;
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  /**
   * Close the client connection
   */
  close(): void {
    this.client.close();
  }

  /**
   * Get the client instance for advanced operations
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * Get operator account information
   */
  getOperatorAccountId(): string {
    return this.operatorAccountId.toString();
  }

  /**
   * Validate network connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      const balance = await this.getAccountBalance(this.operatorAccountId.toString());
      console.log(`Account balance: ${balance.hbars.toString()}`);
      return true;
    } catch (error) {
      console.error('Failed to validate connection:', error);
      return false;
    }
  }
}