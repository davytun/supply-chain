import { NextApiRequest, NextApiResponse } from 'next';
import { ProductBatch, ApiResponse } from '@/types';

// In-memory storage for demo purposes with sample data
let batches: ProductBatch[] = [
  {
    id: 'COF-ETH-abc123def',
    productName: 'Ethiopian Yirgacheffe Coffee',
    productType: 'coffee' as any,
    quantity: 500,
    unit: 'kg',
    createdAt: '2024-01-15T08:30:00Z',
    originLocation: {
      country: 'Ethiopia',
      region: 'Sidamo',
      city: 'Yirgacheffe'
    },
    currentStatus: 'completed' as any,
    qrCode: 'data:image/png;base64,sample',
    events: [
      {
        id: 'COF-ETH-abc123def-harvest',
        batchId: 'COF-ETH-abc123def',
        eventType: 'harvest' as any,
        timestamp: '2024-01-15T08:30:00Z',
        location: { country: 'Ethiopia', region: 'Sidamo', city: 'Yirgacheffe' },
        description: 'Coffee beans harvested from organic farm',
        participantId: 'farmer-001',
        participantType: 'farmer' as any,
        certifications: []
      }
    ],
    certifications: [
      {
        type: 'organic' as any,
        issuedBy: 'USDA Organic',
        issuedDate: '2024-01-10T00:00:00Z',
        certificateId: 'ORG-2024-001',
        isValid: true
      }
    ],
    expectedPath: [],
    anomalies: []
  },
  {
    id: 'COC-GHA-xyz789abc',
    productName: 'Fair Trade Cocoa Beans',
    productType: 'cocoa' as any,
    quantity: 250,
    unit: 'kg',
    createdAt: '2024-01-20T10:15:00Z',
    originLocation: {
      country: 'Ghana',
      region: 'Ashanti',
      city: 'Kumasi'
    },
    currentStatus: 'in_transit' as any,
    qrCode: 'data:image/png;base64,sample',
    events: [
      {
        id: 'COC-GHA-xyz789abc-harvest',
        batchId: 'COC-GHA-xyz789abc',
        eventType: 'harvest' as any,
        timestamp: '2024-01-20T10:15:00Z',
        location: { country: 'Ghana', region: 'Ashanti', city: 'Kumasi' },
        description: 'Cocoa beans harvested from fair trade farm',
        participantId: 'farmer-002',
        participantType: 'farmer' as any,
        certifications: []
      }
    ],
    certifications: [
      {
        type: 'fair_trade' as any,
        issuedBy: 'Fair Trade USA',
        issuedDate: '2024-01-18T00:00:00Z',
        certificateId: 'FT-2024-002',
        isValid: true
      }
    ],
    expectedPath: [],
    anomalies: []
  },
  {
    id: 'COT-IND-def456ghi',
    productName: 'Organic Cotton',
    productType: 'cotton' as any,
    quantity: 1000,
    unit: 'kg',
    createdAt: '2024-01-25T14:45:00Z',
    originLocation: {
      country: 'India',
      region: 'Gujarat',
      city: 'Ahmedabad'
    },
    currentStatus: 'in_production' as any,
    qrCode: 'data:image/png;base64,sample',
    events: [
      {
        id: 'COT-IND-def456ghi-harvest',
        batchId: 'COT-IND-def456ghi',
        eventType: 'harvest' as any,
        timestamp: '2024-01-25T14:45:00Z',
        location: { country: 'India', region: 'Gujarat', city: 'Ahmedabad' },
        description: 'Organic cotton harvested',
        participantId: 'farmer-003',
        participantType: 'farmer' as any,
        certifications: []
      }
    ],
    certifications: [
      {
        type: 'organic' as any,
        issuedBy: 'GOTS Certified',
        issuedDate: '2024-01-22T00:00:00Z',
        certificateId: 'GOTS-2024-003',
        isValid: true
      }
    ],
    expectedPath: [],
    anomalies: []
  },
  {
    id: 'WIN-FRA-ghi789jkl',
    productName: 'Bordeaux Red Wine',
    productType: 'wine' as any,
    quantity: 100,
    unit: 'bottles',
    createdAt: '2024-02-01T16:20:00Z',
    originLocation: {
      country: 'France',
      region: 'Bordeaux',
      city: 'Saint-Émilion'
    },
    currentStatus: 'ready_for_shipment' as any,
    qrCode: 'data:image/png;base64,sample',
    events: [
      {
        id: 'WIN-FRA-ghi789jkl-harvest',
        batchId: 'WIN-FRA-ghi789jkl',
        eventType: 'harvest' as any,
        timestamp: '2024-02-01T16:20:00Z',
        location: { country: 'France', region: 'Bordeaux', city: 'Saint-Émilion' },
        description: 'Grapes harvested and wine produced',
        participantId: 'winery-001',
        participantType: 'processor' as any,
        certifications: []
      }
    ],
    certifications: [
      {
        type: 'organic' as any,
        issuedBy: 'EU Organic',
        issuedDate: '2024-01-30T00:00:00Z',
        certificateId: 'EU-ORG-2024-004',
        isValid: true
      }
    ],
    expectedPath: [],
    anomalies: []
  },
  {
    id: 'ELE-CHN-jkl012mno',
    productName: 'Smartphone Components',
    productType: 'electronics' as any,
    quantity: 5000,
    unit: 'units',
    createdAt: '2024-02-05T09:10:00Z',
    originLocation: {
      country: 'China',
      region: 'Guangdong',
      city: 'Shenzhen'
    },
    currentStatus: 'shipped' as any,
    qrCode: 'data:image/png;base64,sample',
    events: [
      {
        id: 'ELE-CHN-jkl012mno-production',
        batchId: 'ELE-CHN-jkl012mno',
        eventType: 'processing' as any,
        timestamp: '2024-02-05T09:10:00Z',
        location: { country: 'China', region: 'Guangdong', city: 'Shenzhen' },
        description: 'Electronic components manufactured',
        participantId: 'factory-001',
        participantType: 'processor' as any,
        certifications: []
      }
    ],
    certifications: [],
    expectedPath: [],
    anomalies: []
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ProductBatch[]>>
) {
  if (req.method === 'GET') {
    // Return all batches
    res.status(200).json({
      success: true,
      data: batches,
      message: `Found ${batches.length} batches`,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }
}

// Export function to add batch (used by create endpoint)
export function addBatch(batch: ProductBatch) {
  batches.push(batch);
}