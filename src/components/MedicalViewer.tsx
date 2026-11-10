/**
 * Radiologist-Grade Interactive Medical Radiograph & Grad-CAM Viewer.
 * Features Window Width / Window Level, Multi-colormap rendering, Caliper measurement,
 * Invert Negative, Zoom/Pan, and Split-screen wipe comparison.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Layers,
  Ruler,
  Maximize2,
  Minimize2,
  Split,
  Eye,
  Info,
  Move,
  Flame,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { MedicalCase, ColormapMode, WindowPreset } from '../types/medical';
import { renderRadiographToCanvas, calculateDistanceMm } from '../utils/gradcamRenderer';

interface MedicalViewerProps {
  currentCase: MedicalCase;
  onOpenReview: () => void;
}

export const MedicalViewer: React.FC<MedicalViewerProps> = ({ currentCase, onOpenReview }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Viewer state
  const [opacity, setOpacity] = useState<number>(0.65);
  const [colormap, setColormap] = useState<ColormapMode>('jet');
  const [windowPreset, setWindowPreset] = useState<WindowPreset>('default');
  const [invertNegative, setInvertNegative] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false);
  const [splitRatio, setSplitRatio] = useState<number>(0.5);
  const [isCaliperActive, setIsCaliperActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Caliper points
  const [caliperStart, setCaliperStart] = useState<{ x: number; y: number } | null>(null);
  const [caliperEnd, setCaliperEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDrawingCaliper, setIsDrawingCaliper] = useState<boolean>(false);

  // Inspector crosshair
  const [mousePos, setMousePos] = useState<{ x: number; y: number; normX: number; normY: number } | null>(null);

  // Load image element
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentCase.imageUrl;
    img.onload = () => {
      imageObjRef.current = img;
      renderCurrentFrame();
    };
  }, [currentCase.imageUrl]);

  const renderCurrentFrame = useCallback(() => {
    if (!canvasRef.current || !imageObjRef.current) return;
    renderRadiographToCanvas({
      canvas: canvasRef.current,
      image: imageObjRef.current,
      opacity,
      colormap,
      windowPreset,
      invertNegative,
      hotspots: currentCase.aiPrediction.hotspots,
      splitWipeRatio: isSplitMode ? splitRatio : undefined,
    });
  }, [opacity, colormap, windowPreset, invertNegative, currentCase.aiPrediction.hotspots, isSplitMode, splitRatio]);

  useEffect(() => {
    renderCurrentFrame();
  }, [renderCurrentFrame]);

  // Handle Caliper & Mouse tracking
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCaliperActive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvasRef.current.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvasRef.current.height;
    setCaliperStart({ x, y });
    setCaliperEnd({ x, y });
    setIsDrawingCaliper(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvasRef.current.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvasRef.current.height;

    setMousePos({
      x: Math.round(x),
      y: Math.round(y),
      normX: Math.round((x / canvasRef.current.width) * 100),
      normY: Math.round((y / canvasRef.current.height) * 100),
    });

    if (isSplitMode && e.buttons === 1 && !isCaliperActive) {
      const ratio = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
      setSplitRatio(ratio);
    }

    if (isDrawingCaliper && caliperStart) {
      setCaliperEnd({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (isDrawingCaliper) {
      setIsDrawingCaliper(false);
    }
  };

  const resetViewer = () => {
    setZoom(1.0);
    setOpacity(0.65);
    setWindowPreset('default');
    setInvertNegative(false);
    setIsSplitMode(false);
    setCaliperStart(null);
    setCaliperEnd(null);
    setIsCaliperActive(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Measured distance if caliper is set
  const caliperDistance =
    caliperStart && caliperEnd
      ? calculateDistanceMm(caliperStart, caliperEnd, currentCase.dicom.pixelSpacingMm)
      : null;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-full'
      }`}
    >
      {/* Workstation Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-mono text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              {currentCase.dicom.modality} · {currentCase.dicom.viewPosition}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-xs text-slate-300 font-medium">{currentCase.accessionNumber}</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400">{currentCase.patientPseudonym}</span>
        </div>

        {/* Quick Review Status Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            {currentCase.review.status === 'APPROVED' ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approved by {currentCase.review.reviewerName?.split(',')[0]}
              </span>
            ) : currentCase.review.status === 'REJECTED' ? (
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Overridden / Rejected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                Pending Radiologist Review
              </span>
            )}
          </div>

          <button
            onClick={onOpenReview}
            className="px-3 py-1 text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors shadow-sm cursor-pointer"
          >
            Review Case
          </button>
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[440px] select-none">
        {/* Canvas viewport */}
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="transition-transform duration-100 ease-out relative cursor-crosshair"
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={650}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="max-h-[580px] w-auto aspect-[600/650] block object-contain shadow-2xl"
          />

          {/* SVG Caliper Overlay */}
          {caliperStart && caliperEnd && (
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full"
              viewBox="0 0 600 650"
            >
              <line
                x1={caliperStart.x}
                y1={caliperStart.y}
                x2={caliperEnd.x}
                y2={caliperEnd.y}
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <circle cx={caliperStart.x} cy={caliperStart.y} r="4" fill="#38bdf8" />
              <circle cx={caliperEnd.x} cy={caliperEnd.y} r="4" fill="#38bdf8" />
              {caliperDistance && (
                <g>
                  <rect
                    x={(caliperStart.x + caliperEnd.x) / 2 - 35}
                    y={(caliperStart.y + caliperEnd.y) / 2 - 20}
                    width="70"
                    height="18"
                    rx="3"
                    fill="#0f172a"
                    stroke="#0284c7"
                    strokeWidth="1"
                  />
                  <text
                    x={(caliperStart.x + caliperEnd.x) / 2}
                    y={(caliperStart.y + caliperEnd.y) / 2 - 7}
                    fill="#38bdf8"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {caliperDistance.mm} mm
                  </text>
                </g>
              )}
            </svg>
          )}
        </div>

        {/* Anatomical HUD Telemetry (Top Left of image) */}
        <div className="absolute top-3 left-3 pointer-events-none font-mono text-[11px] text-slate-400/90 leading-tight bg-slate-950/60 p-2 rounded backdrop-blur-sm border border-slate-800/50">
          <p className="text-slate-200 font-semibold">{currentCase.dicom.bodyPartExamined} · {currentCase.dicom.viewPosition}</p>
          <p>kVp: {currentCase.dicom.kvp} · {currentCase.dicom.exposureTimeMs}ms</p>
          <p>WC: {currentCase.dicom.windowCenter} / WW: {currentCase.dicom.windowWidth}</p>
          <p className="text-cyan-400">Scale: {Math.round(zoom * 100)}%</p>
          {caliperDistance && (
            <p className="text-amber-400 font-semibold mt-1">
              Lesion: {caliperDistance.mm} mm ({caliperDistance.pixels} px)
            </p>
          )}
        </div>

        {/* Live Cursor Probe (Bottom Left of image) */}
        {mousePos && (
          <div className="absolute bottom-3 left-3 pointer-events-none font-mono text-[11px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/50">
            X: {mousePos.x}px · Y: {mousePos.y}px ({mousePos.normX}%, {mousePos.normY}%)
          </div>
        )}

        {/* Grad-CAM Hotspot Labels Floating Pill */}
        {opacity > 0.2 && currentCase.aiPrediction.hotspots.length > 0 && (
          <div className="absolute top-3 right-3 max-w-[240px] bg-slate-950/85 border border-cyan-800/40 p-2.5 rounded text-xs text-slate-300 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-1.5 text-cyan-400 font-medium mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Grad-CAM Attention Peak</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {currentCase.aiPrediction.hotspots[0].label}
            </p>
          </div>
        )}
      </div>

      {/* Workstation Control Ribbon */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-3">
        {/* Row 1: Heatmap Opacity & Colormap Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Opacity Slider */}
          <div className="flex items-center gap-3 flex-1 min-w-[260px]">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium shrink-0">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Heatmap Blend:</span>
              <span className="font-mono text-cyan-400 w-9">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Colormap Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Palette:</span>
            <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-800">
              {(['jet', 'viridis', 'turbo', 'inferno', 'hot'] as ColormapMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setColormap(mode)}
                  className={`px-2 py-1 text-[11px] font-mono capitalize rounded transition-colors ${
                    colormap === mode
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Windowing Presets, Caliper, Compare Wipe, and Zoom */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-800/60">
          {/* Window / Level Presets */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Window:</span>
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'default', label: 'Default' },
                  { id: 'lung', label: 'Lung (Parenchyma)' },
                  { id: 'bone', label: 'Bone / Ribs' },
                  { id: 'mediastinum', label: 'Mediastinum' },
                  { id: 'high_contrast', label: 'High Contrast' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setWindowPreset(preset.id)}
                  className={`px-2 py-1 text-[11px] rounded transition-colors ${
                    windowPreset === preset.id
                      ? 'bg-slate-800 text-white font-medium border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Caliper, Split Wipe, Invert, Zoom */}
          <div className="flex items-center gap-1.5">
            {/* Invert Negative */}
            <button
              onClick={() => setInvertNegative(!invertNegative)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                invertNegative
                  ? 'bg-slate-200 text-slate-900 border-white'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
              title="Toggle photographic negative contrast"
            >
              Invert
            </button>

            {/* Split Comparison Mode */}
            <button
              onClick={() => setIsSplitMode(!isSplitMode)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                isSplitMode
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
              title="Toggle side-by-side wipe comparison"
            >
              <Split className="w-3 h-3" />
              <span>Split Wipe</span>
            </button>

            {/* Caliper Tool */}
            <button
              onClick={() => {
                setIsCaliperActive(!isCaliperActive);
                if (isCaliperActive) {
                  setCaliperStart(null);
                  setCaliperEnd(null);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                isCaliperActive
                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
              title="Measure opacity/lesion diameter in millimeters"
            >
              <Ruler className="w-3 h-3" />
              <span>Caliper</span>
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1"></div>

            {/* Zoom Controls */}
            <button
              onClick={() => setZoom((z) => Math.min(3.0, z + 0.25))}
              className="p-1 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
              className="p-1 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetViewer}
              className="p-1 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
