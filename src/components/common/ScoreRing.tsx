import React from 'react';
import { motion } from 'motion/react';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

export default function ScoreRing({
  score,
  maxScore = 100,
  size = 140,
  strokeWidth = 9,
  label,
  sublabel = 'Score',
  color,
}: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(score / maxScore, 0), 1);
  const strokeDashoffset = circumference - percentage * circumference;

  const getColor = (s: number) => {
    if (color) return color;
    if (s >= 80) return '#10b981'; // emerald
    if (s >= 60) return '#6366f1'; // indigo
    if (s >= 40) return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  const ringColor = getColor(score);

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
        />
        {/* Animated fill circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-extrabold text-white tracking-tight"
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
          {label || sublabel}
        </span>
      </div>
    </div>
  );
}
