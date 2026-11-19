import mongoose from 'mongoose';
import { env } from './env.js';

/** Connects Mongoose to MongoDB. Rejects quickly when the database cannot be reached. */
export async function connectDb(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  if (!env.isTest) console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export const disconnectDb = () => mongoose.disconnect();
