/**
 * Authentic Pre-loaded Thoracic Cases for Educational Evaluation.
 * Based on clinical benchmarks (NIH ChestX-ray14, CheXpert, RSNA Pneumonia).
 */
import { MedicalCase, PathologyClass } from '../types/medical';

// Generate authentic, high-fidelity chest radiograph SVG data URIs
function generateRadiographSvg(type: 'normal' | 'bacterial' | 'viral' | 'effusion' | 'atelectasis' | 'cardiomegaly'): string {
  const isCardiomegaly = type === 'cardiomegaly';
  const hasBacterial = type === 'bacterial';
  const hasViral = type === 'viral';
  const hasEffusion = type === 'effusion';
  const hasAtelectasis = type === 'atelectasis';

  // Heart width
  const heartRx = isCardiomegaly ? 135 : 95;
  const heartRy = isCardiomegaly ? 115 : 90;
  const heartCx = isCardiomegaly ? 275 : 285;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 650" width="600" height="650">
    <defs>
      <!-- Background & Chest Wall Gradients -->
      <radialGradient id="lungBg" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#0c1117" />
        <stop offset="70%" stop-color="#06090e" />
        <stop offset="100%" stop-color="#020406" />
      </radialGradient>

      <!-- Soft tissue / mediastinum density -->
      <linearGradient id="spineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1e293b" stop-opacity="0.2" />
        <stop offset="50%" stop-color="#cbd5e1" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#1e293b" stop-opacity="0.2" />
      </linearGradient>

      <!-- Rib bone gradient -->
      <linearGradient id="ribGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8" stop-opacity="0.4" />
        <stop offset="50%" stop-color="#f8fafc" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#64748b" stop-opacity="0.3" />
      </linearGradient>

      <!-- Air bronchogram & Consolidation density -->
      <radialGradient id="consolidationGrad" cx="45%" cy="50%" r="55%">
        <stop offset="0%" stop-color="#f1f5f9" stop-opacity="0.9" />
        <stop offset="40%" stop-color="#cbd5e1" stop-opacity="0.75" />
        <stop offset="80%" stop-color="#64748b" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#334155" stop-opacity="0" />
      </radialGradient>

      <!-- Pleural fluid meniscus gradient -->
      <linearGradient id="fluidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#e2e8f0" stop-opacity="0.1" />
        <stop offset="30%" stop-color="#f8fafc" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.95" />
      </linearGradient>

      <!-- Vascular markings filter -->
      <filter id="radiologicalNoise" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.5   0 0 0 0 0.5   0 0 0 0 0.5  0 0 0 0.12 0" />
        <feComposite in="SourceGraphic" in2="noise" operator="over" />
      </filter>
    </defs>

    <!-- Main Radiograph Canvas -->
    <rect width="600" height="650" fill="url(#lungBg)" />
    <rect width="600" height="650" filter="url(#radiologicalNoise)" fill="none" opacity="0.6" />

    <!-- Anatomical Orientation Marker -->
    <text x="35" y="48" font-family="'JetBrains Mono', monospace" font-size="22" font-weight="bold" fill="#64748b" opacity="0.8">R</text>
    <text x="540" y="48" font-family="'JetBrains Mono', monospace" font-size="22" font-weight="bold" fill="#64748b" opacity="0.8">L</text>
    <text x="35" y="625" font-family="'JetBrains Mono', monospace" font-size="12" fill="#475569">POSTEROANTERIOR (PA) UPRIGHT</text>

    <!-- Thoracic Cage Outline & Soft Tissues -->
    <path d="M 120 70 C 150 50, 450 50, 480 70 C 520 180, 530 400, 490 560 C 420 590, 180 590, 110 560 C 70 400, 80 180, 120 70 Z" 
          fill="#0f172a" stroke="#334155" stroke-width="2" opacity="0.5" />

    <!-- Spine / Vertebral Column (Thoracic T1 - T12) -->
    <rect x="290" y="60" width="20" height="520" fill="url(#spineGrad)" rx="2" />
    <!-- Trachea (Radiolucent dark column) -->
    <path d="M 296 60 L 296 220 M 304 60 L 304 220" stroke="#040608" stroke-width="6" stroke-linecap="round" />
    <!-- Carina Bifurcation -->
    <path d="M 298 220 L 270 260 M 302 220 L 330 255" stroke="#05070a" stroke-width="4" stroke-linecap="round" />

    <!-- Clavicles -->
    <path d="M 130 115 Q 210 135 285 140" stroke="url(#ribGrad)" stroke-width="12" fill="none" stroke-linecap="round" />
    <path d="M 470 115 Q 390 135 315 140" stroke="url(#ribGrad)" stroke-width="12" fill="none" stroke-linecap="round" />

    <!-- Bilateral Ribs (Posterior & Anterior Arcs) -->
    <!-- Right Ribs -->
    <path d="M 290 145 Q 160 170 120 220" stroke="url(#ribGrad)" stroke-width="7" fill="none" opacity="0.6" />
    <path d="M 290 180 Q 140 215 110 280" stroke="url(#ribGrad)" stroke-width="8" fill="none" opacity="0.65" />
    <path d="M 290 225 Q 130 265 105 340" stroke="url(#ribGrad)" stroke-width="8.5" fill="none" opacity="0.7" />
    <path d="M 290 275 Q 120 325 105 405" stroke="url(#ribGrad)" stroke-width="9" fill="none" opacity="0.65" />
    <path d="M 290 330 Q 115 390 110 470" stroke="url(#ribGrad)" stroke-width="9" fill="none" opacity="0.6" />
    <path d="M 290 390 Q 115 450 120 530" stroke="url(#ribGrad)" stroke-width="8" fill="none" opacity="0.5" />

    <!-- Left Ribs -->
    <path d="M 310 145 Q 440 170 480 220" stroke="url(#ribGrad)" stroke-width="7" fill="none" opacity="0.6" />
    <path d="M 310 180 Q 460 215 490 280" stroke="url(#ribGrad)" stroke-width="8" fill="none" opacity="0.65" />
    <path d="M 310 225 Q 470 265 495 340" stroke="url(#ribGrad)" stroke-width="8.5" fill="none" opacity="0.7" />
    <path d="M 310 275 Q 480 325 495 405" stroke="url(#ribGrad)" stroke-width="9" fill="none" opacity="0.65" />
    <path d="M 310 330 Q 485 390 490 470" stroke="url(#ribGrad)" stroke-width="9" fill="none" opacity="0.6" />
    <path d="M 310 390 Q 485 450 480 530" stroke="url(#ribGrad)" stroke-width="8" fill="none" opacity="0.5" />

    <!-- Diaphragms & Costophrenic Angles -->
    <!-- Right Hemidiaphragm (Normally 1-2cm higher than left) -->
    <path d="${hasAtelectasis ? 'M 105 520 Q 190 410 295 490' : 'M 105 540 Q 190 460 295 510'}" 
          fill="#1e293b" stroke="#f1f5f9" stroke-width="2.5" opacity="0.8" />
    <!-- Left Hemidiaphragm -->
    ${hasEffusion ? `
      <!-- Blunted Left Costophrenic Angle & Meniscus Sign -->
      <path d="M 495 420 Q 480 500 420 525 Q 360 540 305 520 L 495 545 Z" fill="url(#fluidGrad)" opacity="0.9" />
    ` : `
      <path d="M 495 545 Q 410 475 305 520" fill="#1e293b" stroke="#f1f5f9" stroke-width="2.5" opacity="0.8" />
    `}

    <!-- Cardiac Silhouette (Heart & Aortic Knob) -->
    <!-- Aortic Knob -->
    <path d="M 305 175 Q 345 170 345 205 Q 330 225 310 230" fill="#e2e8f0" opacity="0.65" />
    <!-- Cardiac Shadow -->
    <ellipse cx="${heartCx}" cy="390" rx="${heartRx}" ry="${heartRy}" fill="#e2e8f0" opacity="0.75" />
    <!-- Right Heart Border (Right Atrium) -->
    <path d="M 295 320 Q 250 360 295 450" stroke="#f8fafc" stroke-width="2" fill="none" opacity="0.7" />
    <!-- Left Heart Border (Left Ventricle) -->
    <path d="M 345 230 Q 370 310 415 420 Q 360 480 295 490" stroke="#f8fafc" stroke-width="2.5" fill="none" opacity="0.75" />

    <!-- Pulmonary Bronchovascular Markings (Hilar vessels) -->
    <path d="M 260 260 Q 210 280 180 340 M 260 270 Q 220 320 200 400" stroke="#cbd5e1" stroke-width="2.5" fill="none" opacity="0.45" />
    <path d="M 340 260 Q 390 280 420 340 M 340 270 Q 380 320 400 400" stroke="#cbd5e1" stroke-width="2.5" fill="none" opacity="0.45" />

    ${hasBacterial ? `
      <!-- Focal Lobar Consolidation in Right Middle & Lower Lobe -->
      <ellipse cx="205" cy="380" rx="68" ry="52" fill="url(#consolidationGrad)" opacity="0.95" />
      <!-- Air bronchograms branching within opacity -->
      <path d="M 230 350 L 195 385 M 205 375 L 180 405" stroke="#0a0f16" stroke-width="2" stroke-linecap="round" opacity="0.8" />
      <!-- Silhouette sign obliterating right heart border -->
      <path d="M 250 370 Q 235 390 245 420" stroke="#f1f5f9" stroke-width="3" fill="none" opacity="0.9" />
    ` : ''}

    ${hasViral ? `
      <!-- Bilateral Peripheral Ground-Glass Hazy Infiltrates -->
      <ellipse cx="170" cy="360" rx="50" ry="65" fill="url(#consolidationGrad)" opacity="0.6" />
      <ellipse cx="430" cy="370" rx="55" ry="70" fill="url(#consolidationGrad)" opacity="0.65" />
      <ellipse cx="180" cy="450" rx="40" ry="35" fill="url(#consolidationGrad)" opacity="0.5" />
      <ellipse cx="420" cy="460" rx="45" ry="40" fill="url(#consolidationGrad)" opacity="0.55" />
    ` : ''}

    ${hasAtelectasis ? `
      <!-- Right Upper Lobe Volume Loss / Golden S-Curve pattern -->
      <path d="M 290 140 Q 230 190 150 200 Q 200 160 290 140 Z" fill="url(#consolidationGrad)" opacity="0.85" />
      <!-- Elevated Right Hilum and Tracheal Deviation -->
      <path d="M 296 60 Q 290 130 286 210" stroke="#020406" stroke-width="6" stroke-linecap="round" />
    ` : ''}

    <!-- Gastric Air Bubble (Left upper quadrant under diaphragm) -->
    <ellipse cx="375" cy="545" rx="35" ry="16" fill="#030712" stroke="#475569" stroke-width="1.5" opacity="0.85" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_CASES: MedicalCase[] = [
  {
    id: 'case-rad-001',
    accessionNumber: 'ACC-2026-9041',
    title: 'Right Lobar Airspace Consolidation',
    patientPseudonym: 'PT-THORAX-4819',
    imageUrl: generateRadiographSvg('bacterial'),
    modality: 'DX',
    clinicalHistory: '58-year-old male presenting with 4-day productive cough with rust-colored sputum, fever (39.1°C), and localized right pleuritic chest pain. Leucocytosis (WBC 16.4 x 10^9/L).',
    radiologicalIndication: 'Suspected Community-Acquired Pneumonia (CAP). Rule out lobar consolidation.',
    dicom: {
      patientId: 'PT-THORAX-4819',
      patientAge: '58Y',
      patientSex: 'M',
      studyDate: '2026-10-24 09:14:22',
      modality: 'DX',
      bodyPartExamined: 'CHEST',
      viewPosition: 'PA',
      kvp: 120,
      exposureTimeMs: 12,
      windowCenter: 2048,
      windowWidth: 4096,
      pixelSpacingMm: 0.143,
    },
    aiPrediction: {
      primaryClass: 'Bacterial Pneumonia',
      confidence: 0.942,
      uncertaintyScore: 0.068,
      inferenceLatencyMs: 44.2,
      probabilities: {
        'Bacterial Pneumonia': 0.942,
        'Viral Pneumonia / COVID-19': 0.024,
        'Normal': 0.012,
        'Pleural Effusion': 0.014,
        'Atelectasis': 0.005,
        'Cardiomegaly': 0.003,
      },
      hotspots: [
        {
          cx: 0.34,
          cy: 0.58,
          rx: 0.16,
          ry: 0.14,
          intensity: 0.98,
          label: 'Dense Right Middle/Lower Lobe Airspace Infiltrate & Bronchograms',
        },
      ],
      attentionSummary:
        'Strong focal attention mapped to the right mid-to-lower zone. Gradients reflect dense alveolar opacity obscuring the right heart border (positive silhouette sign).',
      modelArchitecture: 'DenseNet-121 (CheXNet-NIH14 Fine-tuned, conv2 hook)',
    },
    review: {
      status: 'APPROVED',
      reviewerId: 'doc-rad-01',
      reviewerName: 'Dr. Sarah Chen, MD',
      reviewerRole: 'Thoracic Radiologist (12 yrs exp)',
      decisionTimestamp: '2026-10-24 10:02:15',
      clinicalNotes:
        'Concur with DenseNet prediction. Classic right middle lobe consolidation with air bronchograms visible. Recommended initiation of empiric antibiotic therapy and follow-up radiograph in 6 weeks.',
      radiologistAgreement: true,
      auditHash: '3f7a8b1c94d0e256a81f3b7940182746adfc4082591739c91b84e62a1b92c431',
    },
  },
  {
    id: 'case-rad-002',
    accessionNumber: 'ACC-2026-9042',
    title: 'Bilateral Peripheral Ground-Glass Opacities',
    patientPseudonym: 'PT-THORAX-5102',
    imageUrl: generateRadiographSvg('viral'),
    modality: 'DX',
    clinicalHistory: '42-year-old female with progressive shortness of breath, myalgia, persistent dry cough, and oxygen saturation of 91% on room air. Rapid PCR positive for SARS-CoV-2.',
    radiologicalIndication: 'Evaluation of viral pneumonitis severity and secondary bacterial superinfection.',
    dicom: {
      patientId: 'PT-THORAX-5102',
      patientAge: '42Y',
      patientSex: 'F',
      studyDate: '2026-10-25 14:32:08',
      modality: 'DX',
      bodyPartExamined: 'CHEST',
      viewPosition: 'PA',
      kvp: 115,
      exposureTimeMs: 14,
      windowCenter: 2048,
      windowWidth: 4096,
      pixelSpacingMm: 0.140,
    },
    aiPrediction: {
      primaryClass: 'Viral Pneumonia / COVID-19',
      confidence: 0.897,
      uncertaintyScore: 0.112,
      inferenceLatencyMs: 46.8,
      probabilities: {
        'Viral Pneumonia / COVID-19': 0.897,
        'Bacterial Pneumonia': 0.052,
        'Normal': 0.021,
        'Atelectasis': 0.018,
        'Pleural Effusion': 0.008,
        'Cardiomegaly': 0.004,
      },
      hotspots: [
        {
          cx: 0.28,
          cy: 0.55,
          rx: 0.12,
          ry: 0.16,
          intensity: 0.88,
          label: 'Right peripheral mid-zone reticular haziness',
        },
        {
          cx: 0.72,
          cy: 0.57,
          rx: 0.13,
          ry: 0.17,
          intensity: 0.92,
          label: 'Left lateral peripheral patchy ground-glass density',
        },
      ],
      attentionSummary:
        'Bilateral peripheral and subpleural activation. Grad-CAM shows dual-lung focus typical of viral interstitial distribution rather than unilateral lobar consolidation.',
      modelArchitecture: 'DenseNet-121 (CheXNet-NIH14 Fine-tuned, conv2 hook)',
    },
    review: {
      status: 'APPROVED',
      reviewerId: 'doc-pulm-02',
      reviewerName: 'Dr. Marcus Vance, MD',
      reviewerRole: 'Chief of Pulmonology',
      decisionTimestamp: '2026-10-25 15:10:44',
      clinicalNotes:
        'AI classification corresponds with clinical picture and bilateral peripheral GGO pattern. Supplemental oxygen via nasal cannula initiated. Low suspicion of focal bacterial consolidation.',
      radiologistAgreement: true,
      auditHash: '8b417c093a2e1d7f6c990a426189b37e90cfa512684901fbc37189028a31e402',
    },
  },
  {
    id: 'case-rad-003',
    accessionNumber: 'ACC-2026-9043',
    title: 'Left Unilateral Pleural Effusion (Meniscus Sign)',
    patientPseudonym: 'PT-THORAX-6294',
    imageUrl: generateRadiographSvg('effusion'),
    modality: 'CR',
    clinicalHistory: '67-year-old male with history of congestive heart failure and chronic kidney disease, presenting with worsening orthopnea and exertional dyspnea.',
    radiologicalIndication: 'Assess for pleural fluid collection, pulmonary vascular congestion, and volume overload.',
    dicom: {
      patientId: 'PT-THORAX-6294',
      patientAge: '67Y',
      patientSex: 'M',
      studyDate: '2026-10-26 11:20:10',
      modality: 'CR',
      bodyPartExamined: 'CHEST',
      viewPosition: 'PA',
      kvp: 125,
      exposureTimeMs: 16,
      windowCenter: 2100,
      windowWidth: 4200,
      pixelSpacingMm: 0.145,
    },
    aiPrediction: {
      primaryClass: 'Pleural Effusion',
      confidence: 0.938,
      uncertaintyScore: 0.074,
      inferenceLatencyMs: 42.1,
      probabilities: {
        'Pleural Effusion': 0.938,
        'Cardiomegaly': 0.032,
        'Atelectasis': 0.015,
        'Bacterial Pneumonia': 0.010,
        'Normal': 0.003,
        'Viral Pneumonia / COVID-19': 0.002,
      },
      hotspots: [
        {
          cx: 0.74,
          cy: 0.78,
          rx: 0.16,
          ry: 0.13,
          intensity: 0.99,
          label: 'Left Hemithorax Base - Blunted Costophrenic Sulcus & Meniscus Layering',
        },
      ],
      attentionSummary:
        'High-intensity activation over the left lateral costophrenic angle and hemidiaphragm margin. Clear meniscus curvature detected.',
      modelArchitecture: 'DenseNet-121 (CheXNet-NIH14 Fine-tuned, conv2 hook)',
    },
    review: {
      status: 'PENDING',
    },
  },
  {
    id: 'case-rad-004',
    accessionNumber: 'ACC-2026-9044',
    title: 'Cardiomegaly with Increased Transverse Cardiac Diameter',
    patientPseudonym: 'PT-THORAX-7011',
    imageUrl: generateRadiographSvg('cardiomegaly'),
    modality: 'DX',
    clinicalHistory: '74-year-old female with long-standing essential hypertension and peripheral edema. Routine pre-operative thoracic clearance.',
    radiologicalIndication: 'Quantify Cardiothoracic Ratio (CTR) and evaluate pulmonary venous hypertension.',
    dicom: {
      patientId: 'PT-THORAX-7011',
      patientAge: '74Y',
      patientSex: 'F',
      studyDate: '2026-10-27 08:45:00',
      modality: 'DX',
      bodyPartExamined: 'CHEST',
      viewPosition: 'PA',
      kvp: 120,
      exposureTimeMs: 15,
      windowCenter: 2048,
      windowWidth: 4096,
      pixelSpacingMm: 0.143,
    },
    aiPrediction: {
      primaryClass: 'Cardiomegaly',
      confidence: 0.961,
      uncertaintyScore: 0.048,
      inferenceLatencyMs: 41.5,
      probabilities: {
        'Cardiomegaly': 0.961,
        'Normal': 0.018,
        'Pleural Effusion': 0.011,
        'Atelectasis': 0.006,
        'Bacterial Pneumonia': 0.003,
        'Viral Pneumonia / COVID-19': 0.001,
      },
      hotspots: [
        {
          cx: 0.46,
          cy: 0.60,
          rx: 0.22,
          ry: 0.18,
          intensity: 0.97,
          label: 'Expanded left ventricular border, CTR measured at 0.59',
        },
      ],
      attentionSummary:
        'Grad-CAM centers predominantly across the lower central mediastinum, detecting substantial lateralization of the left heart border beyond the mid-clavicular line.',
      modelArchitecture: 'DenseNet-121 (CheXNet-NIH14 Fine-tuned, conv2 hook)',
    },
    review: {
      status: 'APPROVED',
      reviewerId: 'doc-rad-01',
      reviewerName: 'Dr. Sarah Chen, MD',
      reviewerRole: 'Thoracic Radiologist (12 yrs exp)',
      decisionTimestamp: '2026-10-27 09:30:12',
      clinicalNotes:
        'Approved. Measured CTR is 0.59 (abnormal threshold > 0.50). Mild upper lobe pulmonary vascular redistributions. No overt alveolar edema.',
      radiologistAgreement: true,
      auditHash: '9a02bc8371ef350912a4b86129402518e907c162839b40128a3819024f8101a9',
    },
  },
  {
    id: 'case-rad-005',
    accessionNumber: 'ACC-2026-9045',
    title: 'Unremarkable Normal Thoracic Radiograph',
    patientPseudonym: 'PT-THORAX-8820',
    imageUrl: generateRadiographSvg('normal'),
    modality: 'DX',
    clinicalHistory: '29-year-old male athlete undergoing pre-employment medical evaluation. Asymptomatic, no respiratory complaints.',
    radiologicalIndication: 'Routine screening radiograph.',
    dicom: {
      patientId: 'PT-THORAX-8820',
      patientAge: '29Y',
      patientSex: 'M',
      studyDate: '2026-10-28 10:15:40',
      modality: 'DX',
      bodyPartExamined: 'CHEST',
      viewPosition: 'PA',
      kvp: 110,
      exposureTimeMs: 10,
      windowCenter: 2048,
      windowWidth: 4096,
      pixelSpacingMm: 0.141,
    },
    aiPrediction: {
      primaryClass: 'Normal',
      confidence: 0.958,
      uncertaintyScore: 0.052,
      inferenceLatencyMs: 39.8,
      probabilities: {
        'Normal': 0.958,
        'Bacterial Pneumonia': 0.015,
        'Viral Pneumonia / COVID-19': 0.011,
        'Atelectasis': 0.007,
        'Pleural Effusion': 0.005,
        'Cardiomegaly': 0.004,
      },
      hotspots: [
        {
          cx: 0.50,
          cy: 0.50,
          rx: 0.28,
          ry: 0.28,
          intensity: 0.25,
          label: 'Uniform bilateral aeration with no localized focal pathology',
        },
      ],
      attentionSummary:
        'Diffusely distributed, low-intensity background attention across both pulmonary parenchyma. Sharp costophrenic sulci and normal mediastinal contours.',
      modelArchitecture: 'DenseNet-121 (CheXNet-NIH14 Fine-tuned, conv2 hook)',
    },
    review: {
      status: 'APPROVED',
      reviewerId: 'doc-rad-01',
      reviewerName: 'Dr. Sarah Chen, MD',
      reviewerRole: 'Thoracic Radiologist (12 yrs exp)',
      decisionTimestamp: '2026-10-28 11:00:20',
      clinicalNotes:
        'Normal chest radiograph. Bilateral lung zones are clear without consolidation, pneumothorax, or effusion. Cardiomediastinal contour is normal.',
      radiologistAgreement: true,
      auditHash: '1a52b904c78104e823901b54a802491b72e01934812678091a4b862104812903',
    },
  },
  {
    id: 'case-rad-006',
    accessionNumber: 'ACC-2026-9046',
    title: 'Right Apical Volume Loss & Atelectasis',
    patientPseudonym: 'PT-THORAX-9218',
    imageUrl: generateRadiographSvg('atelectasis'),
    modality: 'DX',
    clinicalHistory: '63-year-old male with postoperative shallow breathing following abdominal resection. Mild pleuritic discomfort and decreased right apical breath sounds.',
    radiologicalIndication: 'Rule out mucous plugging, atelectatic collapse, or postoperative pneumothorax.',
    dicom: {
      patientId: 'PT-THORAX-9218',
      patientAge: '63Y',
      patientSex: 'M',
      studyDate: '2026-10-29 16:05:12',
      modality: 'DX',
      bodyPartExamined: 'CHEST',
      viewPosition: 'PA',
      kvp: 120,
      exposureTimeMs: 14,
      windowCenter: 2048,
      windowWidth: 4096,
      pixelSpacingMm: 0.143,
    },
    aiPrediction: {
      primaryClass: 'Atelectasis',
      confidence: 0.884,
      uncertaintyScore: 0.128,
      inferenceLatencyMs: 43.7,
      probabilities: {
        'Atelectasis': 0.884,
        'Bacterial Pneumonia': 0.054,
        'Normal': 0.032,
        'Pleural Effusion': 0.018,
        'Viral Pneumonia / COVID-19': 0.008,
        'Cardiomegaly': 0.004,
      },
      hotspots: [
        {
          cx: 0.36,
          cy: 0.28,
          rx: 0.14,
          ry: 0.09,
          intensity: 0.91,
          label: 'Right upper lobe collapse, elevated minor fissure',
        },
      ],
      attentionSummary:
        'Grad-CAM highlights right apex with tracheal pull. Dense wedge-shaped opacity consistent with subsegmental volume loss.',
      modelArchitecture: 'DenseNet-121 (CheXNet-NIH14 Fine-tuned, conv2 hook)',
    },
    review: {
      status: 'PENDING',
    },
  },
];
