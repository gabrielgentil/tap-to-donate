import { describe, it, expect } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/handlers/donate';
import { Donation } from '../../src/models/Donation';
import { Campaign } from '../../src/models/Campaign';

describe('donate handler', () => {
  it('should process donation successfully for existing campaign', async () => {
    const campaign = new Campaign({
      campaignId: 'test-campaign-001',
      name: 'Test Campaign',
      collectorName: 'Test Collector',
      totalDonations: 100
    });
    await campaign.save();

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        campaignId: 'test-campaign-001',
        amount: 50.00,
        donorName: 'John Doe',
        paymentMethod: 'pix'
      })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toBe('Donation processed successfully!');
    expect(responseBody.data.campaignId).toBe('test-campaign-001');
    expect(responseBody.data.amount).toBe(50.00);
    expect(responseBody.data.totalCampaignDonations).toBe(150);
  });

  it('should create campaign and process donation when campaign does not exist', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        campaignId: 'new-campaign-001',
        amount: 75.50,
        donorName: 'Jane Smith',
        paymentMethod: 'credit_card'
      })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(true);
    expect(responseBody.data.campaignId).toBe('new-campaign-001');
    expect(responseBody.data.amount).toBe(75.50);
    expect(responseBody.data.totalCampaignDonations).toBe(75.50);
  });

  it('should return 400 when request body is missing', async () => {
    const event: APIGatewayProxyEvent = {
      body: null
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('Request body is required');
  });

  it('should return 400 when campaignId is missing', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        amount: 50.00,
        donorName: 'John Doe',
        paymentMethod: 'pix'
      })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('campaignId is required');
  });

  it('should return 400 when amount is missing', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        campaignId: 'test-campaign',
        donorName: 'John Doe',
        paymentMethod: 'pix'
      })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('amount must be greater than 0');
  });

  it('should return 400 when amount is zero', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        campaignId: 'test-campaign',
        amount: 0,
        donorName: 'John Doe',
        paymentMethod: 'pix'
      })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('amount must be greater than 0');
  });

  it('should return 400 when amount is negative', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        campaignId: 'test-campaign',
        amount: -10,
        donorName: 'John Doe',
        paymentMethod: 'pix'
      })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('amount must be greater than 0');
  });

  it('should return 400 when donorName is missing', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        campaignId: 'test-campaign',
        amount: 50.00,
        paymentMethod: 'pix'
      })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('donorName is required');
  });

  it('should return 400 when paymentMethod is missing', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        campaignId: 'test-campaign',
        amount: 50.00,
        donorName: 'John Doe'
      })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('paymentMethod is required');
  });

  it('should accumulate multiple donations for the same campaign', async () => {
    const campaign = new Campaign({
      campaignId: 'accumulate-test',
      name: 'Accumulate Test',
      collectorName: 'Test Collector',
      totalDonations: 0
    });
    await campaign.save();

    const event1: APIGatewayProxyEvent = {
      body: JSON.stringify({
        campaignId: 'accumulate-test',
        amount: 25.00,
        donorName: 'Donor 1',
        paymentMethod: 'pix'
      })
    } as APIGatewayProxyEvent;

    const event2: APIGatewayProxyEvent = {
      body: JSON.stringify({
        campaignId: 'accumulate-test',
        amount: 75.00,
        donorName: 'Donor 2',
        paymentMethod: 'credit_card'
      })
    } as APIGatewayProxyEvent;

    await handler(event1);
    const result2 = await handler(event2);

    const response2 = JSON.parse(result2.body);
    expect(response2.data.totalCampaignDonations).toBe(100);

    const updatedCampaign = await Campaign.findOne({ campaignId: 'accumulate-test' });
    expect(updatedCampaign?.totalDonations).toBe(100);

    const donations = await Donation.find({ campaignId: 'accumulate-test' });
    expect(donations).toHaveLength(2);
  });
}); 