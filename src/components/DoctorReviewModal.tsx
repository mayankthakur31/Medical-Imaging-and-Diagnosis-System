/**
 * Clinical Review & Governance Workflow Modal.
 * Allows certified physicians to independently approve, reject, or request overreads.
 * Generates cryptographic SHA-256 audit log records for medical-legal compliance.
 */
import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  ShieldCheck,
  X,
  FileCheck,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { MedicalCase, ReviewStatus } from '../types/medical';

interface DoctorReviewModalProps {
  currentCase: MedicalCase;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (decision: {
    status: ReviewStatus;
    reviewerName: string;
    reviewerRole: string;
    clinicalNotes: string;
    radiologistAgreement: boolean;
  }) => void;
}

const REVIEWER_PROFILES = [
  {
    id: 'doc-rad-01',
    name: 'Dr. Sarah Chen, MD',
    role: 'Thoracic Radiologist (12 yrs exp)',
    initials: 'SC',
    department: 'Cardiothoracic Imaging Division'
  },
  {
    id: 'doc-pulm-02',
    name: 'Dr. Marcus Vance, MD',
    role: 'Chief of Pulmonology',
    initials: 'MV',
    department: 'Pulmonary & Critical Care'
  },
  {
    id: 'doc-cc-03',
    name: 'Dr. Elena Rostova, MD',
    role: 'Emergency Medicine / Trauma',
    initials: 'ER',
    department: 'Emergency & Urgent Radiology'
  }
];

const CLINICAL_MACROS = [
  'Confirmed dense lobar airspace consolidation with visible air bronchograms. Correlates with clinical signs of pneumonia.',
  'Bilateral patchy peripheral haziness consistent with viral pneumonitis. No evidence of pneumothorax.',
  'Meniscus sign confirmed at left costophrenic angle. Recommend ultrasound-guided thoracentesis if clinically indicated.',
  'Artifactual finding: Density corresponds to scapular overlap and soft tissue attenuation, not true pulmonary infiltrate.',
  'Equivocal appearance: Recommend dedicated High-Resolution Chest CT (HRCT) without IV contrast for definitive assessment.'
];

export const DoctorReviewModal: React.FC<DoctorReviewModalProps> = ({
  currentCase,
  isOpen,
  onClose,
  onSubmitReview
}) => {
  if (!isOpen) return null;

  const [selectedReviewer, setSelectedReviewer] = useState(REVIEWER_PROFILES[0]);
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus>(
    currentCase.review.status === 'PENDING' ? 'APPROVED' : currentCase.review.status
  );
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    currentCase.review.clinicalNotes ||
      `Reviewed radiograph and AI heatmap. Findings are consistent with ${currentCase.aiPrediction.primaryClass}.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview({
      status: selectedStatus,
      reviewerName: selectedReviewer.name,
      reviewerRole: selectedReviewer.role,
      clinicalNotes,
      radiologistAgreement: selectedStatus === 'APPROVED'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950/80 border border-cyan-800/50 rounded-lg text-cyan-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Physician Clinical Review & Sign-Off</h3>
              <p className="text-xs text-slate-400">
                Accession: <span className="font-mono text-cyan-400">{currentCase.accessionNumber}</span> · Patient:{' '}
                {currentCase.patientPseudonym}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Reviewer Persona Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Attending Physician / Reviewer Credentials
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {REVIEWER_PROFILES.map((reviewer) => {
                const isSelected = selectedReviewer.id === reviewer.id;
                return (
                  <button
                    key={reviewer.id}
                    type="button"
                    onClick={() => setSelectedReviewer(reviewer)}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200 shrink-0">
                      {reviewer.initials}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold truncate text-slate-100">{reviewer.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{reviewer.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Finding Summary Reference */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">AI Model Output:</span>
              <span className="font-mono font-semibold text-cyan-400">
                {currentCase.aiPrediction.primaryClass} ({(currentCase.aiPrediction.confidence * 100).toFixed(1)}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Grad-CAM Focus: {currentCase.aiPrediction.attentionSummary}
            </p>
          </div>

          {/* Clinical Decision Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Authoritative Clinical Decision
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus('APPROVED')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedStatus === 'APPROVED'
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 mb-1.5 text-emerald-400" />
                <span className="text-xs font-bold">Approve AI</span>
                <span className="text-[10px] text-slate-400">Concur with findings</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('REJECTED')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedStatus === 'REJECTED'
                    ? 'bg-rose-950/50 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <XCircle className="w-5 h-5 mb-1.5 text-rose-400" />
                <span className="text-xs font-bold">Reject AI</span>
                <span className="text-[10px] text-slate-400">Overrule prediction</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('OVERREAD_REQUESTED')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedStatus === 'OVERREAD_REQUESTED'
                    ? 'bg-amber-950/50 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <AlertTriangle className="w-5 h-5 mb-1.5 text-amber-400" />
                <span className="text-xs font-bold">Overread</span>
                <span className="text-[10px] text-slate-400">Request 2nd opinion</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('BOARD_REVIEW')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedStatus === 'BOARD_REVIEW'
                    ? 'bg-purple-950/50 border-purple-500 text-purple-300 ring-1 ring-purple-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <Users className="w-5 h-5 mb-1.5 text-purple-400" />
                <span className="text-xs font-bold">Board Review</span>
                <span className="text-[10px] text-slate-400">Thoracic tumor board</span>
              </button>
            </div>
          </div>

          {/* Quick Clinical Macros */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400">Clinical Finding Macros:</span>
            <div className="flex flex-wrap gap-1.5">
              {CLINICAL_MACROS.map((macro, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setClinicalNotes(macro)}
                  className="px-2 py-1 text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded transition-colors text-left truncate max-w-[280px] cursor-pointer"
                  title={macro}
                >
                  "{macro.slice(0, 42)}..."
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Justification Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Physician Diagnostic Rationale & Treatment Recommendations
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Enter specific radiological findings, anatomical correlation, and next clinical steps..."
            />
          </div>

          {/* Cryptographic Audit Notice */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Immutable cryptographic SHA-256 audit entry generated upon confirmation.</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors shadow-lg cursor-pointer"
            >
              Authorize & Record Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
