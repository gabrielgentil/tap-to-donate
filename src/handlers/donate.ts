import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDatabase, closeDatabase } from '../utils/database';
import { successResponse, badRequestResponse, internalServerErrorResponse } from '../utils/response';
import { DonationRequest } from '../types';
import { Donation, IDonation } from '../models/Donation';
import { Campaign, ICampaign } from '../models/Campaign';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Received donation request:', event.body);

  try {
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }

    const donationRequest: DonationRequest = JSON.parse(event.body);

    if (!donationRequest.campaignId) {
      return badRequestResponse('campaignId is required');
    }

    if (!donationRequest.amount || donationRequest.amount <= 0) {
      return badRequestResponse('amount must be greater than 0');
    }

    if (!donationRequest.donorName) {
      return badRequestResponse('donorName is required');
    }

    if (!donationRequest.paymentMethod) {
      return badRequestResponse('paymentMethod is required');
    }

    await connectToDatabase();

    const donation = new Donation({
      campaignId: donationRequest.campaignId,
      amount: donationRequest.amount,
      donorName: donationRequest.donorName,
      paymentMethod: donationRequest.paymentMethod,
      donatedAt: new Date()
    });

    console.log('Creating donation:', {
      campaignId: donation.campaignId,
      amount: donation.amount,
      donorName: donation.donorName,
      paymentMethod: donation.paymentMethod
    });

    const savedDonation = await donation.save();

    const campaignFilter = { campaignId: donationRequest.campaignId };
    const campaignUpdate = {
      $inc: { totalDonations: donationRequest.amount },
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
      campaignUpdateResult.name = `Campaign ${donationRequest.campaignId}`;
      campaignUpdateResult.collectorName = 'Default Collector';
      await campaignUpdateResult.save();
    }

    const updatedCampaign = await Campaign.findOne(campaignFilter);

    console.log('Donation processed successfully');
    console.log('Campaign updated:', {
      campaignId: updatedCampaign?.campaignId,
      name: updatedCampaign?.name,
      totalDonations: updatedCampaign?.totalDonations,
      updatedAt: updatedCampaign?.updatedAt
    });

    return successResponse({
      donationId: savedDonation._id,
      campaignId: donationRequest.campaignId,
      amount: donationRequest.amount,
      totalCampaignDonations: updatedCampaign?.totalDonations || donationRequest.amount
    }, 'Donation processed successfully!');

  } catch (error) {
    console.error('Error processing donation:', error);
    return internalServerErrorResponse('Error processing donation');
  } finally {
    await closeDatabase();
  }
}; 