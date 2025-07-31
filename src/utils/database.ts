import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase(): Promise<void> {
  if (isConnected) {
    console.log('✅ Already connected to MongoDB');
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  try {
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ Connected to MongoDB successfully');
    
    // Log connection info
    const db = mongoose.connection.db;
    console.log(`📊 Database: ${db?.databaseName}`);
    console.log(`🔌 Connection state: ${mongoose.connection.readyState}`);
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 MongoDB connection closed');
  }
}

export function getConnectionStatus(): boolean {
  return isConnected;
} 