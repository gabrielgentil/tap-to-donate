import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDatabase, closeDatabase } from '../utils/database';
import { successResponse, badRequestResponse, internalServerErrorResponse } from '../utils/response';
import { createFunctionLogger } from '../utils/logger';
import { donationService } from '../services/donationService';
import { DonationRequest } from '../types';

const logger = createFunctionLogger('Donate-Handler');

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Received donation request', {
    body: event.body,
    path: event.path,
    method: event.httpMethod
  });

  try {
    // 1. Validar request body
    if (!event.body) {
      logger.warn('Request body is missing');
      return badRequestResponse('Request body is required');
    }

    const donationRequest: DonationRequest = JSON.parse(event.body);

    // 2. Validar campos obrigatórios
    if (!donationRequest.campaignId) {
      logger.warn('campaignId is missing', { request: donationRequest });
      return badRequestResponse('campaignId is required');
    }

    if (!donationRequest.amount || donationRequest.amount <= 0) {
      logger.warn('Invalid amount', { amount: donationRequest.amount });
      return badRequestResponse('amount must be greater than 0');
    }

    if (!donationRequest.donorName) {
      logger.warn('donorName is missing', { request: donationRequest });
      return badRequestResponse('donorName is required');
    }

    if (!donationRequest.paymentMethod) {
      logger.warn('paymentMethod is missing', { request: donationRequest });
      return badRequestResponse('paymentMethod is required');
    }

    // 3. Conectar ao banco
    await connectToDatabase();

    // 4. Processar doação
    const result = await donationService.processDonation(donationRequest);

    logger.info('Donation processed successfully', {
      donationId: result.donationId,
      campaignId: result.campaignId,
      amount: result.amount,
      totalCampaignDonations: result.totalCampaignDonations
    });

    return successResponse({
      donationId: result.donationId,
      campaignId: result.campaignId,
      amount: result.amount,
      totalCampaignDonations: result.totalCampaignDonations
    }, 'Donation processed successfully!');

  } catch (error) {
    logger.error('Error processing donation', error as Error, {
      body: event.body
    });
    return internalServerErrorResponse('Error processing donation');
  } finally {
    if (process.env.NODE_ENV !== 'test') {
      await closeDatabase();
    }
  }
}; 