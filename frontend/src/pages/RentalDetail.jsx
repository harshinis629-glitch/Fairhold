import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  User,
  Share2,
  FileText
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { SideBySideViewer } from '../components/SideBySideViewer';
import { DamageCard } from '../components/DamageCard';
import { SettlementBreakdown } from '../components/SettlementBreakdown';
import { PayPalPaymentModal } from '../components/PayPalPaymentModal';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { 
  fetchRentalById, 
  runAiInspection, 
  submitOwnerReview, 
  executeSettlement, 
  uploadRentalPhotos,
  submitDispute 
} from '../services/api';

export function RentalDetail({ 
  rentalId, 
  onBack, 
  userRole = 'owner',
  systemStatus 
}) {
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inspecting, setInspecting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Owner decisions state: finding_id -> { decision: 'APPROVED' | 'ADJUSTED' | 'REJECTED', amount: number }
  const [decisions, setDecisions] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedFindingId, setSelectedFindingId] = useState(null);

  // PayPal settlement modal state
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [settlementError, setSettlementError] = useState(null);
  const [settlementResult, setSettlementResult] = useState(null);

  // Renter dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Normal Production Wear');
  const [disputeNotes, setDisputeNotes] = useState('');

  // Photo upload files
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);

  useEffect(() => {
    loadRental();
  }, [rentalId]);

  const loadRental = async () => {
    try {
      setLoading(true);
      const data = await fetchRentalById(rentalId);
      setRental(data);

      // Initialize decisions map from data
      const initDecisions = {};
      data.findings?.forEach((f) => {
        initDecisions[f.id] = {
          decision: f.owner_decision || 'PENDING',
          amount: f.owner_adjusted_amount !== null && f.owner_adjusted_amount !== undefined 
            ? f.owner_adjusted_amount 
            : f.proposed_deduction
        };
      });
      setDecisions(initDecisions);
      setHasUnsavedChanges(false);
      if (data.findings?.length > 0) {
        setSelectedFindingId(data.findings[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionChange = (findingId, decision, amount) => {
    setDecisions((prev) => ({
      ...prev,
      [findingId]: { decision, amount }
    }));
    setHasUnsavedChanges(true);
  };

  // Compute live approved total from current decisions
  const liveApprovedTotal = rental?.findings?.reduce((sum, f) => {
    const d = decisions[f.id];
    if (!d) return sum + (f.owner_decision === 'REJECTED' ? 0 : f.proposed_deduction);
    if (d.decision === 'REJECTED') return sum;
    if (d.decision === 'ADJUSTED') return sum + (d.amount || 0);
    return sum + (f.proposed_deduction || 0);
  }, 0) || 0;

  const handleSaveReview = async (notes) => {
    try {
      const payload = rental.findings.map((f) => ({
        finding_id: f.id,
        owner_decision: decisions[f.id]?.decision || 'APPROVED',
        owner_adjusted_amount: decisions[f.id]?.amount ?? f.proposed_deduction
      }));

      const updated = await submitOwnerReview(rental.id, payload, notes);
      setRental(updated);
      setHasUnsavedChanges(false);
    } catch (err) {
      alert(`Error saving review: ${err.message}`);
    }
  };

  const handleRunAiInspection = async () => {
    try {
      setInspecting(true);
      const updated = await runAiInspection(rental.id);
      setRental(updated);
      
      const newDecisions = {};
      updated.findings?.forEach((f) => {
        newDecisions[f.id] = {
          decision: 'PENDING',
          amount: f.proposed_deduction
        };
      });
      setDecisions(newDecisions);
      if (updated.findings?.length > 0) {
        setSelectedFindingId(updated.findings[0].id);
      }
    } catch (err) {
      alert(`AI inspection failed: ${err.message}`);
    } finally {
      setInspecting(false);
    }
  };

  const handleUploadPhotos = async (e) => {
    e.preventDefault();
    if (!beforeFile && !afterFile) {
      alert('Please select at least one photo to upload.');
      return;
    }
    try {
      setUploading(true);
      const updated = await uploadRentalPhotos(rental.id, beforeFile, afterFile);
      setRental(updated);
      setBeforeFile(null);
      setAfterFile(null);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleExecuteSettlement = async (notes) => {
    // If there are unsaved review changes, save them first
    if (hasUnsavedChanges) {
      await handleSaveReview(notes);
    }
    setShowPayPalModal(true);
  };

  const handleConfirmPayPalSettlement = async () => {
    try {
      setIsSettling(true);
      setSettlementError(null);
      const settled = await executeSettlement(rental.id);
      setSettlementResult(settled);
      setRental(settled);
    } catch (err) {
      setSettlementError(err.message || 'PayPal settlement failed');
    } finally {
      setIsSettling(false);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await submitDispute(rental.id, disputeReason, disputeNotes);
      setRental(updated);
      setShowDisputeModal(false);
    } catch (err) {
      alert(`Failed to submit dispute: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-3" />
        <p className="text-sm">Loading rental contract & verification proofs...</p>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <p>Rental agreement not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-brand-600 rounded-xl text-white text-xs">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">{rental.id}</span>
              <StatusBadge status={rental.status} />
              <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                • Auth: {rental.paypal_authorization_id || 'SANDBOX-HELD'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {rental.item_name}
            </h1>
          </div>
        </div>

        {/* Action Buttons: Run AI Inspection */}
        <div className="flex items-center gap-2">
          {rental.status !== 'SETTLED' && (
            <button
              onClick={handleRunAiInspection}
              disabled={inspecting}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${
                inspecting
                  ? 'bg-purple-800 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/30 hover:scale-[1.02]'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${inspecting ? 'animate-spin' : 'text-purple-300'}`} />
              {inspecting ? 'Inspecting with Gemini Vision...' : 'Re-Run Gemini Vision Inspection'}
            </button>
          )}
        </div>
      </div>

      {/* Contract Metadata Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-6 text-xs">
        <div>
          <span className="text-slate-500 block text-[11px] uppercase">Renter</span>
          <span className="font-semibold text-slate-200 block truncate">{rental.renter_name}</span>
          <span className="text-[11px] text-slate-400">{rental.renter_email}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px] uppercase">Owner / Studio</span>
          <span className="font-semibold text-slate-200 block truncate">{rental.owner_name}</span>
          <span className="text-[11px] text-slate-400">{rental.owner_email}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px] uppercase">Financial Escrow</span>
          <span className="font-bold text-emerald-400 block">
            ${rental.deposit_amount.toFixed(2)} deposit held
          </span>
          <span className="text-[11px] text-slate-400">${rental.rental_fee.toFixed(2)} rental fee</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px] uppercase">PayPal Status</span>
          <span className="font-mono font-bold text-brand-300 block truncate">
            {rental.paypal_auth_status || 'AUTHORIZED'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono truncate block">
            Order: {rental.paypal_order_id || 'PENDING'}
          </span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKFLOW LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Visual Inspection & Findings List (Cols 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* FEATURE 1: Interactive Side-by-Side Viewer */}
          <div>
            <SideBySideViewer
              beforeUrl={rental.before_image_url}
              afterUrl={rental.after_image_url}
              findings={rental.findings}
              selectedFindingId={selectedFindingId}
              onSelectFinding={setSelectedFindingId}
              itemName={rental.item_name}
            />
          </div>

          {/* Photo Upload Accordion (Upload custom test photos) */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
            <details className="group">
              <summary className="font-semibold text-slate-300 cursor-pointer flex items-center justify-between list-none">
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-brand-400" />
                  Upload Custom Condition Photos
                </span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <form onSubmit={handleUploadPhotos} className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Upload Baseline (Before) Photo:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBeforeFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Upload Return (After) Photo:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAfterFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold"
                  >
                    {uploading ? 'Uploading...' : 'Save Photos & Update Proof'}
                  </button>
                </div>
              </form>
            </details>
          </div>

          {/* AI Damage Findings & Adjudication List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  Itemized Forensic Damage Findings
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {rental.findings?.length || 0} findings detected
              </span>
            </div>

            {rental.findings && rental.findings.length > 0 ? (
              <div className="space-y-4">
                {rental.findings.map((finding, idx) => (
                  <DamageCard
                    key={finding.id}
                    finding={finding}
                    index={idx}
                    isSelected={selectedFindingId === finding.id}
                    onSelect={setSelectedFindingId}
                    userRole={userRole}
                    isSettled={rental.status === 'SETTLED'}
                    decision={decisions[finding.id]?.decision}
                    adjustedAmount={decisions[finding.id]?.amount}
                    onDecisionChange={handleDecisionChange}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">
                  Pristine Condition Verified
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Gemini Vision found zero new scratches, dents, or cracks compared to baseline. Full deposit qualifies for 100% refund.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Transparent Settlement Ledger & Activity Timeline (Cols 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* FEATURE 2: Owner-Approved Settlement Breakdown Card */}
          <SettlementBreakdown
            rental={rental}
            approvedDeductionsTotal={liveApprovedTotal}
            userRole={userRole}
            onExecuteSettlement={handleExecuteSettlement}
            onOpenDispute={() => setShowDisputeModal(true)}
            onSaveReview={handleSaveReview}
            hasUnsavedChanges={hasUnsavedChanges}
            isExecuting={isSettling}
          />

          {/* Activity Timeline */}
          <ActivityTimeline logs={rental.activity_logs} />

        </div>

      </div>

      {/* FEATURE 3: PayPal Sandbox Execution Modal */}
      <PayPalPaymentModal
        isOpen={showPayPalModal}
        onClose={() => setShowPayPalModal(false)}
        rental={rental}
        approvedDeduction={liveApprovedTotal}
        onConfirmSettlement={handleConfirmPayPalSettlement}
        isProcessing={isSettling}
        error={settlementError}
        settlementResult={settlementResult}
      />

      {/* Renter Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-slate-200 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              File Settlement Dispute
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Renters have full protection rights. If you believe the proposed deduction is normal pre-existing wear or incorrect, submit your rationale for platform mediation.
            </p>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dispute Reason
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="Pre-existing baseline condition">Pre-existing baseline condition</option>
                  <option value="Normal Production Wear">Normal expected production wear & tear</option>
                  <option value="Disputed repair estimate">Disputed repair/replacement quote</option>
                  <option value="Other">Other condition dispute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Renter Statement & Details
                </label>
                <textarea
                  required
                  rows={3}
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  placeholder="Explain why you disagree with the owner's deduction claim..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
