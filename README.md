# Tap-to-Donate

POC for digital donations - a serverless API for managing donation campaigns and processing donations using SQS for asynchronous processing with structured logging and clean architecture.

## 🚀 Technologies

- **Backend**: AWS Lambda + Serverless Framework
- **Database**: MongoDB
- **Message Queue**: AWS SQS
- **Runtime**: Node.js
- **Deploy**: Serverless Framework
- **Architecture**: Clean Architecture with Services

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- AWS CLI (for deployment)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd poc-donate
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp env.example .env
# Edit the .env file with your configurations
```

## 🐳 Running with Docker

**Start MongoDB:**
```bash
npm run docker:up
```

**Stop MongoDB:**
```bash
npm run docker:down
```

## 🏃‍♂️ Running Locally

**Start everything (Docker + Serverless Offline):**
```bash
npm run start:local
```

**Development only:**
```bash
npm run dev
```

## 📡 API Endpoints

### Base URL
```
http://localhost:3000
```

### 1. Create Campaign
```bash
POST /campaign
```

**Payload:**
```json
{
  "name": "Campaign Name",
  "collectorName": "Collector Name"
}
```

**Curl example:**
```bash
curl -X POST http://localhost:3000/campaign \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "collectorName": "John Silva"
  }'
```

### 2. Make Donation
```bash
POST /donate
```

**Payload:**
```json
{
  "campaignId": "campaign-id",
  "amount": 50.00,
  "donorName": "Donor Name",
  "paymentMethod": "pix"
}
```

**Curl example:**
```bash
curl -X POST http://localhost:3000/donate \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "camp-001",
    "amount": 25.50,
    "donorName": "Mary Santos",
    "paymentMethod": "pix"
  }'
```

**Valid payment methods:**
- `pix`
- `credit_card`
- `bank_transfer`

**What happens:**
1. Donation is saved to MongoDB
2. Message is sent to SQS queue
3. Lambda function processes the message asynchronously
4. Receipt is generated (simulated)
5. Email notification is sent (simulated)

## 🧪 Testing

### Manual Testing
Use the `test-examples.http` file to test the API with pre-configured examples.

### Automated Testing
The project uses Vitest for integration testing with MongoDB.

**Prerequisites for testing:**
```bash
# Start MongoDB (required for tests)
npm run docker:up
```

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Run tests with coverage:**
```bash
npm run test:coverage
```

**Run specific test:**
```bash
npm test -- --run test/handlers/donate.test.ts -t "should process donation successfully for existing campaign"
```

**Test Structure:**
- `test/setup.ts` - Test environment setup with database connection
- `test/handlers/createCampaign.test.ts` - Campaign creation tests
- `test/handlers/donate.test.ts` - Donation processing tests

**Test Coverage:**
- ✅ Campaign creation (success and validation scenarios)
- ✅ Campaign validation (missing fields, invalid data)
- ✅ Donation processing (success and validation scenarios)
- ✅ Donation validation (missing fields, invalid amounts)
- ✅ Campaign auto-creation when donating to non-existent campaign
- ✅ Multiple donations accumulation
- ✅ Database operations verification
- ✅ Error handling and response validation

**Test Environment:**
- Uses isolated MongoDB database (`test-donate`)
- Database is cleaned before and after each test
- Tests run in parallel with proper isolation
- Connection management handled automatically

## 🔄 SQS Processing Flow

The system uses AWS SQS for asynchronous processing of donations:

1. **Donation Request** → Lambda saves to MongoDB
2. **Message Sent** → SQS queue receives donation notification
3. **Async Processing** → Lambda processes message from SQS
4. **Receipt Generation** → Simulated receipt URL created

**SQS Configuration:**
- Queue: `poc-donation`
- Dead Letter Queue: `poc-donation-dlq`
- Visibility Timeout: 30 seconds
- Max Retries: 3 attempts

## 🏗️ Architecture

### Clean Architecture Pattern
The project follows Clean Architecture principles with clear separation of concerns:

- **Handlers**: HTTP/SQS event controllers (thin layer)
- **Services**: Business logic and external integrations
- **Models**: Data layer (MongoDB schemas)
- **Utils**: Shared utilities (database, responses)


## 📦 Deployment

**Build:**
```bash
npm run build
```

**Deploy to AWS:**
```bash
npm run deploy
```

**Remove from AWS:**
```bash
npm run remove
```

## 📁 Project Structure

```
src/
├── handlers/          # Lambda functions (controllers)
│   ├── createCampaign.ts
│   ├── donate.ts
│   └── processDonationNotification.ts
├── services/         # Business logic services
│   ├── campaignService.ts
│   ├── donationService.ts
│   └── sqsService.ts
├── models/           # Mongoose models
│   ├── Campaign.ts
│   └── Donation.ts
├── types/            # TypeScript types
│   └── index.ts
└── utils/            # Utilities
    ├── database.ts
    ├── logger.ts
    └── response.ts
```

## 🔧 Available Scripts

### Development
- `npm run dev` - Run in development mode
- `npm run build` - Build the project
- `npm run start:local` - Start everything locally (Docker + Serverless)

### Docker Management
- `npm run docker:up` - Start MongoDB
- `npm run docker:down` - Stop MongoDB
- `npm run docker:logs` - View MongoDB logs
- `npm run docker:restart` - Restart MongoDB
- `npm run docker:clean` - Stop and remove volumes

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Deployment
- `npm run deploy` - Deploy to AWS
- `npm run remove` - Remove from AWS

## 📝 License

MIT
