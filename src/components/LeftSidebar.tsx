import React, { useState, useRef } from 'react';
import { UserSession, ProfileConfig, ActiveTab, IlchonFriend } from '../types';
import { ProfileAvatarVisual } from './ProfileAvatarVisual';
import { IlchonList } from './IlchonList';
import {
  Heart,
  Camera,
  Youtube,
  Facebook,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  Settings2,
  Edit3,
  Upload,
  FolderUp,
  MapPin,
  Disc3,
  Music,
  Lock,
  LogOut,
  ChevronDown,
  ChevronUp,
  Palette
} from 'lucide-react';
import { getThemePalette } from '../utils/themePalettes';
import { INITIAL_PROFILE_CONFIG } from '../data/initialData';

interface LeftSidebarProps {
  session: UserSession | null;
  onOpenAdminLogin: () => void;
  onOpenEditProfile: () => void;
  onQuickFileUpload?: (file: File) => void;
  mediaCount: { youtube: number; facebook: number; travel?: number; cd?: number };
  profile: ProfileConfig;
  onSelectTab?: (tab: ActiveTab) => void;
  ilchonFriends: IlchonFriend[];
  onAddIlchon: (friend: Omit<IlchonFriend, 'id'>) => void;
  onUpdateIlchonStatus: (id: string, newStatus: string) => void;
  onDeleteIlchon: (id: string) => void;
  onOpenChat?: (friend: IlchonFriend) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  session,
  onOpenAdminLogin,
  onOpenEditProfile,
  onQuickFileUpload,
  mediaCount,
  profile,
  onSelectTab,
  ilchonFriends,
  onAddIlchon,
  onUpdateIlchonStatus,
  onDeleteIlchon,
  onOpenChat
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedMood, setSelectedMood] = useState('🎬 촬영&편집중');
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(true);
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
    <aside className="w-full md:w-56 shrink-0 flex flex-col gap-2.5 sm:gap-3 text-[#333333]">
      {/* Hidden File Input for Direct Sidebar File Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
      />

      {/* Mobile-Only Summary Bar with Accordion Toggle */}
      <div className="flex md:hidden items-center justify-between p-2 bg-[#f2f7fa] border border-[#bcd2dc] rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#9dbbca] shrink-0 bg-[#eaf1f5]">
            <ProfileAvatarVisual config={profile} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#1a2f3f]">{profile.iconTitle}</span>
              <span
                className="w-2 h-2 rounded-full shadow-xs inline-block animate-pulse shrink-0"
                style={{ backgroundColor: profile.statusDotColor }}
                title={profile.statusDotTitle}
              />
            </div>
            <p className="text-[10px] text-[#6d8494]">{selectedMood}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {session?.isAdmin && (
            <button
              type="button"
              onClick={onOpenEditProfile}
              className="px-2 py-1 bg-white hover:bg-[#ffece0] text-[#334e68] hover:text-[#ff6b2b] border border-[#bed2dc] rounded text-[10px] font-bold transition-colors cursor-pointer"
            >
              아이콘 설정
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsMobileDetailsOpen(!isMobileDetailsOpen)}
            className="px-2 py-1 bg-[#2b7294] hover:bg-[#205b77] text-white rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-0.5"
          >
            <span>{isMobileDetailsOpen ? '접기' : '프로필 상세'}</span>
            {isMobileDetailsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Today Mood Badge (Always visible on desktop, or when expanded on mobile) */}
      <div className={`${isMobileDetailsOpen ? 'flex' : 'hidden'} md:flex bg-[#f2f7f9] border border-[#c4d7e0] rounded-md px-2.5 py-1.5 items-center justify-between text-xs`}>
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

      {/* Profile Photo Area (Collapsible on mobile to save vertical space, always visible on desktop) */}
      <div className={`${isMobileDetailsOpen ? 'flex' : 'hidden'} md:flex bg-white border border-[#bed2dc] rounded-lg p-2.5 shadow-xs flex-col items-center transition-all duration-200`}>
        {/* Profile Image with frame & visual */}
        <div className="relative w-full aspect-square max-w-[180px] rounded-md overflow-hidden border border-[#9dbbca] shadow-inner bg-[#eaf1f5] group">
          <ProfileAvatarVisual config={profile} />

          {/* Badge over photo */}
          <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
            <Camera className="w-2.5 h-2.5 text-[#ff9f43]" />
            <span>{profile.roleBadgeText || 'DIRECTOR'}</span>
          </div>

          {/* Quick upload & edit overlay buttons on hover - Only shown when logged in as admin */}
          {session?.isAdmin && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-1 px-2 bg-[#ff6b2b] hover:bg-[#e05619] text-white rounded text-[11px] font-bold shadow-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="내 컴퓨터에서 사진 화일로 직접 변경"
              >
                <FolderUp className="w-3 h-3" />
                <span>사진 화일 변경</span>
              </button>

              <button
                onClick={onOpenEditProfile}
                className="w-full py-1 px-2 bg-white/90 hover:bg-white text-[#1f3a52] rounded text-[10px] font-medium shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="아이콘 상세 수정 메뉴 열기"
              >
                <Settings2 className="w-3 h-3" />
                <span>아이콘 설정</span>
              </button>
            </div>
          )}
        </div>

        {/* Name: '권용우의 아이콘' + small colored button mark + Edit Icon button */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center flex-wrap">
          <span className="text-xs font-bold text-[#1a2f3f] tracking-tight">
            {profile?.iconTitle || INITIAL_PROFILE_CONFIG.iconTitle}
          </span>
          {/* Small button mark with customizable color */}
          <span
            className="w-2.5 h-2.5 rounded-full shadow-xs inline-block animate-pulse shrink-0"
            style={{ backgroundColor: profile?.statusDotColor || INITIAL_PROFILE_CONFIG.statusDotColor }}
            title={profile?.statusDotTitle || INITIAL_PROFILE_CONFIG.statusDotTitle}
          />

          {/* Direct "아이콘 & 테마 설정" button - 관리자로 로그인 했을 때만 나타남 */}
          {session?.isAdmin && (
            <button
              onClick={onOpenEditProfile}
              className="ml-0.5 px-1.5 py-0.5 bg-[#f4f7f9] hover:bg-[#ffece0] hover:text-[#ff6b2b] border border-[#bcd0dc] rounded text-[10px] text-[#4d697c] flex items-center gap-0.5 transition-colors cursor-pointer"
              title="권용우의 아이콘 & 테마 색상 설정하기 (관리자 전용)"
            >
              <Palette className="w-2.5 h-2.5 text-[#ff6b2b]" />
              <span>설정</span>
            </button>
          )}
        </div>

        {/* Current Theme Skin Pill */}
        {(() => {
          const skin = getThemePalette(profile?.themePalette);
          return (
            <div
              onClick={session?.isAdmin ? onOpenEditProfile : undefined}
              className={`mt-1 px-2 py-0.5 rounded-full border text-[9px] font-mono text-[#385568] flex items-center gap-1 shadow-2xs ${
                session?.isAdmin ? 'cursor-pointer hover:border-[#ff6b2b] transition-colors' : 'cursor-default'
              }`}
              style={{ backgroundColor: skin.bgHex, borderColor: skin.borderHex }}
              title={session?.isAdmin ? "클릭하여 테마 색상 변경하기 (관리자 전용)" : `${skin.name} 테마`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skin.borderHex }} />
              <span className="truncate max-w-[130px] font-medium">{skin.name.split(' ')[0]} 테마</span>
            </div>
          );
        })()}

        {/* Korean introduction */}
        <div className="mt-2 w-full p-2 bg-[#f8fafb] border border-[#d9e5ec] rounded text-center">
          <p className="text-xs leading-relaxed text-[#2c3e50] font-medium break-keep">
            {profile?.welcomeMessage || INITIAL_PROFILE_CONFIG.welcomeMessage}
          </p>
          <p className="mt-1 text-[11px] text-[#6d8494] break-keep">
            {profile?.subMessage || INITIAL_PROFILE_CONFIG.subMessage}
          </p>
        </div>

        {/* Ilchon (Close Friends) List & Real-time Status Messages */}
        <div className="mt-2.5 w-full pt-2 border-t border-dashed border-[#ccdbe2]">
          <IlchonList
            friends={ilchonFriends}
            onAddFriend={onAddIlchon}
            onUpdateStatus={onUpdateIlchonStatus}
            onDeleteFriend={onDeleteIlchon}
            onOpenChat={onOpenChat}
            isAdmin={!!session?.isAdmin}
          />
        </div>
      </div>

      {/* Content summary counters (Grid optimized for mobile & desktop) */}
      <div className="w-full grid grid-cols-4 md:grid-cols-2 gap-1 text-[11px]">
        <div
          onClick={() => onSelectTab && onSelectTab('gallery')}
          className="bg-[#f0f6fa] border border-[#d2e2eb] rounded p-1.5 text-center cursor-pointer hover:bg-[#e4eef5] transition-colors"
          title="영상 목록 보기"
        >
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-red-600 font-bold">
            <Youtube className="w-3 h-3" />
            <span>영상</span>
          </div>
          <span className="font-mono text-[11px] sm:text-xs font-semibold text-[#1e3442]">
            {mediaCount.youtube}개
          </span>
        </div>

        <div
          onClick={() => onSelectTab && onSelectTab('gallery')}
          className="bg-[#f0f6fa] border border-[#d2e2eb] rounded p-1.5 text-center cursor-pointer hover:bg-[#e4eef5] transition-colors"
          title="사진 목록 보기"
        >
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-blue-600 font-bold">
            <Facebook className="w-3 h-3" />
            <span>사진</span>
          </div>
          <span className="font-mono text-[11px] sm:text-xs font-semibold text-[#1e3442]">
            {mediaCount.facebook}장
          </span>
        </div>

        <div
          onClick={() => onSelectTab && onSelectTab('travel_food')}
          className="bg-[#f0faf5] border border-[#cbe8d8] rounded p-1.5 text-center cursor-pointer hover:bg-[#e1f5eb] transition-colors"
          title="국내 여행&맛집 보기"
        >
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-emerald-600 font-bold">
            <MapPin className="w-3 h-3" />
            <span>여행</span>
          </div>
          <span className="font-mono text-[11px] sm:text-xs font-semibold text-[#1e3442]">
            {mediaCount.travel ?? 0}곳
          </span>
        </div>

        <div
          onClick={() => onSelectTab && onSelectTab('cd_review')}
          className="bg-[#f2f4fb] border border-[#cbd5e8] rounded p-1.5 text-center cursor-pointer hover:bg-[#e4eaf8] transition-colors"
          title="구매CD 검토 보기"
        >
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-[#3b82f6] font-bold">
            <Disc3 className="w-3 h-3" />
            <span>CD</span>
          </div>
          <span className="font-mono text-[11px] sm:text-xs font-semibold text-[#1e3442]">
            {mediaCount.cd ?? 0}건
          </span>
        </div>

        {/* Music repeat & control menu button */}
        <div
          onClick={() => onSelectTab && onSelectTab('bgm_manage')}
          className="col-span-4 md:col-span-2 bg-[#fff8f3] border border-[#ffcdb5] rounded p-1.5 text-center cursor-pointer hover:bg-[#ffede2] transition-colors shadow-2xs"
          title="음악 재생 & 반복 설정 메뉴 열기"
        >
          <div className="flex items-center justify-center gap-1.5 text-[#e05619] font-bold text-xs">
            <Music className="w-3.5 h-3.5 text-[#ff6b2b]" />
            <span>음악 재생 &amp; 반복 설정 메뉴</span>
          </div>
        </div>

        {/* Miniroom decoration quick button */}
        <div
          onClick={() => onSelectTab && onSelectTab('miniroom')}
          className="col-span-4 md:col-span-2 bg-[#f0f9ff] border border-[#bae6fd] rounded p-1.5 text-center cursor-pointer hover:bg-[#e0f2fe] transition-colors shadow-2xs"
          title="스튜디오 미니룸 꾸미기 (가구배치·BGM)"
        >
          <div className="flex items-center justify-center gap-1.5 text-[#0369a1] font-bold text-xs">
            <span>🏠</span>
            <span>스튜디오 미니룸 꾸미기</span>
          </div>
        </div>
      </div>

      {/* Share Link & Admin Authentication Status */}
      <div className="w-full flex flex-col gap-1.5">
        <button
          onClick={handleCopyLink}
          className="w-full py-1.5 px-2 bg-white border border-[#b8ced8] hover:bg-[#eaf2f6] text-[#345164] rounded text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
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
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              관리자 인증됨
            </span>
            <button
              onClick={onOpenAdminLogin}
              className="text-[10px] text-[#247045] hover:text-red-600 underline font-medium cursor-pointer"
              title="관리자 설정 / 비밀번호 변경 / 로그아웃"
            >
              관리/로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="w-full py-1.5 px-2 bg-[#f4f7f9] hover:bg-[#e6eff4] border border-[#bcd2dc] text-[#2c526c] rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="dream2note3@gmail.com 관리자 비밀번호 로그인"
          >
            <Lock className="w-3 h-3 text-[#ff6b2b]" />
            <span>관리자 로그인 (비밀번호 인증)</span>
          </button>
        )}
      </div>
    </aside>
  );
};
