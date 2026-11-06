import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-soft ${
        hover ? 'transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5 hover:border-brand-200' : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
