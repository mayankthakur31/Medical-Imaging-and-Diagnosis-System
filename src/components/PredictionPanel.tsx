/**
 * AI Prediction & Diagnostic Explainability Panel.
 * Displays multi-class softmax probabilities, Shannon uncertainty index,
 * Grad-CAM anatomical attention rationale, and mathematical theory breakdown.
 */
import React, { useState } from 'react';
import {
  Brain,
  HelpCircle,
  Activity,
  Zap,
  ChevronRight,
  ShieldAlert,
  Sliders,
  CheckCircle,
  FileText,
  X
} from 'lucide-react';
import { MedicalCase, PathologyClass } from '../types/medical';

interface PredictionPanelProps {
  currentCase: MedicalCase;
  onOpenReview: () => void;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({ currentCase, onOpenReview }) => {
  const [showTheoryModal, setShowTheoryModal] = useState<boolean>(false);
  const { aiPrediction } = currentCase;

  // Sorted classes by probability
  const sortedClasses = Object.entries(aiPrediction.probabilities).sort(
    ([, a], [, b]) => b - a
  ) as [PathologyClass, number][];

  // Uncertainty interpretation
  const getUncertaintyLabel = (score: number) => {
    if (score < 0.10) return { label: 'Low Uncertainty (High Consensus)', color: 'text-emerald-400' };
    if (score < 0.25) return { label: 'Moderate Ambiguity', color: 'text-amber-400' };
    return { label: 'High Diagnostic Uncertainty', color: 'text-rose-400' };
  };

  const uncertaintyInfo = getUncertaintyLabel(aiPrediction.uncertaintyScore);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
            Deep Learning Inference
          </h2>
        </div>
        <button
          onClick={() => setShowTheoryModal(true)}
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Grad-CAM Theory</span>
        </button>
      </div>

      <div className="p-4 space-y-5 overflow-y-auto flex-1">
        {/* Primary Classification Result Card */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Primary Predicted Finding</span>
            <span className="font-mono text-slate-400">{aiPrediction.inferenceLatencyMs} ms</span>
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {aiPrediction.primaryClass}
            </h3>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {(aiPrediction.confidence * 100).toFixed(1)}%
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Softmax Confidence</p>
            </div>
          </div>

          {/* Model & Architecture specs */}
          <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Architecture:</span>
            <span className="text-slate-300">{aiPrediction.modelArchitecture}</span>
          </div>
        </div>

        {/* Model Uncertainty & Entropy Meter */}
        <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Uncertainty Index (Shannon Entropy)</span>
            </div>
            <span className={`font-mono text-xs font-semibold ${uncertaintyInfo.color}`}>
              {aiPrediction.uncertaintyScore.toFixed(3)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                aiPrediction.uncertaintyScore < 0.1
                  ? 'bg-emerald-400'
                  : aiPrediction.uncertaintyScore < 0.25
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
              style={{ width: `${Math.min(100, aiPrediction.uncertaintyScore * 100)}%` }}
            />
          </div>

          <p className={`text-[11px] ${uncertaintyInfo.color}`}>
            {uncertaintyInfo.label}
          </p>
        </div>

        {/* Multi-Class Probability Distribution */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Pathology Class Probabilities</span>
            <span className="text-slate-400 text-[11px]">Top-6 Differential</span>
          </div>

          <div className="space-y-2">
            {sortedClasses.map(([clsName, prob]) => {
              const pct = (prob * 100).toFixed(1);
              const isTop = clsName === aiPrediction.primaryClass;

              return (
                <div key={clsName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isTop ? 'font-medium text-cyan-300' : 'text-slate-400'}>
                      {clsName}
                    </span>
                    <span className={`font-mono text-[11px] ${isTop ? 'font-bold text-cyan-400' : 'text-slate-400'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isTop ? 'bg-cyan-400' : 'bg-slate-600'
                      }`}
                      style={{ width: `${Math.max(2, prob * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grad-CAM Anatomical Explainability Card */}
        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <Zap className="w-3.5 h-3.5" />
            <span>Grad-CAM Visual Attention Rationale</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {aiPrediction.attentionSummary}
          </p>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            Target Activation Hook: <code className="text-cyan-400 font-mono">features.denseblock4.denselayer16.conv2</code>
          </div>
        </div>

        {/* Clinical Disclaimer Notice */}
        <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg flex items-start gap-2.5 text-amber-300/90 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-tight text-[11px]">
            <strong>Research & Educational Prototype:</strong> Not FDA 510(k) cleared.
            Inference requires independent radiologist verification. Do not base medical decisions on AI output.
          </p>
        </div>

        {/* Doctor Review Call to Action */}
        <button
          onClick={onOpenReview}
          className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-medium text-xs rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Authorize Clinical Decision / Overread</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grad-CAM Mathematical Theory Modal */}
      {showTheoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Grad-CAM Mathematical Foundations</h3>
              </div>
              <button
                onClick={() => setShowTheoryModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                <strong>Gradient-weighted Class Activation Mapping (Grad-CAM)</strong> provides visual explanations
                for convolutional neural networks by computing gradient flows from the target class score into the final convolutional feature maps.
              </p>

              {/* Formula 1 */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] space-y-1">
                <div className="text-cyan-400 font-semibold">1. Neuron Importance Weights:</div>
                <div className="text-white bg-slate-900/80 p-2 rounded text-center">
                  {'α_k^c = (1 / Z) · Σ_i Σ_j (∂ y^c / ∂ A_{i,j}^k)'}
                </div>
                <p className="text-[10px] text-slate-400">
                  Global average pooling of gradients ∂y^c / ∂A^k over spatial width and height (Z = U × V).
                </p>
              </div>

              {/* Formula 2 */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] space-y-1">
                <div className="text-cyan-400 font-semibold">2. Weighted Activation Map & ReLU:</div>
                <div className="text-white bg-slate-900/80 p-2 rounded text-center">
                  {'L_{Grad-CAM}^c = ReLU( Σ_k α_k^c · A^k )'}
                </div>
                <p className="text-[10px] text-slate-400">
                  ReLU ensures the model highlights features that <em>increase</em> confidence in class c, discarding negative activations.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded border border-slate-800 text-[11px]">
                <strong className="text-white">Why DenseNet-121?</strong> Dense blocks reuse feature maps across layers via concatenation, preserving both low-level edges (rib contours) and high-level semantic patterns (consolidation, fluid meniscus).
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowTheoryModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium cursor-pointer"
              >
                Close Theory Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
