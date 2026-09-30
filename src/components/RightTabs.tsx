import React from 'react';
import { ActiveTab, UserSession } from '../types';
import { LayoutGrid, Image, Video, ShieldCheck, UserCheck, Palette } from 'lucide-react';

interface RightTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  session: UserSession | null;
}

export const RightTabs: React.FC<RightTabsProps> = ({
  activeTab,
  onTabChange,
  session
}) => {
  const tabs = [
    {
      id: 'gallery' as ActiveTab,
      label: '사진&영상 보기',
      icon: <LayoutGrid className="w-3.5 h-3.5" />,
      subtext: '전체 아카이브'
    },
    {
      id: 'upload_facebook' as ActiveTab,
      label: '사진업로드\n(FaceBook)',
      icon: <Image className="w-3.5 h-3.5 text-blue-600" />,
      subtext: '페이스북 사진 링크'
    },
    {
      id: 'upload_youtube' as ActiveTab,
      label: '영상업로드\n(YouTube)',
      icon: <Video className="w-3.5 h-3.5 text-red-600" />,
      subtext: '유튜브 영상 링크'
    },
    {
      id: 'edit_profile' as ActiveTab,
      label: '아이콘 수정\n(프로필 설정)',
      icon: <Palette className="w-3.5 h-3.5 text-[#ff7e39]" />,
      subtext: '권용우의 아이콘 편집'
    },
    {
      id: 'admin' as ActiveTab,
      label: session?.isAdmin ? '관리자 모드\n(인증됨)' : '관리자',
      icon: session?.isAdmin ? <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-[#6c5ce7]" />,
      subtext: 'dream2note3@gmail.com'
    }
  ];

  return (
    <nav className="w-full md:w-36 shrink-0 flex md:flex-col gap-1.5 p-2 bg-[#dfd6ed] border border-[#beb1d6] rounded-lg shadow-sm md:self-start">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center md:items-start p-2.5 rounded-md transition-all duration-150 text-left border ${
              isActive
                ? 'bg-white text-[#2a2a2a] border-[#b4a4cb] shadow-sm translate-x-0 md:-translate-x-1 font-bold'
                : 'bg-[#ede6f7] text-[#554a6b] border-[#cfc2e3] hover:bg-[#f5f0fa] font-medium'
            }`}
          >
            {/* Active indicator dot / tab spine */}
            {isActive && (
              <div className="hidden md:block absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#ff6b2b] rounded-r-xs" />
            )}

            <div className="flex items-center gap-1.5 w-full">
              <span className="shrink-0">{tab.icon}</span>
              <span className="text-xs whitespace-pre-line leading-tight">
                {tab.label}
              </span>
            </div>

            <span className="hidden md:block text-[10px] text-[#7d7197] mt-1 truncate max-w-full">
              {tab.subtext}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
