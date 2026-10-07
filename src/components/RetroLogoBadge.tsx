import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface RetroLogoBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RetroLogoBadge: React.FC<RetroLogoBadgeProps> = ({
  className = '',
  size = 'md'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 500);
  };

  const dimensionClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-14 h-14'
  }[size];

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center gap-1.5 cursor-pointer select-none group ${className}`}
      title="권용우의 행복한 인생 · 싸이월드 감성 공식 엠블럼"
    >
      {/* Retro Logo Emblem Badge */}
      <div
        className={`relative ${dimensionClasses} shrink-0 transition-transform duration-200 ${
          isHovered ? 'scale-105 -rotate-2' : ''
        } ${clicked ? 'scale-90 rotate-3' : ''}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm filter"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer Warm Cyworld Orange Gradient */}
            <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff8533" />
              <stop offset="45%" stopColor="#ff6b2b" />
              <stop offset="100%" stopColor="#e05619" />
            </linearGradient>

            {/* Camera Body Metallic Texture */}
            <linearGradient id="cameraBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdfefe" />
              <stop offset="25%" stopColor="#e8eff3" />
              <stop offset="100%" stopColor="#d0dee5" />
            </linearGradient>

            {/* Lens Rim Metallic Gradient */}
            <linearGradient id="lensRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#647d8f" />
              <stop offset="50%" stopColor="#2c4252" />
              <stop offset="100%" stopColor="#17242e" />
            </linearGradient>

            {/* Warm Golden Sun Lens Aperture */}
            <radialGradient id="sunLens" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff7d6" />
              <stop offset="40%" stopColor="#ffdd59" />
              <stop offset="75%" stopColor="#ff9f43" />
              <stop offset="100%" stopColor="#ee5253" />
            </radialGradient>

            {/* Clover Green Gradient */}
            <linearGradient id="cloverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2ed573" />
              <stop offset="100%" stopColor="#10ac84" />
            </linearGradient>
          </defs>

          {/* Outer Rounded Squircle Base with 3D Border */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            fill="url(#badgeGrad)"
            stroke="#c8450e"
            strokeWidth="3"
          />

          {/* Inner Highlight Gloss */}
          <rect
            x="7"
            y="7"
            width="86"
            height="42"
            rx="19"
            fill="white"
            fillOpacity="0.22"
          />

          {/* Retro Rangefinder Camera Silhouette */}
          {/* Top Plate */}
          <rect x="22" y="22" width="56" height="12" rx="4" fill="url(#cameraBody)" stroke="#9fb6c3" strokeWidth="1.5" />
          {/* Shutter Button */}
          <rect x="28" y="17" width="8" height="6" rx="2" fill="#ff4757" stroke="#b32d3a" strokeWidth="1" />
          {/* Viewfinder Glass */}
          <rect x="64" y="24" width="8" height="6" rx="1.5" fill="#54a0ff" stroke="#2e86de" strokeWidth="1" />
          {/* Red Flash Indicator */}
          <circle cx="48" cy="27" r="2.5" fill="#ff6b6b" />

          {/* Camera Main Body */}
          <rect x="18" y="32" width="64" height="42" rx="7" fill="url(#cameraBody)" stroke="#9fb6c3" strokeWidth="2" />
          {/* Leatherette Grippy Middle Band */}
          <rect x="20" y="44" width="60" height="22" fill="#2d3748" rx="2" fillOpacity="0.88" />

          {/* Camera Big Center Lens */}
          <circle cx="50" cy="53" r="21" fill="url(#lensRim)" stroke="#ffffff" strokeWidth="2" />
          <circle cx="50" cy="53" r="17" fill="url(#sunLens)" />

          {/* Happy Smiling Sun Face inside the lens reflection */}
          {/* Sun Rays (Happy Life Symbolism) */}
          <path d="M50 39 L50 36 M50 67 L50 70 M36 53 L33 53 M64 53 L67 53" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <path d="M40 43 L38 41 M60 63 L62 65 M40 63 L38 65 M60 43 L62 41" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          {/* Smiling Eyes */}
          <path d="M44 51 Q46 48 48 51" stroke="#573300" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M52 51 Q54 48 56 51" stroke="#573300" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Cute Smile */}
          <path d="M47 55 Q50 58 53 55" stroke="#573300" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Blush Cheeks */}
          <circle cx="43" cy="54" r="1.5" fill="#ff4757" opacity="0.8" />
          <circle cx="57" cy="54" r="1.5" fill="#ff4757" opacity="0.8" />

          {/* Lens Glass Glare Streak */}
          <path d="M41 42 Q50 38 58 44" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

          {/* Lucky Four-leaf Clover / Heart Stamp in Bottom Right */}
          <g transform="translate(62, 62) scale(0.38)">
            <circle cx="20" cy="12" r="10" fill="url(#cloverGrad)" stroke="#0e8363" strokeWidth="2" />
            <circle cx="12" cy="20" r="10" fill="url(#cloverGrad)" stroke="#0e8363" strokeWidth="2" />
            <circle cx="28" cy="20" r="10" fill="url(#cloverGrad)" stroke="#0e8363" strokeWidth="2" />
            <circle cx="20" cy="28" r="10" fill="url(#cloverGrad)" stroke="#0e8363" strokeWidth="2" />
            <path d="M20 25 Q18 42 12 46" stroke="#0e8363" strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="20" cy="20" r="4" fill="#feca57" />
          </g>

          {/* Tiny Golden Sparkles in top corner */}
          <path d="M16 16 L18 11 L20 16 L25 18 L20 20 L18 25 L16 20 L11 18 Z" fill="#fff" opacity="0.9" />
          <circle cx="82" cy="22" r="2.5" fill="#fff" opacity="0.8" />
        </svg>

        {/* Shutter flash pulse animation on hover/click */}
        {clicked && (
          <div className="absolute inset-0 bg-white/70 rounded-2xl animate-ping pointer-events-none" />
        )}
      </div>

      {/* Retro Mini-hompy Pill Badge Label */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 bg-[#ff6b2b] text-white text-[10px] sm:text-xs font-bold rounded shadow-xs tracking-wider border border-[#e05619] inline-flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 text-yellow-200" />
            <span>미니홈피</span>
          </span>
          <span className="text-[9px] font-bold text-[#e05619] bg-[#fff0ea] px-1 py-0.5 rounded border border-[#ffd2c0] hidden sm:inline-block font-mono">
            HAPPY LIFE
          </span>
        </div>
      </div>
    </div>
  );
};
