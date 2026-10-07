import React from 'react';
import { ActiveTab, UserSession } from '../types';
import { LayoutGrid, Image, Video, MapPin, Disc3, Home, Music, MessageSquare } from 'lucide-react';

interface RightTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  session?: UserSession | null;
}

export const RightTabs: React.FC<RightTabsProps> = ({
  activeTab,
  onTabChange,
  session
}) => {
  const isAdmin = !!session?.isAdmin;

  const baseTabs = [
    {
      id: 'gallery' as ActiveTab,
      label: '사진&영상 보기',
      icon: <LayoutGrid className="w-3.5 h-3.5" />,
      subtext: '전체 아카이브'
    },
    {
      id: 'miniroom' as ActiveTab,
      label: '스튜디오 미니룸',
      icon: <Home className="w-3.5 h-3.5 text-[#ff6b2b]" />,
      subtext: '가구배치·BGM'
    },
    {
      id: 'guestbook' as ActiveTab,
      label: '방명록 (글남기기)',
      icon: <MessageSquare className="w-3.5 h-3.5 text-[#ea580c]" />,
      subtext: '방문글·일촌평'
    },
    {
      id: 'my_cd_collection' as ActiveTab,
      label: '소장CD/음원',
      icon: <Music className="w-3.5 h-3.5 text-[#7c3aed]" />,
      subtext: '4만곡·2,500 앨범'
    },
    {
      id: 'travel_food' as ActiveTab,
      label: '국내 여행&맛집',
      icon: <MapPin className="w-3.5 h-3.5 text-emerald-600" />,
      subtext: '명소·맛집 링크'
    },
    {
      id: 'cd_review' as ActiveTab,
      label: '구매CD 검토',
      icon: <Disc3 className="w-3.5 h-3.5 text-[#3b82f6]" />,
      subtext: '음반·판매처 링크'
    }
  ];

  const adminTabs = [
    {
      id: 'upload_facebook' as ActiveTab,
      label: '사진업로드',
      icon: <Image className="w-3.5 h-3.5 text-blue-600" />,
      subtext: '구글드라이브·FB'
    },
    {
      id: 'upload_youtube' as ActiveTab,
      label: '영상업로드',
      icon: <Video className="w-3.5 h-3.5 text-red-600" />,
      subtext: 'YouTube·FB 지원'
    }
  ];

  const tabs = isAdmin ? [...baseTabs, ...adminTabs] : baseTabs;

  return (
    <nav className="w-full md:w-36 shrink-0 flex md:flex-col overflow-x-auto no-scrollbar gap-1 sm:gap-1.5 p-1 sm:p-1.5 md:p-2 bg-[#dfd6ed] border border-[#beb1d6] rounded-lg shadow-xs sticky top-1 z-20 md:static md:self-start">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center md:items-start md:flex-col shrink-0 md:shrink px-2.5 py-1.5 md:p-2.5 rounded-md transition-all duration-150 text-left border cursor-pointer select-none ${
              isActive
                ? 'bg-white text-[#2a2a2a] border-[#b4a4cb] shadow-xs translate-x-0 md:-translate-x-1 font-bold'
                : 'bg-[#ede6f7] text-[#554a6b] border-[#cfc2e3] hover:bg-[#f5f0fa] font-medium'
            }`}
          >
            {/* Desktop Left Spine Indicator */}
            {isActive && (
              <div className="hidden md:block absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#ff6b2b] rounded-r-xs" />
            )}

            {/* Mobile Bottom Highlight Line */}
            {isActive && (
              <div className="md:hidden absolute bottom-0 left-2 right-2 h-0.5 bg-[#ff6b2b] rounded-full" />
            )}

            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="shrink-0">{tab.icon}</span>
              <span className="text-xs leading-tight">
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
