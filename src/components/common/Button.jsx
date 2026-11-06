import React from 'react';
import { Link } from 'react-router-dom';

const variants = {
  primary:
    'bg-brand-800 text-white hover:bg-brand-900 shadow-sm focus:ring-brand-700 border border-transparent',
  secondary:
    'bg-white text-slate-800 hover:bg-cream-100 border border-slate-200 hover:border-slate-300 shadow-sm focus:ring-brand-700',
  outline:
    'bg-transparent text-brand-800 border-2 border-brand-800 hover:bg-brand-50 focus:ring-brand-700',
  soft:
    'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200/60 focus:ring-brand-700',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900',
};

const sizes = {
  sm: 'px-3.5 py-2 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  icon: Icon,
  iconPosition = 'right',
  ...props
}) {
  const baseClasses = `inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClasses} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseClasses} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {content}
    </button>
  );
}
