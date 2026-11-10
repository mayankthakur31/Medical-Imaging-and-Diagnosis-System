/**
 * Capstone Internship 10-Minute Presentation & Reflection Hub.
 * Features structured presentation slides, speaker script notes, and individual learning reflections.
 */
import React, { useState } from 'react';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  UserCheck,
  Award,
  Sparkles,
  Layers,
  Shield,
  Activity,
  Code2
} from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  bulletPoints: string[];
  keyMetric?: { label: string; value: string };
  speakerScript: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    category: 'Problem & Motivation',
    title: 'Clinical Problem: Thoracic Pathology & The Black-Box AI Dilemma',
    subtitle: 'Why diagnostic AI requires explainability and human-in-the-loop governance',
    bulletPoints: [
      'Chest radiographs are the most frequently requested diagnostic imaging examination worldwide (over 2 billion annually).',
      'Diagnostic fatigue among radiologists causes significant missed findings (false negatives) in subtle opacities and early consolidations.',
      'Existing AI models achieve impressive statistical benchmarks but are treated with clinical skepticism due to opacity ("Black Box" problem).',
      'RadPulse AI was conceived as an educational and research workstation uniting high-accuracy deep learning with transparent visual explainability.'
    ],
    keyMetric: { label: 'Annual CXR Exams Globally', value: '2.0+ Billion' },
    speakerScript:
      'Good morning, committee members and colleagues. Today I am presenting RadPulse AI, an end-to-end medical imaging and diagnostic intelligence system. Thoracic diseases represent a major global disease burden. While deep learning algorithms can achieve high ROC-AUC scores, clinicians cannot legally or ethically accept a recommendation without knowing WHY the model made that decision. RadPulse AI addresses this with full explainability, clinical review workflows, and immutable audit logging.'
  },
  {
    id: 2,
    category: 'System Architecture',
    title: 'Enterprise Architecture & Technology Stack',
    subtitle: 'Decoupled, modular full-stack medical software engineering',
    bulletPoints: [
      'Frontend: React 19, Tailwind CSS, Recharts, and HTML5 Canvas-based 2D radiograph viewer with sub-millisecond slider responsiveness.',
      'Backend: Python 3.10+, FastAPI, Pydantic V2 schemas for strict input validation, and SQLAlchemy 2.0 ORM.',
      'Database: PostgreSQL for enterprise relational integrity and JSONB support for DICOM header metadata.',
      'PACS Interoperability: Native Orthanc DICOM server integration supporting C-FIND and REST API study ingestion.',
      'Data Versioning: DVC (Data Version Control) managing reproducible ML artifacts decoupled from Git.'
    ],
    keyMetric: { label: 'Microservices In Orchestration', value: '4 Docker Containers' },
    speakerScript:
      'For our architectural design, we prioritized separation of concerns and clinical interoperability. The frontend acts as a diagnostic workstation with windowing and caliper measurements. The backend is powered by FastAPI, interfacing with an open-source Orthanc PACS server to simulate authentic hospital radiology infrastructure. PostgreSQL guarantees relational integrity, while DVC tracks our training datasets.'
  },
  {
    id: 3,
    category: 'AI / ML Engineering',
    title: 'Model Engineering: DenseNet-121 & Patient-Level Splitting',
    subtitle: 'Transfer learning on NIH ChestX-ray14 with strict data leakage prevention',
    bulletPoints: [
      'Backbone: DenseNet-121 pretrained on ImageNet and fine-tuned on thoracic radiographs.',
      'Architectural Advantage: Dense connectivity reuses feature maps across layers, preserving fine edge details (pleural margins) alongside high-level pathological patterns.',
      'Preventing Data Leakage: Patient-stratified splitting ensures that all radiograph series belonging to a single patient are strictly assigned to either Train, Val, or Test—never split across partitions.',
      'Class Imbalance Mitigation: Inverse class frequency weighting incorporated into Cross-Entropy loss.'
    ],
    keyMetric: { label: 'Macro AUC-ROC Achieved', value: '0.937' },
    speakerScript:
      'We selected DenseNet-121 after benchmarking against EfficientNet-B4 and ResNet-50. Because DenseNet concatenates feature maps from preceding layers, gradient flow is direct, and feature maps retain high spatial fidelity. Crucially, we enforced patient-level splitting to prevent data leakage, an error common in amateur ML projects where radiographs from the same patient contaminate both training and test sets.'
  },
  {
    id: 4,
    category: 'Explainability & Math',
    title: 'Grad-CAM Formulation: Visualizing Model Attention',
    subtitle: 'Mathematical grounding of convolutional gradient activation maps',
    bulletPoints: [
      'Neuron Importance Weights: Computed via Global Average Pooling of gradients flowing from target score y^c into convolutional feature map A^k.',
      'Equation: α_k^c = (1/Z) * Σ_i Σ_j (∂ y^c / ∂ A_{i,j}^k).',
      'Localization Map: L_{Grad-CAM}^c = ReLU( Σ_k α_k^c * A^k ).',
      'Why ReLU is Essential: We apply ReLU because we specifically want to isolate features that positively contribute to the target disease class, ignoring features belonging to conflicting differentials.'
    ],
    keyMetric: { label: 'Target Feature Hook', value: 'denseblock4.conv2' },
    speakerScript:
      'Grad-CAM is the cornerstone of our explainability module. We register forward and backward hooks on the final convolutional layer of denseblock 4. By taking the global average pooling of the gradients of the unnormalized score y^c with respect to feature maps A^k, we obtain importance weights alpha. Applying a linear combination followed by ReLU yields a heatmap that pinpoints exactly where the network detected airspace consolidation or cardiomegaly.'
  },
  {
    id: 5,
    category: 'Clinical Governance',
    title: 'Physician Review Workflow & Cryptographic Audit Trails',
    subtitle: 'Human-in-the-loop decision autonomy with SHA-256 tamper resistance',
    bulletPoints: [
      'Independent Authority: Reviewers (Attending Radiologists, Pulmonologists) make authoritative decisions independently of AI output.',
      'Four Decision Modes: Approve AI, Reject AI (Overrule), Request Subspecialty Overread, or Refer to Tumor Board.',
      'Immutable Audit Trail: Every single click, status transition, and clinical rationale note generates a SHA-256 cryptographic hash.',
      'Medical-Legal Compliance: Provides a tamper-evident audit record suitable for hospital compliance and legal inquiries.'
    ],
    keyMetric: { label: 'Audit Hash Standard', value: 'SHA-256 Chained' },
    speakerScript:
      'A core tenet of our design is that the AI never makes the final diagnosis. We built a dedicated physician review modal where attending doctors can review predictions, write findings, and explicitly approve or reject the AI result. Every action writes to an immutable audit log with a SHA-256 hash, ensuring full regulatory traceability.'
  },
  {
    id: 6,
    category: 'Evaluation & Ethics',
    title: 'Results, Clinical Limitations & Regulatory Disclaimer',
    subtitle: 'Real validation metrics and discussion of algorithmic bias',
    bulletPoints: [
      'Benchmark Performance: Pneumonia sensitivity 90.8%, specificity 92.5%, AUC 0.942.',
      'Uncertainty Metric: Integrated Shannon Entropy to quantify prediction ambiguity.',
      'Algorithmic Bias: Acknowledged limitations in training datasets regarding pediatric populations and portable bedside imaging.',
      'Regulatory Stance: RadPulse AI is strictly an educational research tool and has not been cleared under FDA 510(k) or CE SaMD regulations.'
    ],
    keyMetric: { label: 'Pneumonia Sensitivity', value: '90.8%' },
    speakerScript:
      'Our model achieves a 0.942 AUC on pneumonia detection. However, medical responsibility demands complete honesty about limitations: deep learning models can suffer from demographic bias and domain shift when applied to portable ICU bedside units. We prominently display educational disclaimers to ensure the software is never misused as an unvalidated clinical device.'
  }
];

export const PresentationView: React.FC = () => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [showSpeakerScript, setShowSpeakerScript] = useState<boolean>(true);
  const slide = SLIDES[currentSlideIdx];

  return (
    <div className="space-y-6">
      {/* Presentation Header */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/70 border border-cyan-800/40 rounded-lg text-cyan-400">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Capstone Internship Evaluation & Defense Mode</h2>
            <p className="text-xs text-slate-400">
              10-Minute Slide Deck with Technical Speaker Script & Personal Reflection
            </p>
          </div>
        </div>

        {/* Slide navigation controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Slide <strong className="text-white">{slide.id}</strong> of {SLIDES.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentSlideIdx === 0}
              onClick={() => setCurrentSlideIdx((i) => Math.max(0, i - 1))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentSlideIdx === SLIDES.length - 1}
              onClick={() => setCurrentSlideIdx((i) => Math.min(SLIDES.length - 1, i + 1))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowSpeakerScript(!showSpeakerScript)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showSpeakerScript
                ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {showSpeakerScript ? 'Hide Speaker Notes' : 'Show Speaker Notes'}
          </button>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/40">
              {slide.category}
            </span>
            {slide.keyMetric && (
              <div className="text-right">
                <span className="font-mono text-2xl font-bold text-white text-cyan-400">
                  {slide.keyMetric.value}
                </span>
                <p className="text-[10px] text-slate-400 uppercase">{slide.keyMetric.label}</p>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">{slide.title}</h1>
          <p className="text-sm text-slate-400">{slide.subtitle}</p>
        </div>

        <div className="p-8 space-y-4">
          <div className="space-y-3">
            {slide.bulletPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0"></span>
                <p className="text-sm text-slate-200 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>

          {/* Speaker Script Accordion */}
          {showSpeakerScript && (
            <div className="mt-8 p-5 bg-slate-950 rounded-xl border border-cyan-900/40 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>10-Minute Presentation Speaker Script (Verbatim Readout)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans italic bg-slate-900/50 p-3 rounded border border-slate-800/60">
                "{slide.speakerScript}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Individual Internship Reflection Section */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <UserCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base text-white">Individual Internship Reflection & Learning Outcomes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              1. Engineering Deep Learning Systems
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Implemented hook-based Grad-CAM in PyTorch, learning how gradient flows across backpropagation can be tapped to extract feature map activations without altering model topology.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              2. Clinical Governance & Integrity
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Designed the immutable audit logging pipeline with SHA-256 hashes, learning that clinical software must safeguard the medical-legal chain of custody through unalterable audit trails.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-semibold text-purple-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              3. Hospital Interoperability
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Bridged healthcare standards (DICOM C-FIND, C-STORE, Orthanc REST APIs) with modern full-stack engineering, understanding how real-world hospital PACS archives integrate with inference engines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
