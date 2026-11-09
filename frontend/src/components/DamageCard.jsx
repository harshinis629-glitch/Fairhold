import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  Edit3, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  Percent
} from 'lucide-react';
import { SeverityBadge } from './StatusBadge';

export function DamageCard({ 
  finding, 
  index, 
  isSelected = false, 
  onSelect = () => {},
  userRole = 'owner', 
  isSettled = false,
  decision = 'PENDING',
  adjustedAmount = null,
  onDecisionChange = () => {}
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localAmount, setLocalAmount] = useState(
    adjustedAmount !== null ? adjustedAmount : finding.proposed_deduction
  );

  const handleApprove = () => {
    setIsEditing(false);
    onDecisionChange(finding.id, 'APPROVED', finding.proposed_deduction);
  };

  const handleReject = () => {
    setIsEditing(false);
    onDecisionChange(finding.id, 'REJECTED', 0.0);
  };

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(localAmount) || 0;
    setIsEditing(false);
    onDecisionChange(finding.id, 'ADJUSTED', val);
  };

  const currentDecision = decision || finding.owner_decision || 'PENDING';
  const effectiveAmount = 
    currentDecision === 'REJECTED' 
      ? 0.0 
      : currentDecision === 'ADJUSTED' && adjustedAmount !== null
        ? adjustedAmount
        : finding.proposed_deduction;

  return (
    <div 
      onClick={() => onSelect(finding.id)}
      className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-slate-800/90 border-brand-500 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
      }`}
    >
      {/* Top Header: Anomaly #, Part Name, Severity, Confidence */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-xs font-mono font-bold text-slate-300 border border-slate-700">
            #{index + 1}
          </span>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {finding.item_part}
            </h4>
            <span className="text-xs text-slate-400 font-medium">
              Damage Type: <span className="text-slate-200 font-semibold">{finding.damage_type}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SeverityBadge severity={finding.severity} />
          
          {/* AI Confidence Meter */}
          <div 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/60 text-xs font-semibold"
            title={`Gemini Vision Confidence: ${Math.round(finding.confidence * 100)}%`}
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>{Math.round(finding.confidence * 100)}% conf.</span>
          </div>
        </div>
      </div>

      {/* AI Forensic Description */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
        <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Forensic Inspection Rationale:
        </div>
        {finding.description}
      </div>

      {/* Financials & Owner Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        
        {/* Cost breakdown */}
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Est. Restoration Cost</span>
            <span className="font-semibold text-slate-300 line-through">
              ${(finding.estimated_repair_cost || 0).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">AI Proposed Deduction</span>
            <span className="font-bold text-rose-400">
              ${(finding.proposed_deduction || 0).toFixed(2)}
            </span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-500 block text-[11px]">Effective Deduction</span>
            <span className={`font-extrabold text-sm ${currentDecision === 'REJECTED' ? 'text-emerald-400 line-through' : 'text-emerald-400'}`}>
              ${effectiveAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Adjudication Status & Controls */}
        <div className="flex items-center gap-2">
          
          {/* If already settled, show read-only status */}
          {isSettled ? (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
              currentDecision === 'REJECTED'
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
            }`}>
              {currentDecision === 'REJECTED' ? 'Waived (Normal Wear)' : `Deducted $${effectiveAmount.toFixed(2)}`}
            </span>
          ) : userRole === 'owner' ? (
            
            /* Owner Interactive Buttons */
            isEditing ? (
              <form onSubmit={handleAdjustSubmit} className="flex items-center gap-1.5">
                <div className="relative">
                  <span className="absolute left-2 top-1.5 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={localAmount}
                    onChange={(e) => setLocalAmount(e.target.value)}
                    className="w-20 pl-5 pr-2 py-1 rounded-lg bg-slate-950 border border-brand-500 text-xs text-white focus:outline-none"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleApprove}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    currentDecision === 'APPROVED'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-800 hover:bg-emerald-950/40 hover:text-emerald-300 text-slate-300 border border-slate-700'
                  }`}
                  title="Approve AI's proposed deduction amount"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve (${finding.proposed_deduction.toFixed(0)})
                </button>

                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    currentDecision === 'ADJUSTED'
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-slate-800 hover:bg-amber-950/40 hover:text-amber-300 text-slate-300 border border-slate-700'
                  }`}
                  title="Edit custom deduction amount"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {currentDecision === 'ADJUSTED' ? `Adjusted ($${effectiveAmount})` : 'Adjust'}
                </button>

                <button
                  onClick={handleReject}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    currentDecision === 'REJECTED'
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 text-slate-300 border border-slate-700'
                  }`}
                  title="Reject deduction (mark as reasonable production wear)"
                >
                  <X className="w-3.5 h-3.5" />
                  Waive
                </button>
              </div>
            )
          ) : (
            /* Renter View: Transparent Status Tag */
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
              currentDecision === 'REJECTED'
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                : 'bg-amber-950/60 text-amber-300 border-amber-800'
            }`}>
              {currentDecision === 'REJECTED'
                ? 'Waived by Owner ($0.00)'
                : currentDecision === 'ADJUSTED'
                  ? `Owner Adjusted to $${effectiveAmount.toFixed(2)}`
                  : `Owner Approved $${effectiveAmount.toFixed(2)}`}
            </span>
          )}

        </div>

      </div>

    </div>
  );
}
