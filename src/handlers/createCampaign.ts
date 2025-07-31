import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDatabase, closeDatabase } from '../utils/database';
import { successResponse, badRequestResponse, internalServerErrorResponse } from '../utils/response';
import { campaignService } from '../services/campaignService';
import { CreateCampaignRequest } from '../types';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('[INFO] Received create campaign request', {
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

    const campaignRequest: CreateCampaignRequest = JSON.parse(event.body);

    // 2. Validar campos obrigatórios
    if (!campaignRequest.name) {
      console.warn('[WARN] name is missing', { request: campaignRequest });
      return badRequestResponse('name is required');
    }

    if (!campaignRequest.collectorName) {
      console.warn('[WARN] collectorName is missing', { request: campaignRequest });
      return badRequestResponse('collectorName is required');
    }

    // 3. Conectar ao banco
    await connectToDatabase();

    // 4. Criar campanha
    const result = await campaignService.createCampaign(campaignRequest);

    console.log('[INFO] Campaign created successfully', {
      campaignId: result.campaignId,
      name: result.name,
      collectorName: result.collectorName
    });

    return successResponse({
      campaignId: result.campaignId,
      name: result.name,
      collectorName: result.collectorName,
      totalDonations: result.totalDonations,
      createdAt: result.createdAt
    }, 'Campaign created successfully!');

  } catch (error) {
    console.error('[ERROR] Error creating campaign', error as Error, {
      body: event.body
    });
    return internalServerErrorResponse('Error creating campaign');
  } finally {
    if (process.env.NODE_ENV !== 'test') {
      await closeDatabase();
    }
  }
}; 