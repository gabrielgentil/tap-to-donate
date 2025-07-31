import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

// Configuração do cliente SQS
const sqsClient = new SQSClient({ 
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || ''
  }
});

export interface DonationNotification {
  donationId: string;
  campaignId: string;
  amount: number;
  donorName: string;
  paymentMethod: string;
  donatedAt: string;
}

export class SQSService {
  private queueUrl: string;

  constructor() {
    this.queueUrl = process.env.SQS_QUEUE_URL || '';
    if (!this.queueUrl) {
      console.warn('[WARN] SQS_QUEUE_URL not configured');
    }
  }

  async sendDonationNotification(notification: DonationNotification): Promise<void> {
    try {
      if (!this.queueUrl) {
        console.warn('[WARN] Skipping SQS notification - queue URL not configured');
        return;
      }

      console.log('[INFO] Sending donation notification to SQS', {
        donationId: notification.donationId,
        campaignId: notification.campaignId,
        amount: notification.amount
      });

      await sqsClient.send(new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(notification),
        MessageAttributes: {
          'MessageType': {
            StringValue: 'DonationNotification',
            DataType: 'String'
          }
        }
      }));

      console.log('[INFO] Donation notification sent successfully', {
        donationId: notification.donationId
      });

    } catch (error) {
      console.error('[ERROR] Failed to send donation notification to SQS', error as Error, {
        donationId: notification.donationId,
        queueUrl: this.queueUrl
      });
      throw error;
    }
  }
}

export const sqsService = new SQSService(); 