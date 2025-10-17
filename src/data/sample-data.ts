import { 
  ProductBatch, 
  SupplyChainEvent, 
  ProductType, 
  EventType, 
  ParticipantType,
  CertificationType,
  BatchStatus,
  Location 
} from '@/types';

// Sample locations
export const sampleLocations: Location[] = [
  {
    country: 'Ethiopia',
    region: 'Sidamo',
    city: 'Yirgacheffe',
    coordinates: { latitude: 6.1629, longitude: 38.2070 }
  },
  {
    country: 'Brazil',
    region: 'Minas Gerais',
    city: 'Santos',
    coordinates: { latitude: -23.9608, longitude: -46.3331 }
  },
  {
    country: 'Colombia',
    region: 'Huila',
    city: 'Neiva',
    coordinates: { latitude: 2.9273, longitude: -75.2819 }
  },
  {
    country: 'Vietnam',
    region: 'Dak Lak',
    city: 'Buon Ma Thuot',
    coordinates: { latitude: 12.6667, longitude: 108.0500 }
  },
  {
    country: 'USA',
    region: 'California',
    city: 'Los Angeles',
    coordinates: { latitude: 34.0522, longitude: -118.2437 }
  },
  {
    country: 'Germany',
    region: 'Hamburg',
    city: 'Hamburg',
    coordinates: { latitude: 53.5511, longitude: 9.9937 }
  }
];

// Sample product batches
export const sampleBatches: ProductBatch[] = [
  {
    id: 'COF-ETH-m1n2p3q4r5',
    productName: 'Single Origin Ethiopian Arabica Coffee',
    productType: ProductType.COFFEE,
    quantity: 500,
    unit: 'kg',
    createdAt: '2024-01-15T08:00:00Z',
    originLocation: sampleLocations[0],
    currentStatus: BatchStatus.COMPLETED,
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    events: [],
    certifications: [
      {
        type: CertificationType.ORGANIC,
        issuedBy: 'USDA Organic',
        issuedDate: '2024-01-10T00:00:00Z',
        expiryDate: '2025-01-10T00:00:00Z',
        certificateId: 'ORG-2024-001',
        isValid: true
      },
      {
        type: CertificationType.FAIR_TRADE,
        issuedBy: 'Fair Trade USA',
        issuedDate: '2024-01-12T00:00:00Z',
        expiryDate: '2025-01-12T00:00:00Z',
        certificateId: 'FT-2024-001',
        isValid: true
      }
    ],
    expectedPath: ['Ethiopia', 'Germany', 'USA'],
    anomalies: []
  },
  {
    id: 'COC-BRA-k8l9m0n1o2',
    productName: 'Premium Brazilian Cocoa Beans',
    productType: ProductType.COCOA,
    quantity: 1000,
    unit: 'kg',
    createdAt: '2024-02-01T10:30:00Z',
    originLocation: sampleLocations[1],
    currentStatus: BatchStatus.IN_TRANSIT,
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    events: [],
    certifications: [
      {
        type: CertificationType.RAINFOREST_ALLIANCE,
        issuedBy: 'Rainforest Alliance',
        issuedDate: '2024-01-25T00:00:00Z',
        expiryDate: '2025-01-25T00:00:00Z',
        certificateId: 'RA-2024-002',
        isValid: true
      }
    ],
    expectedPath: ['Brazil', 'USA'],
    anomalies: []
  },
  {
    id: 'COT-VIE-x3y4z5a6b7',
    productName: 'Organic Vietnamese Coffee Beans',
    productType: ProductType.COFFEE,
    quantity: 750,
    unit: 'kg',
    createdAt: '2024-02-10T06:15:00Z',
    originLocation: sampleLocations[3],
    currentStatus: BatchStatus.PROCESSING,
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    events: [],
    certifications: [
      {
        type: CertificationType.ORGANIC,
        issuedBy: 'JAS Organic',
        issuedDate: '2024-02-05T00:00:00Z',
        expiryDate: '2025-02-05T00:00:00Z',
        certificateId: 'JAS-2024-003',
        isValid: true
      }
    ],
    expectedPath: ['Vietnam', 'Germany', 'USA'],
    anomalies: []
  }
];

// Sample supply chain events
export const sampleEvents: SupplyChainEvent[] = [
  {
    id: 'COF-ETH-m1n2p3q4r5-harvest',
    batchId: 'COF-ETH-m1n2p3q4r5',
    eventType: EventType.HARVEST,
    timestamp: '2024-01-15T08:00:00Z',
    location: sampleLocations[0],
    description: 'Coffee beans harvested from certified organic farm in Yirgacheffe region',
    participantId: 'farmer-eth-001',
    participantType: ParticipantType.FARMER,
    certifications: [
      {
        type: CertificationType.ORGANIC,
        issuedBy: 'USDA Organic',
        issuedDate: '2024-01-10T00:00:00Z',
        expiryDate: '2025-01-10T00:00:00Z',
        certificateId: 'ORG-2024-001',
        isValid: true
      }
    ],
    metadata: {
      altitude: 1800,
      varietyType: 'Arabica Typica',
      harvestMethod: 'Hand-picked',
      weatherConditions: 'Optimal'
    },
    hederaTransactionId: '0.0.12345@1642248000.123456789',
    sequenceNumber: 1,
    anomalyScore: 0.05,
    isAnomaly: false
  },
  {
    id: 'COF-ETH-m1n2p3q4r5-processing',
    batchId: 'COF-ETH-m1n2p3q4r5',
    eventType: EventType.PROCESSING,
    timestamp: '2024-01-16T14:30:00Z',
    location: sampleLocations[0],
    description: 'Coffee beans processed using traditional washed method',
    participantId: 'processor-eth-001',
    participantType: ParticipantType.PROCESSOR,
    metadata: {
      processingMethod: 'Washed',
      fermentationTime: '36 hours',
      dryingMethod: 'Sun-dried',
      moistureContent: '11.5%'
    },
    hederaTransactionId: '0.0.12345@1642334200.234567890',
    sequenceNumber: 2,
    previousEventId: 'COF-ETH-m1n2p3q4r5-harvest',
    anomalyScore: 0.08,
    isAnomaly: false
  },
  {
    id: 'COF-ETH-m1n2p3q4r5-quality-check',
    batchId: 'COF-ETH-m1n2p3q4r5',
    eventType: EventType.QUALITY_CHECK,
    timestamp: '2024-01-18T10:00:00Z',
    location: sampleLocations[0],
    description: 'Quality inspection passed - Grade AA specialty coffee',
    participantId: 'inspector-eth-001',
    participantType: ParticipantType.INSPECTOR,
    certifications: [
      {
        type: CertificationType.FAIR_TRADE,
        issuedBy: 'Fair Trade USA',
        issuedDate: '2024-01-12T00:00:00Z',
        expiryDate: '2025-01-12T00:00:00Z',
        certificateId: 'FT-2024-001',
        isValid: true
      }
    ],
    metadata: {
      grade: 'AA',
      cupScore: 87,
      defectCount: 2,
      screenSize: '18+',
      approvedBy: 'Coffee Quality Institute'
    },
    hederaTransactionId: '0.0.12345@1642507200.345678901',
    sequenceNumber: 3,
    previousEventId: 'COF-ETH-m1n2p3q4r5-processing',
    anomalyScore: 0.03,
    isAnomaly: false
  },
  {
    id: 'COF-ETH-m1n2p3q4r5-packaging',
    batchId: 'COF-ETH-m1n2p3q4r5',
    eventType: EventType.PACKAGING,
    timestamp: '2024-01-19T16:45:00Z',
    location: sampleLocations[0],
    description: 'Coffee packaged in biodegradable jute bags for export',
    participantId: 'processor-eth-001',
    participantType: ParticipantType.PROCESSOR,
    metadata: {
      packageType: 'Jute bags',
      packageSize: '60kg',
      packagesCount: 8,
      sustainabilityFeatures: ['Biodegradable', 'Reusable'],
      packagingDate: '2024-01-19'
    },
    hederaTransactionId: '0.0.12345@1642617900.456789012',
    sequenceNumber: 4,
    previousEventId: 'COF-ETH-m1n2p3q4r5-quality-check',
    anomalyScore: 0.04,
    isAnomaly: false
  },
  {
    id: 'COF-ETH-m1n2p3q4r5-shipping',
    batchId: 'COF-ETH-m1n2p3q4r5',
    eventType: EventType.SHIPPING,
    timestamp: '2024-01-22T09:15:00Z',
    location: sampleLocations[0],
    description: 'Shipped from Addis Ababa to Hamburg port via cargo vessel',
    participantId: 'shipper-intl-001',
    participantType: ParticipantType.DISTRIBUTOR,
    metadata: {
      shipmentMethod: 'Sea freight',
      vesselName: 'Atlantic Trader',
      containerNumber: 'MSKU7834562',
      estimatedArrival: '2024-02-15T00:00:00Z',
      trackingNumber: 'MSK-AT-2024-001'
    },
    hederaTransactionId: '0.0.12345@1642852500.567890123',
    sequenceNumber: 5,
    previousEventId: 'COF-ETH-m1n2p3q4r5-packaging',
    anomalyScore: 0.06,
    isAnomaly: false
  },
  {
    id: 'COF-ETH-m1n2p3q4r5-storage',
    batchId: 'COF-ETH-m1n2p3q4r5',
    eventType: EventType.STORAGE,
    timestamp: '2024-02-16T14:20:00Z',
    location: sampleLocations[5],
    description: 'Arrived and stored at Hamburg distribution center',
    participantId: 'warehouse-ger-001',
    participantType: ParticipantType.DISTRIBUTOR,
    metadata: {
      warehouseFacility: 'Hamburg Coffee Terminal',
      storageConditions: 'Temperature controlled, 15-18°C',
      humidity: '60-65%',
      storageLocation: 'Section A-12',
      inspectionStatus: 'Passed'
    },
    hederaTransactionId: '0.0.12345@1645020000.678901234',
    sequenceNumber: 6,
    previousEventId: 'COF-ETH-m1n2p3q4r5-shipping',
    anomalyScore: 0.02,
    isAnomaly: false
  }
];

// Generate additional sample events for other batches
export function generateSampleEventsForBatch(batch: ProductBatch): SupplyChainEvent[] {
  const baseEvents: Partial<SupplyChainEvent>[] = [
    {
      eventType: EventType.HARVEST,
      description: `${batch.productName} harvested from origin farm`,
      participantType: ParticipantType.FARMER,
      metadata: { harvestMethod: 'Hand-picked', quality: 'Premium' }
    },
    {
      eventType: EventType.PROCESSING,
      description: `Initial processing of ${batch.productName}`,
      participantType: ParticipantType.PROCESSOR,
      metadata: { processingMethod: 'Traditional', duration: '24 hours' }
    },
    {
      eventType: EventType.QUALITY_CHECK,
      description: `Quality inspection completed for ${batch.productName}`,
      participantType: ParticipantType.INSPECTOR,
      metadata: { grade: 'A', defectRate: '< 2%' }
    }
  ];

  return baseEvents.map((event, index) => ({
    id: `${batch.id}-${event.eventType}-${index + 1}`,
    batchId: batch.id,
    timestamp: new Date(new Date(batch.createdAt).getTime() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
    location: batch.originLocation,
    participantId: `${event.participantType}-001`,
    certifications: batch.certifications,
    hederaTransactionId: `0.0.12345@${Date.now() + index}.${Math.random().toString().slice(2, 11)}`,
    sequenceNumber: index + 1,
    previousEventId: index > 0 ? `${batch.id}-${baseEvents[index - 1].eventType}-${index}` : undefined,
    anomalyScore: Math.random() * 0.1,
    isAnomaly: false,
    ...event
  } as SupplyChainEvent));
}

// Export all sample data together
export const sampleData = {
  batches: sampleBatches,
  events: sampleEvents,
  locations: sampleLocations,
  generateEventsForBatch: generateSampleEventsForBatch
};