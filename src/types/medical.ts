/**
 * Type definitions for RadPulse AI Medical Imaging System.
 */

export type PathologyClass =
  | 'Normal'
  | 'Bacterial Pneumonia'
  | 'Viral Pneumonia / COVID-19'
  | 'Pleural Effusion'
  | 'Atelectasis'
  | 'Cardiomegaly';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'OVERREAD_REQUESTED' | 'BOARD_REVIEW';

export interface DicomMetadata {
  patientId: string;
  patientAge: string;
  patientSex: 'M' | 'F' | 'O';
  studyDate: string;
  modality: 'DX' | 'CR' | 'CT';
  bodyPartExamined: string;
  viewPosition: 'PA' | 'AP' | 'LATERAL';
  kvp: number;
  exposureTimeMs: number;
  windowCenter: number;
  windowWidth: number;
  pixelSpacingMm: number; // e.g. 0.14 mm/pixel for caliper
}

export interface GradCamHotspot {
  cx: number; // 0 to 1 relative X coordinate
  cy: number; // 0 to 1 relative Y coordinate
  rx: number; // radius X
  ry: number; // radius Y
  intensity: number; // 0 to 1
  label: string;
}

export interface MedicalCase {
  id: string;
  accessionNumber: string;
  title: string;
  patientPseudonym: string;
  imageUrl: string;
  thumbnailUrl?: string;
  modality: 'DX' | 'CR' | 'CT';
  clinicalHistory: string;
  radiologicalIndication: string;
  dicom: DicomMetadata;
  aiPrediction: {
    primaryClass: PathologyClass;
    confidence: number; // 0.0 - 1.0
    uncertaintyScore: number; // Shannon entropy 0.0 - 1.0
    inferenceLatencyMs: number;
    probabilities: Record<PathologyClass, number>;
    hotspots: GradCamHotspot[];
    attentionSummary: string;
    modelArchitecture: string;
  };
  review: {
    status: ReviewStatus;
    reviewerId?: string;
    reviewerName?: string;
    reviewerRole?: string;
    decisionTimestamp?: string;
    clinicalNotes?: string;
    radiologistAgreement?: boolean;
    auditHash?: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  accessionNumber: string;
  imageTitle: string;
  reviewerName: string;
  reviewerRole: string;
  actionType: string;
  previousStatus: ReviewStatus;
  newStatus: ReviewStatus;
  clinicalNotes: string;
  tamperProofHash: string;
}

export type ColormapMode = 'jet' | 'viridis' | 'turbo' | 'inferno' | 'hot';
export type WindowPreset = 'default' | 'lung' | 'bone' | 'mediastinum' | 'high_contrast';
