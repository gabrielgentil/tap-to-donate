# Tap-to-Donate

POC for digital donations a serverless API for managing donation campaigns and processing donations.

## 🚀 Technologies

- **Backend**: AWS Lambda + Serverless Framework
- **Database**: MongoDB
- **Runtime**: Node.js
- **Deploy**: Serverless Framework

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

## 🧪 Testing

Use the `test-examples.http` file to test the API with pre-configured examples.

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
├── handlers/          # Lambda functions
│   ├── createCampaign.ts
│   └── donate.ts
├── models/           # Mongoose models
│   ├── Campaign.ts
│   └── Donation.ts
├── types/            # TypeScript types
│   └── index.ts
└── utils/            # Utilities
    ├── database.ts
    └── response.ts
```

## 🔧 Available Scripts

- `npm run dev` - Run in development mode
- `npm run build` - Build the project
- `npm run deploy` - Deploy to AWS
- `npm run remove` - Remove from AWS
- `npm run docker:up` - Start MongoDB
- `npm run docker:down` - Stop MongoDB
- `npm run start:local` - Start everything locally

## 📝 License

MIT
