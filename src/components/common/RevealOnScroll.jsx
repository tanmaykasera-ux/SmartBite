import React, { useEffect, useRef, useState } from 'react';

/**
 * Gentle scroll-reveal wrapper (fade + slide up) using IntersectionObserver.
 * Falls back to visible immediately if IntersectionObserver is unavailable.
 */
export default function RevealOnScroll({
  children,
  className = '',
  delayMs = 0,
  threshold = 0.12,
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !('IntersectionObserver' in window);
  });

  useEffect(() => {
    const node = ref.current;
    if (!node || isVisible) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, threshold]);

  return (
    <div
      ref={ref}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`transition-all duration-700 ease-out will-change-transform ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-5'
      } ${className}`}
    >
      {children}
    </div>
  );
}
