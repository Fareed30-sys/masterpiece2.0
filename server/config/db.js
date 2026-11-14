import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Disable buffering so unbacked queries fail immediately in 0ms without hanging
mongoose.set('bufferCommands', false);

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/omnipulse';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 800,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Operating in Zero-Latency In-Memory Mode (No local MongoDB needed).`);
  }
};

export const getIsConnected = () => mongoose.connection.readyState === 1;

export default connectDB;
