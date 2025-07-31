import { Campaign, ICampaign } from '../models/Campaign';
import { randomUUID } from 'crypto';

export interface CreateCampaignRequest {
  name: string;
  collectorName: string;
}

export interface CampaignResponse {
  campaignId: string;
  name: string;
  collectorName: string;
  totalDonations: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CampaignService {
  async createCampaign(request: CreateCampaignRequest): Promise<CampaignResponse> {
    try {
      console.log('[INFO] Creating new campaign', {
        name: request.name,
        collectorName: request.collectorName
      });

      const campaignId = randomUUID();

      const campaign = new Campaign({
        campaignId,
        name: request.name,
        collectorName: request.collectorName,
        totalDonations: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedCampaign = await campaign.save();

      console.log('[INFO] Campaign created successfully', {
        campaignId: savedCampaign.campaignId,
        name: savedCampaign.name
      });

      return this.mapToResponse(savedCampaign);

    } catch (error) {
      console.error('[ERROR] Failed to create campaign', error as Error, {
        name: request.name,
        collectorName: request.collectorName
      });
      throw error;
    }
  }

  async updateCampaignTotal(campaignId: string, amount: number): Promise<void> {
    try {
      console.log('[INFO] Updating campaign total donations', {
        campaignId,
        amount,
        currentTotal: 0 // Será atualizado pelo MongoDB
      });

      const campaignFilter = { campaignId };
      const campaignUpdate = {
        $inc: { totalDonations: amount },
        $set: { updatedAt: new Date() }
      };

      const campaignUpdateResult = await Campaign.findOneAndUpdate(
        campaignFilter,
        campaignUpdate,
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true 
        }
      );

      if (campaignUpdateResult && !campaignUpdateResult.name) {
        campaignUpdateResult.name = `Campaign ${campaignId}`;
        campaignUpdateResult.collectorName = 'Default Collector';
        await campaignUpdateResult.save();
      }

      console.log('[INFO] Campaign total updated successfully', {
        campaignId,
        newTotal: campaignUpdateResult?.totalDonations
      });

    } catch (error) {
      console.error('[ERROR] Failed to update campaign total', error as Error, {
        campaignId,
        amount
      });
      throw error;
    }
  }

  async getCampaign(campaignId: string): Promise<CampaignResponse | null> {
    try {
      console.log('[INFO] Fetching campaign', { campaignId });

      const campaign = await Campaign.findOne({ campaignId });
      
      if (!campaign) {
        console.warn('[WARN] Campaign not found', { campaignId });
        return null;
      }

      console.log('[INFO] Campaign fetched successfully', {
        campaignId,
        name: campaign.name,
        totalDonations: campaign.totalDonations
      });

      return this.mapToResponse(campaign);

    } catch (error) {
      console.error('[ERROR] Failed to fetch campaign', error as Error, { campaignId });
      throw error;
    }
  }

  private mapToResponse(campaign: ICampaign): CampaignResponse {
    return {
      campaignId: campaign.campaignId,
      name: campaign.name,
      collectorName: campaign.collectorName,
      totalDonations: campaign.totalDonations,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt
    };
  }
}

export const campaignService = new CampaignService(); 