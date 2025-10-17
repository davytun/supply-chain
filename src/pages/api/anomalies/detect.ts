import { NextApiRequest, NextApiResponse } from 'next';
import { AnomalyDetectionSystem } from '@/lib/ai/anomaly-detection';
import { HederaService } from '@/lib/hedera/service';
import { SupplyChainEvent, AnomalyAlert, ApiResponse } from '@/types';

const anomalyDetector = new AnomalyDetectionSystem(
  parseFloat(process.env.ANOMALY_DETECTION_THRESHOLD || '0.7')
);
const hederaService = new HederaService();

interface AnomalyDetectionRequest {
  event: SupplyChainEvent;
  batchId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AnomalyAlert[]>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { event, batchId }: AnomalyDetectionRequest = req.body;

    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: event',
        timestamp: new Date().toISOString()
      });
    }

    // Initialize services if needed
    if (!hederaService.getTopicId()) {
      await hederaService.initialize();
    }

    await anomalyDetector.initialize();

    // Get previous events for the batch to provide context
    let previousEvents: SupplyChainEvent[] = [];
    
    try {
      const targetBatchId = batchId || event.batchId;
      if (targetBatchId) {
        previousEvents = await hederaService.getSupplyChainHistory(targetBatchId);
        
        // Filter out the current event if it's already in the history
        previousEvents = previousEvents.filter(e => e.id !== event.id);
        
        // Sort by timestamp
        previousEvents.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }
    } catch (error) {
      console.warn('Could not fetch previous events for anomaly detection:', error);
      // Continue with empty previous events array
    }

    // Run anomaly detection
    const anomalies = await anomalyDetector.analyzeEvent(event, previousEvents);

    // Log anomalies if any are detected
    if (anomalies.length > 0) {
      console.log(`Detected ${anomalies.length} anomalies for event ${event.id}`);
      
      // Here you would typically save anomalies to your database
      // For this demo, we'll just return them
    }

    // Event updated with anomaly information (for potential future use)
    // const updatedEvent = {
    //   ...event,
    //   anomalyScore: anomalies.length > 0 ? Math.max(...anomalies.map(a => a.score)) : 0,
    //   isAnomaly: anomalies.length > 0
    // };

    res.status(200).json({
      success: true,
      data: anomalies,
      message: anomalies.length > 0 
        ? `Detected ${anomalies.length} anomaly/anomalies` 
        : 'No anomalies detected',
      timestamp: new Date().toISOString(),
      metadata: {
        eventId: event.id,
        batchId: event.batchId,
        previousEventsCount: previousEvents.length,
        anomalyThreshold: anomalyDetector.getAnomalyThreshold(),
        aiEnabled: process.env.ENABLE_AI_MONITORING === 'true'
      }
    });

  } catch (error) {
    console.error('Error in anomaly detection:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}