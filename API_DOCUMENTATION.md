# API Documentation - Supply Chain Tracker

This document provides comprehensive documentation for all API endpoints in the Transparent Supply Chain Tracker application.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API uses header-based participant identification:

```http
X-Participant-ID: participant-001
X-Participant-Type: farmer
```

## Response Format

All API responses follow this standard format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
```

## Batch Management

### Create Product Batch

Creates a new product batch with tokenization and QR code generation.

**Endpoint:** `POST /api/batches/create`

**Request Body:**
```typescript
interface BatchFormData {
  productName: string;
  productType: ProductType;
  quantity: number;
  unit: string;
  originLocation: {
    country: string;
    region: string;
    city: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  certifications: Certification[];
}
```

**Example Request:**
```json
{
  "productName": "Single Origin Ethiopian Coffee",
  "productType": "coffee",
  "quantity": 500,
  "unit": "kg",
  "originLocation": {
    "country": "Ethiopia",
    "region": "Sidamo",
    "city": "Yirgacheffe",
    "coordinates": {
      "latitude": 6.1629,
      "longitude": 38.2070
    }
  },
  "certifications": [
    {
      "type": "organic",
      "issuedBy": "USDA Organic",
      "certificateId": "ORG-2024-001"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "COF-ETH-abc123def456",
    "productName": "Single Origin Ethiopian Coffee",
    "productType": "coffee",
    "quantity": 500,
    "unit": "kg",
    "createdAt": "2024-01-15T08:00:00Z",
    "originLocation": { ... },
    "currentStatus": "in_production",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "hederaTokenId": "0.0.123456",
    "events": [...],
    "certifications": [...],
    "anomalies": []
  },
  "message": "Batch created successfully",
  "timestamp": "2024-01-15T08:00:00Z",
  "metadata": {
    "tokenInfo": {
      "tokenId": "0.0.123456",
      "name": "Single Origin Ethiopian Coffee Batch",
      "symbol": "COFETH001"
    },
    "trackingUrl": "http://localhost:3000/track/COF-ETH-abc123def456",
    "qrCodeGenerated": true
  }
}
```

**Status Codes:**
- `201` - Batch created successfully
- `400` - Invalid request data
- `500` - Internal server error

## Event Management

### Log Supply Chain Event

Records a new supply chain event on the Hedera blockchain.

**Endpoint:** `POST /api/events/log`

**Headers:**
```http
Content-Type: application/json
X-Participant-ID: farmer-001
X-Participant-Type: farmer
```

**Request Body:**
```typescript
interface EventFormData {
  batchId: string;
  eventType: EventType;
  location: Location;
  description: string;
  certifications?: Certification[];
  metadata?: Record<string, any>;
}
```

**Example Request:**
```json
{
  "batchId": "COF-ETH-abc123def456",
  "eventType": "harvest",
  "location": {
    "country": "Ethiopia",
    "region": "Sidamo",
    "city": "Yirgacheffe"
  },
  "description": "Coffee beans harvested from certified organic farm",
  "certifications": [
    {
      "type": "organic",
      "issuedBy": "USDA Organic",
      "certificateId": "ORG-2024-001"
    }
  ],
  "metadata": {
    "altitude": 1800,
    "varietyType": "Arabica Typica",
    "harvestMethod": "Hand-picked",
    "weatherConditions": "Optimal"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "COF-ETH-abc123def456-harvest-1642248000123",
    "batchId": "COF-ETH-abc123def456",
    "eventType": "harvest",
    "timestamp": "2024-01-15T08:00:00Z",
    "location": { ... },
    "description": "Coffee beans harvested from certified organic farm",
    "participantId": "farmer-001",
    "participantType": "farmer",
    "certifications": [...],
    "metadata": { ... },
    "hederaTransactionId": "0.0.12345@1642248000.123456789",
    "hederaTopicId": "0.0.67890",
    "sequenceNumber": 1
  },
  "message": "Event logged successfully",
  "timestamp": "2024-01-15T08:00:00Z"
}
```

**Status Codes:**
- `201` - Event logged successfully
- `400` - Missing required fields
- `500` - Internal server error

### Query Supply Chain Events

Retrieves supply chain events based on various filters.

**Endpoint:** `GET /api/events/query`

**Query Parameters:**
- `batchId` (string) - Filter by batch ID
- `qrCode` (string) - Extract batch ID from QR code
- `transactionId` (string) - Filter by Hedera transaction ID
- `startDate` (string) - Start date for date range filter (ISO 8601)
- `endDate` (string) - End date for date range filter (ISO 8601)

**Example Requests:**
```http
GET /api/events/query?batchId=COF-ETH-abc123def456
GET /api/events/query?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
GET /api/events/query?qrCode=http://localhost:3000/track/COF-ETH-abc123def456
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "COF-ETH-abc123def456-harvest-1642248000123",
      "batchId": "COF-ETH-abc123def456",
      "eventType": "harvest",
      "timestamp": "2024-01-15T08:00:00Z",
      "location": { ... },
      "description": "Coffee beans harvested from certified organic farm",
      "participantId": "farmer-001",
      "participantType": "farmer",
      "hederaTransactionId": "0.0.12345@1642248000.123456789",
      "sequenceNumber": 1
    }
  ],
  "message": "Found 1 events",
  "timestamp": "2024-01-15T08:00:00Z"
}
```

**Status Codes:**
- `200` - Events retrieved successfully
- `400` - Missing query parameters
- `500` - Internal server error

## QR Code Generation

### Generate QR Code

Creates QR codes for product batch tracking.

**Endpoint:** `POST /api/qr/generate`

**Request Body:**
```typescript
interface QRGenerateRequest {
  batchId: string;
  format?: 'png' | 'svg' | 'utf8';
  size?: number;
  includeUrl?: boolean;
}
```

**Example Request:**
```json
{
  "batchId": "COF-ETH-abc123def456",
  "format": "png",
  "size": 256,
  "includeUrl": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "format": "png",
    "batchId": "COF-ETH-abc123def456",
    "trackingUrl": "http://localhost:3000/track/COF-ETH-abc123def456"
  },
  "message": "QR code generated successfully",
  "timestamp": "2024-01-15T08:00:00Z"
}
```

**Supported Formats:**
- `png` - Base64 encoded PNG image (default)
- `svg` - SVG markup string
- `utf8` - ASCII art representation

**Status Codes:**
- `200` - QR code generated successfully
- `400` - Invalid format or missing batch ID
- `500` - Internal server error

## Anomaly Detection

### Detect Anomalies

Analyzes supply chain events for potential anomalies using AI.

**Endpoint:** `POST /api/anomalies/detect`

**Request Body:**
```typescript
interface AnomalyDetectionRequest {
  event: SupplyChainEvent;
  batchId?: string;
}
```

**Example Request:**
```json
{
  "event": {
    "id": "COF-ETH-abc123def456-shipping-1642852500567",
    "batchId": "COF-ETH-abc123def456",
    "eventType": "shipping",
    "timestamp": "2024-01-22T09:15:00Z",
    "location": {
      "country": "Germany",
      "region": "Hamburg",
      "city": "Hamburg"
    },
    "description": "Shipped from Addis Ababa to Hamburg port",
    "participantId": "shipper-intl-001",
    "participantType": "distributor"
  },
  "batchId": "COF-ETH-abc123def456"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "anomaly-COF-ETH-abc123def456-1642852500567",
      "batchId": "COF-ETH-abc123def456",
      "eventId": "COF-ETH-abc123def456-shipping-1642852500567",
      "type": "location_jump",
      "severity": "high",
      "description": "Impossible transport speed detected: 2,450 km/h between Ethiopia and Germany",
      "detectedAt": "2024-01-22T09:15:00Z",
      "score": 0.92,
      "isResolved": false,
      "metadata": {
        "previousLocation": "Addis Ababa, Ethiopia",
        "currentLocation": "Hamburg, Germany",
        "timeElapsed": "2 hours",
        "calculatedSpeed": "2,450 km/h"
      }
    }
  ],
  "message": "Detected 1 anomaly/anomalies",
  "timestamp": "2024-01-22T09:15:00Z",
  "metadata": {
    "eventId": "COF-ETH-abc123def456-shipping-1642852500567",
    "batchId": "COF-ETH-abc123def456",
    "previousEventsCount": 5,
    "anomalyThreshold": 0.7,
    "aiEnabled": true
  }
}
```

**Anomaly Types:**
- `time_inconsistency` - Events with impossible timestamps
- `location_jump` - Unrealistic transport speeds
- `unexpected_participant` - Unauthorized supply chain actors
- `certification_mismatch` - Invalid or expired certifications
- `suspicious_pattern` - ML-detected unusual behavior
- `quality_deviation` - Unexpected quality changes
- `quantity_mismatch` - Inconsistent quantity reporting

**Severity Levels:**
- `low` - Minor inconsistencies
- `medium` - Moderate concerns requiring attention
- `high` - Serious issues requiring immediate review
- `critical` - Severe problems indicating potential fraud

**Status Codes:**
- `200` - Analysis completed successfully
- `400` - Missing event data
- `500` - Internal server error

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Detailed error message",
  "timestamp": "2024-01-15T08:00:00Z"
}
```

### Common Error Codes

- `400 Bad Request` - Invalid request data or missing required fields
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `405 Method Not Allowed` - HTTP method not supported
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server-side error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per minute per IP
- **Blockchain operations**: 10 requests per minute per account
- **QR generation**: 50 requests per minute per IP

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248060
```

## Webhooks (Future Feature)

Planned webhook support for real-time notifications:

```json
{
  "event": "batch.created",
  "data": {
    "batchId": "COF-ETH-abc123def456",
    "timestamp": "2024-01-15T08:00:00Z"
  },
  "signature": "sha256=..."
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Participant-ID': 'farmer-001',
    'X-Participant-Type': 'farmer'
  }
});

// Create batch
const batch = await api.post('/batches/create', {
  productName: 'Ethiopian Coffee',
  productType: 'coffee',
  quantity: 500,
  unit: 'kg',
  originLocation: {
    country: 'Ethiopia',
    region: 'Sidamo',
    city: 'Yirgacheffe'
  },
  certifications: []
});

// Log event
const event = await api.post('/events/log', {
  batchId: batch.data.data.id,
  eventType: 'harvest',
  location: {
    country: 'Ethiopia',
    region: 'Sidamo',
    city: 'Yirgacheffe'
  },
  description: 'Coffee harvested'
});
```

### Python

```python
import requests

class SupplyChainAPI:
    def __init__(self, base_url, participant_id, participant_type):
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'X-Participant-ID': participant_id,
            'X-Participant-Type': participant_type
        }
    
    def create_batch(self, batch_data):
        response = requests.post(
            f"{self.base_url}/batches/create",
            json=batch_data,
            headers=self.headers
        )
        return response.json()
    
    def log_event(self, event_data):
        response = requests.post(
            f"{self.base_url}/events/log",
            json=event_data,
            headers=self.headers
        )
        return response.json()

# Usage
api = SupplyChainAPI(
    'http://localhost:3000/api',
    'farmer-001',
    'farmer'
)

batch = api.create_batch({
    'productName': 'Ethiopian Coffee',
    'productType': 'coffee',
    'quantity': 500,
    'unit': 'kg',
    'originLocation': {
        'country': 'Ethiopia',
        'region': 'Sidamo',
        'city': 'Yirgacheffe'
    },
    'certifications': []
})
```

## Testing

Use the provided sample data for testing:

```bash
# Test batch creation
curl -X POST http://localhost:3000/api/batches/create \
  -H "Content-Type: application/json" \
  -H "X-Participant-ID: farmer-001" \
  -H "X-Participant-Type: farmer" \
  -d @sample-batch.json

# Test event logging
curl -X POST http://localhost:3000/api/events/log \
  -H "Content-Type: application/json" \
  -H "X-Participant-ID: farmer-001" \
  -H "X-Participant-Type: farmer" \
  -d @sample-event.json

# Test event querying
curl "http://localhost:3000/api/events/query?batchId=COF-ETH-abc123def456"
```

## Changelog

### v1.0.0 (Current)
- Initial API implementation
- Batch and event management
- QR code generation
- Anomaly detection
- Hedera blockchain integration

### Planned Features
- Batch update endpoints
- Advanced filtering options
- Bulk operations
- Webhook notifications
- API versioning
- Enhanced authentication