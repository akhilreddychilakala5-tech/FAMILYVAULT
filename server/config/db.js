import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.resolve(__dirname, '../data/db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let mongodInstance = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      console.log('Connecting to provided MONGODB_URI...');
      await mongoose.connect(mongoUri);
      console.log(`✅ Connected to external MongoDB at ${mongoose.connection.host}`);
      return;
    }

    console.log(`⚡ Initializing persistent MongoDB engine at ${dbDir}...`);
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbPath: dbDir,
        storageEngine: 'wiredTiger',
      },
    });
    mongoUri = mongodInstance.getUri();
    await mongoose.connect(mongoUri);
    console.log(`✅ Persistent MongoDB running successfully at ${mongoUri}`);
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB startup notice (${error.message}). Initializing standard instance...`);
    try {
      if (!mongodInstance) {
        mongodInstance = await MongoMemoryServer.create();
      }
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ MongoDB running successfully at ${memoryUri}`);
    } catch (fallbackError) {
      console.error('❌ Failed to connect to MongoDB engine:', fallbackError);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
