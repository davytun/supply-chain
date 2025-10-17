# Setup Guide - Transparent Supply Chain Tracker

This guide will help you set up and run the Transparent Supply Chain Tracker application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd daap2
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

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

### 4. Hedera Testnet Setup

To use Hedera features:

1. **Create a testnet account:**
   - Visit [Hedera Portal](https://portal.hedera.com/)
   - Create a new testnet account
   - Fund your account with test HBAR

2. **Get your credentials:**
   - Account ID (format: 0.0.XXXXXX)
   - Private Key (64-character hex string)

3. **Add credentials to `.env.local`:**
   ```env
   HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
   HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
   ```

### 5. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

### 6. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Detailed Configuration

### Hedera Configuration

The application uses Hedera Hashgraph for:
- **Consensus Topics**: Store supply chain events immutably
- **Tokens**: Create tokenized assets for batch traceability
- **Mirror Nodes**: Real-time event streaming

#### Creating a Topic (Optional)

If you don't provide a `HEDERA_TOPIC_ID`, the application will create one automatically. To create manually:

```javascript
// Using Hedera SDK
const topicCreateTx = new TopicCreateTransaction()
  .setTopicMemo("Supply Chain Events - Ethical Sourcing Tracker");

const topicCreateSubmit = await topicCreateTx.execute(client);
const topicCreateRx = await topicCreateSubmit.getReceipt(client);
const topicId = topicCreateRx.topicId;
```

### AI Configuration

The anomaly detection system uses TensorFlow.js:

```env
# Adjust sensitivity (0.0 = strict, 1.0 = permissive)
ANOMALY_DETECTION_THRESHOLD=0.7

# Enable/disable AI monitoring
ENABLE_AI_MONITORING=true
```

### Database Configuration (Optional)

For production, you may want to use a database:

```env
# MongoDB
DATABASE_URL=mongodb://localhost:27017/supply-chain-tracker

# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/supply_chain
```

## Project Structure

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
│   ├── batches/       # Batch management pages
│   ├── events/        # Event management pages
│   ├── track/         # Product tracking pages
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

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler

# Testing (if implemented)
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## Features Overview

### Core Functionality
- **Event Logging**: Supply chain participants can log events
- **Consumer Verification**: Track product history via QR codes
- **Real-time Dashboard**: Interactive visualizations
- **Anomaly Detection**: AI-powered fraud detection
- **Blockchain Integration**: Tamper-proof event logging

### Pages and Routes
- `/` - Dashboard with overview and statistics
- `/batches` - Product batch management
- `/batches/create` - Create new product batch
- `/events` - Supply chain event listing
- `/events/log` - Log new supply chain event
- `/track` - Product tracking search
- `/track/[batchId]` - Detailed tracking results
- `/scanner` - QR code scanner
- `/anomalies` - Anomaly detection and management
- `/analytics` - Analytics and reporting

### API Endpoints
- `POST /api/batches/create` - Create new product batch
- `POST /api/events/log` - Log supply chain event
- `GET /api/events/query` - Query events with filters
- `POST /api/anomalies/detect` - Run anomaly detection
- `POST /api/qr/generate` - Generate QR code

## Troubleshooting

### Common Issues

1. **Hedera Connection Failed**
   - Verify your account ID and private key
   - Ensure you have test HBAR in your account
   - Check network connectivity

2. **QR Code Scanner Not Working**
   - Ensure HTTPS in production (camera requires secure context)
   - Grant camera permissions in browser
   - Try uploading an image instead

3. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

4. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the root directory
   - Restart the development server after changes
   - Check for typos in variable names

### Performance Optimization

1. **Enable Static Generation**
   ```javascript
   // In pages with static content
   export async function getStaticProps() {
     return { props: {}, revalidate: 60 };
   }
   ```

2. **Optimize Images**
   ```javascript
   import Image from 'next/image';
   // Use Next.js Image component for automatic optimization
   ```

3. **Code Splitting**
   ```javascript
   import dynamic from 'next/dynamic';
   const DynamicComponent = dynamic(() => import('../components/Heavy'));
   ```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different keys for development and production
   - Rotate keys regularly

2. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS in production

3. **Blockchain Security**
   - Store private keys securely
   - Use hardware wallets for production
   - Monitor account balances

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment

```bash
npm run build
npm start
```

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the [Hedera documentation](https://docs.hedera.com)
- Open an issue in the project repository

## Next Steps

After setup:
1. Explore the sample data and demo functionality
2. Create your first product batch
3. Log supply chain events
4. Test QR code tracking
5. Monitor anomaly detection
6. Customize for your specific use case