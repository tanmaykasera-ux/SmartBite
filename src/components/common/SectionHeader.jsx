import React from 'react';
import Badge from './Badge';

export default function SectionHeader({
  badge,
  badgeIcon,
  title,
  highlight,
  subtitle,
  align = 'center',
  className = '',
}) {
  const alignmentClasses =
    align === 'left' ? 'text-left items-start' : 'text-center items-center mx-auto';

  return (
    <div className={`flex flex-col max-w-3xl ${alignmentClasses} ${className}`}>
      {badge && (
        <div className="mb-3">
          <Badge icon={badgeIcon}>{badge}</Badge>
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
        {title}{' '}
        {highlight && <span className="text-brand-700">{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
