import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { connectToDatabase, closeDatabase } from '../utils/database';
import { successResponse, badRequestResponse, internalServerErrorResponse } from '../utils/response';
import { CreateCampaignRequest } from '../types';
import { Campaign } from '../models/Campaign';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Received create campaign request:', event.body);

  try {
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }

    const campaignRequest: CreateCampaignRequest = JSON.parse(event.body);

    if (!campaignRequest.name) {
      return badRequestResponse('name is required');
    }

    if (!campaignRequest.collectorName) {
      return badRequestResponse('collectorName is required');
    }

    await connectToDatabase();

    const campaignId = randomUUID();

    const campaign = new Campaign({
      campaignId,
      name: campaignRequest.name,
      totalDonations: 0,
      collectorName: campaignRequest.collectorName
    });

    console.log('Creating campaign:', {
      campaignId: campaign.campaignId,
      name: campaign.name,
      collectorName: campaign.collectorName,
      totalDonations: campaign.totalDonations
    });

    const savedCampaign = await campaign.save();

    console.log('Campaign created successfully');
    console.log('Campaign ID:', savedCampaign._id);

    return successResponse({
      campaignId,
      name: campaignRequest.name,
      collectorName: campaignRequest.collectorName,
      totalDonations: 0,
      createdAt: campaign.createdAt
    }, 'Campaign created successfully!');

  } catch (error) {
    console.error('Error creating campaign:', error);
    return internalServerErrorResponse('Error creating campaign');
  } finally {
    await closeDatabase();
  }
}; 