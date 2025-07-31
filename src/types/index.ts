export interface DonationRequest {
  campaignId: string;
  amount: number;
  donorName: string;
  paymentMethod: 'credit_card' | 'pix' | 'bank_transfer';
}

export interface Donation {
  campaignId: string;
  amount: number;
  donorName: string;
  paymentMethod: 'credit_card' | 'pix' | 'bank_transfer';
  donatedAt: Date;
}

export interface Campaign {
  campaignId: string;
  name: string;
  totalDonations: number;
  collectorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCampaignRequest {
  name: string;
  collectorName: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LambdaResponse {
  statusCode: number;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Headers': string;
    'Access-Control-Allow-Methods': string;
  };
  body: string;
} 