import React from 'react';
import { Smile, Meh, Frown, AlertTriangle } from 'lucide-react';

export const SentimentBadge = ({ sentiment = 'Neutral', score, showScore = true }) => {
  const configs = {
    Positive: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      icon: Smile,
      label: 'Positive',
    },
    Neutral: {
      bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      icon: Meh,
      label: 'Neutral',
    },
    Frustrated: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      icon: Frown,
      label: 'Frustrated',
    },
    Critical: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      icon: AlertTriangle,
      label: 'Critical',
    },
  };

  const config = configs[sentiment] || configs.Neutral;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
      {showScore && typeof score === 'number' && (
        <span className="opacity-80 text-[11px] font-mono border-l border-current/20 pl-1.5">
          {score}%
        </span>
      )}
    </span>
  );
};

export default SentimentBadge;
