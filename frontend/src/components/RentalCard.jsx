import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  Sparkles, 
  Layers, 
  User, 
  UserCheck 
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { getImageUrl } from '../services/api';

export function RentalCard({ rental, onSelect, userRole = 'owner' }) {
  const rentalFee = rental.rental_fee || 0;
  const deposit = rental.deposit_amount || 0;
  const total = rental.total_authorized || (rentalFee + deposit);
  const findingsCount = rental.findings?.length || 0;

  const beforeThumb = getImageUrl(rental.before_image_url);
  const afterThumb = getImageUrl(rental.after_image_url);

  return (
    <div 
      onClick={() => onSelect(rental.id)}
      className="group bg-slate-900 border border-slate-800 hover:border-brand-500/50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Image Preview Banner */}
        <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden flex border-b border-slate-800">
          {beforeThumb && afterThumb ? (
            <div className="w-full h-full flex">
              <div className="relative w-1/2 h-full border-r border-slate-800/80">
                <img 
                  src={beforeThumb} 
                  alt="Baseline" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/90 text-emerald-400 text-[10px] font-bold">
                  BEFORE
                </span>
              </div>
              <div className="relative w-1/2 h-full">
                <img 
                  src={afterThumb} 
                  alt="Return" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-900/90 text-rose-400 text-[10px] font-bold">
                  AFTER
                </span>
              </div>
            </div>
          ) : beforeThumb ? (
            <div className="w-full h-full relative">
              <img 
                src={beforeThumb} 
                alt="Baseline" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/90 text-emerald-400 text-[10px] font-bold">
                BEFORE (Baseline only)
              </span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-700">
              <Layers className="w-8 h-8" />
            </div>
          )}

          {/* Status Badge overlay */}
          <div className="absolute top-2.5 right-2.5 z-10 shadow-md">
            <StatusBadge status={rental.status} size="sm" />
          </div>

          {/* AI Findings Tag */}
          {findingsCount > 0 && (
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-purple-500/40 text-purple-300 text-[11px] font-bold shadow-md">
              <Sparkles className="w-3 h-3 text-purple-400" />
              {findingsCount} Anomaly{findingsCount > 1 ? 'ies' : ''}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">
              {rental.category}
            </span>
            <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
              {rental.item_name}
            </h3>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4 pt-2 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Owner</span>
              <span className="font-medium text-slate-300 truncate block">
                {rental.owner_name}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Renter</span>
              <span className="font-medium text-slate-300 truncate block">
                {rental.renter_name}
              </span>
            </div>
          </div>

          {/* Financial Breakdown Pills */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Rental Fee:</span>
              <span className="font-mono font-medium text-slate-200">${rentalFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Deposit Held:</span>
              <span className="font-mono font-semibold text-emerald-400">${deposit.toFixed(2)}</span>
            </div>

            {/* If there's proposed or approved deduction */}
            {rental.approved_deduction > 0 ? (
              <div className="flex justify-between items-center text-rose-400 pt-1 border-t border-slate-800/60 font-semibold">
                <span>Approved Deduction:</span>
                <span className="font-mono">-${rental.approved_deduction.toFixed(2)}</span>
              </div>
            ) : rental.proposed_deduction > 0 ? (
              <div className="flex justify-between items-center text-amber-400 pt-1 border-t border-slate-800/60 font-semibold">
                <span>AI Proposed Deduction:</span>
                <span className="font-mono">-${rental.proposed_deduction.toFixed(2)}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-slate-300">
          Total: ${total.toFixed(2)} {rental.currency}
        </span>
        <span className="font-semibold text-brand-400 group-hover:text-brand-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          {rental.status === 'SETTLED' ? 'View Receipt' : 'Review & Settle'}
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
