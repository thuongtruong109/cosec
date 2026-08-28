import React from 'react';

interface BrandIconProps {
  size?: number;
  className?: string;
}

export function BrandIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform ${className}`}
    >
      {/* Minimalist geometric dual-refractive lens / focus aperture */}
      {/* Outer focus rings */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="text-slate-800 dark:text-zinc-200"
      />
      {/* Interlocking dynamic lens arcs */}
      <path
        d="M8.5 12C8.5 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-indigo-600 dark:text-indigo-400"
      />
      <path
        d="M15.5 12C15.5 13.933 13.933 15.5 12 15.5C10.067 15.5 8.5 13.933 8.5 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-indigo-600 dark:text-indigo-400"
      />
      {/* Central focus core point */}
      <circle
        cx="12"
        cy="12"
        r="1.75"
        fill="currentColor"
        className="text-slate-900 dark:text-white"
      />
      {/* Diagnostic precision cross-ticks */}
      <path
        d="M12 2.5V4M12 20V21.5M2.5 12H4M20 12H21.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="text-indigo-500/80 dark:text-indigo-400/80"
      />
    </svg>
  );
}

export function BrandLogo({ size = 20, className = '', textClassName = '' }: { size?: number; className?: string; textClassName?: string }) {
  return (
    <div className={`flex items-center space-x-2.5 select-none ${className}`}>
      <BrandIcon size={size} />
      <span className={`font-extrabold text-sm tracking-tight text-slate-900 dark:text-white font-sans ${textClassName}`}>
        Colens
      </span>
    </div>
  );
}

export default BrandIcon;
