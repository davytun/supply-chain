# Transparent Supply Chain Tracker for Ethical Sourcing

A web-based dashboard that logs and queries supply chain events using Hedera Hashgraph for ethical sourcing verification. This application helps track products from farm to store, ensuring fair labor practices and reducing fraud through blockchain transparency.

## 🌟 Features

### Core Functionality
- **Event Logging**: Supply chain participants can log events with timestamps, locations, certifications, and batch details
- **Consumer Verification**: Track product history via unique identifiers (QR codes) 
- **Real-time Dashboard**: Interactive visualizations of supply chain data and event timelines
- **Anomaly Detection**: AI-powered detection of unethical practices and fraudulent activities
- **Blockchain Integration**: Tamper-proof event logging using Hedera Hashgraph

### Key Benefits
- **Enhanced Accountability**: Transparent supply chain tracking
- **Fraud Prevention**: Combat counterfeit goods (addressing issues like $3B in fake wine annually)
- **Consumer Empowerment**: Enable ethical purchasing decisions
- **Fair Trade Support**: Verify and promote fair-trade initiatives

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 with React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with Node.js
- **Blockchain**: Hedera Hashgraph SDK with protobufs integration
- **AI/ML**: TensorFlow.js for anomaly detection
- **QR Codes**: qrcode.js for batch tracking
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS with custom component system

### Hedera Integration
- **ConsensusSubmitMessageTransactionBody**: Serialize supply chain events with chunking support
- **ConsensusGetTopicInfoQuery**: Query event history for products/batches
- **TokenCreateTransactionBody**: Create tokenized assets for batch traceability
- **Mirror Node Integration**: Real-time event streaming

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Hedera Testnet account (for blockchain features)

### Quick Start

1. **Clone and navigate to the project**
   ```bash
   git clone <repository-url>
   cd daap2
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables in `.env.local`:
   ```env
   # Hedera Network Configuration
   HEDERA_NETWORK=testnet
   HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
   HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
   HEDERA_TOPIC_ID=0.0.YOUR_TOPIC_ID

   # Application Settings
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

   # Mirror Node Configuration
   HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com

   # AI/ML Configuration
   ANOMALY_DETECTION_THRESHOLD=0.7
   ENABLE_AI_MONITORING=true

   # QR Code Configuration
   QR_CODE_BASE_URL=http://localhost:3000/track/
   ```

4. **Hedera Testnet Setup**
   
   To use Hedera features:
   - Create a testnet account at [Hedera Portal](https://portal.hedera.com/)
   - Fund your account with test HBAR
   - Add your Account ID and Private Key to `.env.local`

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

> **Note:** For detailed setup instructions, see [SETUP.md](SETUP.md)

## 📖 Usage Guide

### For Supply Chain Participants

1. **Create a Product Batch**
   - Navigate to "Batches" → "Create New Batch"
   - Fill in product details, origin location, and certifications
   - System generates unique batch ID and QR code

2. **Log Supply Chain Events**
   - Navigate to "Events" → "Log New Event" 
   - Select batch ID and event type
   - Add location, description, and certification details
   - Event is logged to Hedera blockchain

3. **Monitor Anomalies**
   - View "Anomalies" dashboard for suspicious activities
   - AI system flags unusual patterns automatically
   - Resolve anomalies through investigation workflow

### For Consumers

1. **Track a Product**
   - Navigate to "Track Product"
   - Scan QR code or enter batch ID
   - View complete supply chain history

2. **Verify Authenticity**
   - Check blockchain transaction IDs
   - Verify certifications and their validity
   - Review participant information

3. **QR Code Scanning**
   - Use "QR Scanner" for mobile-friendly tracking
   - Instant access to product history

## 🔧 API Documentation

### Core Endpoints

#### Batch Management
- `POST /api/batches/create` - Create new product batch
- `GET /api/events/query?batchId={id}` - Get batch history

#### Event Logging  
- `POST /api/events/log` - Log supply chain event
- `GET /api/events/query` - Query events with filters

#### Anomaly Detection
- `POST /api/anomalies/detect` - Run anomaly detection on event

#### QR Code Generation
- `POST /api/qr/generate` - Generate QR code for batch

### Example API Usage

**Create a new batch:**
```javascript
const response = await fetch('/api/batches/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productName: 'Ethiopian Coffee Beans',
    productType: 'coffee',
    quantity: 500,
    unit: 'kg',
    originLocation: {
      country: 'Ethiopia',
      region: 'Sidamo', 
      city: 'Yirgacheffe'
    },
    certifications: [
      {
        type: 'organic',
        issuedBy: 'USDA Organic',
        certificateId: 'ORG-2024-001'
      }
    ]
  })
});
```

**Log an event:**
```javascript
const response = await fetch('/api/events/log', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-Participant-ID': 'farmer-001',
    'X-Participant-Type': 'farmer'
  },
  body: JSON.stringify({
    batchId: 'COF-ETH-abc123',
    eventType: 'harvest',
    location: {
      country: 'Ethiopia',
      region: 'Sidamo',
      city: 'Yirgacheffe'
    },
    description: 'Coffee beans harvested from organic farm',
    certifications: [...]
  })
});
```

## 🤖 AI Anomaly Detection

The system uses TensorFlow.js for real-time anomaly detection:

### Detection Types
- **Time Inconsistencies**: Events with impossible timestamps
- **Location Jumps**: Unrealistic transport speeds  
- **Unexpected Participants**: Unauthorized supply chain actors
- **Certification Mismatches**: Invalid or expired certifications
- **Suspicious Patterns**: ML-detected unusual behavior

### Configuration
Adjust detection sensitivity in `.env.local`:
```env
ANOMALY_DETECTION_THRESHOLD=0.7  # 0.0-1.0, higher = less sensitive
```

## 🔒 Security Features

- **Blockchain Immutability**: Events stored on Hedera are tamper-proof
- **Input Validation**: All API endpoints validate data integrity
- **Authentication Headers**: Participant identification required
- **QR Code Verification**: Batch IDs linked to blockchain records

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode  
npm run test:watch

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   └── Layout.tsx      # Main layout component
├── lib/                # Core libraries
│   ├── hedera/         # Hedera blockchain integration
│   │   ├── client.ts   # Hedera client setup
│   │   ├── mirror.ts   # Mirror node integration  
│   │   └── service.ts  # Main service wrapper
│   └── ai/             # AI anomaly detection
│       └── anomaly-detection.ts
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   │   ├── events/    # Event management
│   │   ├── batches/   # Batch management
│   │   ├── anomalies/ # Anomaly detection
│   │   └── qr/        # QR code generation
│   ├── index.tsx      # Dashboard
│   └── _app.tsx       # App wrapper
├── types/             # TypeScript definitions
│   └── index.ts       # Core type definitions
├── data/              # Sample data
│   └── sample-data.ts # Demo data for development
├── styles/            # Global styles
│   └── globals.css    # Tailwind CSS + custom styles
└── utils/             # Utility functions
```

## 🌍 Sample Supply Chain Flow

1. **Harvest** (Ethiopia) - Coffee beans harvested from organic farm
2. **Processing** (Ethiopia) - Beans processed using washed method
3. **Quality Check** (Ethiopia) - Grade AA certification obtained
4. **Packaging** (Ethiopia) - Packed in biodegradable jute bags
5. **Shipping** (Ethiopia → Germany) - Sea freight to Hamburg port
6. **Storage** (Germany) - Stored at temperature-controlled facility
7. **Distribution** (Germany → USA) - Final delivery to retailer

Each step is logged on Hedera blockchain with full traceability.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Hedera Support**: Visit [Hedera Developer Portal](https://docs.hedera.com)

## 🎯 Roadmap

- [ ] Mobile app for field workers
- [ ] Multi-language support
- [ ] Advanced ML models for fraud detection
- [ ] IoT device integration
- [ ] Sustainability metrics tracking
- [ ] Regulatory compliance reporting

## 📊 Impact

This solution addresses critical supply chain challenges:
- **$3B+ annual losses** from counterfeit wine alone
- **Labor exploitation** in agricultural supply chains  
- **Lack of transparency** in product origins
- **Consumer trust** in ethical sourcing claims

By leveraging Hedera Hashgraph's fast, secure, and affordable consensus, we enable real-time supply chain transparency at scale.

---

**Built with ❤️ for ethical supply chain transparency**