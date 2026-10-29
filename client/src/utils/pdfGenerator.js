import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates and downloads a clean, branded Clinical Laboratory Test Report PDF
 */
export function generateReportPDF(report) {
  if (!report) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const {
    patientName = 'Patient',
    patientAge = 'N/A',
    patientGender = 'Unspecified',
    reportDate = new Date().toISOString().split('T')[0],
    labName = 'Clinical Diagnostic Laboratory',
    tests = [],
    summary = {}
  } = report;

  // --- Header ---
  doc.setFillColor(15, 118, 110); // Deep Teal (#0f766e)
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MEDISCAN LABORATORY REPORT ANALYZER', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Automated Optical Character Recognition & Clinical Evaluation Summary', 14, 19);

  // --- Patient Demographics Card ---
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(14, 28, 182, 24, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Patient Name:', 18, 35);
  doc.text('Age / Gender:', 18, 41);
  doc.text('Report Date:', 18, 47);

  doc.setFont('helvetica', 'normal');
  doc.text(String(patientName), 46, 35);
  doc.text(`${patientAge || 'N/A'} Yrs  /  ${patientGender || 'Unspecified'}`, 46, 41);
  doc.text(String(reportDate), 46, 47);

  doc.setFont('helvetica', 'bold');
  doc.text('Diagnostic Facility:', 110, 35);
  doc.text('Wellness Score:', 110, 41);
  doc.text('Parameters Analyzed:', 110, 47);

  doc.setFont('helvetica', 'normal');
  doc.text(String(labName), 146, 35);

  const healthScore = summary.healthScore ?? 85;
  if (healthScore >= 80) {
    doc.setTextColor(16, 185, 129); // Green
  } else if (healthScore >= 60) {
    doc.setTextColor(217, 119, 6); // Amber
  } else {
    doc.setTextColor(225, 29, 72); // Red
  }
  doc.setFont('helvetica', 'bold');
  doc.text(`${healthScore} / 100`, 146, 41);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  const normalCount = summary.normalCount ?? tests.filter(t => t.status === 'NORMAL').length;
  const abnormalCount = summary.abnormalCount ?? tests.filter(t => t.status !== 'NORMAL').length;
  doc.text(`${tests.length} Total (${normalCount} Normal, ${abnormalCount} Abnormal)`, 146, 47);

  // --- Observations & Recommendations Box ---
  let startY = 56;
  if (summary.keyFindings && summary.keyFindings.length > 0) {
    doc.setFillColor(254, 242, 242); // Rose-50
    doc.setDrawColor(254, 205, 211); // Rose-200
    doc.roundedRect(14, startY, 182, 14, 2, 2, 'FD');

    doc.setTextColor(190, 18, 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Key Observations:', 18, startY + 5);

    doc.setFont('helvetica', 'normal');
    const findingStr = summary.keyFindings.slice(0, 2).join('; ');
    doc.text(doc.splitTextToSize(findingStr, 172), 18, startY + 10);
    startY += 18;
  }

  // --- Tests Table ---
  const tableData = tests.map(t => {
    let statusLabel = 'NORMAL';
    if (t.status === 'ABOVE_NORMAL') statusLabel = 'HIGH ▲';
    if (t.status === 'BELOW_NORMAL') statusLabel = 'LOW ▼';

    return [
      t.name,
      t.category || 'General',
      `${t.value} ${t.unit || ''}`.trim(),
      t.referenceString || `${t.referenceMin} - ${t.referenceMax} ${t.unit || ''}`,
      statusLabel,
      doc.splitTextToSize(t.interpretation || '', 45)
    ];
  });

  doc.autoTable({
    startY: startY,
    head: [['Test Parameter', 'Panel', 'Measured Value', 'Reference Range', 'Flag', 'Clinical Interpretation']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 30, textColor: [100, 116, 139] },
      2: { cellWidth: 26, fontStyle: 'bold' },
      3: { cellWidth: 28 },
      4: { cellWidth: 20, fontStyle: 'bold' },
      5: { cellWidth: 38, fontSize: 7.5, textColor: [71, 85, 105] }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 4) {
        const text = String(data.cell.raw);
        if (text.includes('HIGH')) {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fillColor = [255, 241, 242];
        } else if (text.includes('LOW')) {
          data.cell.styles.textColor = [2, 132, 199];
          data.cell.styles.fillColor = [240, 249, 255];
        } else {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fillColor = [236, 253, 245];
        }
      }
    },
    margin: { left: 14, right: 14 }
  });

  // --- Medical Disclaimer Footer ---
  const finalY = doc.lastAutoTable.finalY + 8;
  const pageHeight = doc.internal.pageSize.height;

  let disclaimerY = finalY;
  if (disclaimerY + 20 > pageHeight) {
    doc.addPage();
    disclaimerY = 20;
  }

  doc.setFillColor(254, 243, 199); // Amber-50
  doc.setDrawColor(251, 191, 36); // Amber-400
  doc.roundedRect(14, disclaimerY, 182, 16, 1.5, 1.5, 'FD');

  doc.setTextColor(146, 64, 14); // Amber-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('IMPORTANT MEDICAL & REGULATORY NOTICE:', 18, disclaimerY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const disclaimerText = 'The Laboratory Test Report Analyzer is an educational support tool. It does not constitute medical diagnosis, clinical evaluation, or treatment prescriptions. All results must be evaluated by a licensed physician in the context of the patient\'s complete clinical history.';
  doc.text(doc.splitTextToSize(disclaimerText, 174), 18, disclaimerY + 9);

  // Download trigger
  const safeName = (patientName || 'Report').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Lab_Analysis_${safeName}_${reportDate}.pdf`);
}
