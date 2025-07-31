import { describe, it, expect } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/handlers/createCampaign';
import { Campaign } from '../../src/models/Campaign';

describe('createCampaign handler', () => {
  it('should create a campaign successfully', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        name: 'Test Campaign',
        collectorName: 'John Doe'
      })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toBe('Campaign created successfully!');
    expect(responseBody.data.name).toBe('Test Campaign');
    expect(responseBody.data.collectorName).toBe('John Doe');
    expect(responseBody.data.totalDonations).toBe(0);
    expect(responseBody.data.campaignId).toBeDefined();
    expect(responseBody.data.createdAt).toBeDefined();

    const campaign = await Campaign.findOne({ campaignId: responseBody.data.campaignId });
    expect(campaign).toBeDefined();
    expect(campaign?.name).toBe('Test Campaign');
    expect(campaign?.collectorName).toBe('John Doe');
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

  it('should return 400 when name is missing', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        collectorName: 'John Doe'
      })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('name is required');
  });

  it('should return 400 when collectorName is missing', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        name: 'Test Campaign'
      })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('collectorName is required');
  });

  it('should return 400 when both name and collectorName are missing', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({})
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('name is required');
  });

  it('should generate unique campaign IDs for different campaigns', async () => {
    const event1: APIGatewayProxyEvent = {
      body: JSON.stringify({
        name: 'Campaign 1',
        collectorName: 'Collector 1'
      })
    } as APIGatewayProxyEvent;

    const event2: APIGatewayProxyEvent = {
      body: JSON.stringify({
        name: 'Campaign 2',
        collectorName: 'Collector 2'
      })
    } as APIGatewayProxyEvent;

    const result1 = await handler(event1);
    const result2 = await handler(event2);

    const response1 = JSON.parse(result1.body);
    const response2 = JSON.parse(result2.body);

    expect(response1.data.campaignId).not.toBe(response2.data.campaignId);
  });
}); 