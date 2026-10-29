import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import { normalizeOcrText } from './reportParser.js';

/**
 * Extract raw text from an uploaded file (Image or PDF)
 */
export async function extractTextFromFile(filePath, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const cleanedText = normalizeOcrText(pdfData.text);
      return {
        text: cleanedText,
        confidence: 95,
        engine: 'pdf-parse'
      };
    } else {
      // Image extraction using Tesseract OCR with table segmentation parameters
      const result = await Tesseract.recognize(filePath, 'eng', {
        tessedit_pageseg_mode: '6', // Assume single uniform block of text (tabular columns)
        preserve_interword_spaces: '1'
      });

      const cleanedText = normalizeOcrText(result.data.text);

      return {
        text: cleanedText,
        confidence: Math.round(result.data.confidence),
        engine: 'tesseract-ocr'
      };
    }
  } catch (error) {
    console.error('OCR Extraction error:', error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}
