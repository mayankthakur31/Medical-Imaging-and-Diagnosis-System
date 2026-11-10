/**
 * RadPulse AI — Medical Imaging & Diagnostic Intelligence System.
 * End-to-end clinical workstation with Grad-CAM explainability,
 * doctor review workflows, and immutable audit logs.
 */
import React, { useState } from 'react';
import {
  Activity,
  Upload,
  ShieldAlert,
  Server,
  FileText,
  Layers,
  Presentation,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  ChevronDown,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';

import { MedicalCase, AuditLogEntry, ReviewStatus } from './types/medical';
import { SAMPLE_CASES } from './data/sampleCases';
import { MedicalViewer } from './components/MedicalViewer';
import { PredictionPanel } from './components/PredictionPanel';
import { DoctorReviewModal } from './components/DoctorReviewModal';
import { UploadModal } from './components/UploadModal';
import { AuditTrailView } from './components/AuditTrailView';
import { OrthancIntegrationView } from './components/OrthancIntegrationView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PresentationView } from './components/PresentationView';
import { CodeInspector } from './components/CodeInspector';

type ActiveTab = 'workstation' | 'audit' | 'orthanc' | 'analytics' | 'presentation' | 'code';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workstation');
  const [cases, setCases] = useState<MedicalCase[]>(SAMPLE_CASES);
  const [currentCaseId, setCurrentCaseId] = useState<string>(SAMPLE_CASES[0].id);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Initial audit log entries populated from sample cases
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'aud-init-001',
      timestamp: '2026-10-24 10:02:15',
      accessionNumber: 'ACC-2026-9041',
      imageTitle: 'Right Lobar Airspace Consolidation',
      reviewerName: 'Dr. Sarah Chen, MD',
      reviewerRole: 'Thoracic Radiologist (12 yrs exp)',
      actionType: 'REVIEW_APPROVED',
      previousStatus: 'PENDING',
      newStatus: 'APPROVED',
      clinicalNotes: 'Concur with DenseNet prediction. Right middle lobe consolidation with air bronchograms visible.',
      tamperProofHash: '3f7a8b1c94d0e256a81f3b7940182746adfc4082591739c91b84e62a1b92c431'
    },
    {
      id: 'aud-init-002',
      timestamp: '2026-10-25 15:10:44',
      accessionNumber: 'ACC-2026-9042',
      imageTitle: 'Bilateral Peripheral Ground-Glass Opacities',
      reviewerName: 'Dr. Marcus Vance, MD',
      reviewerRole: 'Chief of Pulmonology',
      actionType: 'REVIEW_APPROVED',
      previousStatus: 'PENDING',
      newStatus: 'APPROVED',
      clinicalNotes: 'AI classification corresponds with clinical picture and bilateral peripheral GGO pattern.',
      tamperProofHash: '8b417c093a2e1d7f6c990a426189b37e90cfa512684901fbc37189028a31e402'
    },
    {
      id: 'aud-init-003',
      timestamp: '2026-10-27 09:30:12',
      accessionNumber: 'ACC-2026-9044',
      imageTitle: 'Cardiomegaly with Increased CTR',
      reviewerName: 'Dr. Sarah Chen, MD',
      reviewerRole: 'Thoracic Radiologist (12 yrs exp)',
      actionType: 'REVIEW_APPROVED',
      previousStatus: 'PENDING',
      newStatus: 'APPROVED',
      clinicalNotes: 'Approved. Measured CTR is 0.59. Mild upper lobe pulmonary vascular redistributions.',
      tamperProofHash: '9a02bc8371ef350912a4b86129402518e907c162839b40128a3819024f8101a9'
    }
  ]);

  const currentCase = cases.find((c) => c.id === currentCaseId) || cases[0];

  // Handle Review Decision Submission
  const handleReviewDecision = (decision: {
    status: ReviewStatus;
    reviewerName: string;
    reviewerRole: string;
    clinicalNotes: string;
    radiologistAgreement: boolean;
  }) => {
    // Generate pseudo-SHA-256 tamper-proof hash for demonstrative audit trail
    const characters = '0123456789abcdef';
    let randomHash = '';
    for (let i = 0; i < 64; i++) {
      randomHash += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const previousStatus = currentCase.review.status;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // Update case review status
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === currentCase.id) {
          return {
            ...c,
            review: {
              status: decision.status,
              reviewerName: decision.reviewerName,
              reviewerRole: decision.reviewerRole,
              decisionTimestamp: nowStr,
              clinicalNotes: decision.clinicalNotes,
              radiologistAgreement: decision.radiologistAgreement,
              auditHash: randomHash
            }
          };
        }
        return c;
      })
    );

    // Create immutable audit log entry
    const newLogEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: nowStr,
      accessionNumber: currentCase.accessionNumber,
      imageTitle: currentCase.title,
      reviewerName: decision.reviewerName,
      reviewerRole: decision.reviewerRole,
      actionType: `REVIEW_${decision.status}`,
      previousStatus,
      newStatus: decision.status,
      clinicalNotes: decision.clinicalNotes,
      tamperProofHash: randomHash
    };

    setAuditLogs((prev) => [newLogEntry, ...prev]);
  };

  // Handle new uploaded case
  const handleCaseUploaded = (newCase: MedicalCase) => {
    setCases((prev) => [newCase, ...prev]);
    setCurrentCaseId(newCase.id);
    setActiveTab('workstation');

    // Create upload audit log
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLogEntry: AuditLogEntry = {
      id: `aud-upload-${Date.now()}`,
      timestamp: nowStr,
      accessionNumber: newCase.accessionNumber,
      imageTitle: newCase.title,
      reviewerName: 'System Preprocessor',
      reviewerRole: 'Automated Ingestion Pipeline',
      actionType: 'IMAGE_UPLOAD_INFERENCE',
      previousStatus: 'PENDING',
      newStatus: 'PENDING',
      clinicalNotes: `Uploaded ${newCase.modality} radiograph. Forward pass executed in ${newCase.aiPrediction.inferenceLatencyMs}ms.`,
      tamperProofHash: `7e91a0${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}b4c`
    };
    setAuditLogs((prev) => [newLogEntry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Clinical System Header */}
      <header className="bg-slate-950/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
          {/* Brand & System Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">RadPulse AI</h1>
                <span className="text-xs text-slate-400 font-mono">v1.4.2</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Medical Imaging Diagnostic & Explainability Workstation
              </p>
            </div>
          </div>

          {/* Educational Disclaimer Banner */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-amber-950/30 border border-amber-900/40 rounded text-[11px] text-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Research & Educational Prototype · Not a certified diagnostic device</span>
          </div>

          {/* Action Ribbon: Ingest Radiograph & Doctor Persona */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-xs font-semibold rounded-lg shadow transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ingest Radiograph</span>
            </button>

            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-300 font-bold text-[10px] flex items-center justify-center border border-cyan-800">
                SC
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs font-semibold text-slate-200">Dr. Sarah Chen, MD</p>
                <p className="text-[10px] text-slate-400">Thoracic Radiologist</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs (Clean typography with active indicator) */}
        <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-1 overflow-x-auto text-xs border-t border-slate-900">
          {[
            { id: 'workstation', label: 'Diagnostic Workstation', icon: Stethoscope },
            { id: 'audit', label: 'Audit & Governance', icon: FileText, count: auditLogs.length },
            { id: 'orthanc', label: 'Orthanc DICOM PACS', icon: Server },
            { id: 'analytics', label: 'Model Benchmarks & DVC', icon: Layers },
            { id: 'presentation', label: 'Capstone Defense (10-Min)', icon: Presentation },
            { id: 'code', label: 'Codebase Artifacts', icon: FileCode }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 py-2.5 px-3 font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main App Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 space-y-4">
        {/* VIEW 1: Main Diagnostic Workstation */}
        {activeTab === 'workstation' && (
          <div className="space-y-4">
            {/* Case Selection Carousel / Ribbon */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Select Study from Radiology Worklist ({cases.length} cases available):
                </span>
                <span className="text-slate-400 text-[11px]">
                  Modality: Chest Radiography (PA / AP)
                </span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                {cases.map((c) => {
                  const isSelected = c.id === currentCase.id;
                  const isApproved = c.review.status === 'APPROVED';
                  const isRejected = c.review.status === 'REJECTED';

                  return (
                    <button
                      key={c.id}
                      onClick={() => setCurrentCaseId(c.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-left shrink-0 min-w-[260px] transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/50 border-cyan-500 ring-1 ring-cyan-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={c.imageUrl}
                        alt={c.title}
                        className="w-11 h-11 object-contain bg-black rounded border border-slate-800 shrink-0"
                      />
                      <div className="overflow-hidden flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-cyan-400 font-semibold truncate">
                            {c.accessionNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(c.aiPrediction.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="font-bold text-slate-200 truncate">{c.aiPrediction.primaryClass}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span>{c.patientPseudonym}</span>
                          <span>·</span>
                          {isApproved ? (
                            <span className="text-emerald-400 font-semibold">Approved</span>
                          ) : isRejected ? (
                            <span className="text-rose-400 font-semibold">Rejected</span>
                          ) : (
                            <span className="text-amber-400">Pending</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Screen Workspace: Left = Radiograph & GradCAM Viewer (60%), Right = Predictions & Explainability (40%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 flex flex-col">
                <MedicalViewer
                  currentCase={currentCase}
                  onOpenReview={() => setIsReviewModalOpen(true)}
                />
              </div>

              <div className="lg:col-span-4 flex flex-col">
                <PredictionPanel
                  currentCase={currentCase}
                  onOpenReview={() => setIsReviewModalOpen(true)}
                />
              </div>
            </div>

            {/* Clinical Indications & DICOM Metadata Footer Drawer */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Clinical History & Symptoms
                </span>
                <p className="text-slate-200 leading-relaxed">{currentCase.clinicalHistory}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Radiological Indication
                </span>
                <p className="text-slate-200 leading-relaxed">{currentCase.radiologicalIndication}</p>
              </div>

              <div className="space-y-1 font-mono text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
                <p>
                  <strong className="text-slate-300">Study Date:</strong> {currentCase.dicom.studyDate}
                </p>
                <p>
                  <strong className="text-slate-300">Demographics:</strong> {currentCase.dicom.patientAge} · {currentCase.dicom.patientSex}
                </p>
                <p>
                  <strong className="text-slate-300">Pixel Pitch:</strong> {currentCase.dicom.pixelSpacingMm} mm/px
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Audit Trail & Governance */}
        {activeTab === 'audit' && <AuditTrailView auditLogs={auditLogs} />}

        {/* VIEW 3: Orthanc DICOM PACS Integration */}
        {activeTab === 'orthanc' && (
          <OrthancIntegrationView
            onLoadCaseIntoViewer={(sampleCaseId) => {
              setCurrentCaseId(sampleCaseId);
              setActiveTab('workstation');
            }}
          />
        )}

        {/* VIEW 4: Model Analytics, Evaluation & DVC */}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {/* VIEW 5: Capstone Internship 10-Minute Presentation */}
        {activeTab === 'presentation' && <PresentationView />}

        {/* VIEW 6: Source Code & Repository Artifacts */}
        {activeTab === 'code' && <CodeInspector />}
      </main>

      {/* Review Modal */}
      <DoctorReviewModal
        currentCase={currentCase}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmitReview={handleReviewDecision}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onCaseUploaded={handleCaseUploaded}
      />
    </div>
  );
}
