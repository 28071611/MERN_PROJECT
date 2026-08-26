import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const connectDB = async () => {
  try {
    let MONGO_URI = process.env.MONGO_URI;

    // If no MONGO_URI is provided, start an in-memory MongoDB for development/testing
    if (!MONGO_URI) {
      const mongod = await MongoMemoryServer.create();
      MONGO_URI = mongod.getUri();
      console.log('Started in-memory MongoDB for development');
    }

    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Database connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
