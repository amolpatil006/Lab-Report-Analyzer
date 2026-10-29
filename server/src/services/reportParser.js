import { MEDICAL_TESTS, matchTestDefinition } from './medicalKnowledgeBase.js';

/**
 * Pre-processes and cleans noisy OCR text
 */
export function normalizeOcrText(text) {
  if (!text) return '';

  return text
    // Replace non-standard dashes/hyphens with standard hyphen
    .replace(/[—–−]/g, '-')
    // Replace non-standard quotes
    .replace(/[""]/g, '"')
    // Fix OCR decimal spacing: e.g. "14 . 2" or "14, 2" or "14,2" -> "14.2"
    .replace(/(\d+)\s*[,.·]\s*(\d+)/g, '$1.$2')
    // Separate flag letters stuck to numbers: e.g. "118H" -> "118 H", "10.4L" -> "10.4 L"
    .replace(/(\d+(?:\.\d+)?)\s*([HL]|HIGH|LOW)\b/gi, '$1 $2')
    // Remove stray asterisks/hashes stuck to values: e.g. "118*" -> "118"
    .replace(/(\d+(?:\.\d+)?)\s*[\*#]+/g, '$1 ')
    // Normalize brackets spacing: "( 13.5 - 17.5 )" -> "(13.5-17.5)"
    .replace(/\(\s*([<>]?\s*\d+(?:\.\d+)?)\s*[-to]\s*(\d+(?:\.\d+)?)\s*\)/gi, '($1-$2)')
    // Clean trailing and multiple whitespaces per line
    .split('\n')
    .map(line => line.trim())
    .join('\n');
}

/**
 * Extract patient info from raw report text
 */
export function extractPatientInfo(text) {
  const normalized = normalizeOcrText(text);
  const info = {
    patientName: 'Unknown Patient',
    patientAge: null,
    patientGender: 'Not Specified',
    reportDate: new Date().toISOString().split('T')[0],
    labName: 'Clinical Diagnostic Laboratory'
  };

  const lines = normalized.split('\n');

  // Name regexes
  const namePatterns = [
    /(?:Patient\s*Name|Name|Pt\s*Name|Client)[\s:=|]+([A-Za-z\s.]+?)(?=\s{2,}|Age|Gender|Sex|Ref|Date|ID|$)/i,
    /(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Za-z\s]+?)(?=\s{2,}|Age|Gender|Sex|$)/i
  ];

  for (const line of lines) {
    for (const pattern of namePatterns) {
      const match = line.match(pattern);
      if (match && match[1] && match[1].trim().length > 2) {
        const cleanedName = match[1]
          .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s*/i, '')
          .replace(/[\[\]]/g, '')
          .trim();
        if (cleanedName && cleanedName.toLowerCase() !== 'example name') {
          info.patientName = cleanedName;
          break;
        }
      }
    }
    if (info.patientName !== 'Unknown Patient') break;
  }

  // Age regexes
  const ageMatch = normalized.match(/(?:Age|Years|Yrs)[\s:=|]+(\d{1,3})/i) || normalized.match(/(\d{1,3})\s*(?:Yrs|Years|Y\/O)/i);
  if (ageMatch && ageMatch[1]) {
    const age = parseInt(ageMatch[1], 10);
    if (age > 0 && age < 120) {
      info.patientAge = age;
    }
  }

  // Gender regexes
  const genderMatch = normalized.match(/(?:Gender|Sex)[\s:=|]+(Male|Female|M|F|Other)/i);
  if (genderMatch && genderMatch[1]) {
    const g = genderMatch[1].trim().toUpperCase();
    info.patientGender = g.startsWith('M') ? 'Male' : g.startsWith('F') ? 'Female' : 'Other';
  }

  // Date regexes
  const dateMatch = normalized.match(/(?:Date|Report\s*Date|Collected)[\s:=|]+(\d{1,2}[-/\s][A-Za-z0-9]{3,}[-/\s]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
  if (dateMatch && dateMatch[1]) {
    info.reportDate = dateMatch[1].trim();
  }

  // Lab name regexes
  const labMatch = normalized.match(/(?:Diagnostic|Pathology|Hospital|Laboratory|Labs|Clinic|Health Center)[\w\s&.]*/i);
  if (labMatch && labMatch[0].trim().length > 5) {
    info.labName = labMatch[0].trim();
  }

  return info;
}

/**
 * Re-evaluate / Classify a single test item (used during extraction & interactive review edits)
 */
export function classifyTest(testDefOrId, measuredValue, overrideMin = null, overrideMax = null, overrideUnit = null, gender = 'general') {
  const testDef = typeof testDefOrId === 'string'
    ? MEDICAL_TESTS.find(t => t.id === testDefOrId) || { id: testDefOrId, name: testDefOrId, category: 'General Panel', defaultUnit: '', ranges: { general: { min: 0, max: 100 } }, interpretation: {} }
    : testDefOrId;

  const genderKey = gender && gender.toLowerCase() === 'female' ? 'female' : gender && gender.toLowerCase() === 'male' ? 'male' : 'general';
  const defaultRange = (testDef.ranges?.[genderKey] || testDef.ranges?.general || { min: 0, max: 100 });

  const refMin = overrideMin !== null && !isNaN(overrideMin) ? parseFloat(overrideMin) : defaultRange.min;
  const refMax = overrideMax !== null && !isNaN(overrideMax) ? parseFloat(overrideMax) : defaultRange.max;
  const unit = overrideUnit || testDef.defaultUnit || '';

  let refString = '';
  if (refMin === 0 && refMax > 0) {
    refString = `< ${refMax}`;
  } else if (refMin > 0 && (refMax === Infinity || refMax === null)) {
    refString = `> ${refMin}`;
  } else {
    refString = `${refMin} - ${refMax}`;
  }

  let status = 'NORMAL';
  if (measuredValue < refMin) {
    status = 'BELOW_NORMAL';
  } else if (measuredValue > refMax) {
    status = 'ABOVE_NORMAL';
  }

  let interpretation = testDef.interpretation?.normal || 'Value is within expected reference interval.';
  let severity = 'normal';

  if (status === 'BELOW_NORMAL') {
    interpretation = testDef.interpretation?.low || 'Value is below standard physiological reference range.';
    severity = (refMin > 0 && measuredValue < refMin * 0.75) ? 'critical' : 'mild';
  } else if (status === 'ABOVE_NORMAL') {
    interpretation = testDef.interpretation?.high || 'Value exceeds standard physiological reference range.';
    severity = (refMax > 0 && measuredValue > refMax * 1.25) ? 'critical' : 'mild';
  }

  return {
    testId: testDef.id,
    name: testDef.name,
    category: testDef.category || 'General Panel',
    value: parseFloat(measuredValue),
    unit,
    referenceMin: refMin,
    referenceMax: refMax,
    referenceString: refString,
    status,
    severity,
    interpretation
  };
}

/**
 * Parse lines and match test values and ranges with enhanced table parsing
 */
export function parseTestsFromText(text, patientGender = 'general') {
  const normalized = normalizeOcrText(text);
  const lines = normalized.split('\n');
  const extractedTests = [];
  const foundTestIds = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.length < 3) continue;

    // Check against each knowledge base test
    for (const testDef of MEDICAL_TESTS) {
      if (foundTestIds.has(testDef.id)) continue;

      let matchedAlias = null;
      for (const alias of testDef.aliases) {
        // Look for alias matching whole word
        const regex = new RegExp(`\\b${alias.replace('/', '\\/')}\\b`, 'i');
        if (regex.test(line)) {
          matchedAlias = alias;
          break;
        }
      }

      if (matchedAlias) {
        // Combine current line with next line if value might have wrapped
        const combinedText = line + ' ' + (lines[i + 1] ? lines[i + 1].trim() : '');
        const parsed = parseTestValues(combinedText, testDef, patientGender);

        if (parsed) {
          extractedTests.push(parsed);
          foundTestIds.add(testDef.id);
          break;
        }
      }
    }
  }

  return extractedTests;
}

/**
 * Extract numeric value, unit, and reference range from text line for a given test definition
 */
function parseTestValues(text, testDef, gender = 'general') {
  const genderKey = gender && gender.toLowerCase() === 'female' ? 'female' : gender && gender.toLowerCase() === 'male' ? 'male' : 'general';
  const defaultRange = (testDef.ranges?.[genderKey] || testDef.ranges?.general || { min: 0, max: 100 });

  let refMin = defaultRange.min;
  let refMax = defaultRange.max;
  let refString = `${refMin} - ${refMax}`;
  let rangeFoundInText = false;

  // 1. Look for range patterns:
  // Pattern A: (min - max) or min - max or min to max
  const rangePattern = /(?:[\[\(]?)\s*(\d+(?:\.\d+)?)\s*(?:-|to|\.\.)\s*(\d+(?:\.\d+)?)\s*(?:[\]\)]?)/i;
  const rangeMatch = text.match(rangePattern);

  // Pattern B: < max or <= max or Up to max
  const lessPattern = /(?:<|<=|≤|less than|up to|below)\s*(\d+(?:\.\d+)?)/i;
  const lessMatch = text.match(lessPattern);

  // Pattern C: > min or >= min or greater than min
  const greaterPattern = /(?:>|>=|≥|greater than|above)\s*(\d+(?:\.\d+)?)/i;
  const greaterMatch = text.match(greaterPattern);

  let matchedRangeSubstring = '';

  if (rangeMatch && !text.includes('10^3')) {
    refMin = parseFloat(rangeMatch[1]);
    refMax = parseFloat(rangeMatch[2]);
    refString = `${refMin} - ${refMax}`;
    matchedRangeSubstring = rangeMatch[0];
    rangeFoundInText = true;
  } else if (lessMatch) {
    refMin = 0;
    refMax = parseFloat(lessMatch[1]);
    refString = `< ${refMax}`;
    matchedRangeSubstring = lessMatch[0];
    rangeFoundInText = true;
  } else if (greaterMatch) {
    refMin = parseFloat(greaterMatch[1]);
    refMax = defaultRange.max || refMin * 2;
    refString = `> ${refMin}`;
    matchedRangeSubstring = greaterMatch[0];
    rangeFoundInText = true;
  }

  // 2. Extract measured value:
  // Clean test aliases and names to isolate candidate values
  let textWithoutName = text;
  for (const alias of testDef.aliases) {
    textWithoutName = textWithoutName.replace(new RegExp(`\\b${alias.replace('/', '\\/')}\\b`, 'gi'), ' ');
  }

  // Remove test names like "Vitamin D3", "T3", "T4" numbers so they aren't parsed as measured values
  textWithoutName = textWithoutName.replace(/\b(?:D3|B12|T3|T4|x10\^3)\b/gi, ' ');

  // Remove the range substring
  if (matchedRangeSubstring) {
    textWithoutName = textWithoutName.replace(matchedRangeSubstring, ' ');
  }

  // Extract units if present
  const unitMatch = text.match(/(?:g\/dL|mg\/dL|million\/mcL|cells\/mcL|x10\^3\/mcL|\/uL|\/cumm|%|U\/L|uIU\/mL|ng\/mL|pg\/mL|mmol\/L|mEq\/L)/i);
  const unit = unitMatch ? unitMatch[0] : testDef.defaultUnit;

  // Extract candidate numbers
  // Matches floats and integers
  const numberMatches = textWithoutName.match(/(?:\b|\s)(\d+(?:\.\d+)?)(?:\b|\s|$)/g);
  if (!numberMatches || numberMatches.length === 0) {
    return null;
  }

  const candidateNumbers = numberMatches
    .map(n => parseFloat(n.trim()))
    .filter(n => !isNaN(n) && n >= 0);

  if (candidateNumbers.length === 0) return null;

  // The measured value is usually the first number before the reference range
  const measuredValue = candidateNumbers[0];

  return classifyTest(testDef, measuredValue, refMin, refMax, unit, gender);
}

/**
 * Generate overall report summary, score, and recommendations
 */
export function generateReportSummary(tests) {
  const totalTests = tests.length;
  if (totalTests === 0) {
    return {
      totalTests: 0,
      normalCount: 0,
      abnormalCount: 0,
      highCount: 0,
      lowCount: 0,
      healthScore: 100,
      keyFindings: ['No laboratory parameters detected.'],
      recommendations: ['Ensure the uploaded file is clearly legible and contains standard laboratory test tables.']
    };
  }

  let normalCount = 0;
  let highCount = 0;
  let lowCount = 0;
  const keyFindings = [];
  const recommendations = [];

  for (const t of tests) {
    if (t.status === 'NORMAL') {
      normalCount++;
    } else if (t.status === 'ABOVE_NORMAL') {
      highCount++;
      keyFindings.push(`${t.name} is elevated at ${t.value} ${t.unit} (Normal: ${t.referenceString}).`);
    } else if (t.status === 'BELOW_NORMAL') {
      lowCount++;
      keyFindings.push(`${t.name} is below normal at ${t.value} ${t.unit} (Normal: ${t.referenceString}).`);
    }
  }

  const abnormalCount = highCount + lowCount;
  // Calculate health index score (0-100)
  const healthScore = Math.max(20, Math.round(100 - (abnormalCount / totalTests) * 70));

  if (abnormalCount === 0) {
    keyFindings.push('All analyzed clinical parameters are within their designated normal reference ranges.');
    recommendations.push('Maintain a healthy lifestyle, balanced nutrition, and regular annual preventative health checkups.');
  } else {
    // Generate tailored recommendations
    const testIds = tests.filter(t => t.status !== 'NORMAL').map(t => t.testId);

    if (testIds.includes('fasting_blood_sugar') || testIds.includes('hba1c') || testIds.includes('postprandial_blood_sugar')) {
      recommendations.push('Blood glucose parameters show fluctuations. Consult a physician or endocrinologist; consider dietary carbohydrate moderation and regular physical activity.');
    }
    if (testIds.includes('total_cholesterol') || testIds.includes('ldl_cholesterol') || testIds.includes('triglycerides')) {
      recommendations.push('Lipid levels are elevated. Prioritize cardiovascular health: reduce trans fats and saturated lipids, increase fiber intake, and schedule a cardiac risk review.');
    }
    if (testIds.includes('hemoglobin') || testIds.includes('rbc')) {
      recommendations.push('Red blood cell / Hemoglobin levels are outside standard bounds. Discuss potential iron or nutritional supplementation with your healthcare provider.');
    }
    if (testIds.includes('sgpt_alt') || testIds.includes('sgot_ast') || testIds.includes('total_bilirubin')) {
      recommendations.push('Liver enzyme activity is elevated. Avoid hepatotoxic substances, maintain hydration, and consult a gastroenterologist or physician.');
    }
    if (testIds.includes('serum_creatinine') || testIds.includes('blood_urea_nitrogen') || testIds.includes('uric_acid')) {
      recommendations.push('Kidney markers show variance. Maintain adequate daily hydration and consult a nephrologist for clinical evaluation.');
    }

    recommendations.push('Schedule a follow-up consultation with your doctor to review these findings in the context of your complete clinical history.');
  }

  return {
    totalTests,
    normalCount,
    abnormalCount,
    highCount,
    lowCount,
    healthScore,
    keyFindings,
    recommendations
  };
}
