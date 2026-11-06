import React from 'react';

const badgeStyles = {
  green: 'bg-brand-50 text-brand-800 border-brand-200',
  dark: 'bg-brand-900 text-brand-100 border-brand-800',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  blue: 'bg-sky-50 text-sky-800 border-sky-200',
  neutral: 'bg-cream-100 text-slate-700 border-slate-200',
};

export default function Badge({ children, variant = 'green', icon: Icon, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeStyles[variant]} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </span>
  );
}
