import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  PlusCircle, 
  Search, 
  SlidersHorizontal,
  Info,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
  UserCheck,
  User
} from 'lucide-react';

export function Navbar({ 
  currentTab, 
  setCurrentTab, 
  userRole, 
  setUserRole, 
  systemStatus 
}) {
  const [showConfigModal, setShowConfigModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Name */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setCurrentTab('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-emerald-500 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-emerald-300 bg-clip-text text-transparent">
                    Fairhold
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Fintech MVP
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block -mt-0.5">
                  AI-Powered Rental Deposit Protection
                </p>
              </div>
            </div>

            {/* Main Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Dashboard & Claims
              </button>
              <button
                onClick={() => setCurrentTab('new-rental')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'new-rental'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                Authorize Rental
              </button>
              <button
                onClick={() => setCurrentTab('inspector')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'inspector'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Live AI Inspector
              </button>
            </nav>

            {/* Right: Role Switcher & API Status */}
            <div className="flex items-center gap-3">
              
              {/* Role Toggle */}
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                <button
                  onClick={() => setUserRole('owner')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    userRole === 'owner'
                      ? 'bg-brand-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Owner view: Review AI findings, adjust & approve damage deductions"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Owner
                </button>
                <button
                  onClick={() => setUserRole('renter')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    userRole === 'renter'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Renter view: View transparent settlement breakdown, release receipt, or dispute"
                >
                  <User className="w-3.5 h-3.5" />
                  Renter
                </button>
              </div>

              {/* System Credentials Status Badge */}
              <button
                onClick={() => setShowConfigModal(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs transition-colors"
                title="View Gemini & PayPal Sandbox credentials status"
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${systemStatus?.gemini_configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-[11px] text-slate-300 font-mono hidden lg:inline">
                    {systemStatus?.gemini_configured ? 'Gemini: Live' : 'Gemini: Demo'}
                  </span>
                </div>
                <div className="h-3 w-[1px] bg-slate-700 hidden lg:block" />
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${systemStatus?.paypal_configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-[11px] text-slate-300 font-mono hidden lg:inline">
                    {systemStatus?.paypal_configured ? 'PayPal: Live' : 'PayPal: Sandbox'}
                  </span>
                </div>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="md:hidden flex border-t border-slate-800 bg-slate-900 px-4 py-2 justify-around text-xs">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`py-1 ${currentTab === 'dashboard' ? 'text-brand-400 font-bold border-b-2 border-brand-400' : 'text-slate-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('new-rental')}
            className={`py-1 ${currentTab === 'new-rental' ? 'text-brand-400 font-bold border-b-2 border-brand-400' : 'text-slate-400'}`}
          >
            + Authorize
          </button>
          <button
            onClick={() => setCurrentTab('inspector')}
            className={`py-1 ${currentTab === 'inspector' ? 'text-brand-400 font-bold border-b-2 border-brand-400' : 'text-slate-400'}`}
          >
            AI Inspector
          </button>
        </div>
      </header>

      {/* Credentials & System Info Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 text-slate-200 shadow-2xl relative">
            <button 
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Fairhold API Integrations Status</h3>
                <p className="text-xs text-slate-400">Environment variable connection & sandbox state</p>
              </div>
            </div>

            <div className="space-y-4 mb-6 text-sm">
              {/* Gemini Status Box */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-slate-200">Google Gemini Vision AI</span>
                  </div>
                  {systemStatus?.gemini_configured ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                      <CheckCircle className="w-3.5 h-3.5" /> Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800">
                      <AlertCircle className="w-3.5 h-3.5" /> Demo Inspection Mode Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {systemStatus?.gemini_configured
                    ? 'Using live Gemini Vision API to compare baseline vs return rental photos.'
                    : 'Placeholder active in backend/.env. Using intelligent forensic demo analysis for instant evaluation without requiring external keys.'}
                </p>
                <div className="mt-2 text-[11px] font-mono bg-slate-950 px-2.5 py-1.5 rounded text-slate-400">
                  GEMINI_API_KEY=YOUR_GEMINI_API_KEY
                </div>
              </div>

              {/* PayPal Sandbox Status Box */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-brand-400" />
                    <span className="font-semibold text-slate-200">PayPal Sandbox REST API</span>
                  </div>
                  {systemStatus?.paypal_configured ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                      <CheckCircle className="w-3.5 h-3.5" /> Connected ({systemStatus.paypal_mode})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800">
                      <AlertCircle className="w-3.5 h-3.5" /> Sandbox Simulation Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {systemStatus?.paypal_configured
                    ? 'Directly communicates with PayPal Sandbox endpoint (v2/checkout/orders and v2/payments/authorizations).'
                    : 'Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in backend/.env to execute live sandbox authorizations, captures, and voids.'}
                </p>
                <div className="mt-2 text-[11px] font-mono bg-slate-950 px-2.5 py-1.5 rounded text-slate-400 space-y-0.5">
                  <div>PAYPAL_CLIENT_ID=YOUR_SANDBOX_CLIENT_ID</div>
                  <div>PAYPAL_CLIENT_SECRET=YOUR_SANDBOX_SECRET</div>
                  <div>PAYPAL_MODE=sandbox</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
              >
                Close & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
