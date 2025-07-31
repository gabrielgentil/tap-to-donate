import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDatabase, closeDatabase } from '../utils/database';
import { successResponse, badRequestResponse, internalServerErrorResponse } from '../utils/response';
import { donationService } from '../services/donationService';
import { DonationRequest } from '../types';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('[INFO] Received donation request', {
    body: event.body,
    path: event.path,
    method: event.httpMethod
  });

  try {
    // 1. Validar request body
    if (!event.body) {
      console.warn('[WARN] Request body is missing');
      return badRequestResponse('Request body is required');
    }

    const donationRequest: DonationRequest = JSON.parse(event.body);

    // 2. Validar campos obrigatórios
    const validationError = donationService.validateDonationRequest(donationRequest);
    if (validationError) {
      return badRequestResponse(validationError.message);
    }

    // 3. Conectar ao banco
    await connectToDatabase();

    // 4. Processar doação
    const result = await donationService.processDonation(donationRequest);

    console.log('[INFO] Donation processed successfully', {
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
    console.error('[ERROR] Error processing donation', error as Error, {
      body: event.body
    });
    return internalServerErrorResponse('Error processing donation');
  } finally {
    if (process.env.NODE_ENV !== 'test') {
      await closeDatabase();
    }
  }
}; 