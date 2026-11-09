import React from 'react';
import { 
  CreditCard, 
  Sparkles, 
  UserCheck, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { ActorBadge } from './StatusBadge';

export function ActivityTimeline({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500">
        No recorded activity yet.
      </div>
    );
  }

  const getActionIcon = (action, actor) => {
    switch (action) {
      case 'AUTHORIZATION_CREATED':
        return <CreditCard className="w-4 h-4 text-brand-400" />;
      case 'PHOTOS_UPDATED':
      case 'RETURN_PHOTOS_UPLOADED':
        return <UploadCloud className="w-4 h-4 text-sky-400" />;
      case 'AI_INSPECTION_RUN':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'DEDUCTION_MODIFIED':
        return <UserCheck className="w-4 h-4 text-amber-400" />;
      case 'SETTLEMENT_EXECUTED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'SETTLEMENT_DISPUTED':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-4 h-4 text-brand-400" />
        <h3 className="text-sm font-bold text-white">Auditable Activity Timeline</h3>
        <span className="text-xs text-slate-500 font-mono">({logs.length} events logged)</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {logs.map((log, index) => (
          <div key={log.id || index} className="relative group">
            
            {/* Timeline Node Icon */}
            <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              {getActionIcon(log.action, log.actor)}
            </div>

            {/* Event Content */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 group-hover:border-slate-700 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <ActorBadge actor={log.actor} />
                  <span className="text-xs font-bold text-slate-200">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {formatDate(log.timestamp)}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {log.message}
              </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
