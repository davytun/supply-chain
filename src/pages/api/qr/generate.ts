import { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';
import { ApiResponse } from '@/types';

interface QRGenerateRequest {
  batchId: string;
  format?: 'png' | 'svg' | 'utf8';
  size?: number;
  includeUrl?: boolean;
}

interface QRGenerateResponse {
  qrCode: string;
  format: string;
  batchId: string;
  trackingUrl?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<QRGenerateResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { batchId, format = 'png', size = 256, includeUrl = true }: QRGenerateRequest = req.body;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: batchId',
        timestamp: new Date().toISOString()
      });
    }

    // Determine QR code content
    let qrContent: string;
    let trackingUrl: string | undefined;

    if (includeUrl) {
      trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${batchId}`;
      qrContent = trackingUrl;
    } else {
      qrContent = batchId;
    }

    // QR code generation options
    const options = {
      errorCorrectionLevel: 'M' as const,
      type: 'image/png' as const,
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: size
    };

    let qrCode: string;

    // Generate QR code based on format
    switch (format) {
      case 'png':
        qrCode = await QRCode.toDataURL(qrContent, options);
        break;
      case 'svg':
        qrCode = await QRCode.toString(qrContent, { 
          type: 'svg',
          errorCorrectionLevel: 'M',
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        break;
      case 'utf8':
        qrCode = await QRCode.toString(qrContent, { 
          type: 'utf8',
          errorCorrectionLevel: 'M'
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid format. Supported formats: png, svg, utf8',
          timestamp: new Date().toISOString()
        });
    }

    const response: QRGenerateResponse = {
      qrCode,
      format,
      batchId,
      ...(trackingUrl && { trackingUrl })
    };

    res.status(200).json({
      success: true,
      data: response,
      message: 'QR code generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}