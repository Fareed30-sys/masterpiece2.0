export default function Badge({ type, value, className = '' }) {
  const colorMap = {
    sentiment: {
      Positive: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      Neutral: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      Frustrated: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
    status: {
      open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    churnRisk: {
      Low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
    category: {
      Billing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Technical Issue': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'Feature Request': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Shipping & Delivery': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      Account: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    },
  };

  const colors = colorMap[type]?.[value] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  const displayValue = type === 'status'
    ? value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : value;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colors} ${className}`}
    >
      {displayValue}
    </span>
  );
}
