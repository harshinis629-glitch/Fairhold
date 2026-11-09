import React, { useState } from 'react';
import { 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  RotateCcw,
  ShieldCheck,
  FileText,
  Lock,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export function SettlementBreakdown({
  rental,
  approvedDeductionsTotal = 0,
  userRole = 'owner',
  onExecuteSettlement = () => {},
  onOpenDispute = () => {},
  onSaveReview = () => {},
  hasUnsavedChanges = false,
  isExecuting = false
}) {
  const [ownerNotes, setOwnerNotes] = useState(rental.owner_notes || '');

  const rentalFee = rental.rental_fee || 0;
  const depositAmount = rental.deposit_amount || 0;
  const totalAuthorized = rental.total_authorized || (rentalFee + depositAmount);
  
  // Use current live approved deductions if in review, else database field
  const currentDeductions = Math.min(approvedDeductionsTotal, depositAmount);
  
  // Captured: Rental fee + approved damages
  const netCaptured = round(rentalFee + currentDeductions);
  // Refunded: Deposit - approved damages (voided authorization)
  const netRefunded = round(Math.max(0, depositAmount - currentDeductions));
  
  const refundPercent = depositAmount > 0 ? Math.round((netRefunded / depositAmount) * 100) : 100;

  function round(val) {
    return Math.round(val * 100) / 100;
  }

  const isSettled = rental.status === 'SETTLED';
  const isDisputed = rental.status === 'DISPUTED';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Background ambient fintech glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Transparent Settlement Breakdown</h3>
            <p className="text-xs text-slate-400">
              Deterministic, formulaic escrow ledger backed by PayPal Sandbox
            </p>
          </div>
        </div>

        {isSettled ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Settled & Executed
          </span>
        ) : isDisputed ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 text-rose-300 border border-rose-700/60 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Under Renter Dispute
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-700/60 text-xs font-bold">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Pre-Authorized Escrow
          </span>
        )}
      </div>

      {/* Visual Deposit Allocation Meter */}
      <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="flex justify-between text-xs font-semibold mb-2">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Deposit Refunded to Renter: ${netRefunded.toFixed(2)} ({refundPercent}%)
          </span>
          <span className="text-rose-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Damage Deducted: ${currentDeductions.toFixed(2)} ({100 - refundPercent}%)
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${refundPercent}%` }} 
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" 
          />
          <div 
            style={{ width: `${100 - refundPercent}%` }} 
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500" 
          />
        </div>
      </div>

      {/* Itemized Calculation Ledger */}
      <div className="space-y-3 text-sm mb-6 divide-y divide-slate-800/80">
        
        {/* Line 1: Pre-authorization */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-400 text-xs flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            Total Authorized by PayPal
          </span>
          <span className="font-mono font-semibold text-slate-200">
            ${totalAuthorized.toFixed(2)} {rental.currency}
          </span>
        </div>

        {/* Line 2: Rental Fee */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-400 text-xs pl-5">
            • Fixed Rental Contract Fee
          </span>
          <span className="font-mono text-slate-300">
            ${rentalFee.toFixed(2)}
          </span>
        </div>

        {/* Line 3: Security Deposit */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-400 text-xs pl-5">
            • Refundable Security Deposit Held
          </span>
          <span className="font-mono text-slate-300">
            ${depositAmount.toFixed(2)}
          </span>
        </div>

        {/* Line 4: Approved Damage Deductions */}
        <div className="flex justify-between items-center pt-2">
          <div className="text-xs">
            <span className="text-rose-400 font-medium pl-5 block">
              • Less: Owner-Approved Damage Deductions
            </span>
            <span className="text-[11px] text-slate-500 pl-5">
              Itemized repair claims adjudicated from Gemini AI
            </span>
          </div>
          <span className="font-mono font-bold text-rose-400">
            - ${currentDeductions.toFixed(2)}
          </span>
        </div>

        {/* Line 5: Summary Cards */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Card A: Net Captured */}
          <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-800/50">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-brand-300 block mb-1">
              Net PayPal Capture (Fee + Damage)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white font-mono">
                ${netCaptured.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-400">debited</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Transferred to owner via PayPal REST capture
            </span>
          </div>

          {/* Card B: Net Released Deposit */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-300 block mb-1">
              Net Deposit Released to Renter
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                ${netRefunded.toFixed(2)}
              </span>
              <span className="text-[11px] text-emerald-400/80">returned</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Released immediately via PayPal REST void
            </span>
          </div>

        </div>

      </div>

      {/* Owner Notes Section */}
      {!isSettled && userRole === 'owner' && (
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Owner Settlement Statement & Deductions Rationale</span>
            {hasUnsavedChanges && (
              <span className="text-[11px] text-amber-400 animate-pulse">
                ● Unsaved review edits
              </span>
            )}
          </label>
          <textarea
            value={ownerNotes}
            onChange={(e) => setOwnerNotes(e.target.value)}
            placeholder="Add explanation for approved deductions or waivers (visible to renter on transparent settlement receipt)..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      )}

      {/* Existing Notes Display */}
      {rental.owner_notes && (isSettled || userRole === 'renter') && (
        <div className="mb-6 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-brand-400" />
            Owner's Inspection Statement:
          </div>
          <p className="text-slate-300 leading-relaxed italic">
            "{rental.owner_notes}"
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
        
        {/* Left: Secondary actions or status */}
        <div>
          {hasUnsavedChanges && userRole === 'owner' && (
            <button
              onClick={() => onSaveReview(ownerNotes)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors"
            >
              Save Review Changes
            </button>
          )}

          {userRole === 'renter' && !isSettled && !isDisputed && (
            <button
              onClick={onOpenDispute}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-semibold transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Dispute Damage Deduction
            </button>
          )}
        </div>

        {/* Right: Primary Settlement Trigger (PayPal Sandbox) */}
        {!isSettled ? (
          <button
            onClick={() => onExecuteSettlement(ownerNotes)}
            disabled={isExecuting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
              isExecuting
                ? 'bg-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/20 hover:scale-[1.02]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            {isExecuting 
              ? 'Executing PayPal Sandbox Capture & Void...' 
              : `Finalize & Execute Settlement ($${netCaptured.toFixed(2)})`}
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Settlement executed via PayPal Sandbox
          </div>
        )}

      </div>

    </div>
  );
}
