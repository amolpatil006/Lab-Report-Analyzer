import mongoose from 'mongoose';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { isMongoConnected, JSON_DB_FILE } from '../config/db.js';

const TestItemSchema = new mongoose.Schema({
  testId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String, default: '' },
  referenceMin: { type: Number },
  referenceMax: { type: Number },
  referenceString: { type: String },
  status: { type: String, enum: ['NORMAL', 'BELOW_NORMAL', 'ABOVE_NORMAL'], required: true },
  severity: { type: String, enum: ['normal', 'mild', 'critical'], default: 'normal' },
  interpretation: { type: String }
});

const ReportSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4() },
  patientName: { type: String, required: true },
  patientAge: { type: Number },
  patientGender: { type: String, default: 'Not Specified' },
  reportDate: { type: String, required: true },
  labName: { type: String, default: 'Clinical Diagnostic Laboratory' },
  originalFileName: { type: String },
  fileType: { type: String },
  rawText: { type: String },
  tests: [TestItemSchema],
  summary: {
    totalTests: { type: Number, default: 0 },
    normalCount: { type: Number, default: 0 },
    abnormalCount: { type: Number, default: 0 },
    highCount: { type: Number, default: 0 },
    lowCount: { type: Number, default: 0 },
    healthScore: { type: Number, default: 100 },
    keyFindings: [String],
    recommendations: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

export const ReportModel = mongoose.model('Report', ReportSchema);

// JSON file helper functions
function readJsonDb() {
  try {
    if (!fs.existsSync(JSON_DB_FILE)) return [];
    const content = fs.readFileSync(JSON_DB_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (e) {
    console.error('Error reading JSON DB:', e);
    return [];
  }
}

function writeJsonDb(data) {
  try {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing JSON DB:', e);
  }
}

// Unified Repository API
export const ReportRepository = {
  async create(reportData) {
    const dataWithId = {
      ...reportData,
      id: reportData.id || uuidv4(),
      createdAt: reportData.createdAt || new Date().toISOString()
    };

    if (isMongoConnected) {
      const doc = new ReportModel(dataWithId);
      const saved = await doc.save();
      return saved.toObject();
    } else {
      const all = readJsonDb();
      all.unshift(dataWithId);
      writeJsonDb(all);
      return dataWithId;
    }
  },

  async findAll() {
    if (isMongoConnected) {
      return await ReportModel.find().sort({ createdAt: -1 }).lean();
    } else {
      return readJsonDb().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async findById(id) {
    if (isMongoConnected) {
      const found = await ReportModel.findOne({ $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : null }] }).lean();
      return found;
    } else {
      const all = readJsonDb();
      return all.find(r => r.id === id || r._id === id) || null;
    }
  },

  async deleteById(id) {
    if (isMongoConnected) {
      const res = await ReportModel.deleteOne({ $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : null }] });
      return res.deletedCount > 0;
    } else {
      const all = readJsonDb();
      const filtered = all.filter(r => r.id !== id && r._id !== id);
      const deleted = filtered.length < all.length;
      writeJsonDb(filtered);
      return deleted;
    }
  }
};
