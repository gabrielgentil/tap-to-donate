import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  campaignId: string;
  name: string;
  totalDonations: number;
  collectorName: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>({
  campaignId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  totalDonations: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  collectorName: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'campaigns'
});

// Índices para melhor performance
CampaignSchema.index({ campaignId: 1 }, { unique: true });
CampaignSchema.index({ createdAt: -1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema); 