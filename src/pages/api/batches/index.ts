import { NextApiRequest, NextApiResponse } from 'next';
import { ProductBatch, ApiResponse } from '@/types';

// In-memory storage for demo purposes with sample data
const batches: ProductBatch[] = [
  {
    id: 'COF-ETH-abc123def',
    productName: 'Ethiopian Yirgacheffe Coffee',
    productType: 'coffee',
    quantity: 500,
    unit: 'kg',
    createdAt: '2024-01-15T08:30:00Z',
    originLocation: {
      country: 'Ethiopia',
      region: 'Sidamo',
      city: 'Yirgacheffe'
    },
    currentStatus: 'completed',
    qrCode: 'data:image/png;base64,sample',
    events: [],
    certifications: [
      {
        type: 'organic',
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
    productType: 'cocoa',
    quantity: 250,
    unit: 'kg',
    createdAt: '2024-01-20T10:15:00Z',
    originLocation: {
      country: 'Ghana',
      region: 'Ashanti',
      city: 'Kumasi'
    },
    currentStatus: 'in_transit',
    qrCode: 'data:image/png;base64,sample',
    events: [],
    certifications: [
      {
        type: 'fair_trade',
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
    productType: 'cotton',
    quantity: 1000,
    unit: 'kg',
    createdAt: '2024-01-25T14:45:00Z',
    originLocation: {
      country: 'India',
      region: 'Gujarat',
      city: 'Ahmedabad'
    },
    currentStatus: 'in_production',
    qrCode: 'data:image/png;base64,sample',
    events: [],
    certifications: [
      {
        type: 'organic',
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
    productType: 'wine',
    quantity: 100,
    unit: 'bottles',
    createdAt: '2024-02-01T16:20:00Z',
    originLocation: {
      country: 'France',
      region: 'Bordeaux',
      city: 'Saint-Émilion'
    },
    currentStatus: 'ready_for_shipment',
    qrCode: 'data:image/png;base64,sample',
    events: [],
    certifications: [
      {
        type: 'organic',
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
    productType: 'electronics',
    quantity: 5000,
    unit: 'units',
    createdAt: '2024-02-05T09:10:00Z',
    originLocation: {
      country: 'China',
      region: 'Guangdong',
      city: 'Shenzhen'
    },
    currentStatus: 'shipped',
    qrCode: 'data:image/png;base64,sample',
    events: [],
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