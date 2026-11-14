import React from 'react';
import { ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';

export const ChurnBadge = ({ churnRisk = 'Low', reason }) => {
  const configs = {
    Low: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      icon: ShieldCheck,
      label: 'Low Churn Risk',
    },
    Medium: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      icon: AlertCircle,
      label: 'Medium Churn Risk',
    },
    High: {
      bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400 font-semibold animate-pulse',
      icon: ShieldAlert,
      label: 'HIGH CHURN RISK',
    },
  };

  const config = configs[churnRisk] || configs.Low;
  const Icon = config.icon;

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}
        title={reason}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </span>
    </div>
  );
};

export default ChurnBadge;
