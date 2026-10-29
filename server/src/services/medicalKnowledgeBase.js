/**
 * Medical Knowledge Base for Laboratory Test Analyzer
 * Contains reference ranges, units, aliases, clinical interpretations, and patient-friendly guidance.
 * Note: Educational and decision-support reference; does not replace professional medical advice.
 */

export const MEDICAL_TESTS = [
  // ================= COMPLETE BLOOD COUNT (CBC) =================
  {
    id: 'hemoglobin',
    name: 'Hemoglobin (Hb)',
    category: 'Complete Blood Count (CBC)',
    aliases: ['hemoglobin', 'hb', 'hgb', 'haemoglobin'],
    defaultUnit: 'g/dL',
    ranges: {
      male: { min: 13.5, max: 17.5 },
      female: { min: 12.0, max: 15.5 },
      general: { min: 12.0, max: 17.5 }
    },
    interpretation: {
      low: 'Low hemoglobin indicates anemia. Common causes include iron deficiency, vitamin B12 deficiency, or blood loss. May cause fatigue, paleness, or dizziness.',
      high: 'High hemoglobin (polycythemia) may result from dehydration, smoking, high altitude, or chronic lung conditions.',
      normal: 'Hemoglobin is within optimal range, indicating healthy oxygen-carrying capacity.'
    }
  },
  {
    id: 'wbc',
    name: 'Total White Blood Cell Count (WBC)',
    category: 'Complete Blood Count (CBC)',
    aliases: ['wbc', 'wbc count', 'white blood cells', 'total leukocyte count', 'tlc'],
    defaultUnit: 'cells/mcL',
    ranges: {
      general: { min: 4000, max: 11000 }
    },
    interpretation: {
      low: 'Leukopenia (low WBC) indicates weakened immune response, viral infections, or bone marrow issues.',
      high: 'Leukocytosis (high WBC) frequently signifies an active bacterial/viral infection, systemic inflammation, or physical stress.',
      normal: 'White blood cell count is normal, indicating an active and balanced immune system.'
    }
  },
  {
    id: 'rbc',
    name: 'Red Blood Cell Count (RBC)',
    category: 'Complete Blood Count (CBC)',
    aliases: ['rbc', 'rbc count', 'red blood cells', 'erythrocyte count'],
    defaultUnit: 'million/mcL',
    ranges: {
      male: { min: 4.5, max: 5.9 },
      female: { min: 4.1, max: 5.1 },
      general: { min: 4.1, max: 5.9 }
    },
    interpretation: {
      low: 'Low RBC count suggests anemia or blood loss, reducing oxygen delivery to body tissues.',
      high: 'Elevated RBC count can stem from dehydration, sleep apnea, heart disease, or hypoxia.',
      normal: 'Red blood cell count is within expected healthy limits.'
    }
  },
  {
    id: 'platelets',
    name: 'Platelet Count',
    category: 'Complete Blood Count (CBC)',
    aliases: ['platelets', 'platelet count', 'plt', 'thrombocyte count'],
    defaultUnit: 'x10^3/mcL',
    ranges: {
      general: { min: 150000, max: 450000 }
    },
    interpretation: {
      low: 'Thrombocytopenia (low platelets) elevates risk of bruising or bleeding. May be caused by viral infections (like Dengue), medication, or autoimmune conditions.',
      high: 'Thrombocytosis (high platelets) can be reactive to inflammation, iron deficiency, or bone marrow disorders.',
      normal: 'Platelet count is optimal for healthy blood clotting and wound healing.'
    }
  },
  {
    id: 'hematocrit',
    name: 'Hematocrit (PCV)',
    category: 'Complete Blood Count (CBC)',
    aliases: ['hematocrit', 'pcv', 'packed cell volume', 'hct'],
    defaultUnit: '%',
    ranges: {
      male: { min: 38.8, max: 50.0 },
      female: { min: 34.9, max: 44.5 },
      general: { min: 35.0, max: 50.0 }
    },
    interpretation: {
      low: 'Low hematocrit reflects a lower proportion of red blood cells, indicating anemia.',
      high: 'Elevated hematocrit suggests dehydration or overproduction of red blood cells.',
      normal: 'Hematocrit level is balanced with plasma volume.'
    }
  },

  // ================= BLOOD SUGAR & DIABETES =================
  {
    id: 'fasting_blood_sugar',
    name: 'Fasting Blood Glucose',
    category: 'Blood Sugar & Diabetes',
    aliases: ['fasting blood sugar', 'fbs', 'fasting glucose', 'fasting blood glucose', 'glucose fasting'],
    defaultUnit: 'mg/dL',
    ranges: {
      general: { min: 70, max: 99 }
    },
    interpretation: {
      low: 'Hypoglycemia (low blood sugar) may cause shakiness, sweating, lightheadedness, or confusion.',
      high: 'Elevated fasting glucose (100-125 mg/dL indicates prediabetes; ≥126 mg/dL points toward diabetes). Requires medical evaluation.',
      normal: 'Fasting glucose is in the normal non-diabetic range.'
    }
  },
  {
    id: 'postprandial_blood_sugar',
    name: 'Postprandial Blood Glucose (PPBS)',
    category: 'Blood Sugar & Diabetes',
    aliases: ['postprandial blood sugar', 'ppbs', 'post prandial glucose', 'pp glucose', '2 hr post glucose'],
    defaultUnit: 'mg/dL',
    ranges: {
      general: { min: 70, max: 140 }
    },
    interpretation: {
      low: 'Post-meal reactive hypoglycemia or prolonged fasting effects.',
      high: 'Elevated postprandial glucose (140-199 mg/dL indicates impaired glucose tolerance; ≥200 mg/dL suggests diabetes).',
      normal: 'Post-meal glucose processing is functioning properly.'
    }
  },
  {
    id: 'hba1c',
    name: 'Glycated Hemoglobin (HbA1c)',
    category: 'Blood Sugar & Diabetes',
    aliases: ['hba1c', 'glycated hemoglobin', 'a1c', 'glycosylated hemoglobin'],
    defaultUnit: '%',
    ranges: {
      general: { min: 4.0, max: 5.6 }
    },
    interpretation: {
      low: 'Low HbA1c is rare; can be related to hemolytic anemia or recent blood loss.',
      high: '5.7% - 6.4% indicates prediabetes; 6.5% or above indicates diabetes mellitus. Reflects average 3-month blood sugar control.',
      normal: 'HbA1c shows excellent average 3-month glycemic control.'
    }
  },

  // ================= LIPID PROFILE =================
  {
    id: 'total_cholesterol',
    name: 'Total Cholesterol',
    category: 'Lipid / Cholesterol Profile',
    aliases: ['total cholesterol', 'cholesterol total', 'cholesterol', 'serum cholesterol'],
    defaultUnit: 'mg/dL',
    ranges: {
      general: { min: 125, max: 200 }
    },
    interpretation: {
      low: 'Very low cholesterol is uncommon but can be linked to malnutrition or hyperthyroidism.',
      high: 'Hypercholesterolemia (>200 mg/dL) elevates cardiovascular risk, atherosclerosis, and heart disease likelihood.',
      normal: 'Total cholesterol is within healthy heart guidelines.'
    }
  },
  {
    id: 'triglycerides',
    name: 'Triglycerides',
    category: 'Lipid / Cholesterol Profile',
    aliases: ['triglycerides', 'serum triglycerides', 'tg', 'triglyceride'],
    defaultUnit: 'mg/dL',
    ranges: {
      general: { min: 40, max: 150 }
    },
    interpretation: {
      low: 'Low triglycerides generally do not pose health concerns.',
      high: 'Elevated triglycerides (>150 mg/dL) increase risk of arterial hardening, metabolic syndrome, and pancreatitis if very high.',
      normal: 'Triglyceride levels are within the normal heart-healthy bracket.'
    }
  },
  {
    id: 'hdl_cholesterol',
    name: 'HDL Cholesterol (Good)',
    category: 'Lipid / Cholesterol Profile',
    aliases: ['hdl', 'hdl cholesterol', 'high density lipoprotein', 'good cholesterol'],
    defaultUnit: 'mg/dL',
    ranges: {
      male: { min: 40, max: 90 },
      female: { min: 50, max: 90 },
      general: { min: 40, max: 90 }
    },
    interpretation: {
      low: 'Low HDL (<40 mg/dL in men, <50 mg/dL in women) reduces cardio-protection and increases heart risk.',
      high: 'High HDL (>60 mg/dL) is protective against coronary heart disease.',
      normal: 'Optimal level of protective high-density lipoprotein.'
    }
  },
  {
    id: 'ldl_cholesterol',
    name: 'LDL Cholesterol (Bad)',
    category: 'Lipid / Cholesterol Profile',
    aliases: ['ldl', 'ldl cholesterol', 'low density lipoprotein', 'bad cholesterol'],
    defaultUnit: 'mg/dL',
    ranges: {
      general: { min: 50, max: 100 }
    },
    interpretation: {
      low: 'Low LDL is generally cardio-protective.',
      high: 'High LDL (>100 mg/dL) causes plaque accumulation in arterial walls, increasing heart attack and stroke risk.',
      normal: 'LDL cholesterol is within the desirable heart-safe target.'
    }
  },

  // ================= LIVER FUNCTION TESTS (LFT) =================
  {
    id: 'sgpt_alt',
    name: 'SGPT / ALT (Alanine Aminotransferase)',
    category: 'Liver Function Test (LFT)',
    aliases: ['sgpt', 'alt', 'alanine aminotransferase', 'alanine transaminase', 'sgpt/alt'],
    defaultUnit: 'U/L',
    ranges: {
      male: { min: 7, max: 55 },
      female: { min: 7, max: 45 },
      general: { min: 7, max: 55 }
    },
    interpretation: {
      low: 'Low ALT is normal and indicates absence of acute hepatocellular injury.',
      high: 'Elevated ALT indicates liver cell inflammation, fatty liver disease, viral hepatitis, or medication-induced stress.',
      normal: 'Liver enzyme ALT is within healthy baseline limits.'
    }
  },
  {
    id: 'sgot_ast',
    name: 'SGOT / AST (Aspartate Aminotransferase)',
    category: 'Liver Function Test (LFT)',
    aliases: ['sgot', 'ast', 'aspartate aminotransferase', 'aspartate transaminase', 'sgot/ast'],
    defaultUnit: 'U/L',
    ranges: {
      general: { min: 8, max: 48 }
    },
    interpretation: {
      low: 'Low AST is expected and healthy.',
      high: 'Elevated AST suggests liver, heart, or skeletal muscle stress or inflammation.',
      normal: 'AST enzyme level is healthy and stable.'
    }
  },
  {
    id: 'total_bilirubin',
    name: 'Total Bilirubin',
    category: 'Liver Function Test (LFT)',
    aliases: ['total bilirubin', 'bilirubin total', 'serum bilirubin', 't bilirubin'],
    defaultUnit: 'mg/dL',
    ranges: {
      general: { min: 0.2, max: 1.2 }
    },
    interpretation: {
      low: 'Low bilirubin levels are clinically unremarkable.',
      high: 'Elevated bilirubin can cause jaundice (yellowing of skin/eyes), indicating biliary obstruction, liver dysfunction, or hemolysis.',
      normal: 'Bilirubin breakdown and clearance are functioning normally.'
    }
  },
  {
    id: 'serum_albumin',
    name: 'Serum Albumin',
    category: 'Liver Function Test (LFT)',
    aliases: ['albumin', 'serum albumin', 'alb'],
    defaultUnit: 'g/dL',
    ranges: {
      general: { min: 3.5, max: 5.5 }
    },
    interpretation: {
      low: 'Hypoalbuminemia may suggest chronic liver disease, kidney protein loss (nephrotic syndrome), or poor nutritional intake.',
      high: 'High albumin is typically caused by dehydration.',
      normal: 'Albumin synthesis and serum protein balance are healthy.'
    }
  },

  // ================= KIDNEY FUNCTION TESTS (KFT) =================
  {
    id: 'serum_creatinine',
    name: 'Serum Creatinine',
    category: 'Kidney Function Test (KFT)',
    aliases: ['creatinine', 'serum creatinine', 'creat', 's creatinine'],
    defaultUnit: 'mg/dL',
    ranges: {
      male: { min: 0.7, max: 1.3 },
      female: { min: 0.5, max: 1.1 },
      general: { min: 0.6, max: 1.2 }
    },
    interpretation: {
      low: 'Low creatinine may indicate reduced muscle mass, severe liver disease, or malnutrition.',
      high: 'Elevated creatinine is a key indicator of impaired renal clearance or reduced glomerular filtration rate (GFR).',
      normal: 'Renal filtration and creatinine excretion are optimal.'
    }
  },
  {
    id: 'blood_urea_nitrogen',
    name: 'Blood Urea Nitrogen (BUN)',
    category: 'Kidney Function Test (KFT)',
    aliases: ['blood urea nitrogen', 'bun', 'urea', 'blood urea'],
    defaultUnit: 'mg/dL',
    ranges: {
      general: { min: 7, max: 20 }
    },
    interpretation: {
      low: 'Low BUN may reflect high hydration, low protein diet, or severe liver disease.',
      high: 'Elevated BUN can point to reduced renal function, dehydration, gastrointestinal bleeding, or high protein intake.',
      normal: 'BUN is within normal physiological limits.'
    }
  },
  {
    id: 'uric_acid',
    name: 'Uric Acid',
    category: 'Kidney Function Test (KFT)',
    aliases: ['uric acid', 'serum uric acid', 'urate'],
    defaultUnit: 'mg/dL',
    ranges: {
      male: { min: 3.5, max: 7.2 },
      female: { min: 2.4, max: 6.0 },
      general: { min: 3.0, max: 7.0 }
    },
    interpretation: {
      low: 'Low uric acid is uncommon and usually benign.',
      high: 'Hyperuricemia increases risk of gout (painful joint inflammation) and kidney stones.',
      normal: 'Uric acid levels are balanced.'
    }
  },

  // ================= THYROID & VITAMINS =================
  {
    id: 'tsh',
    name: 'Thyroid Stimulating Hormone (TSH)',
    category: 'Thyroid & Endocrine',
    aliases: ['tsh', 'thyroid stimulating hormone', 'ultra tsh'],
    defaultUnit: 'uIU/mL',
    ranges: {
      general: { min: 0.4, max: 4.5 }
    },
    interpretation: {
      low: 'Low TSH suggests hyperthyroidism (overactive thyroid producing excess T3/T4).',
      high: 'Elevated TSH indicates hypothyroidism (underactive thyroid requiring higher stimulation).',
      normal: 'Pituitary-thyroid regulatory feedback loop is healthy.'
    }
  },
  {
    id: 'vitamin_d',
    name: 'Vitamin D (25-OH)',
    category: 'Vitamins & Minerals',
    aliases: ['vitamin d', 'vit d', '25-hydroxy vitamin d', 'vitamin d3'],
    defaultUnit: 'ng/mL',
    ranges: {
      general: { min: 30, max: 100 }
    },
    interpretation: {
      low: 'Deficiency (<20 ng/mL) or insufficiency (20-29 ng/mL) affects bone density, calcium absorption, and immune function.',
      high: 'Excessive Vitamin D (>100 ng/mL) from over-supplementation can lead to hypercalcemia.',
      normal: 'Vitamin D status is sufficient for bone health and immune support.'
    }
  },
  {
    id: 'vitamin_b12',
    name: 'Vitamin B12 (Cobalamin)',
    category: 'Vitamins & Minerals',
    aliases: ['vitamin b12', 'vit b12', 'cyanocobalamin', 'b12'],
    defaultUnit: 'pg/mL',
    ranges: {
      general: { min: 200, max: 900 }
    },
    interpretation: {
      low: 'Low B12 can lead to megaloblastic anemia, peripheral neuropathy (tingling in hands/feet), fatigue, and memory fog.',
      high: 'Elevated B12 is typically due to supplementation or liver conditions.',
      normal: 'Vitamin B12 level is sufficient for nerve function and red blood cell production.'
    }
  }
];

/**
 * Match a raw test name against known medical dictionary
 */
export function matchTestDefinition(rawName) {
  if (!rawName) return null;
  const cleaned = rawName.toLowerCase().replace(/[^a-z0-9\s/]/g, ' ').replace(/\s+/g, ' ').trim();

  for (const item of MEDICAL_TESTS) {
    for (const alias of item.aliases) {
      if (cleaned === alias || cleaned.includes(alias) || alias.includes(cleaned)) {
        return item;
      }
    }
  }
  return null;
}
