import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/omnipulse';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Notice: Could not connect to MongoDB at ${mongoUri}`);
    console.warn(`[MongoDB] To connect to MongoDB Atlas, add your connection string to server/.env:`);
    console.warn(`[MongoDB] MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/omnipulse?retryWrites=true&w=majority`);
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

mongoose.connection.on('connected', () => {
  isConnected = true;
});

export const getIsConnected = () => isConnected;

export default connectDB;
