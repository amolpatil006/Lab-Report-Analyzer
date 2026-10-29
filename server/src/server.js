import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import reportRoutes from './routes/reportRoutes.js';
import { ReportRepository } from './models/Report.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads if needed
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Laboratory Test Report Analyzer API',
    timestamp: new Date().toISOString()
  });
});

// Report routes
app.use('/api/reports', reportRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  await connectDB();

  // Auto seed initial sample reports if empty so users can test immediately
  try {
    const existing = await ReportRepository.findAll();
    if (existing.length === 0) {
      console.log('🌱 Populating initial demonstration lab reports...');
      const response = await fetch(`http://localhost:${PORT}/api/reports/seed`, { method: 'POST' }).catch(() => null);
    }
  } catch (e) {
    // Ignore initial seed warning
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🧪 Lab Report Analyzer Backend API running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer();
