import { NextApiRequest, NextApiResponse } from 'next';
import { HederaService } from '@/lib/hedera/service';
import { ProductBatch, BatchFormData, ApiResponse, BatchStatus } from '@/types';
import { addBatch } from './index';
import QRCode from 'qrcode';

const hederaService = new HederaService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ProductBatch>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const batchData: BatchFormData = req.body;

    // Validate required fields
    if (!batchData.productName || !batchData.productType || !batchData.quantity || !batchData.originLocation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: productName, productType, quantity, originLocation',
        timestamp: new Date().toISOString()
      });
    }

    // Check if Hedera is properly configured
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY || !process.env.HEDERA_TOPIC_ID) {
      // Create batch without Hedera integration
      const batchId = generateBatchId(batchData.productType, batchData.productName);
      const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${batchId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl);
      
      const batch: ProductBatch = {
        id: batchId,
        productName: batchData.productName,
        productType: batchData.productType,
        quantity: batchData.quantity,
        unit: batchData.unit,
        createdAt: new Date().toISOString(),
        originLocation: batchData.originLocation,
        currentStatus: BatchStatus.IN_PRODUCTION,
        qrCode: qrCodeDataUrl,
        events: [],
        certifications: batchData.certifications || [],
        expectedPath: [],
        anomalies: []
      };
      
      // Store batch in memory
      addBatch(batch);
      
      return res.status(201).json({
        success: true,
        data: batch,
        message: 'Batch created successfully (Hedera not configured)',
        timestamp: new Date().toISOString()
      });
    }

    // Generate unique batch ID
    const batchId = generateBatchId(batchData.productType, batchData.productName);

    // Generate QR code for tracking
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${batchId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Create product batch object
    const batch: ProductBatch = {
      id: batchId,
      productName: batchData.productName,
      productType: batchData.productType,
      quantity: batchData.quantity,
      unit: batchData.unit,
      createdAt: new Date().toISOString(),
      originLocation: batchData.originLocation,
      currentStatus: BatchStatus.IN_PRODUCTION,
      qrCode: qrCodeDataUrl,
      events: [],
      certifications: batchData.certifications || [],
      expectedPath: [],
      anomalies: []
    };

    // Initialize Hedera service if needed
    if (!hederaService.getTopicId()) {
      await hederaService.initialize();
    }

    // Create batch on Hedera (this will create token and log creation event)
    const { batch: updatedBatch, tokenInfo } = await hederaService.createProductBatch(batch);

    // Store batch in memory for demo
    addBatch(updatedBatch);

    const response = {
      success: true,
      data: updatedBatch,
      message: 'Batch created successfully',
      timestamp: new Date().toISOString(),
      metadata: {
        tokenInfo,
        trackingUrl,
        qrCodeGenerated: true
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

function generateBatchId(productType: string, productName: string): string {
  const timestamp = Date.now().toString(36);
  const productCode = productType.substring(0, 3).toUpperCase();
  const nameCode = productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${productCode}-${nameCode}-${timestamp}-${random}`;
}