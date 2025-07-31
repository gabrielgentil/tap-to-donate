import { Donation, IDonation } from '../models/Donation';
import { DonationRequest } from '../types';
import { campaignService } from './campaignService';
import { sqsService, DonationNotification } from './sqsService';

export interface DonationResponse {
  donationId: string;
  campaignId: string;
  amount: number;
  donorName: string;
  paymentMethod: string;
  donatedAt: Date;
  totalCampaignDonations: number;
}

export interface ValidationError {
  message: string;
  field?: string;
}

export class DonationService {
  validateDonationRequest(donationRequest: DonationRequest): ValidationError | null {
    if (!donationRequest.campaignId) {
      console.warn('[WARN] campaignId is missing', { request: donationRequest });
      return { message: 'campaignId is required', field: 'campaignId' };
    }

    if (!donationRequest.amount || donationRequest.amount <= 0) {
      console.warn('[WARN] Invalid amount', { amount: donationRequest.amount });
      return { message: 'amount must be greater than 0', field: 'amount' };
    }

    if (!donationRequest.donorName) {
      console.warn('[WARN] donorName is missing', { request: donationRequest });
      return { message: 'donorName is required', field: 'donorName' };
    }

    if (!donationRequest.paymentMethod) {
      console.warn('[WARN] paymentMethod is missing', { request: donationRequest });
      return { message: 'paymentMethod is required', field: 'paymentMethod' };
    }

    return null;
  }

  async processDonation(request: DonationRequest): Promise<DonationResponse> {
    try {
      console.log('[INFO] Processing donation request', {
        campaignId: request.campaignId,
        amount: request.amount,
        donorName: request.donorName,
        paymentMethod: request.paymentMethod
      });

      // 1. Criar doação no banco
      const donation = await this.createDonation(request);

      // 2. Atualizar total da campanha
      await campaignService.updateCampaignTotal(request.campaignId, request.amount);

      // 3. Buscar campanha atualizada
      const updatedCampaign = await campaignService.getCampaign(request.campaignId);

      // 4. Enviar notificação SQS
      await this.sendDonationNotification(donation, request);

      console.log('[INFO] Donation processed successfully', {
        donationId: donation._id,
        campaignId: request.campaignId,
        amount: request.amount,
        totalCampaignDonations: updatedCampaign?.totalDonations || request.amount
      });

      return {
        donationId: donation._id?.toString() || '',
        campaignId: request.campaignId,
        amount: request.amount,
        donorName: request.donorName,
        paymentMethod: request.paymentMethod,
        donatedAt: donation.donatedAt,
        totalCampaignDonations: updatedCampaign?.totalDonations || request.amount
      };

    } catch (error) {
      console.error('[ERROR] Failed to process donation', error as Error, {
        campaignId: request.campaignId,
        amount: request.amount,
        donorName: request.donorName
      });
      throw error;
    }
  }

  private async createDonation(request: DonationRequest): Promise<IDonation> {
    try {
      console.log('[INFO] Creating donation record', {
        campaignId: request.campaignId,
        amount: request.amount
      });

      const donation = new Donation({
        campaignId: request.campaignId,
        amount: request.amount,
        donorName: request.donorName,
        paymentMethod: request.paymentMethod,
        donatedAt: new Date()
      });

      const savedDonation = await donation.save();

      console.log('[INFO] Donation record created successfully', {
        donationId: savedDonation._id,
        campaignId: savedDonation.campaignId
      });

      return savedDonation;

    } catch (error) {
      console.error('[ERROR] Failed to create donation record', error as Error, {
        campaignId: request.campaignId,
        amount: request.amount
      });
      throw error;
    }
  }

  private async sendDonationNotification(donation: IDonation, request: DonationRequest): Promise<void> {
    try {
      const notification: DonationNotification = {
        donationId: donation._id?.toString() || '',
        campaignId: request.campaignId,
        amount: request.amount,
        donorName: request.donorName,
        paymentMethod: request.paymentMethod,
        donatedAt: donation.donatedAt.toISOString()
      };

      await sqsService.sendDonationNotification(notification);

    } catch (error) {
      console.error('[ERROR] Failed to send donation notification', error as Error, {
        donationId: donation._id,
        campaignId: request.campaignId
      });
      // Não falhar a doação por erro na notificação
    }
  }
}

export const donationService = new DonationService(); 