# Laboratory Test Report Analyzer (MERN Stack + OCR)

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://react.dev)
[![OCR Engine](https://img.shields.io/badge/OCR-Tesseract.js-blue.svg)](https://tesseract.projectnaptha.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An intelligent, software-based healthcare web application developed to simplify the process of analyzing, interpreting, and tracking laboratory test reports using **Optical Character Recognition (OCR)**, clinical parameter classification, and the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).

---

## 📄 Abstract & Scope

> **Abstract:** The *Laboratory Test Report Analyzer* is a software-based application developed to simplify the process of analyzing and understanding laboratory test reports. The system allows users to upload digital laboratory reports containing various medical test results such as blood count, blood sugar, cholesterol, liver function, and kidney function tests. The application uses Optical Character Recognition (OCR) to extract relevant information from uploaded reports, including test names, measured values, units, and reference ranges. The extracted values are processed and compared with their corresponding reference ranges to classify results as **normal**, **below normal**, or **above normal**. The analyzed information is presented through an interactive and user-friendly dashboard, allowing users to easily identify abnormal test parameters. The system also provides functionality to store reports and maintain a history of previous test results, enabling users to compare their results over time.
>
> *Disclaimer: The proposed application is intended to support users in understanding their laboratory reports and is not a replacement for professional medical diagnosis or advice.*

**Index Terms:** Healthcare application, laboratory test analysis, medical reports, MERN stack, MongoDB, Node.js, OCR, React.js, reference range, report analyzer.

---

## 🌟 Key Features

1. **Multi-Format Report Intake:**
   - Supports scanned and digital reports in **PNG, JPG, WebP**, and **PDF** formats.
   - Built-in drag-and-drop file upload zone.
   - Direct report text input tab with 1-click preset clinical panels.

2. **Automated OCR & Data Extraction:**
   - Integrated with **Tesseract OCR** and `pdf-parse` for automated text recognition.
   - Intelligent regex-based heuristic extractor parsing patient metadata (Name, Age, Gender, Date, Diagnostic Lab) and test matrices.

3. **Clinical Reference Range Classification:**
   - Compares measured clinical values against gender- and age-calibrated reference intervals:
     - 🟢 **NORMAL** (Within standard physiological range)
     - 🔴 **ABOVE_NORMAL (HIGH)** (Exceeds upper limit threshold)
     - 🔵 **BELOW_NORMAL (LOW)** (Falls below lower limit threshold)
   - Evaluates severity (Mild vs Critical) and auto-generates patient-friendly explanations in plain language.

4. **Supported Diagnostic Panels:**
   - **Complete Blood Count (CBC):** Hemoglobin, RBC, Total WBC, Platelets, Hematocrit (PCV).
   - **Blood Sugar & Diabetes:** Fasting Blood Glucose (FBS), Postprandial Glucose (PPBS), HbA1c.
   - **Lipid / Cholesterol Profile:** Total Cholesterol, Triglycerides, HDL (Good), LDL (Bad).
   - **Liver Function Tests (LFT):** SGPT / ALT, SGOT / AST, Total Bilirubin, Serum Albumin.
   - **Kidney Function Tests (KFT):** Serum Creatinine, Blood Urea Nitrogen (BUN), Uric Acid.
   - **Thyroid & Vitamins:** TSH, Vitamin D, Vitamin B12.

5. **Interactive Visual Dashboard:**
   - **Visual Range Bars:** Interactive linear gauges illustrating exactly where the patient's value lies relative to healthy boundaries.
   - **Summary Stat Cards:** Instant breakdown of Total Tests, Normal Parameters, Elevated, and Low levels.
   - **Wellness Index:** Weighted clinical health score (0–100%).
   - **Key Clinical Observations & Health Guidance:** Tailored lifestyle recommendations and follow-up consultation reminders.
   - **Search & Filtering:** Instant filtering by Panel (CBC, Lipid, Metabolic) and Status (Normal vs Abnormal).

6. **Longitudinal History & Trends Over Time:**
   - Stores all patient records in database.
   - Chronological line charts displaying biomarker changes across successive tests with shaded normal target zones.
   - Trajectory delta tracking (+/- change from prior tests).

7. **Dual-Mode Resilient Database:**
   - Standard **MongoDB** via Mongoose.
   - Built-in **resilient JSON local storage fallback** so the application works out-of-the-box even without a local MongoDB service running!

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│                   React.js Frontend                    │
│   (Vite, Tailwind CSS, Lucide Icons, Interactive SVGs) │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON / FormData)
┌───────────────────────────▼────────────────────────────┐
│                  Express & Node.js API                 │
│        (Multer File Uploads, Route Controllers)        │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
┌─────────────▼───────────────┐ ┌─────────▼──────────────┐
│       OCR & Data Engine     │ │   Persistence Layer    │
│  - Tesseract.js / pdf-parse │ │  - MongoDB (Mongoose)  │
│  - Regex Entity Extractor   │ │  - Resilient JSON DB   │
│  - Medical Knowledge Base   │ └────────────────────────┘
└─────────────────────────────┘
```

---

## 📁 Project Directory Structure

```
lab-report-analyzer/
├── client/                      # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Header navigation & quick controls
│   │   │   ├── MedicalDisclaimer.jsx    # IEEE-compliant clinical disclaimer
│   │   │   ├── UploadSection.jsx        # File upload & text preset selector
│   │   │   ├── ReportDashboard.jsx      # Core analysis dashboard with filters
│   │   │   ├── RangeVisualizer.jsx      # Visual reference gauge component
│   │   │   ├── HistoryView.jsx          # Archived patient reports list
│   │   │   ├── TrendsView.jsx           # Longitudinal time-series charts
│   │   │   └── DictionaryModal.jsx      # Reference range knowledge guide
│   │   ├── App.jsx                      # Main React application controller
│   │   ├── main.jsx                     # Vite entry point
│   │   └── index.css                    # Tailwind CSS definitions
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                      # Node.js Express backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # MongoDB / Dual-mode resilient database
│   │   ├── controllers/
│   │   │   └── reportController.js      # Upload, analyze, history, trends handlers
│   │   ├── models/
│   │   │   └── Report.js                # Mongoose schema and repository API
│   │   ├── routes/
│   │   │   └── reportRoutes.js          # REST endpoints
│   │   ├── services/
│   │   │   ├── medicalKnowledgeBase.js  # Clinical dictionary & normal thresholds
│   │   │   ├── ocrService.js            # Tesseract OCR & PDF text extraction
│   │   │   └── reportParser.js          # Entity parser & status classifier
│   │   └── server.js                    # Express app bootstrap
│   ├── test-analyzer.js                 # Automated end-to-end verification test
│   ├── .env                             # Port & DB configuration
│   └── package.json
│
├── samples/                     # Pre-built test files & real report images
│   ├── sample_hospital_lab_report.jpg   # Scanned sample medical lab report
│   └── sample_city_hospital_report.txt  # Ready-to-use raw clinical report text
│
├── run.bat                      # 1-Click Windows runner for Frontend + Backend
├── package.json                 # Root package scripts
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### 1. Launching with 1 Click (Windows)
Double-click `run.bat` in the project root folder. It will launch two command windows:
- Backend Server: `http://localhost:5000`
- Frontend UI: `http://localhost:3000`

### 2. Manual Startup via Terminal

```bash
# Terminal 1: Start Backend API
cd server
npm run dev

# Terminal 2: Start Frontend Client
cd client
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/reports/upload` | Uploads JPG/PNG/PDF file, runs OCR, parses and classifies parameters |
| `POST` | `/api/reports/analyze-text` | Analyzes raw pasted report text directly |
| `GET` | `/api/reports` | Returns list of all stored patient reports |
| `GET` | `/api/reports/:id` | Returns complete details of a specific report |
| `DELETE` | `/api/reports/:id` | Deletes a report record from the database |
| `GET` | `/api/reports/trends` | Returns aggregated time-series biomarker trends |
| `POST` | `/api/reports/seed` | Seeds database with realistic demonstration reports |
| `GET` | `/api/health` | Backend service health check |

---

## 🧪 Running the Verification Test Suite

To verify OCR parsing, reference range comparison, and storage functionality:

```bash
cd server
node test-analyzer.js
```

All 3 automated test suites will execute and validate clinical boundaries.

---

## ⚖️ Legal & Medical Notice

This software is designed as an educational and technical research tool for medical laboratory report interpretation. It does not provide medical diagnosis, clinical evaluation, or treatment prescriptions. Users must consult licensed physicians and healthcare professionals for medical advice.
