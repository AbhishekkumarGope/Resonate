import React from 'react';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

export const TrustScoreBadge = ({ score = 50, showDetails = false, size = 'md' }) => {
  const getScoreColor = (s) => {
    if (s >= 80) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', label: 'Very High Trust' };
    if (s >= 60) return { bg: 'bg-teal-50 text-teal-700 border-teal-200', bar: 'bg-brand-teal', label: 'Verified & Trusted' };
    if (s >= 40) return { bg: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-500', label: 'Moderate Trust' };
    return { bg: 'bg-rose-50 text-rose-700 border-rose-200', bar: 'bg-rose-500', label: 'New / Low Trust' };
  };

  const config = getScoreColor(score);

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
        <ShieldCheck className="w-3 h-3 text-current" />
        <span>{score}% Trust</span>
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg}`}>
          {score >= 60 ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          <span>Trust Score: {score}/100</span>
        </span>
        <span className="text-[11px] font-medium text-slate-500">{config.label}</span>
      </div>
      {showDetails && (
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
};
