import { Donation, IDonation } from '../models/Donation';
import { DonationRequest } from '../types';
import { createFunctionLogger } from '../utils/logger';
import { campaignService } from './campaignService';
import { sqsService, DonationNotification } from './sqsService';

const logger = createFunctionLogger('Donation-Service');

export interface DonationResponse {
  donationId: string;
  campaignId: string;
  amount: number;
  donorName: string;
  paymentMethod: string;
  donatedAt: Date;
  totalCampaignDonations: number;
}

export class DonationService {
  async processDonation(request: DonationRequest): Promise<DonationResponse> {
    try {
      logger.info('Processing donation request', {
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

      logger.info('Donation processed successfully', {
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
      logger.error('Failed to process donation', error as Error, {
        campaignId: request.campaignId,
        amount: request.amount,
        donorName: request.donorName
      });
      throw error;
    }
  }

  private async createDonation(request: DonationRequest): Promise<IDonation> {
    try {
      logger.info('Creating donation record', {
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

      logger.info('Donation record created successfully', {
        donationId: savedDonation._id,
        campaignId: savedDonation.campaignId
      });

      return savedDonation;

    } catch (error) {
      logger.error('Failed to create donation record', error as Error, {
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
      logger.error('Failed to send donation notification', error as Error, {
        donationId: donation._id,
        campaignId: request.campaignId
      });
      // Não falhar a doação por erro na notificação
    }
  }
}

export const donationService = new DonationService(); 