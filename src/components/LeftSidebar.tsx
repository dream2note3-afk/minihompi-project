import React, { useState } from 'react';
import { UserSession } from '../types';
import { Heart, Camera, Youtube, Facebook, ExternalLink, Sparkles, Copy, Check } from 'lucide-react';

interface LeftSidebarProps {
  session: UserSession | null;
  onOpenAdminLogin: () => void;
  mediaCount: { youtube: number; facebook: number };
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  session,
  onOpenAdminLogin,
  mediaCount
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedMood, setSelectedMood] = useState('🎬 촬영&편집중');

  const moods = ['🎬 촬영&편집중', '☕️ 커피타임', '✨ 영감충전', '📷 야외출사', '🌿 힐링'];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-full md:w-56 shrink-0 flex flex-col gap-3 text-[#333333]">
      {/* Today Mood Badge */}
      <div className="bg-[#f2f7f9] border border-[#c4d7e0] rounded-md px-2.5 py-1.5 flex items-center justify-between text-xs">
        <span className="font-bold text-[#1f4e79] text-[11px] tracking-wide">TODAY IS...</span>
        <select
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value)}
          className="bg-transparent text-xs text-[#2a455a] font-medium outline-hidden cursor-pointer"
        >
          {moods.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Profile Photo Area */}
      <div className="bg-white border border-[#bed2dc] rounded-lg p-2.5 shadow-xs flex flex-col items-center">
        {/* Profile Image with frame */}
        <div className="relative w-full aspect-square max-w-[180px] rounded-md overflow-hidden border border-[#9dbbca] shadow-inner bg-[#eaf1f5] group">
          {/* Stylized Studio Director Kwon Yong-woo Profile Illustration */}
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          {/* Badge over photo */}
          <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
            <Camera className="w-2.5 h-2.5 text-[#ff9f43]" />
            <span>DIRECTOR</span>
          </div>
        </div>

        {/* Name: '권용우의 아이콘' + small red button mark */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center">
          <span className="text-xs font-bold text-[#1a2f3f] tracking-tight">
            권용우의 아이콘
          </span>
          {/* Small red button mark specified in user prompt */}
          <span
            className="w-2.5 h-2.5 rounded-full bg-[#e63946] border border-[#a81c28] shadow-xs inline-block animate-pulse"
            title="현재 활동 중 (ON)"
          />
        </div>

        {/* Korean introduction: “권용우의 스튜디오 방문을 환영합니다!“ */}
        <div className="mt-2 w-full p-2 bg-[#f8fafb] border border-[#d9e5ec] rounded text-center">
          <p className="text-xs leading-relaxed text-[#2c3e50] font-medium break-keep">
            “권용우의 스튜디오 방문을 환영합니다!“
          </p>
          <p className="mt-1 text-[11px] text-[#6d8494] break-keep">
            일상의 찰나와 시네마틱 스냅을 유튜브 영상과 페이스북 사진으로 기록합니다.
          </p>
        </div>

        {/* Ilchon / Wave Surf quick select */}
        <div className="mt-2.5 w-full pt-2 border-t border-dashed border-[#ccdbe2] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-[#486578]">
            <span className="font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#ff7e39]" />
              파도타기
            </span>
            <span className="text-[10px] text-[#7d93a1]">일촌 미니홈피</span>
          </div>

          <select
            className="w-full text-xs p-1 bg-white border border-[#bcd2dc] rounded text-[#2d4353] focus:border-[#2b7294] outline-hidden cursor-pointer"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                alert(`🌊 '${e.target.value}' 미니홈피로 파도타기를 시뮬레이션합니다!`);
              }
            }}
          >
            <option value="" disabled>-- 일촌 파도타기 이동 --</option>
            <option value="김작가의 필름작업실">김작가의 필름작업실 📸</option>
            <option value="이감독의 4K 드론스튜디오">이감독의 4K 드론스튜디오 🎬</option>
            <option value="박프로의 감성포토북">박프로의 감성포토북 📖</option>
            <option value="최조명의 라이팅연구소">최조명의 라이팅연구소 💡</option>
          </select>
        </div>

        {/* Content summary counters */}
        <div className="mt-2 w-full grid grid-cols-2 gap-1 text-[11px]">
          <div className="bg-[#f0f6fa] border border-[#d2e2eb] rounded p-1.5 text-center">
            <div className="flex items-center justify-center gap-1 text-red-600 font-bold">
              <Youtube className="w-3 h-3" />
              <span>영상</span>
            </div>
            <span className="font-mono text-xs font-semibold text-[#1e3442]">
              {mediaCount.youtube}개
            </span>
          </div>
          <div className="bg-[#f0f6fa] border border-[#d2e2eb] rounded p-1.5 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 font-bold">
              <Facebook className="w-3 h-3" />
              <span>사진</span>
            </div>
            <span className="font-mono text-xs font-semibold text-[#1e3442]">
              {mediaCount.facebook}장
            </span>
          </div>
        </div>

        {/* Share & Admin status indicator */}
        <div className="mt-2.5 w-full flex flex-col gap-1.5">
          <button
            onClick={handleCopyLink}
            className="w-full py-1 px-2 bg-white border border-[#b8ced8] hover:bg-[#eaf2f6] text-[#345164] rounded text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-600" />
                <span>주소 복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>미니홈피 주소복사</span>
              </>
            )}
          </button>

          {session?.isAdmin ? (
            <div className="p-1.5 bg-[#eafaf1] border border-[#a3e4c0] rounded text-[11px] text-[#1b7943] flex items-center justify-between">
              <span className="font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                관리자 인증됨
              </span>
              <span className="text-[10px] font-mono">dream2note3</span>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="text-[11px] text-[#718898] hover:text-[#1f3a52] underline text-center py-0.5 transition-colors"
            >
              관리자 로그인 (권한 획득)
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
