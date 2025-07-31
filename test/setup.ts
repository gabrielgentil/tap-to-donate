import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { connectToDatabase, closeDatabase } from '../src/utils/database';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGO_URI = 'mongodb://admin:password123@localhost:27017/donations?authSource=admin';
  await connectToDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

beforeEach(async () => {
  // Clean the database before each test to ensure isolation
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterEach(async () => {
  // Clean the database after each test as well
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
}); 