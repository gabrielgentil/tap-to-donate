import mongoose, { Schema, Document } from 'mongoose';

export interface IDonation extends Document {
  campaignId: string;
  amount: number;
  donorName: string;
  paymentMethod: 'credit_card' | 'pix' | 'bank_transfer';
  donatedAt: Date;
}

const DonationSchema = new Schema<IDonation>({
  campaignId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
    validate: {
      validator: function(v: number) {
        return v > 0;
      },
      message: 'Amount must be greater than 0'
    }
  },
  donorName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'pix', 'bank_transfer'],
    default: 'credit_card'
  },
  donatedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: false,
  collection: 'donations'
});

// Índices para melhor performance
DonationSchema.index({ campaignId: 1 });
DonationSchema.index({ donatedAt: -1 });
DonationSchema.index({ paymentMethod: 1 });

export const Donation = mongoose.model<IDonation>('Donation', DonationSchema); 