import axios, { AxiosResponse } from 'axios';
import { HederaConfig } from '@/types';

export interface MirrorNodeMessage {
  chunk_info?: {
    initial_transaction_id: string;
    number: number;
    total: number;
  };
  consensus_timestamp: string;
  message: string;
  payer_account_id: string;
  running_hash: string;
  running_hash_version: number;
  sequence_number: number;
  topic_id: string;
}

export interface MirrorNodeResponse {
  messages: MirrorNodeMessage[];
  links: {
    next?: string;
  };
}

export class HederaMirrorNode {
  private baseUrl: string;
  private config: HederaConfig;

  constructor(config: HederaConfig) {
    this.config = config;
    this.baseUrl = config.mirrorNodeUrl || 'https://testnet.mirrornode.hedera.com';
  }

  /**
   * Get topic messages from mirror node
   */
  async getTopicMessages(
    topicId: string,
    options?: {
      limit?: number;
      order?: 'asc' | 'desc';
      timestamp?: string;
      sequenceNumber?: number;
    }
  ): Promise<MirrorNodeResponse> {
    try {
      const params = new URLSearchParams();
      
      if (options?.limit) {
        params.append('limit', options.limit.toString());
      }
      
      if (options?.order) {
        params.append('order', options.order);
      }
      
      if (options?.timestamp) {
        params.append('timestamp', options.timestamp);
      }
      
      if (options?.sequenceNumber) {
        params.append('sequencenumber', options.sequenceNumber.toString());
      }

      const url = `${this.baseUrl}/api/v1/topics/${topicId}/messages?${params.toString()}`;
      const response: AxiosResponse<MirrorNodeResponse> = await axios.get(url);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching topic messages:', error);
      throw error;
    }
  }

  /**
   * Get latest messages for a topic
   */
  async getLatestMessages(topicId: string, limit: number = 10): Promise<MirrorNodeMessage[]> {
    const response = await this.getTopicMessages(topicId, {
      limit,
      order: 'desc'
    });
    
    return response.messages;
  }

  /**
   * Get messages after a specific sequence number
   */
  async getMessagesAfterSequence(
    topicId: string, 
    sequenceNumber: number,
    limit: number = 100
  ): Promise<MirrorNodeMessage[]> {
    const response = await this.getTopicMessages(topicId, {
      sequenceNumber: sequenceNumber + 1,
      order: 'asc',
      limit
    });
    
    return response.messages;
  }

  /**
   * Get messages within a timestamp range
   */
  async getMessagesInRange(
    topicId: string,
    startTimestamp: string,
    endTimestamp: string,
    limit: number = 100
  ): Promise<MirrorNodeMessage[]> {
    try {
      const params = new URLSearchParams({
        'timestamp': `gte:${startTimestamp}`,
        'timestamp': `lte:${endTimestamp}`,
        'limit': limit.toString(),
        'order': 'asc'
      });

      const url = `${this.baseUrl}/api/v1/topics/${topicId}/messages?${params.toString()}`;
      const response: AxiosResponse<MirrorNodeResponse> = await axios.get(url);
      
      return response.messages;
    } catch (error) {
      console.error('Error fetching messages in range:', error);
      throw error;
    }
  }

  /**
   * Decode base64 message content
   */
  decodeMessage(message: string): string {
    try {
      return Buffer.from(message, 'base64').toString('utf8');
    } catch (error) {
      console.error('Error decoding message:', error);
      return message;
    }
  }

  /**
   * Process chunked messages and reassemble them
   */
  processChunkedMessages(messages: MirrorNodeMessage[]): string[] {
    const chunkedMessages = new Map<string, Map<number, string>>();
    const completeMessages: string[] = [];

    // Group messages by messageId and chunk
    for (const message of messages) {
      const decodedMessage = this.decodeMessage(message.message);
      
      try {
        const parsedMessage = JSON.parse(decodedMessage);
        
        // Check if this is a chunked message
        if (parsedMessage.chunkIndex !== undefined && parsedMessage.totalChunks !== undefined) {
          const messageId = parsedMessage.messageId;
          
          if (!chunkedMessages.has(messageId)) {
            chunkedMessages.set(messageId, new Map());
          }
          
          const chunks = chunkedMessages.get(messageId)!;
          chunks.set(parsedMessage.chunkIndex, parsedMessage.data);
          
          // Check if we have all chunks
          if (chunks.size === parsedMessage.totalChunks) {
            // Reassemble the message
            let reassembledMessage = '';
            for (let i = 0; i < parsedMessage.totalChunks; i++) {
              const chunkData = chunks.get(i);
              if (chunkData) {
                reassembledMessage += Buffer.from(chunkData, 'base64').toString('utf8');
              }
            }
            
            completeMessages.push(reassembledMessage);
            chunkedMessages.delete(messageId);
          }
        } else {
          // This is a complete message
          completeMessages.push(decodedMessage);
        }
      } catch {
        // If parsing fails, treat as a complete message
        completeMessages.push(decodedMessage);
      }
    }

    return completeMessages;
  }

  /**
   * Stream messages in real-time using polling
   */
  async startMessageStream(
    topicId: string,
    callback: (messages: string[]) => void,
    options?: {
      pollInterval?: number; // milliseconds
      batchSize?: number;
    }
  ): Promise<() => void> {
    const pollInterval = options?.pollInterval || 5000; // 5 seconds default
    const batchSize = options?.batchSize || 10;
    let lastSequenceNumber = 0;
    let isStreaming = true;

    // Get initial sequence number
    const latestMessages = await this.getLatestMessages(topicId, 1);
    if (latestMessages.length > 0) {
      lastSequenceNumber = latestMessages[0].sequence_number;
    }

    const poll = async () => {
      if (!isStreaming) return;

      try {
        const newMessages = await this.getMessagesAfterSequence(
          topicId,
          lastSequenceNumber,
          batchSize
        );

        if (newMessages.length > 0) {
          const decodedMessages = this.processChunkedMessages(newMessages);
          
          if (decodedMessages.length > 0) {
            callback(decodedMessages);
          }

          // Update last sequence number
          lastSequenceNumber = Math.max(
            ...newMessages.map(m => m.sequence_number)
          );
        }
      } catch (error) {
        console.error('Error in message stream:', error);
      }

      if (isStreaming) {
        setTimeout(poll, pollInterval);
      }
    };

    // Start polling
    setTimeout(poll, pollInterval);

    // Return stop function
    return () => {
      isStreaming = false;
    };
  }

  /**
   * Get account information from mirror node
   */
  async getAccountInfo(accountId: string) {
    try {
      const url = `${this.baseUrl}/api/v1/accounts/${accountId}`;
      const response = await axios.get(url);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw error;
    }
  }

  /**
   * Get token information from mirror node
   */
  async getTokenInfo(tokenId: string) {
    try {
      const url = `${this.baseUrl}/api/v1/tokens/${tokenId}`;
      const response = await axios.get(url);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw error;
    }
  }

  /**
   * Get transaction information
   */
  async getTransaction(transactionId: string) {
    try {
      const url = `${this.baseUrl}/api/v1/transactions/${transactionId}`;
      const response = await axios.get(url);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction info:', error);
      throw error;
    }
  }

  /**
   * Get network status and information
   */
  async getNetworkNodes() {
    try {
      const url = `${this.baseUrl}/api/v1/network/nodes`;
      const response = await axios.get(url);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching network nodes:', error);
      throw error;
    }
  }

  /**
   * Get topic information from mirror node
   */
  async getTopicInfo(topicId: string) {
    try {
      const url = `${this.baseUrl}/api/v1/topics/${topicId}`;
      const response = await axios.get(url);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching topic info from mirror node:', error);
      throw error;
    }
  }

  /**
   * Health check for mirror node
   */
  async healthCheck(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/api/v1/network/nodes`;
      const response = await axios.get(url, { timeout: 5000 });
      
      return response.status === 200;
    } catch (error) {
      console.error('Mirror node health check failed:', error);
      return false;
    }
  }

  /**
   * Convert Hedera timestamp to JavaScript Date
   */
  static parseHederaTimestamp(timestamp: string): Date {
    // Hedera timestamp format: "seconds.nanoseconds"
    const [seconds, nanoseconds] = timestamp.split('.');
    const milliseconds = parseInt(seconds) * 1000 + Math.floor(parseInt(nanoseconds) / 1000000);
    
    return new Date(milliseconds);
  }

  /**
   * Convert JavaScript Date to Hedera timestamp format
   */
  static toHederaTimestamp(date: Date): string {
    const seconds = Math.floor(date.getTime() / 1000);
    const nanoseconds = (date.getTime() % 1000) * 1000000;
    
    return `${seconds}.${nanoseconds.toString().padStart(9, '0')}`;
  }
}