import React from 'react';
import { CreditCard, Wrench, Sparkles, Truck, UserCircle, Tag } from 'lucide-react';

export const CategoryBadge = ({ category = 'Technical Issue' }) => {
  const configs = {
    Billing: {
      bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
      icon: CreditCard,
    },
    'Technical Issue': {
      bg: 'bg-sky-950/60 text-sky-300 border-sky-800/50',
      icon: Wrench,
    },
    'Feature Request': {
      bg: 'bg-purple-950/60 text-purple-300 border-purple-800/50',
      icon: Sparkles,
    },
    'Shipping/Delivery': {
      bg: 'bg-amber-950/60 text-amber-300 border-amber-800/50',
      icon: Truck,
    },
    Account: {
      bg: 'bg-blue-950/60 text-blue-300 border-blue-800/50',
      icon: UserCircle,
    },
  };

  const config = configs[category] || {
    bg: 'bg-slate-800 text-slate-300 border-slate-700',
    icon: Tag,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${config.bg}`}
    >
      <Icon className="w-3 h-3" />
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;
