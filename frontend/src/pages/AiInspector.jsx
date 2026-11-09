import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { inspectAdhoc } from '../services/api';
import { SideBySideViewer } from '../components/SideBySideViewer';
import { DamageCard } from '../components/DamageCard';

export function AiInspector({ onCreateContractWithFindings, systemStatus }) {
  const [itemName, setItemName] = useState('Sony FX3 Cinema Camera Kit');
  const [category, setCategory] = useState('Camera & Cinema Optics');
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [beforePreview, setBeforePreview] = useState('/uploads/sony_fx3_before.jpg');
  const [afterPreview, setAfterPreview] = useState('/uploads/sony_fx3_after.jpg');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFindingId, setSelectedFindingId] = useState(null);

  const handleBeforeFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setBeforeFile(f);
      setBeforePreview(URL.createObjectURL(f));
    }
  };

  const handleAfterFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setAfterFile(f);
      setAfterPreview(URL.createObjectURL(f));
    }
  };

  const handleRunInspection = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // If user hasn't selected custom files, convert default images into blobs for the API
      let bFile = beforeFile;
      let aFile = afterFile;

      if (!bFile) {
        const bResp = await fetch(beforePreview);
        const bBlob = await bResp.blob();
        bFile = new File([bBlob], "before_sample.jpg", { type: "image/jpeg" });
      }

      if (!aFile) {
        const aResp = await fetch(afterPreview);
        const aBlob = await aResp.blob();
        aFile = new File([aBlob], "after_sample.jpg", { type: "image/jpeg" });
      }

      const res = await inspectAdhoc(itemName, category, bFile, aFile);
      setResult(res);
      if (res.findings?.length > 0) {
        setSelectedFindingId(res.findings[0].id || 0);
      }
    } catch (err) {
      alert(`Inspection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (name, cat, bUrl, aUrl) => {
    setItemName(name);
    setCategory(cat);
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview(bUrl);
    setAfterPreview(aUrl);
    setResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
      
      {/* Title */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Gemini Vision Damage Inspector
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Forensic comparative AI inspection: Detect scratches, dents, and cracks from before & after photos
          </p>
        </div>

        {/* Live or Demo Badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2.5 py-1 rounded-full border font-semibold ${
            systemStatus?.gemini_configured
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
              : 'bg-amber-950/60 text-amber-300 border-amber-800'
          }`}>
            {systemStatus?.gemini_configured ? '● Live Gemini Vision Model' : '● Demo Inspection Fallback Active'}
          </span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs flex flex-wrap items-center gap-2">
        <span className="text-slate-400 font-semibold mr-1">Load Demo Inspection:</span>
        <button
          onClick={() => loadPreset('Sony FX3 Cinema Camera Kit', 'Camera & Cinema Optics', '/uploads/sony_fx3_before.jpg', '/uploads/sony_fx3_after.jpg')}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
        >
          📷 Sony FX3 (Front Element Scratch)
        </button>
        <button
          onClick={() => loadPreset('DJI Mavic 3 Pro Cine Drone', 'Drones & Aerial', '/uploads/drone_before.jpg', '/uploads/drone_after.jpg')}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
        >
          🚁 DJI Mavic 3 (Cracked Rotor Arm)
        </button>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Inputs & File pickers (Cols 4) */}
        <div className="lg:col-span-4 space-y-4">
          <form onSubmit={handleRunInspection} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Item Name
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                1. Baseline Photo (BEFORE)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBeforeFileChange}
                className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1">
                2. Return Photo (AFTER)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAfterFileChange}
                className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:opacity-95 text-white shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Gemini Vision Analyzing Photos...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  Run AI Damage Detection
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Viewer: Visual Results & Damage cards (Cols 8) */}
        <div className="lg:col-span-8 space-y-6">
          <SideBySideViewer
            beforeUrl={beforePreview}
            afterUrl={afterPreview}
            findings={result?.findings || []}
            selectedFindingId={selectedFindingId}
            onSelectFinding={setSelectedFindingId}
            itemName={itemName}
          />

          {/* Results Summary Box */}
          {result && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Inspection Summary</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Proposed Damage Deduction: </span>
                  <span className="text-base font-extrabold text-rose-400 font-mono">
                    ${(result.total_proposed_deduction || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                "{result.summary}"
              </p>

              {/* Findings */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Detected Damage Items ({result.findings?.length || 0})
                </h4>
                {result.findings?.map((f, idx) => (
                  <DamageCard
                    key={f.id || idx}
                    finding={f}
                    index={idx}
                    isSelected={selectedFindingId === (f.id || idx)}
                    onSelect={() => setSelectedFindingId(f.id || idx)}
                    userRole="renter"
                    isSettled={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
