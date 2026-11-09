import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  CreditCard,
  PackageCheck
} from 'lucide-react';

export function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  switch (status) {
    case 'AUTHORIZED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800 ${sizeClasses}`}>
          <CreditCard className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          Deposit Authorized
        </span>
      );
    case 'ACTIVE':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          Rental Active
        </span>
      );
    case 'RETURNED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 ${sizeClasses}`}>
          <PackageCheck className="w-3.5 h-3.5 text-sky-600" />
          Item Returned
        </span>
      );
    case 'INSPECTED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 ${sizeClasses}`}>
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          AI Inspected
        </span>
      );
    case 'OWNER_REVIEW':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Owner Review
        </span>
      );
    case 'SETTLED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Settled & Released
        </span>
      );
    case 'DISPUTED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          Disputed
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}

export function SeverityBadge({ severity }) {
  switch (severity?.toLowerCase()) {
    case 'severe':
      return (
        <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
          Severe
        </span>
      );
    case 'moderate':
      return (
        <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
          Moderate
        </span>
      );
    case 'minor':
      return (
        <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800">
          Minor
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-700 border border-slate-300">
          None / Wear
        </span>
      );
  }
}

export function ActorBadge({ actor }) {
  switch (actor?.toUpperCase()) {
    case 'PAYPAL':
      return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">PayPal</span>;
    case 'GEMINI_AI':
      return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">Gemini AI</span>;
    case 'OWNER':
      return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-200">Owner</span>;
    case 'RENTER':
      return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">Renter</span>;
    default:
      return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">System</span>;
  }
}
