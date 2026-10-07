import React from 'react';
import { ProfileConfig } from '../types';
import { Camera, Film, Sparkles, Image as ImageIcon } from 'lucide-react';
import { transformIfGoogleDriveUrl, handleGoogleDriveImageError } from '../utils/googleDrive';

interface ProfileAvatarVisualProps {
  config: ProfileConfig;
  className?: string;
}

export const ProfileAvatarVisual: React.FC<ProfileAvatarVisualProps> = ({ config, className = 'w-full h-full' }) => {
  // If user uploaded an icon file (or avatarType is uploaded_file), display the uploaded photo
  if (
    config.uploadedFileDataUrl &&
    (config.avatarType === 'uploaded_file' ||
      !config.avatarType ||
      config.avatarType === 'preset_director')
  ) {
    return (
      <div className={`relative w-full h-full bg-[#1e293b] flex items-center justify-center overflow-hidden ${className}`}>
        <img
          src={config.uploadedFileDataUrl}
          alt={config.iconTitle || '권용우의 아이콘'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (config.avatarType === 'custom_url' && config.customImageUrl) {
    const photoSrc = transformIfGoogleDriveUrl(config.customImageUrl);
    return (
      <div className={`relative w-full h-full bg-[#1e293b] flex items-center justify-center overflow-hidden ${className}`}>
        <img
          src={photoSrc}
          alt={config.iconTitle}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            handleGoogleDriveImageError(e.currentTarget, config.customImageUrl || '');
          }}
        />
        {/* Fallback visual if custom image fails */}
        <div className="absolute inset-0 bg-[#2d4253] flex flex-col items-center justify-center text-white/50 -z-1">
          <ImageIcon className="w-8 h-8 mb-1" />
          <span className="text-[10px]">이미지 로드중...</span>
        </div>
      </div>
    );
  }

  if (config.avatarType === 'preset_camera') {
    return (
      <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#2C3437" />
        {/* Retro warm studio bokeh background */}
        <circle cx="40" cy="40" r="30" fill="#E8984E" fillOpacity="0.3" />
        <circle cx="160" cy="50" r="40" fill="#4A8EA4" fillOpacity="0.25" />
        <circle cx="100" cy="170" r="50" fill="#DE6B48" fillOpacity="0.2" />

        {/* Vintage Camera Body */}
        <rect x="35" y="60" width="130" height="95" rx="10" fill="#1C2123" stroke="#8A9CA5" strokeWidth="2.5" />
        <rect x="42" y="68" width="116" height="79" rx="6" fill="#242B2E" />
        
        {/* Leather textured band */}
        <rect x="42" y="85" width="116" height="50" fill="#3D3028" stroke="#5A473C" strokeWidth="1" />
        
        {/* Rangefinder top plate */}
        <rect x="55" y="44" width="90" height="18" rx="4" fill="#C2D1D9" stroke="#7A8E99" strokeWidth="1.5" />
        <rect x="65" y="40" width="20" height="6" rx="2" fill="#E07A5F" />
        <circle cx="125" cy="52" r="5" fill="#4F5D65" stroke="#242B2E" strokeWidth="1.5" />
        <rect x="75" y="48" width="12" height="8" rx="1" fill="#242B2E" />

        {/* Big Retro Lens */}
        <circle cx="100" cy="110" r="38" fill="#15191A" stroke="#B0BEC5" strokeWidth="3" />
        <circle cx="100" cy="110" r="30" fill="#263238" stroke="#455A64" strokeWidth="2" />
        <circle cx="100" cy="110" r="22" fill="#1E88E5" fillOpacity="0.3" />
        <circle cx="95" cy="105" r="14" fill="#64B5F6" fillOpacity="0.4" />
        <circle cx="90" cy="100" r="5" fill="#FFFFFF" fillOpacity="0.8" />
        
        {/* Brand engraved mark */}
        <rect x="85" y="74" width="30" height="6" rx="1" fill="#E07A5F" />
      </svg>
    );
  }

  if (config.avatarType === 'preset_cinema') {
    return (
      <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#1A1F2C" />
        {/* Film Spotlight Beam */}
        <path d="M100 20L190 190H10L100 20Z" fill="#F4A261" fillOpacity="0.12" />
        
        {/* Film Reel */}
        <circle cx="100" cy="80" r="45" fill="#2E384D" stroke="#788896" strokeWidth="3" />
        <circle cx="100" cy="80" r="15" fill="#1A1F2C" stroke="#788896" strokeWidth="2" />
        {/* Reel spoke holes */}
        <circle cx="100" cy="50" r="7" fill="#1A1F2C" />
        <circle cx="100" cy="110" r="7" fill="#1A1F2C" />
        <circle cx="70" cy="80" r="7" fill="#1A1F2C" />
        <circle cx="130" cy="80" r="7" fill="#1A1F2C" />
        <circle cx="79" cy="59" r="6" fill="#1A1F2C" />
        <circle cx="121" cy="59" r="6" fill="#1A1F2C" />
        <circle cx="79" cy="101" r="6" fill="#1A1F2C" />
        <circle cx="121" cy="101" r="6" fill="#1A1F2C" />

        {/* Film Slate / Clapperboard */}
        <g transform="rotate(-6 100 135)">
          <rect x="35" y="115" width="130" height="60" rx="4" fill="#1E232A" stroke="#90A4AE" strokeWidth="2" />
          {/* Chevron stripes */}
          <rect x="35" y="115" width="130" height="16" fill="#37474F" />
          <path d="M45 115L55 131H45L35 115Z" fill="#ECEFF1" />
          <path d="M70 115L80 131H70L60 115Z" fill="#ECEFF1" />
          <path d="M95 115L105 131H95L85 115Z" fill="#ECEFF1" />
          <path d="M120 115L130 131H120L110 115Z" fill="#ECEFF1" />
          <path d="M145 115L155 131H145L135 115Z" fill="#ECEFF1" />
          {/* Slate text marks */}
          <rect x="45" y="140" width="40" height="4" rx="2" fill="#E07A5F" />
          <rect x="95" y="140" width="30" height="4" rx="2" fill="#90A4AE" />
          <rect x="45" y="152" width="55" height="4" rx="2" fill="#CFD8DC" />
          <rect x="110" y="152" width="40" height="4" rx="2" fill="#CFD8DC" />
        </g>
      </svg>
    );
  }

  if (config.avatarType === 'preset_atelier') {
    return (
      <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#2E2325" />
        {/* Darkroom Red Ambient Light */}
        <circle cx="100" cy="50" r="70" fill="#E63946" fillOpacity="0.25" />

        {/* Hanging Developed Film Strip */}
        <line x1="20" y1="35" x2="180" y2="35" stroke="#8D6E63" strokeWidth="2" />
        
        {/* Peg 1 & Photo */}
        <rect x="42" y="30" width="6" height="10" rx="1" fill="#D7CCC8" />
        <rect x="30" y="38" width="32" height="42" rx="2" fill="#FAFAFA" stroke="#B0BEC5" strokeWidth="1.5" />
        <rect x="34" y="42" width="24" height="24" fill="#37474F" />
        <circle cx="46" cy="54" r="5" fill="#FFB74D" />

        {/* Peg 2 & Photo */}
        <rect x="92" y="30" width="6" height="10" rx="1" fill="#D7CCC8" />
        <rect x="80" y="38" width="36" height="46" rx="2" fill="#FAFAFA" stroke="#B0BEC5" strokeWidth="1.5" />
        <rect x="84" y="42" width="28" height="28" fill="#263238" />
        <path d="M84 62L96 52L106 60L112 55V70H84V62Z" fill="#81C784" />

        {/* Peg 3 & Photo */}
        <rect x="144" y="30" width="6" height="10" rx="1" fill="#D7CCC8" />
        <rect x="134" y="38" width="30" height="38" rx="2" fill="#FAFAFA" stroke="#B0BEC5" strokeWidth="1.5" />
        <rect x="138" y="42" width="22" height="22" fill="#1A237E" />
        <circle cx="149" cy="50" r="4" fill="#E91E63" />

        {/* Studio Desk & Warm Lamp */}
        <rect x="0" y="145" width="200" height="55" fill="#4E342E" />
        <rect x="25" y="115" width="45" height="30" rx="3" fill="#D84315" stroke="#BF360C" strokeWidth="1.5" />
        <circle cx="47" cy="130" r="8" fill="#FFCCBC" />
        {/* Coffee Mug */}
        <rect x="145" y="125" width="22" height="20" rx="3" fill="#ECEFF1" stroke="#B0BEC5" strokeWidth="1.5" />
        <path d="M167 130C171 130 174 133 174 137C174 141 171 144 167 144" stroke="#ECEFF1" strokeWidth="2" />
        {/* Steam */}
        <path d="M152 118C154 114 153 112 155 108" stroke="#FFE082" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M159 120C161 116 160 114 162 110" stroke="#FFE082" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Default: Classic Director Avatar
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#E2EBF0" />
      {/* Studio warm background */}
      <circle cx="100" cy="85" r="75" fill="#F4E8D8" />
      <path d="M0 160C40 145 160 145 200 160V200H0V160Z" fill="#3D5060" />
      {/* Person avatar */}
      <circle cx="100" cy="72" r="32" fill="#FADBC7" />
      {/* Hair */}
      <path d="M68 68C68 45 82 38 100 38C118 38 132 45 132 68C132 74 125 70 120 62C110 65 95 62 80 62C75 70 68 74 68 68Z" fill="#2B2D42" />
      {/* Eyes & Warm Smile */}
      <circle cx="88" cy="70" r="3" fill="#2B2D42" />
      <circle cx="112" cy="70" r="3" fill="#2B2D42" />
      <path d="M93 82C97 86 103 86 107 82" stroke="#2B2D42" strokeWidth="2.5" strokeLinecap="round" />
      {/* Retro glasses */}
      <circle cx="88" cy="70" r="10" stroke="#715B4C" strokeWidth="2" fill="none" />
      <circle cx="112" cy="70" r="10" stroke="#715B4C" strokeWidth="2" fill="none" />
      <line x1="98" y1="70" x2="102" y2="70" stroke="#715B4C" strokeWidth="2" />
      {/* Camera strap & body */}
      <path d="M85 105L70 145L130 145L115 105Z" fill="#5C6F84" />
      <rect x="82" y="125" width="36" height="24" rx="4" fill="#1A1A1A" stroke="#C0C0C0" strokeWidth="2" />
      <circle cx="100" cy="137" r="8" fill="#3A75C4" stroke="#88B04B" strokeWidth="1.5" />
      <rect x="108" y="121" width="8" height="4" fill="#D32F2F" rx="1" />
    </svg>
  );
};
