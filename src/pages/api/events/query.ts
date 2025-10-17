import { NextApiRequest, NextApiResponse } from 'next';
import { HederaService } from '@/lib/hedera/service';
import { SupplyChainEvent, ApiResponse } from '@/types';

const hederaService = new HederaService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<SupplyChainEvent[]>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { batchId, qrCode, transactionId, startDate, endDate } = req.query;

    // Initialize Hedera service if needed
    if (!hederaService.getTopicId()) {
      await hederaService.initialize();
    }

    let events: SupplyChainEvent[] = [];

    if (batchId) {
      // Query events for specific batch
      events = await hederaService.getSupplyChainHistory(batchId as string);
    } else if (qrCode) {
      // Extract batch ID from QR code (assuming QR code contains batch ID)
      const extractedBatchId = extractBatchIdFromQR(qrCode as string);
      if (extractedBatchId) {
        events = await hederaService.getSupplyChainHistory(extractedBatchId);
      }
    } else if (transactionId) {
      // Query by transaction ID (would need additional implementation)
      // For now, return empty array
      events = [];
    } else if (startDate && endDate) {
      // Query events within date range
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      events = await hederaService.getEventsInDateRange(start, end);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Missing query parameter: batchId, qrCode, transactionId, or date range (startDate & endDate)',
        timestamp: new Date().toISOString()
      });
    }

    // Sort events by timestamp (most recent first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.status(200).json({
      success: true,
      data: events,
      message: `Found ${events.length} events`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error querying events:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

function extractBatchIdFromQR(qrCode: string): string | null {
  try {
    // QR code might be a URL like: https://domain.com/track/BATCH123
    // or just the batch ID directly
    if (qrCode.includes('/track/')) {
      return qrCode.split('/track/')[1];
    } else if (qrCode.includes('batchId=')) {
      const params = new URLSearchParams(qrCode.split('?')[1]);
      return params.get('batchId');
    } else {
      // Assume it's the batch ID directly
      return qrCode;
    }
  } catch (error) {
    console.error('Error extracting batch ID from QR code:', error);
    return null;
  }
}