import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export default function MedicalDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 flex items-start space-x-2 text-amber-900 text-xs leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold">Medical Notice:</span> For educational and reference assistance only. This system does not substitute professional medical diagnosis, clinical evaluation, or treatment advice. Always consult a qualified medical professional.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="text-sm">
          <h4 className="font-bold text-amber-900">Clinical Reference & Informational Disclaimer</h4>
          <p className="text-amber-800 mt-1 leading-relaxed text-xs sm:text-sm">
            The <strong>Laboratory Test Report Analyzer</strong> is developed to assist users in interpreting and understanding laboratory values, flags, and reference thresholds. <strong>It is not a replacement for professional medical advice, clinical diagnosis, or therapeutic decision-making.</strong> Lab tests must always be interpreted by a licensed doctor or healthcare specialist in the context of the patient's full medical history and physical condition.
          </p>
        </div>
      </div>
    </div>
  );
}
