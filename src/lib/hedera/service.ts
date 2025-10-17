import { HederaClient } from './client';
import { HederaMirrorNode } from './mirror';
import { HederaConfig, SupplyChainEvent, ProductBatch, HederaTransaction, HederaTokenInfo, EventType, ParticipantType } from '@/types';

export class HederaService {
  private client: HederaClient;
  private mirrorNode: HederaMirrorNode;
  private config: HederaConfig;
  private topicId: string | null = null;

  constructor(config?: HederaConfig) {
    // Use environment variables if config not provided
    this.config = config || {
      accountId: process.env.HEDERA_ACCOUNT_ID || '0.0.0',
      privateKey: process.env.HEDERA_PRIVATE_KEY || 'placeholder_key',
      network: (process.env.HEDERA_NETWORK as 'testnet' | 'mainnet') || 'testnet',
      topicId: process.env.HEDERA_TOPIC_ID,
      mirrorNodeUrl: process.env.HEDERA_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com'
    };

    // Only initialize Hedera client if valid credentials are provided
    if (this.config.accountId !== '0.0.0' && this.config.privateKey !== 'placeholder_key') {
      try {
        this.client = new HederaClient(this.config);
      } catch (error) {
        console.warn('Failed to initialize Hedera client:', error);
        this.client = null;
      }
    }
    this.mirrorNode = new HederaMirrorNode(this.config);
    this.topicId = this.config.topicId || null;
  }

  /**
   * Initialize the service by creating or validating topic
   */
  async initialize(): Promise<void> {
    try {
      // Skip initialization if no client
      if (!this.client) {
        console.warn('Hedera client not available, skipping initialization');
        return;
      }
      
      // Validate connection first
      const isConnected = await this.client.validateConnection();
      if (!isConnected) {
        throw new Error('Failed to connect to Hedera network');
      }

      // Create topic if not exists
      if (!this.topicId) {
        this.topicId = await this.client.createTopic('Supply Chain Events - Ethical Sourcing Tracker');
        console.log(`Created new topic: ${this.topicId}`);
      } else {
        // Validate existing topic
        try {
          await this.client.getTopicInfo(this.topicId);
          console.log(`Using existing topic: ${this.topicId}`);
        } catch (error) {
          console.error('Invalid topic ID, creating new one:', error);
          this.topicId = await this.client.createTopic('Supply Chain Events - Ethical Sourcing Tracker');
        }
      }
    } catch (error) {
      console.error('Failed to initialize Hedera service:', error);
      throw error;
    }
  }

  /**
   * Log a supply chain event to Hedera
   */
  async logSupplyChainEvent(event: SupplyChainEvent): Promise<HederaTransaction> {
    if (!this.topicId || !this.client) {
      throw new Error('Hedera service not initialized or client unavailable');
    }

    try {
      // Prepare event data for blockchain storage
      const eventData = {
        id: event.id,
        batchId: event.batchId,
        eventType: event.eventType,
        timestamp: event.timestamp,
        location: event.location,
        description: event.description,
        participantId: event.participantId,
        participantType: event.participantType,
        certifications: event.certifications || [],
        metadata: event.metadata || {},
        previousEventId: event.previousEventId
      };

      const message = JSON.stringify(eventData);
      const transaction = await this.client.submitMessage(this.topicId, message);

      console.log(`Logged event ${event.id} to Hedera:`, transaction.transactionId);
      return transaction;
    } catch (error) {
      console.error('Failed to log supply chain event:', error);
      throw error;
    }
  }

  /**
   * Create a tokenized product batch
   */
  async createProductBatch(batch: ProductBatch): Promise<{ batch: ProductBatch; tokenInfo?: HederaTokenInfo }> {
    try {
      let tokenInfo;

      // Skip token creation for now to avoid signature issues
      // TODO: Fix Hedera account credentials before enabling token creation
      // if (batch.productType && this.shouldCreateToken(batch)) {
      //   tokenInfo = await this.client.createNftToken(
      //     `${batch.productName} Batch`,
      //     `${batch.productType.toUpperCase()}${batch.id.slice(-4)}`
      //   );
      //   batch.hederaTokenId = tokenInfo.tokenId;
      // }

      // Log batch creation event (skip if no Hedera client)
      const creationEvent: SupplyChainEvent = {
        id: `${batch.id}-creation`,
        batchId: batch.id,
        eventType: 'harvest' as EventType,
        timestamp: batch.createdAt,
        location: batch.originLocation,
        description: `Created batch of ${batch.quantity} ${batch.unit} ${batch.productName}`,
        participantId: 'system',
        participantType: 'farmer' as ParticipantType,
        certifications: batch.certifications,
        metadata: {
          tokenId: tokenInfo?.tokenId,
          productType: batch.productType,
          quantity: batch.quantity,
          unit: batch.unit
        }
      };

      if (this.client) {
        const transaction = await this.logSupplyChainEvent(creationEvent);
        batch.events = [{ ...creationEvent, hederaTransactionId: transaction.transactionId }];
      } else {
        // Store event locally without Hedera transaction
        batch.events = [creationEvent];
      }

      return { batch, tokenInfo };
    } catch (error) {
      console.error('Failed to create product batch:', error);
      throw error;
    }
  }

  /**
   * Query supply chain events for a batch
   */
  async getSupplyChainHistory(batchId: string): Promise<SupplyChainEvent[]> {
    if (!this.topicId) {
      throw new Error('Hedera service not initialized');
    }

    try {
      // Get all messages from the topic
      const messages = await this.mirrorNode.getLatestMessages(this.topicId, 1000);
      const decodedMessages = this.mirrorNode.processChunkedMessages(messages);

      const batchEvents: SupplyChainEvent[] = [];

      for (const message of decodedMessages) {
        try {
          const eventData = JSON.parse(message);
          
          // Filter events for the specific batch
          if (eventData.batchId === batchId) {
            batchEvents.push(eventData);
          }
        } catch (parseError) {
          console.warn('Failed to parse event data:', parseError);
        }
      }

      // Sort events by timestamp
      return batchEvents.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to get supply chain history:', error);
      throw error;
    }
  }

  /**
   * Stream real-time supply chain events
   */
  async startEventStream(callback: (events: SupplyChainEvent[]) => void): Promise<() => void> {
    if (!this.topicId) {
      throw new Error('Hedera service not initialized');
    }

    return this.mirrorNode.startMessageStream(
      this.topicId,
      (messages) => {
        const events: SupplyChainEvent[] = [];
        
        for (const message of messages) {
          try {
            const eventData = JSON.parse(message);
            events.push(eventData);
          } catch (parseError) {
            console.warn('Failed to parse streamed event:', parseError);
          }
        }

        if (events.length > 0) {
          callback(events);
        }
      },
      { pollInterval: 3000, batchSize: 50 }
    );
  }

  /**
   * Get events within a date range
   */
  async getEventsInDateRange(
    startDate: Date,
    endDate: Date,
    batchId?: string
  ): Promise<SupplyChainEvent[]> {
    if (!this.topicId) {
      throw new Error('Hedera service not initialized');
    }

    try {
      const startTimestamp = HederaMirrorNode.toHederaTimestamp(startDate);
      const endTimestamp = HederaMirrorNode.toHederaTimestamp(endDate);

      const messages = await this.mirrorNode.getMessagesInRange(
        this.topicId,
        startTimestamp,
        endTimestamp,
        1000
      );

      const decodedMessages = this.mirrorNode.processChunkedMessages(messages);
      const events: SupplyChainEvent[] = [];

      for (const message of decodedMessages) {
        try {
          const eventData = JSON.parse(message);
          
          // Filter by batchId if provided
          if (!batchId || eventData.batchId === batchId) {
            events.push(eventData);
          }
        } catch (parseError) {
          console.warn('Failed to parse event data:', parseError);
        }
      }

      return events.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to get events in date range:', error);
      throw error;
    }
  }

  /**
   * Transfer batch ownership using tokens
   */
  async transferBatchOwnership(
    batchId: string,
    fromParticipantId: string,
    toParticipantId: string,
    transferEvent: Omit<SupplyChainEvent, 'id' | 'hederaTransactionId'>
  ): Promise<HederaTransaction> {
    try {
      // Find the batch and its token
      const batchHistory = await this.getSupplyChainHistory(batchId);
      const creationEvent = batchHistory.find(e => e.id.includes('creation'));
      const tokenId = creationEvent?.metadata?.tokenId;

      if (tokenId) {
        // Transfer token ownership (simplified - in reality you'd need proper account management)
        console.log(`Transferring token ${tokenId} from ${fromParticipantId} to ${toParticipantId}`);
      }

      // Log transfer event
      const event: SupplyChainEvent = {
        ...transferEvent,
        id: `${batchId}-transfer-${Date.now()}`,
        batchId,
        metadata: {
          ...transferEvent.metadata,
          fromParticipant: fromParticipantId,
          toParticipant: toParticipantId,
          tokenId
        }
      };

      return await this.logSupplyChainEvent(event);
    } catch (error) {
      console.error('Failed to transfer batch ownership:', error);
      throw error;
    }
  }

  /**
   * Get network and service status
   */
  async getServiceStatus(): Promise<{
    hederaConnected: boolean;
    mirrorNodeHealthy: boolean;
    topicId: string | null;
    networkType: string;
  }> {
    const hederaConnected = this.client ? await this.client.validateConnection() : false;
    const mirrorNodeHealthy = await this.mirrorNode.healthCheck();

    return {
      hederaConnected,
      mirrorNodeHealthy,
      topicId: this.topicId,
      networkType: this.config.network
    };
  }

  /**
   * Get topic statistics
   */
  async getTopicStats() {
    if (!this.topicId) {
      return null;
    }

    try {
      if (!this.client) {
        return null;
      }
      
      const topicInfo = await this.client.getTopicInfo(this.topicId);
      const recentMessages = await this.mirrorNode.getLatestMessages(this.topicId, 100);

      return {
        topicId: this.topicId,
        sequenceNumber: topicInfo.sequenceNumber,
        totalMessages: recentMessages.length,
        lastMessageTime: recentMessages.length > 0 ? 
          HederaMirrorNode.parseHederaTimestamp(recentMessages[0].consensus_timestamp) : null
      };
    } catch (error) {
      console.error('Failed to get topic stats:', error);
      return null;
    }
  }

  /**
   * Close connections
   */
  close(): void {
    if (this.client) {
      this.client.close();
    }
  }

  /**
   * Get the current topic ID
   */
  getTopicId(): string | null {
    return this.topicId;
  }

  /**
   * Determine if a batch should have a token created
   */
  private shouldCreateToken(batch: ProductBatch): boolean {
    // Create tokens for high-value or regulated products
    const tokenWorthy = ['wine', 'coffee', 'electronics', 'beef', 'seafood'];
    return tokenWorthy.includes(batch.productType.toLowerCase()) || batch.quantity > 100;
  }

  /**
   * Validate event data before submission
   */
  private validateEvent(event: SupplyChainEvent): boolean {
    const required = ['id', 'batchId', 'eventType', 'timestamp', 'location', 'participantId'];
    return required.every(field => event[field as keyof SupplyChainEvent]);
  }
}