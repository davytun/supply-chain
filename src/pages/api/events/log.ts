import { NextApiRequest, NextApiResponse } from 'next';
import { HederaService } from '@/lib/hedera/service';
import { SupplyChainEvent, EventFormData, ApiResponse, ParticipantType } from '@/types';

const hederaService = new HederaService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<SupplyChainEvent>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const eventData: EventFormData = req.body;

    // Validate required fields
    if (!eventData.batchId || !eventData.eventType || !eventData.location || !eventData.description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: batchId, eventType, location, description',
        timestamp: new Date().toISOString()
      });
    }

    // Check if Hedera is properly configured
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY || !process.env.HEDERA_TOPIC_ID) {
      const event: SupplyChainEvent = {
        id: `${eventData.batchId}-${eventData.eventType}-${Date.now()}`,
        batchId: eventData.batchId,
        eventType: eventData.eventType,
        timestamp: new Date().toISOString(),
        location: eventData.location,
        description: eventData.description,
        participantId: req.headers['x-participant-id'] as string || 'anonymous',
        participantType: (req.headers['x-participant-type'] as ParticipantType) || ParticipantType.FARMER,
        certifications: eventData.certifications || [],
        metadata: eventData.metadata || {}
      };
      
      return res.status(201).json({
        success: true,
        data: event,
        message: 'Event logged successfully (Hedera not configured)',
        timestamp: new Date().toISOString()
      });
    }

    // Create supply chain event
    const event: SupplyChainEvent = {
      id: `${eventData.batchId}-${eventData.eventType}-${Date.now()}`,
      batchId: eventData.batchId,
      eventType: eventData.eventType,
      timestamp: new Date().toISOString(),
      location: eventData.location,
      description: eventData.description,
      participantId: req.headers['x-participant-id'] as string || 'anonymous',
      participantType: (req.headers['x-participant-type'] as ParticipantType) || ParticipantType.FARMER,
      certifications: eventData.certifications || [],
      metadata: eventData.metadata || {}
    };

    // Initialize Hedera service if needed
    if (!hederaService.getTopicId()) {
      await hederaService.initialize();
    }

    // Log event to Hedera
    const transaction = await hederaService.logSupplyChainEvent(event);
    
    // Add Hedera transaction details to event
    event.hederaTransactionId = transaction.transactionId;
    event.hederaTopicId = transaction.topicId;
    event.sequenceNumber = transaction.sequenceNumber;

    // Here you would typically also save to your local database
    // For this demo, we'll just return the event with Hedera confirmation

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event logged successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error logging event:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}