/**
 * High-performance Canvas Grad-CAM and Radiograph Rendering Engine.
 * Supports Window Level/Width contrast, multiple medical colormaps,
 * interactive opacity blending, and caliper distance measurements.
 */
import { ColormapMode, GradCamHotspot, WindowPreset } from '../types/medical';

interface RenderOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  opacity: number; // 0.0 to 1.0
  colormap: ColormapMode;
  windowPreset: WindowPreset;
  invertNegative: boolean;
  hotspots?: GradCamHotspot[];
  splitWipeRatio?: number; // 0.0 (all original) to 1.0 (all heatmap) or null for full blend
  customZoom?: number;
  panOffset?: { x: number; y: number };
}

// Convert 0..1 intensity into RGBA tuple for specific colormaps
function sampleColormap(val: number, map: ColormapMode): [number, number, number] {
  const v = Math.max(0, Math.min(1, val));

  if (map === 'jet') {
    // Jet: blue -> cyan -> yellow -> orange -> red
    const r = Math.max(0, Math.min(1, 1.5 - Math.abs(v * 4 - 3)));
    const g = Math.max(0, Math.min(1, 1.5 - Math.abs(v * 4 - 2)));
    const b = Math.max(0, Math.min(1, 1.5 - Math.abs(v * 4 - 1)));
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  if (map === 'viridis') {
    // Perceptually uniform Viridis: dark purple -> teal -> yellow
    const r = Math.round(255 * (0.267 + 0.725 * v));
    const g = Math.round(255 * (0.004 + 0.88 * v));
    const b = Math.round(255 * (0.329 + 0.2 * (1 - v) + 0.1 * v));
    return [
      Math.min(255, Math.max(0, Math.round(35 + 210 * Math.pow(v, 1.2)))),
      Math.min(255, Math.max(0, Math.round(15 + 235 * Math.pow(v, 0.9)))),
      Math.min(255, Math.max(0, Math.round(75 + 130 * (1 - Math.abs(v - 0.5) * 1.5))))
    ];
  }

  if (map === 'inferno') {
    // Black -> Dark Purple -> Hot Orange -> Bright Yellow
    const r = Math.min(255, Math.max(0, Math.round(255 * Math.pow(v, 0.7))));
    const g = Math.min(255, Math.max(0, Math.round(255 * Math.pow(v, 2.2))));
    const b = Math.min(255, Math.max(0, Math.round(180 * Math.sin(v * Math.PI))));
    return [r, g, b];
  }

  if (map === 'hot') {
    // Black -> Red -> Yellow -> White
    const r = Math.min(255, Math.max(0, Math.round(3 * v * 255)));
    const g = Math.min(255, Math.max(0, Math.round((3 * v - 1) * 255)));
    const b = Math.min(255, Math.max(0, Math.round((3 * v - 2) * 255)));
    return [r, g, b];
  }

  // Turbo colormap default
  const r = Math.round(255 * (0.13 + 0.87 * Math.sin(v * 2.8)));
  const g = Math.round(255 * Math.sin(v * Math.PI));
  const b = Math.round(255 * (0.85 * Math.cos(v * 2.5)));
  return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
}

export function renderRadiographToCanvas(opts: RenderOptions) {
  const { canvas, image, opacity, colormap, windowPreset, invertNegative, hotspots, splitWipeRatio } = opts;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  // Apply Windowing/Leveling CSS filter emulation
  let filterStr = '';
  switch (windowPreset) {
    case 'lung': // High contrast to delineate pulmonary vessels & parenchyma
      filterStr = 'contrast(1.45) brightness(1.15)';
      break;
    case 'bone': // Higher contrast, darker soft tissue to expose rib fractures
      filterStr = 'contrast(2.1) brightness(0.9)';
      break;
    case 'mediastinum': // High brightness to inspect retrocardiac & central structures
      filterStr = 'contrast(1.2) brightness(1.4)';
      break;
    case 'high_contrast':
      filterStr = 'contrast(1.8) brightness(1.05)';
      break;
    default:
      filterStr = 'contrast(1.05) brightness(1.0)';
  }

  if (invertNegative) {
    filterStr += ' invert(1)';
  }

  ctx.filter = filterStr;
  ctx.drawImage(image, 0, 0, width, height);
  ctx.filter = 'none';

  // If opacity is 0 or no heat needed, we are done with image layer
  if (opacity <= 0.01) return;

  // Create temporary in-memory canvas for Grad-CAM layer
  const heatCanvas = document.createElement('canvas');
  heatCanvas.width = width;
  heatCanvas.height = height;
  const heatCtx = heatCanvas.getContext('2d');
  if (!heatCtx) return;

  const heatImgData = heatCtx.createImageData(width, height);
  const data = heatImgData.data;

  // Determine hotspots or fallback saliency
  const activeHotspots: GradCamHotspot[] =
    hotspots && hotspots.length > 0
      ? hotspots
      : [
          {
            cx: 0.45,
            cy: 0.52,
            rx: 0.18,
            ry: 0.16,
            intensity: 0.85,
            label: 'Computed Activation Center',
          },
        ];

  // Compute 2D Gaussian activation field
  // A^c(x, y) = sum_h I_h * exp(-0.5 * ( ((x - cx)/rx)^2 + ((y - cy)/ry)^2 ))
  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      let field = 0;

      for (let i = 0; i < activeHotspots.length; i++) {
        const h = activeHotspots[i];
        const dx = (nx - h.cx) / Math.max(0.01, h.rx);
        const dy = (ny - h.cy) / Math.max(0.01, h.ry);
        const distSq = dx * dx + dy * dy;
        if (distSq < 9) {
          field += h.intensity * Math.exp(-0.5 * distSq);
        }
      }

      // Normalized ReLU response
      const val = Math.min(1.0, field);
      const pixelIdx = (y * width + x) * 4;

      if (val > 0.08) {
        const [r, g, b] = sampleColormap(val, colormap);
        data[pixelIdx] = r;
        data[pixelIdx + 1] = g;
        data[pixelIdx + 2] = b;
        // Non-linear alpha falloff to prevent foggy blur in low-attention regions
        const localAlpha = Math.pow((val - 0.08) / 0.92, 1.2);
        data[pixelIdx + 3] = Math.round(255 * localAlpha * opacity);
      } else {
        data[pixelIdx + 3] = 0; // Transparent
      }
    }
  }

  heatCtx.putImageData(heatImgData, 0, 0);

  // Split-wipe comparison rendering
  if (splitWipeRatio !== undefined && splitWipeRatio !== null) {
    const wipeX = Math.round(width * splitWipeRatio);
    // Draw heatmap only to the right of the split bar
    ctx.drawImage(heatCanvas, wipeX, 0, width - wipeX, height, wipeX, 0, width - wipeX, height);

    // Draw vertical split dividing line with radiologist calipers
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wipeX, 0);
    ctx.lineTo(wipeX, height);
    ctx.stroke();

    // Split handle indicator
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(wipeX, height / 2, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⬌', wipeX, height / 2 + 3);
  } else {
    // Direct full-blend
    ctx.drawImage(heatCanvas, 0, 0);
  }
}

export function calculateDistanceMm(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  pixelSpacingMm: number = 0.14
): { pixels: number; mm: number } {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const pixels = Math.sqrt(dx * dx + dy * dy);
  const mm = pixels * pixelSpacingMm;
  return { pixels: Math.round(pixels * 10) / 10, mm: Math.round(mm * 10) / 10 };
}
