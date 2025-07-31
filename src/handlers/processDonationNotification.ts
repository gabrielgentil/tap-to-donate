import { SQSEvent, SQSHandler } from 'aws-lambda';

interface DonationNotification {
  donationId: string;
  campaignId: string;
  amount: number;
  donorName: string;
  paymentMethod: string;
  donatedAt: string;
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  console.log('[INFO] Received SQS message', {
    messageCount: event.Records.length,
    source: event.Records[0]?.eventSource
  });

  for (const record of event.Records) {
    try {
      console.log('[INFO] Processing SQS record', {
        messageId: record.messageId,
        receiptHandle: record.receiptHandle
      });

      // 1. Parse da mensagem
      const message: DonationNotification = JSON.parse(record.body);
      
      console.log('[INFO] Parsed donation notification', {
        donationId: message.donationId,
        campaignId: message.campaignId,
        amount: message.amount,
        donorName: message.donorName,
        paymentMethod: message.paymentMethod
      });

      // 2. Gerar comprovante fake (sem S3)
      const receiptUrl = await generateFakeReceipt(message);
      
      // 3. Enviar notificação por email (simulado)
      await sendEmailNotification(message, receiptUrl);

      console.log('[INFO] Successfully processed donation notification', {
        donationId: message.donationId,
        receiptUrl: receiptUrl
      });

    } catch (error) {
      console.error('[ERROR] Error processing SQS record', error as Error, {
        messageId: record.messageId,
        body: record.body
      });
      // Não fazer throw para não reprocessar a mensagem
    }
  }
};

async function generateFakeReceipt(donation: DonationNotification): Promise<string> {
  try {
    // Conteúdo do comprovante (sem salvar no S3)
    const receiptContent = `
      ========================================
      COMPROVANTE DE DOAÇÃO
      ========================================
      
      ID da Doação: ${donation.donationId}
      Campanha: ${donation.campaignId}
      Doador: ${donation.donorName}
      Valor: R$ ${donation.amount.toFixed(2)}
      Método: ${donation.paymentMethod}
      Data: ${new Date(donation.donatedAt).toLocaleString('pt-BR')}
      
      ========================================
      Obrigado pela sua doação!
      ========================================
    `;

    // Simular URL do comprovante (sem S3)
    const receiptUrl = `https://api.donations.com/receipts/${donation.donationId}`;
    
    console.log('[INFO] Receipt generated (simulated)', { receiptUrl });
    console.log('[INFO] Receipt content', { content: receiptContent });
    
    return receiptUrl;
  } catch (error) {
    console.error('[ERROR] Error generating receipt', error as Error);
    return 'https://api.donations.com/receipt-not-available';
  }
}

async function sendEmailNotification(donation: DonationNotification, receiptUrl: string): Promise<void> {
  try {
    const emailContent = `
      Nova doação recebida!
      
      Detalhes da doação:
      - ID: ${donation.donationId}
      - Campanha: ${donation.campaignId}
      - Doador: ${donation.donorName}
      - Valor: R$ ${donation.amount.toFixed(2)}
      - Método: ${donation.paymentMethod}
      - Data: ${new Date(donation.donatedAt).toLocaleString('pt-BR')}
      
      Comprovante: ${receiptUrl}
    `;

    console.log('[INFO] Email notification sent (simulated)', {
      to: 'gabriel.sgentil97@gmail.com',
      subject: 'Nova Doação Recebida',
      content: emailContent
    });

  } catch (error) {
    console.error('[ERROR] Error sending email notification', error as Error);
  }
} 