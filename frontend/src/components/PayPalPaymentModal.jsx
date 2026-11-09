import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  X, 
  Code, 
  ShieldCheck, 
  ExternalLink,
  Lock,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function PayPalPaymentModal({
  isOpen,
  onClose,
  rental,
  approvedDeduction,
  onConfirmSettlement,
  isProcessing = false,
  error = null,
  settlementResult = null
}) {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen) return null;

  const rentalFee = rental.rental_fee || 0;
  const deposit = rental.deposit_amount || 0;
  const deduction = Math.min(approvedDeduction, deposit);
  const captureAmount = Math.round((rentalFee + deduction) * 100) / 100;
  const voidAmount = Math.round(Math.max(0, deposit - deduction) * 100) / 100;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore if canvas-confetti is not loaded
    }
  };

  const isSuccess = !!settlementResult || rental.status === 'SETTLED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 text-slate-200 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        {!isProcessing && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className={`p-3 rounded-2xl ${isSuccess ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-brand-500/15 text-brand-400 border border-brand-500/30'}`}>
            {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isSuccess ? 'PayPal Settlement Finalized' : 'Execute PayPal Sandbox Settlement'}
            </h3>
            <p className="text-xs text-slate-400">
              {isSuccess 
                ? 'Capture & Void operations executed with actual PayPal REST API responses' 
                : 'Atomic 2-step capture and void transaction on authorized deposit'}
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm mb-0.5">PayPal Transaction Failed</span>
              <p className="leading-relaxed">{error}</p>
              <p className="text-[11px] text-rose-300 mt-2">
                Note: Ensure your `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in `backend/.env` are valid for PayPal Sandbox.
              </p>
            </div>
          </div>
        )}

        {/* 2-Step Settlement Diagram */}
        <div className="space-y-3 mb-6">
          
          {/* Step 1: Capture Fee + Damages */}
          <div className={`p-4 rounded-xl border transition-all ${
            isSuccess 
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200' 
              : 'bg-slate-950/80 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  isSuccess ? 'bg-emerald-500 text-slate-950' : 'bg-brand-600 text-white'
                }`}>
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Step 1: Capture Rental Fee + Approved Damages
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Endpoint: <code className="text-brand-300 font-mono">POST /v2/payments/authorizations/{'{auth_id}'}/capture</code>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-base text-white">
                  ${captureAmount.toFixed(2)} {rental.currency}
                </span>
                <span className="block text-[10px] text-slate-500">
                  (${rentalFee.toFixed(2)} fee + ${deduction.toFixed(2)} damages)
                </span>
              </div>
            </div>

            {/* If captured, show real capture ID */}
            {(settlementResult?.paypal_capture_id || rental.paypal_capture_id) && (
              <div className="mt-2.5 pt-2 border-t border-emerald-900/40 text-[11px] font-mono flex items-center justify-between text-emerald-400">
                <span>Capture ID: {settlementResult?.paypal_capture_id || rental.paypal_capture_id}</span>
                <span className="font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60">COMPLETED</span>
              </div>
            )}
          </div>

          {/* Step 2: Void Remaining Security Deposit */}
          <div className={`p-4 rounded-xl border transition-all ${
            isSuccess 
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200' 
              : 'bg-slate-950/80 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  isSuccess ? 'bg-emerald-500 text-slate-950' : 'bg-brand-600 text-white'
                }`}>
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Step 2: Void Unused Security Deposit Authorization
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Endpoint: <code className="text-brand-300 font-mono">POST /v2/payments/authorizations/{'{auth_id}'}/void</code>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-base text-emerald-400">
                  ${voidAmount.toFixed(2)} {rental.currency}
                </span>
                <span className="block text-[10px] text-emerald-400/80">
                  Released back to renter
                </span>
              </div>
            </div>

            {/* If voided, show void status */}
            {(settlementResult?.paypal_void_id || rental.paypal_void_id) && (
              <div className="mt-2.5 pt-2 border-t border-emerald-900/40 text-[11px] font-mono flex items-center justify-between text-emerald-400">
                <span>Authorization Status: {settlementResult?.paypal_void_id || rental.paypal_void_id}</span>
                <span className="font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60">VOIDED</span>
              </div>
            )}
          </div>

        </div>

        {/* Existing Authorization Meta */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono text-slate-400 mb-6 flex flex-wrap justify-between gap-2">
          <div>
            <span className="text-slate-500">PayPal Auth ID: </span>
            <span className="text-brand-300">{rental.paypal_authorization_id || 'SANDBOX-AUTH-ACTIVE'}</span>
          </div>
          <div>
            <span className="text-slate-500">Initial Total Held: </span>
            <span className="text-slate-200">${(rental.total_authorized || (rentalFee + deposit)).toFixed(2)}</span>
          </div>
        </div>

        {/* Raw PayPal Response Inspector Accordion */}
        {isSuccess && (
          <div className="mb-6">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold mb-2"
            >
              <Code className="w-3.5 h-3.5" />
              {showRawJson ? 'Hide Raw PayPal API Response' : 'Inspect Raw PayPal REST Responses'}
            </button>

            {showRawJson && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto text-[11px] font-mono text-slate-300">
                <div className="text-emerald-400 font-bold mb-1">// PayPal Capture Response:</div>
                <pre>{JSON.stringify(rental.paypal_raw_capture || settlementResult?.paypal_raw_capture || { status: "COMPLETED", id: rental.paypal_capture_id }, null, 2)}</pre>
                <div className="text-emerald-400 font-bold mt-3 mb-1">// PayPal Void Response:</div>
                <pre>{JSON.stringify(rental.paypal_raw_void || settlementResult?.paypal_raw_void || { status: "VOIDED", id: rental.paypal_authorization_id }, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          {!isSuccess ? (
            <>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirmSettlement();
                  triggerConfetti();
                }}
                disabled={isProcessing}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${
                  isProcessing
                    ? 'bg-slate-700 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30 hover:scale-[1.02]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing PayPal Calls...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Confirm & Execute Capture (${captureAmount.toFixed(2)})
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
            >
              Done & Return to Contract
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
