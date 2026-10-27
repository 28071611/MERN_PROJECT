import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Prioritize IPv4 over IPv6 in DNS resolution.
// This resolves the common 'querySrv ETIMEOUT' / connection timeout issue with MongoDB Atlas on Render/Linux.
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Connection event listeners for runtime monitoring
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ [MongoDB] Disconnected. Reconnection will be handled automatically by driver.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ [MongoDB] Error event:', err.message);
});

export const connectDB = async (retries = 5, delayMs = 3000) => {
  let MONGO_URI = process.env.MONGO_URI;

  // Handle missing MONGO_URI
  if (!MONGO_URI) {
    if (process.env.NODE_ENV === 'production') {
      console.error('\n============================================================');
      console.error('❌ FATAL ERROR: MONGO_URI is missing in production environment!');
      console.error('👉 If deploying on Render:');
      console.error('   1. Open your Web Service dashboard on Render');
      console.error('   2. Navigate to "Environment" tab');
      console.error('   3. Add key: MONGO_URI');
      console.error('   4. Value: mongodb+srv://<username>:<password>@cluster0.../lostfound?retryWrites=true&w=majority');
      console.error('============================================================\n');
      process.exit(1);
    }

    console.log('⚠️ No MONGO_URI specified in local environment. Starting in-memory MongoDB...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    MONGO_URI = mongod.getUri();
    console.log('✅ In-memory MongoDB started successfully.');
  }

  // Attempt connection with retry logic
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Connecting to MongoDB (attempt ${attempt}/${retries})...`);
      const conn = await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000, // 10 second timeout for faster feedback
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB connected successfully to: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed: ${error.message}`);

      // Provide targeted troubleshooting guidance based on common error patterns
      if (error.message.includes('querySrv') || error.message.includes('ENOTFOUND')) {
        console.error('🔍 [Diagnosis]: DNS lookup failed for your MongoDB Atlas cluster hostname.');
        console.error('👉 Verify that the cluster URL in MONGO_URI is typed correctly and active.');
      } else if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
        console.error('🔍 [Diagnosis]: MongoDB Atlas authentication failed.');
        console.error('👉 Check that database username and password in MONGO_URI are correct.');
      } else if (
        error.message.includes('whitelist') ||
        error.message.includes('timed out') ||
        error.message.includes('Server selection timed out') ||
        error.name === 'MongooseServerSelectionError'
      ) {
        console.error('🔍 [Diagnosis]: Atlas Network Access / IP Whitelist issue or cluster unreachable.');
        console.error('👉 Crucial for Render deployment:');
        console.error('   1. Log into cloud.mongodb.com');
        console.error('   2. Select your project and go to "Network Access" under Security');
        console.error('   3. Click "Add IP Address" and select "Allow Access From Anywhere" (0.0.0.0/0)');
        console.error('   4. Save and wait 1-2 minutes for Atlas rules to apply.');
      }

      if (attempt < retries) {
        console.log(`⏳ Waiting ${delayMs / 1000}s before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error(`\n🚨 All ${retries} connection attempts to MongoDB failed.`);
        if (process.env.NODE_ENV === 'production') {
          console.error('Exiting process due to persistent database connection failure in production.\n');
          process.exit(1);
        }
      }
    }
  }
};

