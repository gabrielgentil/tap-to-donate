import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDatabase, closeDatabase } from '../utils/database';
import { successResponse, badRequestResponse, internalServerErrorResponse } from '../utils/response';
import { createFunctionLogger } from '../utils/logger';
import { campaignService } from '../services/campaignService';
import { CreateCampaignRequest } from '../types';

const logger = createFunctionLogger('CreateCampaign-Handler');

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Received create campaign request', {
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

    const campaignRequest: CreateCampaignRequest = JSON.parse(event.body);

    // 2. Validar campos obrigatórios
    if (!campaignRequest.name) {
      logger.warn('name is missing', { request: campaignRequest });
      return badRequestResponse('name is required');
    }

    if (!campaignRequest.collectorName) {
      logger.warn('collectorName is missing', { request: campaignRequest });
      return badRequestResponse('collectorName is required');
    }

    // 3. Conectar ao banco
    await connectToDatabase();

    // 4. Criar campanha
    const result = await campaignService.createCampaign(campaignRequest);

    logger.info('Campaign created successfully', {
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
    logger.error('Error creating campaign', error as Error, {
      body: event.body
    });
    return internalServerErrorResponse('Error creating campaign');
  } finally {
    if (process.env.NODE_ENV !== 'test') {
      await closeDatabase();
    }
  }
}; 