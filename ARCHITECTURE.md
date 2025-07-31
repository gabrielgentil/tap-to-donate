# Tap-to-Donate Architecture Documentation

### 1. System Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                    Tap-to-Donate System                       │
├─────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Client    │    │   Client    │    │   Client    │      │
│  │  (Mobile/   │    │   (Web)     │    │  (API)      │      │
│  │   Desktop)  │    │             │    │             │      │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘      │
│         │                  │                   │             │
│         └──────────────────┼───────────────────┘             │
│                            │                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              API Gateway (AWS)                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │   /campaign │  │   /donate   │  │/test-notif  │   │  │
│  │  │    (POST)   │  │   (POST)    │  │   (POST)    │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Lambda Functions                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │createCampaign│  │   donate    │  │processDonat │   │  │
│  │  │   Handler   │  │   Handler   │  │Notification │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Services Layer                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │Campaign     │  │Donation     │  │SQS          │   │  │
│  │  │Service      │  │Service      │  │Service      │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Data Layer                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │  MongoDB    │  │    SQS      │  │   Logger    │   │  │
│  │  │ (Campaigns  │  │ (Messages)  │  │   (Pino)    │   │  │
│  │  │ & Donations)│  │             │  │             │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Request Flow Diagram
```
┌─────────────┐
│   Client    │
│  Request    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Gateway    │
│  (Validation)   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Lambda Handler  │
│ (Controller)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Service       │
│ (Business Logic)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Database      │
│   (MongoDB)     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   SQS Queue     │
│ (Async Process) │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Process Handler │
│ (Receipt/Email) │
└─────────────────┘
```

### 3. Data Flow Diagram
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Campaign   │    │  Donation   │    │ Notification│
│   Data      │    │   Data      │    │    Data     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  MongoDB    │    │  MongoDB    │    │    SQS      │
│ (Campaigns) │    │ (Donations) │    │ (Messages)  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │   Logger    │
                   │   (Pino)    │
                   └─────────────┘
```

### 4. Component Details

#### Handlers (Controllers)
- **createCampaign**: Creates new donation campaigns
- **donate**: Processes donation requests

#### Services (Business Logic)
- **CampaignService**: Campaign CRUD operations
- **DonationService**: Donation processing logic
- **SQSService**: Message queue operations

#### Data Layer
- **MongoDB**: Campaigns and Donations collections
- **SQS**: Asynchronous message processing
- **Pino**: Structured logging

### 5. Color Scheme for Excalidraw
- **Client**: Light Blue (#E3F2FD)
- **API Gateway**: Orange (#FF9800)
- **Lambda**: Green (#4CAF50)
- **Services**: Purple (#9C27B0)
- **Database**: Red (#F44336)
- **SQS**: Yellow (#FFEB3B)
- **Logger**: Gray (#9E9E9E)

### 6. Connection Types
- **HTTP Requests**: Solid arrows
- **Database Operations**: Dashed arrows
- **SQS Messages**: Dotted arrows
- **Logging**: Thin arrows

### 7. Notes for Diagram
- Show async flow with SQS
- Highlight clean architecture layers
- Include error handling paths
- Show logging integration
- Display environment separation (dev/prod) 