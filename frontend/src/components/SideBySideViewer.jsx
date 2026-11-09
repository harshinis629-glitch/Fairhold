import React, { useState, useRef } from 'react';
import { 
  Split, 
  Layers, 
  Maximize2, 
  Eye, 
  Sparkles, 
  AlertCircle,
  ZoomIn,
  RefreshCw
} from 'lucide-react';
import { getImageUrl } from '../services/api';
import { SeverityBadge } from './StatusBadge';

export function SideBySideViewer({ 
  beforeUrl, 
  afterUrl, 
  findings = [], 
  selectedFindingId = null,
  onSelectFinding = () => {},
  itemName = 'Item'
}) {
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side', 'split-slider', 'flip'
  const [sliderPos, setSliderPos] = useState(50);
  const [activeFlip, setActiveFlip] = useState('after');
  const [showOverlays, setShowOverlays] = useState(true);
  const sliderRef = useRef(null);

  const handleSliderMove = (e) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  const handleTouchMove = (e) => {
    handleSliderMove(e);
  };

  const fullBeforeUrl = getImageUrl(beforeUrl);
  const fullAfterUrl = getImageUrl(afterUrl);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      
      {/* Header bar with controls */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Visual Forensics Inspection
              {findings.length > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {findings.length} anomaly{findings.length > 1 ? 'ies' : ''} detected
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Comparative analysis between baseline handover & returned condition
            </p>
          </div>
        </div>

        {/* View mode toggle buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'side-by-side'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('split-slider')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'split-slider'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              Split Slider
            </button>
            <button
              onClick={() => setViewMode('flip')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'flip'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Toggle Flip
            </button>
          </div>

          {/* Overlay markers toggle */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              showOverlays
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle AI damage markers"
          >
            <Eye className="w-3.5 h-3.5" />
            Markers {showOverlays ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main image viewer viewport */}
      <div className="p-4 bg-slate-950/80">
        
        {/* MODE 1: SIDE BY SIDE */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Baseline (Before) */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                BEFORE: Baseline Condition
              </div>
              <div className="aspect-[4/3] flex items-center justify-center bg-slate-950 overflow-hidden">
                {fullBeforeUrl ? (
                  <img
                    src={fullBeforeUrl}
                    alt={`${itemName} baseline`}
                    className="w-full h-full object-contain select-none group-hover:scale-[1.02] transition-transform duration-300"
                  />
                ) : (
                  <div className="text-slate-600 text-xs flex flex-col items-center gap-2">
                    <Layers className="w-8 h-8 text-slate-700" />
                    No baseline photo uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Right: Return (After) with Damage Locator Overlays */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-rose-500/30 text-rose-400 text-xs font-semibold shadow-lg">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                AFTER: Return Inspection
              </div>

              <div className="aspect-[4/3] relative flex items-center justify-center bg-slate-950 overflow-hidden">
                {fullAfterUrl ? (
                  <>
                    <img
                      src={fullAfterUrl}
                      alt={`${itemName} returned`}
                      className="w-full h-full object-contain select-none group-hover:scale-[1.02] transition-transform duration-300"
                    />

                    {/* AI Bounding Boxes / Overlays */}
                    {showOverlays && findings.map((f, idx) => {
                      const box = f.bounding_box || { x: 50, y: 40, width: 16, height: 16 };
                      const isSelected = selectedFindingId === f.id;

                      return (
                        <div
                          key={f.id || idx}
                          onClick={() => onSelectFinding(f.id)}
                          style={{
                            left: `${box.x || 45}%`,
                            top: `${box.y || 40}%`,
                            width: `${box.width || 18}%`,
                            height: `${box.height || 18}%`,
                            transform: 'translate(-20%, -20%)'
                          }}
                          className={`absolute cursor-pointer rounded-lg transition-all duration-200 group/box ${
                            isSelected
                              ? 'border-2 border-rose-400 bg-rose-500/25 ring-4 ring-rose-500/30 z-20'
                              : 'border-2 border-amber-400/90 bg-amber-500/15 hover:border-rose-400 hover:bg-rose-500/20 z-10'
                          }`}
                          title={`${f.item_part}: ${f.damage_type} (${f.severity})`}
                        >
                          {/* Pin Icon / Label */}
                          <div className="absolute -top-7 left-0 whitespace-nowrap bg-slate-900/95 text-white border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            #{idx + 1} {f.damage_type} ({Math.round((f.confidence || 0.9) * 100)}%)
                          </div>

                          {/* Pulsing focal radar ring */}
                          <div className="w-full h-full animate-ping opacity-20 bg-rose-500 rounded-lg pointer-events-none" />
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-slate-600 text-xs flex flex-col items-center gap-2">
                    <Layers className="w-8 h-8 text-slate-700" />
                    No return photo uploaded
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* MODE 2: SPLIT SLIDER */}
        {viewMode === 'split-slider' && (
          <div
            ref={sliderRef}
            onMouseMove={handleSliderMove}
            onTouchMove={handleTouchMove}
            className="relative aspect-[16/9] w-full max-h-[500px] rounded-xl overflow-hidden cursor-ew-resize border border-slate-800 bg-slate-950 select-none shadow-inner"
          >
            {/* Base Image: AFTER */}
            <img
              src={fullAfterUrl || fullBeforeUrl}
              alt="After condition"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Overlaid Clip Image: BEFORE */}
            <div
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <img
                src={fullBeforeUrl}
                alt="Before condition"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Divider Line & Handle */}
            <div
              style={{ left: `${sliderPos}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-xl">
                <Split className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Badges on slider */}
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-slate-900/80 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              ◄ BEFORE (Handover)
            </div>
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-slate-900/80 text-rose-400 text-xs font-semibold border border-rose-500/30">
              AFTER (Return) ►
            </div>
          </div>
        )}

        {/* MODE 3: FLIP TOGGLE */}
        {viewMode === 'flip' && (
          <div className="relative aspect-[16/9] w-full max-h-[500px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
            <img
              src={activeFlip === 'before' ? fullBeforeUrl : fullAfterUrl}
              alt="Flipped condition"
              className="w-full h-full object-contain select-none"
            />
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-slate-900/90 text-xs font-bold border border-slate-700 shadow-lg">
              Showing:{' '}
              <span className={activeFlip === 'before' ? 'text-emerald-400' : 'text-rose-400'}>
                {activeFlip === 'before' ? 'BEFORE (Pristine Handover)' : 'AFTER (Return Inspection)'}
              </span>
            </div>
            <div className="absolute bottom-4 inset-x-0 flex justify-center">
              <button
                onClick={() => setActiveFlip(activeFlip === 'before' ? 'after' : 'before')}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg flex items-center gap-2 border border-brand-400/40"
              >
                <RefreshCw className="w-4 h-4" />
                Toggle to {activeFlip === 'before' ? 'After (Return)' : 'Before (Handover)'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Footer Info strip */}
      <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Baseline verified
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Inspection anomalies marked
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Click any anomaly pin to inspect detailed repair rationale below
        </span>
      </div>

    </div>
  );
}
