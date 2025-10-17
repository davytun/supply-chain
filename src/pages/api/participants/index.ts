import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, ParticipantType } from '@/types';

interface Participant {
  id: string;
  name: string;
  type: ParticipantType;
  organization: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
  isActive: boolean;
  joinedAt: string;
  batchesCount: number;
  eventsCount: number;
}

const mockParticipants: Participant[] = [
  {
    id: 'farmer-eth-001',
    name: 'Abebe Kebede',
    type: ParticipantType.FARMER,
    organization: 'Yirgacheffe Coffee Cooperative',
    location: {
      country: 'Ethiopia',
      region: 'Sidamo',
      city: 'Yirgacheffe'
    },
    isActive: true,
    joinedAt: '2023-01-15T00:00:00Z',
    batchesCount: 45,
    eventsCount: 234
  },
  {
    id: 'processor-eth-001',
    name: 'Meron Tadesse',
    type: ParticipantType.PROCESSOR,
    organization: 'Ethiopian Coffee Processing Ltd',
    location: {
      country: 'Ethiopia',
      region: 'Sidamo',
      city: 'Yirgacheffe'
    },
    isActive: true,
    joinedAt: '2023-02-01T00:00:00Z',
    batchesCount: 38,
    eventsCount: 156
  },
  {
    id: 'shipper-intl-001',
    name: 'Global Logistics Inc',
    type: ParticipantType.DISTRIBUTOR,
    organization: 'Global Logistics Inc',
    location: {
      country: 'Germany',
      region: 'Hamburg',
      city: 'Hamburg'
    },
    isActive: true,
    joinedAt: '2023-01-20T00:00:00Z',
    batchesCount: 89,
    eventsCount: 445
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Participant[]>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 100));

    res.status(200).json({
      success: true,
      data: mockParticipants,
      message: `Found ${mockParticipants.length} participants`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}