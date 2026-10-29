import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isMongoConnected = false;
export const DATA_DIR = path.join(__dirname, '../../data');
export const JSON_DB_FILE = path.join(DATA_DIR, 'reports.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(JSON_DB_FILE)) {
  fs.writeFileSync(JSON_DB_FILE, JSON.stringify([]), 'utf-8');
}

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lab_report_analyzer';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log(`✅ [MongoDB] Connected successfully to: ${mongoURI}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`⚠️ [Database Mode] MongoDB connection unavailable (${err.message}).`);
    console.log(`📁 [Fallback Engine] Using resilient local file storage: ${JSON_DB_FILE}`);
    console.log(`   (Tip: Start MongoDB anytime or configure MONGODB_URI in server/.env to use cloud/local MongoDB.)`);
  }
}
