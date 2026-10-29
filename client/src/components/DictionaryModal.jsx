import React, { useState } from 'react';
import { BookOpen, Search, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import MedicalDisclaimer from './MedicalDisclaimer.jsx';

const REFERENCE_GUIDE = [
  {
    category: 'Complete Blood Count (CBC)',
    tests: [
      {
        name: 'Hemoglobin (Hb)',
        unit: 'g/dL',
        normalRange: '13.5 - 17.5 (Men) | 12.0 - 15.5 (Women)',
        purpose: 'Carries oxygen from lungs to rest of the body.',
        highMeaning: 'Polycythemia, dehydration, hypoxia, chronic smoking.',
        lowMeaning: 'Iron-deficiency anemia, blood loss, chronic disease.'
      },
      {
        name: 'Total White Blood Cell Count (WBC)',
        unit: 'cells/mcL',
        normalRange: '4,000 - 11,000',
        purpose: 'Primary defense against bacterial, viral, and fungal infections.',
        highMeaning: 'Infection, inflammation, acute stress, leukemia.',
        lowMeaning: 'Immunodeficiency, viral illness (e.g. Dengue), bone marrow suppression.'
      },
      {
        name: 'Platelet Count',
        unit: 'cells/mcL',
        normalRange: '150,000 - 450,000',
        purpose: 'Essential for blood clotting and stopping bleedings.',
        highMeaning: 'Thrombocytosis, systemic inflammation, reactive states.',
        lowMeaning: 'Thrombocytopenia, bleeding tendencies, viral infections.'
      }
    ]
  },
  {
    category: 'Blood Sugar & Diabetes Panel',
    tests: [
      {
        name: 'Fasting Blood Glucose (FBS)',
        unit: 'mg/dL',
        normalRange: '70 - 99 mg/dL (Normal) | 100-125 (Prediabetes) | >= 126 (Diabetes)',
        purpose: 'Measures baseline circulating glucose after an 8-12 hour fast.',
        highMeaning: 'Impaired fasting glucose, diabetes mellitus, steroid therapy.',
        lowMeaning: 'Hypoglycemia, excessive insulin or medication.'
      },
      {
        name: 'HbA1c (Glycated Hemoglobin)',
        unit: '%',
        normalRange: '4.0 - 5.6% (Normal) | 5.7 - 6.4% (Prediabetes) | >= 6.5% (Diabetes)',
        purpose: 'Reflects average blood sugar control over the past 2 to 3 months.',
        highMeaning: 'Poor long-term glycemic control, diabetes diagnosis.',
        lowMeaning: 'Hemolytic anemia, recent acute blood loss.'
      }
    ]
  },
  {
    category: 'Lipid / Cardiovascular Profile',
    tests: [
      {
        name: 'Total Cholesterol',
        unit: 'mg/dL',
        normalRange: '125 - 200 mg/dL',
        purpose: 'Essential lipid for cell membranes and hormone synthesis.',
        highMeaning: 'Hypercholesterolemia, atherosclerosis, coronary heart risk.',
        lowMeaning: 'Malnutrition, liver disease, severe hyperthyroidism.'
      },
      {
        name: 'LDL Cholesterol (Bad)',
        unit: 'mg/dL',
        normalRange: '< 100 mg/dL (Desirable) | > 160 (High)',
        purpose: 'Transports cholesterol into tissues; accumulates in arterial walls.',
        highMeaning: 'Elevated arterial plaque risk, stroke, coronary artery disease.',
        lowMeaning: 'Cardioprotective status.'
      },
      {
        name: 'HDL Cholesterol (Good)',
        unit: 'mg/dL',
        normalRange: '> 40 (Men) | > 50 (Women)',
        purpose: 'Scavenges excess cholesterol from arteries back to liver.',
        highMeaning: 'Cardioprotective effect against ischemic heart disease.',
        lowMeaning: 'Elevated cardiovascular risk profile.'
      },
      {
        name: 'Triglycerides',
        unit: 'mg/dL',
        normalRange: '< 150 mg/dL',
        purpose: 'Main form of stored body fat and energy storage.',
        highMeaning: 'Metabolic syndrome, high carbohydrate diet, pancreatitis if severe.',
        lowMeaning: 'Clinically safe, low-fat diet.'
      }
    ]
  },
  {
    category: 'Liver Function Tests (LFT)',
    tests: [
      {
        name: 'SGPT / ALT (Alanine Transaminase)',
        unit: 'U/L',
        normalRange: '7 - 55 U/L',
        purpose: 'Specific enzyme located primarily inside liver cells.',
        highMeaning: 'Hepatocellular damage, fatty liver (NAFLD), hepatitis, alcohol toxicity.',
        lowMeaning: 'Healthy normal liver tissue.'
      },
      {
        name: 'Total Bilirubin',
        unit: 'mg/dL',
        normalRange: '0.2 - 1.2 mg/dL',
        purpose: 'Byproduct of red blood cell hemoglobin breakdown.',
        highMeaning: 'Jaundice, biliary tract obstruction, hemolysis, liver inflammation.',
        lowMeaning: 'Clinically normal.'
      }
    ]
  },
  {
    category: 'Kidney Function Tests (KFT)',
    tests: [
      {
        name: 'Serum Creatinine',
        unit: 'mg/dL',
        normalRange: '0.7 - 1.3 (Men) | 0.5 - 1.1 (Women)',
        purpose: 'Muscle waste metabolite cleared almost exclusively by kidney glomeruli.',
        highMeaning: 'Decreased renal filtration (GFR), acute or chronic kidney disease.',
        lowMeaning: 'Low muscle mass, pregnancy, malnutrition.'
      },
      {
        name: 'Blood Urea Nitrogen (BUN)',
        unit: 'mg/dL',
        normalRange: '7 - 20 mg/dL',
        purpose: 'Nitrogenous waste product from dietary and cellular protein breakdown.',
        highMeaning: 'Dehydration, reduced renal excretion, high protein consumption.',
        lowMeaning: 'Low protein intake, severe liver insufficiency.'
      }
    ]
  }
];

export default function DictionaryModal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-6">
      <MedicalDisclaimer />

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900">Clinical Reference Range Guide</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard laboratory thresholds, test purposes, and abnormal indicators for clinical understanding.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search test name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Guide Panels */}
      <div className="space-y-6">
        {REFERENCE_GUIDE.map((panel, pIdx) => {
          const matchingTests = panel.tests.filter(
            t =>
              t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              panel.category.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (matchingTests.length === 0) return null;

          return (
            <div key={pIdx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-teal-800 border-b border-slate-100 pb-3 mb-4">
                {panel.category}
              </h3>

              <div className="space-y-4">
                {matchingTests.map((t, tIdx) => {
                  const cardKey = `${pIdx}-${tIdx}`;
                  const isExpanded = expandedIndex === cardKey;

                  return (
                    <div
                      key={tIdx}
                      className="border border-slate-200 rounded-xl p-4 hover:border-teal-300 transition bg-slate-50/40"
                    >
                      <div
                        className="flex justify-between items-start cursor-pointer"
                        onClick={() => toggleExpand(cardKey)}
                      >
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                          <p className="text-xs text-teal-700 font-mono mt-0.5">
                            Reference Range: <strong>{t.normalRange} {t.unit}</strong>
                          </p>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 mt-2">{t.purpose}</p>

                      {isExpanded && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200 text-xs">
                          <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-3 text-rose-900">
                            <span className="font-bold block text-rose-800 mb-1">
                              When Level is High:
                            </span>
                            <p className="leading-relaxed">{t.highMeaning}</p>
                          </div>
                          <div className="bg-sky-50/70 border border-sky-200 rounded-lg p-3 text-sky-900">
                            <span className="font-bold block text-sky-800 mb-1">
                              When Level is Low:
                            </span>
                            <p className="leading-relaxed">{t.lowMeaning}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
