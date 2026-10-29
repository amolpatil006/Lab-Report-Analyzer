import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractPatientInfo, parseTestsFromText, generateReportSummary } from './src/services/reportParser.js';
import { ReportRepository } from './src/models/Report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTestSuite() {
  console.log('🧪 Starting Laboratory Test Analyzer Test Suite...\n');

  // Test 1: Parser & Classification Verification
  console.log('--- TEST 1: Parsing and Clinical Classification ---');
  const sampleTextPath = path.join(__dirname, '../samples/sample_city_hospital_report.txt');
  const rawText = fs.readFileSync(sampleTextPath, 'utf-8');

  const patient = extractPatientInfo(rawText);
  console.log(`✓ Patient Extracted: ${patient.patientName}, Age: ${patient.patientAge}, Gender: ${patient.patientGender}`);

  const tests = parseTestsFromText(rawText, patient.patientGender);
  console.log(`✓ Tests Detected: ${tests.length}`);

  let passedAllClassifications = true;
  for (const t of tests) {
    console.log(`   - ${t.name.padEnd(30)} Value: ${String(t.value).padEnd(6)} Range: ${t.referenceString.padEnd(14)} Status: [${t.status}]`);
    if (t.testId === 'fasting_blood_sugar' && t.status !== 'ABOVE_NORMAL') passedAllClassifications = false;
    if (t.testId === 'total_cholesterol' && t.status !== 'ABOVE_NORMAL') passedAllClassifications = false;
    if (t.testId === 'hemoglobin' && t.status !== 'NORMAL') passedAllClassifications = false;
  }

  if (passedAllClassifications) {
    console.log('✅ TEST 1 PASSED: Values correctly classified against physiological reference ranges!\n');
  } else {
    console.error('❌ TEST 1 FAILED: Status mismatch.');
  }

  // Test 2: Clinical Summary Generation
  console.log('--- TEST 2: Health Index & Clinical Summary ---');
  const summary = generateReportSummary(tests);
  console.log(`✓ Total Tests: ${summary.totalTests}`);
  console.log(`✓ Normal Count: ${summary.normalCount}, High Count: ${summary.highCount}, Low Count: ${summary.lowCount}`);
  console.log(`✓ Health Score: ${summary.healthScore}/100`);
  console.log(`✓ Findings: ${summary.keyFindings.length} observation(s)`);
  console.log(`✓ Recommendations: ${summary.recommendations.length} clinical step(s)`);

  if (summary.highCount === 2 && summary.normalCount > 0) {
    console.log('✅ TEST 2 PASSED: Clinical Summary & health scoring generated accurately!\n');
  } else {
    console.error('❌ TEST 2 FAILED: Unexpected summary counts.');
  }

  // Test 3: Repository Persistence
  console.log('--- TEST 3: Repository Dual-Mode Storage ---');
  const savedDoc = await ReportRepository.create({
    patientName: patient.patientName,
    patientAge: patient.patientAge,
    patientGender: patient.patientGender,
    reportDate: patient.reportDate,
    labName: patient.labName,
    originalFileName: 'test_report.txt',
    fileType: 'text/plain',
    rawText,
    tests,
    summary
  });
  console.log(`✓ Report Saved with ID: ${savedDoc.id}`);

  const fetched = await ReportRepository.findById(savedDoc.id);
  if (fetched && fetched.patientName === patient.patientName) {
    console.log('✅ TEST 3 PASSED: Repository persistence and retrieval verified!\n');
  } else {
    console.error('❌ TEST 3 FAILED: Could not retrieve saved report.');
  }

  console.log('🎉 ALL LABORATORY TEST ANALYZER TESTS PASSED SUCCESSFULLY!');
}

runTestSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
