import React, { useState, useRef } from 'react';
import { UserSession, ProfileConfig, ActiveTab } from '../types';
import { ProfileAvatarVisual } from './ProfileAvatarVisual';
import { Heart, Camera, Youtube, Facebook, ExternalLink, Sparkles, Copy, Check, Settings2, Edit3, Upload, FolderUp, MapPin, Disc3 } from 'lucide-react';

interface LeftSidebarProps {
  session: UserSession | null;
  onOpenAdminLogin: () => void;
  onOpenEditProfile: () => void;
  onQuickFileUpload?: (file: File) => void;
  mediaCount: { youtube: number; facebook: number; travel?: number; cd?: number };
  profile: ProfileConfig;
  onSelectTab?: (tab: ActiveTab) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  session,
  onOpenAdminLogin,
  onOpenEditProfile,
  onQuickFileUpload,
  mediaCount,
  profile,
  onSelectTab
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedMood, setSelectedMood] = useState('🎬 촬영&편집중');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const moods = ['🎬 촬영&편집중', '☕️ 커피타임', '✨ 영감충전', '📷 야외출사', '🌿 힐링'];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onQuickFileUpload) {
      onQuickFileUpload(file);
    }
  };

  return (
    <aside className="w-full md:w-56 shrink-0 flex flex-col gap-3 text-[#333333]">
      {/* Hidden File Input for Direct Sidebar File Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
      />

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
        {/* Profile Image with frame & visual */}
        <div className="relative w-full aspect-square max-w-[180px] rounded-md overflow-hidden border border-[#9dbbca] shadow-inner bg-[#eaf1f5] group">
          <ProfileAvatarVisual config={profile} />

          {/* Badge over photo */}
          <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
            <Camera className="w-2.5 h-2.5 text-[#ff9f43]" />
            <span>{profile.roleBadgeText || 'DIRECTOR'}</span>
          </div>

          {/* Quick upload & edit overlay buttons on hover */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-1 px-2 bg-[#ff6b2b] hover:bg-[#e05619] text-white rounded text-[11px] font-bold shadow-xs flex items-center justify-center gap-1 transition-all active:scale-95"
              title="내 컴퓨터에서 사진 화일로 직접 변경"
            >
              <FolderUp className="w-3 h-3" />
              <span>사진 화일 변경</span>
            </button>

            <button
              onClick={onOpenEditProfile}
              className="w-full py-1 px-2 bg-white/90 hover:bg-white text-[#1f3a52] rounded text-[10px] font-medium shadow-xs flex items-center justify-center gap-1 transition-all"
              title="아이콘 상세 수정 메뉴 열기"
            >
              <Settings2 className="w-3 h-3" />
              <span>아이콘 설정</span>
            </button>
          </div>
        </div>

        {/* Name: '권용우의 아이콘' + small colored button mark + Edit Icon button */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center flex-wrap">
          <span className="text-xs font-bold text-[#1a2f3f] tracking-tight">
            {profile.iconTitle}
          </span>
          {/* Small button mark with customizable color */}
          <span
            className="w-2.5 h-2.5 rounded-full shadow-xs inline-block animate-pulse shrink-0"
            style={{ backgroundColor: profile.statusDotColor }}
            title={profile.statusDotTitle}
          />

          {/* Direct "아이콘 수정" button */}
          <button
            onClick={onOpenEditProfile}
            className="ml-0.5 px-1.5 py-0.5 bg-[#f4f7f9] hover:bg-[#ffece0] hover:text-[#ff6b2b] border border-[#bcd0dc] rounded text-[10px] text-[#4d697c] flex items-center gap-0.5 transition-colors cursor-pointer"
            title="권용우의 아이콘 수정하기"
          >
            <Edit3 className="w-2.5 h-2.5" />
            <span>수정</span>
          </button>
        </div>

        {/* Korean introduction */}
        <div className="mt-2 w-full p-2 bg-[#f8fafb] border border-[#d9e5ec] rounded text-center">
          <p className="text-xs leading-relaxed text-[#2c3e50] font-medium break-keep">
            {profile.welcomeMessage}
          </p>
          <p className="mt-1 text-[11px] text-[#6d8494] break-keep">
            {profile.subMessage}
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
          <div
            onClick={() => onSelectTab && onSelectTab('gallery')}
            className="bg-[#f0f6fa] border border-[#d2e2eb] rounded p-1.5 text-center cursor-pointer hover:bg-[#e4eef5] transition-colors"
            title="영상 목록 보기"
          >
            <div className="flex items-center justify-center gap-1 text-red-600 font-bold">
              <Youtube className="w-3 h-3" />
              <span>영상</span>
            </div>
            <span className="font-mono text-xs font-semibold text-[#1e3442]">
              {mediaCount.youtube}개
            </span>
          </div>

          <div
            onClick={() => onSelectTab && onSelectTab('gallery')}
            className="bg-[#f0f6fa] border border-[#d2e2eb] rounded p-1.5 text-center cursor-pointer hover:bg-[#e4eef5] transition-colors"
            title="사진 목록 보기"
          >
            <div className="flex items-center justify-center gap-1 text-blue-600 font-bold">
              <Facebook className="w-3 h-3" />
              <span>사진</span>
            </div>
            <span className="font-mono text-xs font-semibold text-[#1e3442]">
              {mediaCount.facebook}장
            </span>
          </div>

          <div
            onClick={() => onSelectTab && onSelectTab('travel_food')}
            className="bg-[#f0faf5] border border-[#cbe8d8] rounded p-1.5 text-center cursor-pointer hover:bg-[#e1f5eb] transition-colors"
            title="국내 여행&맛집 보기"
          >
            <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold">
              <MapPin className="w-3 h-3" />
              <span>여행·맛집</span>
            </div>
            <span className="font-mono text-xs font-semibold text-[#1e3442]">
              {mediaCount.travel ?? 0}곳
            </span>
          </div>

          <div
            onClick={() => onSelectTab && onSelectTab('cd_review')}
            className="bg-[#f2f4fb] border border-[#cbd5e8] rounded p-1.5 text-center cursor-pointer hover:bg-[#e4eaf8] transition-colors"
            title="구매CD 검토 보기"
          >
            <div className="flex items-center justify-center gap-1 text-[#3b82f6] font-bold">
              <Disc3 className="w-3 h-3" />
              <span>구매CD</span>
            </div>
            <span className="font-mono text-xs font-semibold text-[#1e3442]">
              {mediaCount.cd ?? 0}건
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
