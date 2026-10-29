import fs from 'fs';
import { extractTextFromFile } from '../services/ocrService.js';
import { extractPatientInfo, parseTestsFromText, generateReportSummary, classifyTest } from '../services/reportParser.js';
import { ReportRepository } from '../models/Report.js';

// Pre-packaged realistic sample reports for instant demonstration
const SAMPLE_REPORTS = [
  {
    patientName: 'Robert Vance',
    patientAge: 48,
    patientGender: 'Male',
    reportDate: '2025-01-15',
    labName: 'Apex Health Diagnostics',
    originalFileName: 'sample_lipid_and_glucose.pdf',
    fileType: 'application/pdf',
    rawText: `APEX HEALTH DIAGNOSTICS - CLINICAL BIOCHEMISTRY
Patient: Robert Vance  Age: 48 Yrs  Sex: Male  Date: 15-Jan-2025
Ref: Dr. S. K. Gupta

TEST NAME                   VALUE    UNIT     REFERENCE RANGE
Fasting Blood Sugar (FBS)   134.0    mg/dL    70 - 99
HbA1c Glycated Hemoglobin   6.8      %        4.0 - 5.6
Total Cholesterol           238.0    mg/dL    125 - 200
Triglycerides               195.0    mg/dL    40 - 150
HDL Cholesterol (Good)      38.0     mg/dL    40 - 90
LDL Cholesterol (Bad)       145.0    mg/dL    50 - 100
Serum Creatinine            1.1      mg/dL    0.7 - 1.3
SGPT / ALT                  42.0     U/L      7 - 55`,
    tests: [
      {
        testId: 'fasting_blood_sugar',
        name: 'Fasting Blood Glucose',
        category: 'Blood Sugar & Diabetes',
        value: 134,
        unit: 'mg/dL',
        referenceMin: 70,
        referenceMax: 99,
        referenceString: '70 - 99',
        status: 'ABOVE_NORMAL',
        severity: 'critical',
        interpretation: 'Elevated fasting blood sugar (>=126 mg/dL indicates diabetes). Requires medical consultation and dietary regulation.'
      },
      {
        testId: 'hba1c',
        name: 'Glycated Hemoglobin (HbA1c)',
        category: 'Blood Sugar & Diabetes',
        value: 6.8,
        unit: '%',
        referenceMin: 4.0,
        referenceMax: 5.6,
        referenceString: '4.0 - 5.6',
        status: 'ABOVE_NORMAL',
        severity: 'critical',
        interpretation: 'HbA1c at 6.8% indicates diabetes mellitus (target threshold is typically < 5.7%). Reflects persistent elevated glucose over past 90 days.'
      },
      {
        testId: 'total_cholesterol',
        name: 'Total Cholesterol',
        category: 'Lipid / Cholesterol Profile',
        value: 238,
        unit: 'mg/dL',
        referenceMin: 125,
        referenceMax: 200,
        referenceString: '125 - 200',
        status: 'ABOVE_NORMAL',
        severity: 'mild',
        interpretation: 'Hypercholesterolemia (>200 mg/dL) elevates cardiovascular risk, atherosclerosis, and heart disease likelihood.'
      },
      {
        testId: 'triglycerides',
        name: 'Triglycerides',
        category: 'Lipid / Cholesterol Profile',
        value: 195,
        unit: 'mg/dL',
        referenceMin: 40,
        referenceMax: 150,
        referenceString: '40 - 150',
        status: 'ABOVE_NORMAL',
        severity: 'mild',
        interpretation: 'Elevated triglycerides (>150 mg/dL) increase risk of arterial hardening and metabolic syndrome.'
      },
      {
        testId: 'hdl_cholesterol',
        name: 'HDL Cholesterol (Good)',
        category: 'Lipid / Cholesterol Profile',
        value: 38,
        unit: 'mg/dL',
        referenceMin: 40,
        referenceMax: 90,
        referenceString: '40 - 90',
        status: 'BELOW_NORMAL',
        severity: 'mild',
        interpretation: 'Low HDL (<40 mg/dL in men) reduces cardio-protection.'
      },
      {
        testId: 'ldl_cholesterol',
        name: 'LDL Cholesterol (Bad)',
        category: 'Lipid / Cholesterol Profile',
        value: 145,
        unit: 'mg/dL',
        referenceMin: 50,
        referenceMax: 100,
        referenceString: '50 - 100',
        status: 'ABOVE_NORMAL',
        severity: 'mild',
        interpretation: 'High LDL (>100 mg/dL) causes plaque accumulation in arterial walls.'
      },
      {
        testId: 'serum_creatinine',
        name: 'Serum Creatinine',
        category: 'Kidney Function Test (KFT)',
        value: 1.1,
        unit: 'mg/dL',
        referenceMin: 0.7,
        referenceMax: 1.3,
        referenceString: '0.7 - 1.3',
        status: 'NORMAL',
        severity: 'normal',
        interpretation: 'Renal filtration and creatinine excretion are optimal.'
      },
      {
        testId: 'sgpt_alt',
        name: 'SGPT / ALT (Alanine Aminotransferase)',
        category: 'Liver Function Test (LFT)',
        value: 42,
        unit: 'U/L',
        referenceMin: 7,
        referenceMax: 55,
        referenceString: '7 - 55',
        status: 'NORMAL',
        severity: 'normal',
        interpretation: 'Liver enzyme ALT is within healthy baseline limits.'
      }
    ],
    summary: {
      totalTests: 8,
      normalCount: 2,
      abnormalCount: 6,
      highCount: 5,
      lowCount: 1,
      healthScore: 48,
      keyFindings: [
        'Fasting Blood Glucose is elevated at 134.0 mg/dL (Normal: 70 - 99).',
        'HbA1c is elevated at 6.8 % (Normal: 4.0 - 5.6).',
        'Total Cholesterol is elevated at 238.0 mg/dL (Normal: 125 - 200).',
        'Triglycerides is elevated at 195.0 mg/dL (Normal: 40 - 150).',
        'HDL Cholesterol (Good) is below normal at 38.0 mg/dL (Normal: 40 - 90).',
        'LDL Cholesterol (Bad) is elevated at 145.0 mg/dL (Normal: 50 - 100).'
      ],
      recommendations: [
        'Blood glucose parameters show diabetic range indicators. Consult a physician or endocrinologist immediately.',
        'Lipid levels are elevated. Prioritize cardiovascular health: reduce trans fats and saturated lipids.',
        'Schedule a complete comprehensive clinical review with your primary care provider.'
      ]
    }
  },
  {
    patientName: 'Sarah Jenkins',
    patientAge: 32,
    patientGender: 'Female',
    reportDate: '2025-02-20',
    labName: 'MetroPath Clinical Diagnostics',
    originalFileName: 'sample_cbc_panel.jpg',
    fileType: 'image/jpeg',
    rawText: `METROPATH CLINICAL DIAGNOSTICS
Patient Name: Sarah Jenkins  Age: 32 Yrs  Gender: Female  Date: 20-Feb-2025
COMPLETE BLOOD COUNT (CBC) REPORT
Hemoglobin : 10.4 g/dL (Normal 12.0 - 15.5)
Total WBC Count : 7200 cells/mcL (Normal 4000 - 11000)
RBC Count : 3.8 million/mcL (Normal 4.1 - 5.1)
Platelet Count : 260000 cells/mcL (Normal 150000 - 450000)
Hematocrit (PCV) : 32.5 % (Normal 34.9 - 44.5)
Serum Albumin : 4.2 g/dL (Normal 3.5 - 5.5)`,
    tests: [
      {
        testId: 'hemoglobin',
        name: 'Hemoglobin (Hb)',
        category: 'Complete Blood Count (CBC)',
        value: 10.4,
        unit: 'g/dL',
        referenceMin: 12.0,
        referenceMax: 15.5,
        referenceString: '12.0 - 15.5',
        status: 'BELOW_NORMAL',
        severity: 'mild',
        interpretation: 'Low hemoglobin indicates mild microcytic/normocytic anemia. Common causes include iron deficiency, dietary deficits, or menstrual blood loss.'
      },
      {
        testId: 'wbc',
        name: 'Total White Blood Cell Count (WBC)',
        category: 'Complete Blood Count (CBC)',
        value: 7200,
        unit: 'cells/mcL',
        referenceMin: 4000,
        referenceMax: 11000,
        referenceString: '4000 - 11000',
        status: 'NORMAL',
        severity: 'normal',
        interpretation: 'White blood cell count is normal, indicating an active and balanced immune system.'
      },
      {
        testId: 'rbc',
        name: 'Red Blood Cell Count (RBC)',
        category: 'Complete Blood Count (CBC)',
        value: 3.8,
        unit: 'million/mcL',
        referenceMin: 4.1,
        referenceMax: 5.1,
        referenceString: '4.1 - 5.1',
        status: 'BELOW_NORMAL',
        severity: 'mild',
        interpretation: 'Low RBC count suggests anemia, reducing oxygen delivery to body tissues.'
      },
      {
        testId: 'platelets',
        name: 'Platelet Count',
        category: 'Complete Blood Count (CBC)',
        value: 260000,
        unit: 'cells/mcL',
        referenceMin: 150000,
        referenceMax: 450000,
        referenceString: '150000 - 450000',
        status: 'NORMAL',
        severity: 'normal',
        interpretation: 'Platelet count is optimal for healthy blood clotting.'
      },
      {
        testId: 'hematocrit',
        name: 'Hematocrit (PCV)',
        category: 'Complete Blood Count (CBC)',
        value: 32.5,
        unit: '%',
        referenceMin: 34.9,
        referenceMax: 44.5,
        referenceString: '34.9 - 44.5',
        status: 'BELOW_NORMAL',
        severity: 'mild',
        interpretation: 'Low hematocrit reflects a lower volume proportion of red blood cells.'
      },
      {
        testId: 'serum_albumin',
        name: 'Serum Albumin',
        category: 'Liver Function Test (LFT)',
        value: 4.2,
        unit: 'g/dL',
        referenceMin: 3.5,
        referenceMax: 5.5,
        referenceString: '3.5 - 5.5',
        status: 'NORMAL',
        severity: 'normal',
        interpretation: 'Albumin synthesis and serum protein balance are healthy.'
      }
    ],
    summary: {
      totalTests: 6,
      normalCount: 3,
      abnormalCount: 3,
      highCount: 0,
      lowCount: 3,
      healthScore: 65,
      keyFindings: [
        'Hemoglobin (Hb) is below normal at 10.4 g/dL (Normal: 12.0 - 15.5).',
        'RBC Count is below normal at 3.8 million/mcL (Normal: 4.1 - 5.1).',
        'Hematocrit (PCV) is below normal at 32.5 % (Normal: 34.9 - 44.5).'
      ],
      recommendations: [
        'Indicators consistent with mild iron-deficiency anemia.',
        'Increase dietary iron (spinach, lentils, beets, lean meats) and vitamin C to improve absorption.',
        'Consult your doctor for serum ferritin testing or iron supplement advice.'
      ]
    }
  }
];

export async function scanAndExtractOnly(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No report file provided.' });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const originalName = req.file.originalname;

    // Step 1: OCR Text Extraction
    const ocrResult = await extractTextFromFile(filePath, mimeType);
    const extractedText = ocrResult.text;

    // Clean up uploaded temp file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.warn('Failed to delete temp file:', e.message);
    }

    // Step 2: Information Extraction & Patient Profile Parsing
    const parsedPatient = extractPatientInfo(extractedText);
    const patientName = req.body.patientName || parsedPatient.patientName;
    const patientAge = req.body.patientAge ? parseInt(req.body.patientAge, 10) : parsedPatient.patientAge;
    const patientGender = req.body.patientGender || parsedPatient.patientGender;
    const reportDate = req.body.reportDate || parsedPatient.reportDate;
    const labName = req.body.labName || parsedPatient.labName;

    // Step 3: Parse Laboratory Tests & Classify vs Reference Ranges
    const tests = parseTestsFromText(extractedText, patientGender);

    // Step 4: Generate Summary & Health Insights
    const summary = generateReportSummary(tests);

    return res.status(200).json({
      success: true,
      message: 'Report scanned. Ready for human verification and edits.',
      ocrConfidence: ocrResult.confidence,
      engine: ocrResult.engine,
      data: {
        patientName,
        patientAge,
        patientGender,
        reportDate,
        labName,
        originalFileName: originalName,
        fileType: mimeType,
        rawText: extractedText,
        tests,
        summary
      }
    });
  } catch (error) {
    console.error('Error in scanAndExtractOnly:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to scan and extract report text.'
    });
  }
}

export async function saveVerifiedReport(req, res) {
  try {
    const {
      patientName,
      patientAge,
      patientGender,
      reportDate,
      labName,
      originalFileName,
      fileType,
      rawText,
      tests
    } = req.body;

    if (!tests || !Array.isArray(tests)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing tests data.' });
    }

    // Re-verify classification and summary with any user-edited values
    const verifiedTests = tests.map(t =>
      classifyTest(
        t.testId || t.name,
        t.value,
        t.referenceMin,
        t.referenceMax,
        t.unit,
        patientGender
      )
    );

    const summary = generateReportSummary(verifiedTests);

    const savedRecord = await ReportRepository.create({
      patientName: patientName || 'Unknown Patient',
      patientAge: patientAge ? parseInt(patientAge, 10) : null,
      patientGender: patientGender || 'Not Specified',
      reportDate: reportDate || new Date().toISOString().split('T')[0],
      labName: labName || 'Diagnostic Laboratory',
      originalFileName: originalFileName || 'verified_report.txt',
      fileType: fileType || 'application/json',
      rawText: rawText || '',
      tests: verifiedTests,
      summary
    });

    return res.status(201).json({
      success: true,
      message: 'Verified report committed and saved successfully.',
      data: savedRecord
    });
  } catch (error) {
    console.error('Error in saveVerifiedReport:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function reclassifySingleItem(req, res) {
  try {
    const { testId, name, value, referenceMin, referenceMax, unit, gender } = req.body;
    const classified = classifyTest(
      testId || name,
      value,
      referenceMin,
      referenceMax,
      unit,
      gender
    );
    return res.json({ success: true, data: classified });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function uploadAndAnalyze(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No report file provided.' });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const originalName = req.file.originalname;

    // Step 1: Optical Character Recognition (OCR) / Text Extraction
    const ocrResult = await extractTextFromFile(filePath, mimeType);
    const extractedText = ocrResult.text;

    // Clean up uploaded temp file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.warn('Failed to delete temp file:', e.message);
    }

    // Step 2: Information Extraction & Patient Profile Parsing
    const parsedPatient = extractPatientInfo(extractedText);
    const patientName = req.body.patientName || parsedPatient.patientName;
    const patientAge = req.body.patientAge ? parseInt(req.body.patientAge, 10) : parsedPatient.patientAge;
    const patientGender = req.body.patientGender || parsedPatient.patientGender;
    const reportDate = req.body.reportDate || parsedPatient.reportDate;
    const labName = req.body.labName || parsedPatient.labName;

    // Step 3: Parse Laboratory Tests & Classify vs Reference Ranges
    const tests = parseTestsFromText(extractedText, patientGender);

    // Step 4: Generate Summary & Health Insights
    const summary = generateReportSummary(tests);

    // Step 5: Save to Database / Repository
    const reportRecord = await ReportRepository.create({
      patientName,
      patientAge,
      patientGender,
      reportDate,
      labName,
      originalFileName: originalName,
      fileType: mimeType,
      rawText: extractedText,
      tests,
      summary
    });

    return res.status(201).json({
      success: true,
      message: 'Report uploaded, scanned via OCR, and successfully analyzed.',
      data: reportRecord
    });
  } catch (error) {
    console.error('Error in uploadAndAnalyze:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process and analyze report.'
    });
  }
}

export async function analyzeTextDirectly(req, res) {
  try {
    const { rawText, patientName, patientAge, patientGender, reportDate, labName } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, message: 'rawText is required.' });
    }

    const parsedPatient = extractPatientInfo(rawText);
    const finalName = patientName || parsedPatient.patientName;
    const finalAge = patientAge ? parseInt(patientAge, 10) : parsedPatient.patientAge;
    const finalGender = patientGender || parsedPatient.patientGender;
    const finalDate = reportDate || parsedPatient.reportDate;
    const finalLab = labName || parsedPatient.labName;

    const tests = parseTestsFromText(rawText, finalGender);
    const summary = generateReportSummary(tests);

    const reportRecord = await ReportRepository.create({
      patientName: finalName,
      patientAge: finalAge,
      patientGender: finalGender,
      reportDate: finalDate,
      labName: finalLab,
      originalFileName: 'text_input.txt',
      fileType: 'text/plain',
      rawText,
      tests,
      summary
    });

    return res.status(201).json({
      success: true,
      message: 'Report text parsed and analyzed successfully.',
      data: reportRecord
    });
  } catch (error) {
    console.error('Error in analyzeTextDirectly:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllReports(req, res) {
  try {
    const reports = await ReportRepository.findAll();
    return res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getReportById(req, res) {
  try {
    const { id } = req.params;
    const report = await ReportRepository.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    return res.json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteReport(req, res) {
  try {
    const { id } = req.params;
    const deleted = await ReportRepository.deleteById(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    return res.json({ success: true, message: 'Report deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getHistoricalTrends(req, res) {
  try {
    const { patientName, testId } = req.query;
    let reports = await ReportRepository.findAll();

    if (patientName) {
      reports = reports.filter(r => r.patientName.toLowerCase().includes(patientName.toLowerCase()));
    }

    // Sort chronologically ascending
    reports.sort((a, b) => new Date(a.reportDate || a.createdAt) - new Date(b.reportDate || b.createdAt));

    // Aggregate trends
    const trendsMap = {};

    reports.forEach(report => {
      const date = report.reportDate || report.createdAt.split('T')[0];
      report.tests.forEach(test => {
        if (!testId || test.testId === testId) {
          if (!trendsMap[test.name]) {
            trendsMap[test.name] = {
              testId: test.testId,
              testName: test.name,
              category: test.category,
              unit: test.unit,
              referenceMin: test.referenceMin,
              referenceMax: test.referenceMax,
              timeline: []
            };
          }
          trendsMap[test.name].timeline.push({
            reportId: report.id || report._id,
            patientName: report.patientName,
            date: date,
            value: test.value,
            status: test.status
          });
        }
      });
    });

    return res.json({
      success: true,
      data: Object.values(trendsMap)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function seedSampleReports(req, res) {
  try {
    const existing = await ReportRepository.findAll();
    if (existing.length === 0) {
      for (const sample of SAMPLE_REPORTS) {
        await ReportRepository.create(sample);
      }
      return res.json({ success: true, message: 'Sample reports populated successfully.', count: SAMPLE_REPORTS.length });
    }
    return res.json({ success: true, message: 'Database already has reports.', count: existing.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
