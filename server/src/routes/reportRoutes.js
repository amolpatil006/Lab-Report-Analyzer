import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  uploadAndAnalyze,
  analyzeTextDirectly,
  getAllReports,
  getReportById,
  deleteReport,
  getHistoricalTrends,
  seedSampleReports,
  scanAndExtractOnly,
  saveVerifiedReport,
  reclassifySingleItem
} from '../controllers/reportController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload JPG, PNG, or PDF.'));
    }
  }
});

const router = express.Router();

router.post('/upload', upload.single('reportFile'), uploadAndAnalyze);
router.post('/scan', upload.single('reportFile'), scanAndExtractOnly);
router.post('/save-verified', saveVerifiedReport);
router.post('/classify-item', reclassifySingleItem);
router.post('/analyze-text', analyzeTextDirectly);
router.get('/trends', getHistoricalTrends);
router.post('/seed', seedSampleReports);
router.get('/', getAllReports);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

export default router;
