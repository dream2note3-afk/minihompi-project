/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MediaItem, GuestbookEntry, UserSession, ActiveTab, ProfileConfig } from './types';
import { INITIAL_MEDIA_ITEMS, INITIAL_GUESTBOOK_ENTRIES, INITIAL_PROFILE_CONFIG } from './data/initialData';
import { TopHeader } from './components/TopHeader';
import { LeftSidebar } from './components/LeftSidebar';
import { RightTabs } from './components/RightTabs';
import { MediaGallery } from './components/MediaGallery';
import { FacebookUploadModal } from './components/FacebookUploadModal';
import { YoutubeUploadModal } from './components/YoutubeUploadModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { EditIconPanel } from './components/EditIconPanel';
import { Guestbook } from './components/Guestbook';

const STORAGE_KEYS = {
  MEDIA: 'kwon_studio_media_v1',
  GUESTBOOK: 'kwon_studio_guestbook_v1',
  SESSION: 'kwon_studio_session_v1',
  VISITS: 'kwon_studio_visits_v1',
  PROFILE: 'kwon_studio_profile_v1'
};

const ADMIN_EMAIL = 'dream2note3@gmail.com';

export default function App() {
  // Media items state with localStorage
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEDIA);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_MEDIA_ITEMS;
  });

  // Guestbook entries state with localStorage
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUESTBOOK);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_GUESTBOOK_ENTRIES;
  });

  // Profile / Icon configuration state with localStorage
  const [profile, setProfile] = useState<ProfileConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PROFILE_CONFIG;
  });

  // User session state
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to admin pre-authenticated since user email matches!
    return {
      email: ADMIN_EMAIL,
      name: '권용우',
      isAdmin: true
    };
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('gallery');

  // Visitor statistics
  const [todayVisits, setTodayVisits] = useState(24);
  const [totalVisits, setTotalVisits] = useState(12840);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(mediaItems));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [mediaItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GUESTBOOK, JSON.stringify(guestbookEntries));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [guestbookEntries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [session]);

  // Visits counter simulation
  useEffect(() => {
    try {
      const savedVisits = localStorage.getItem(STORAGE_KEYS.VISITS);
      if (savedVisits) {
        const parsed = JSON.parse(savedVisits);
        setTodayVisits(parsed.today + 1);
        setTotalVisits(parsed.total + 1);
        localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify({ today: parsed.today + 1, total: parsed.total + 1 }));
      } else {
        localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify({ today: 25, total: 12841 }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Authentication Handlers
  const handleLogin = (email: string) => {
    const isTargetAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const newSession: UserSession = {
      email: email.trim(),
      name: isTargetAdmin ? '권용우' : email.split('@')[0],
      isAdmin: isTargetAdmin
    };
    setSession(newSession);
    return isTargetAdmin;
  };

  const handleLogout = () => {
    setSession(null);
  };

  // Media Handlers
  const handleAddMedia = (newItemData: Omit<MediaItem, 'id' | 'likes' | 'views' | 'date'>) => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    const created: MediaItem = {
      ...newItemData,
      id: `${newItemData.type}-${Date.now()}`,
      date: todayStr,
      likes: 1,
      views: 12
    };

    setMediaItems((prev) => [created, ...prev]);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('이 미디어를 삭제하시겠습니까?')) {
      setMediaItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleTogglePin = (id: string) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item))
    );
  };

  const handleToggleLike = (id: string) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item))
    );
  };

  // Guestbook Handlers
  const handleAddGuestbookEntry = (entryData: Omit<GuestbookEntry, 'id' | 'createdAt'>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newEntry: GuestbookEntry = {
      ...entryData,
      id: `gb-${Date.now()}`,
      createdAt: timeStr
    };

    setGuestbookEntries((prev) => [newEntry, ...prev]);
  };

  const handleDeleteGuestbookEntry = (id: string) => {
    if (confirm('이 방명록 글을 삭제하시겠습니까?')) {
      setGuestbookEntries((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  const handleSaveProfileConfig = (newConfig: ProfileConfig) => {
    setProfile(newConfig);
  };

  const handleQuickFileUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const maxDim = 500;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimized = canvas.toDataURL('image/jpeg', 0.9);
          setProfile((prev) => ({
            ...prev,
            avatarType: 'uploaded_file',
            uploadedFileDataUrl: optimized,
            uploadedFileName: file.name
          }));
        } else {
          setProfile((prev) => ({
            ...prev,
            avatarType: 'uploaded_file',
            uploadedFileDataUrl: dataUrl,
            uploadedFileName: file.name
          }));
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleResetData = () => {
    setMediaItems(INITIAL_MEDIA_ITEMS);
    setGuestbookEntries(INITIAL_GUESTBOOK_ENTRIES);
    setProfile(INITIAL_PROFILE_CONFIG);
  };

  const mediaCount = {
    youtube: mediaItems.filter((i) => i.type === 'youtube').length,
    facebook: mediaItems.filter((i) => i.type === 'facebook').length
  };

  return (
    <div className="min-h-screen py-4 px-2 sm:px-4 md:py-8 flex flex-col items-center justify-start">
      {/* Outer Cyworld Container */}
      <div className="w-full max-w-6xl cyworld-outer-box p-2.5 sm:p-4 md:p-6">
        
        {/* Top Header: Logo Tile + Title + Visitor Stats + BGM Player */}
        <TopHeader todayVisits={todayVisits} totalVisits={totalVisits} />

        {/* 3-Column Retro Layout: Left Sidebar | Main Center Area | Right Tabs */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-2 items-stretch mt-1">
          
          {/* 1. Left Sidebar Column */}
          <div className="cyworld-inner-box p-3 bg-white flex flex-col md:w-60 shrink-0">
            <LeftSidebar
              session={session}
              onOpenAdminLogin={() => setActiveTab('admin')}
              onOpenEditProfile={() => setActiveTab('edit_profile')}
              onQuickFileUpload={handleQuickFileUpload}
              mediaCount={mediaCount}
              profile={profile}
            />
          </div>

          {/* Retro Binder Rings Divider (visible on desktop) */}
          <div className="hidden md:flex flex-col justify-around py-12 px-1 -mx-2 z-10 select-none">
            {[1, 2, 3, 4, 5, 6].map((ring) => (
              <div key={ring} className="w-3.5 h-6 cyworld-ring my-2 shrink-0" />
            ))}
          </div>

          {/* 2. Central Main Panel Column */}
          <main className="cyworld-inner-box p-3.5 sm:p-4 bg-white flex-1 min-w-0 flex flex-col justify-between">
            <div>
              {/* Main Panel Content Title bar */}
              <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-[#bcd0dc]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#ff6b2b] rounded-xs" />
                  <h2 className="text-sm font-bold text-[#1f374a] tracking-tight">
                    {activeTab === 'gallery' && '스튜디오 갤러리 (사진 & 영상 모아보기)'}
                    {activeTab === 'upload_facebook' && '페이스북 사진 업로드 및 링크 관리'}
                    {activeTab === 'upload_youtube' && '유튜브 영상 등록 및 연동 관리'}
                    {activeTab === 'edit_profile' && '권용우의 아이콘 수정 (프로필 & 아바타 커스텀)'}
                    {activeTab === 'admin' && '관리자 센터 (dream2note3@gmail.com)'}
                  </h2>
                </div>

                <div className="text-[11px] text-[#6d8494] font-medium hidden sm:block">
                  권용우의 공식 미니홈피 스튜디오
                </div>
              </div>

              {/* Dynamic View by Tab */}
              {activeTab === 'gallery' && (
                <MediaGallery
                  items={mediaItems}
                  onToggleLike={handleToggleLike}
                  onDeleteItem={handleDeleteItem}
                  onTogglePin={handleTogglePin}
                  isAdmin={!!session?.isAdmin}
                />
              )}

              {activeTab === 'upload_facebook' && (
                <FacebookUploadModal
                  onAddMedia={handleAddMedia}
                  session={session}
                  onOpenAdminLogin={() => setActiveTab('admin')}
                  onSuccessReturn={() => setActiveTab('gallery')}
                />
              )}

              {activeTab === 'upload_youtube' && (
                <YoutubeUploadModal
                  onAddMedia={handleAddMedia}
                  session={session}
                  onOpenAdminLogin={() => setActiveTab('admin')}
                  onSuccessReturn={() => setActiveTab('gallery')}
                />
              )}

              {activeTab === 'edit_profile' && (
                <EditIconPanel
                  currentConfig={profile}
                  onSaveConfig={handleSaveProfileConfig}
                  session={session}
                  onOpenAdminLogin={() => setActiveTab('admin')}
                  onReturnToGallery={() => setActiveTab('gallery')}
                />
              )}

              {activeTab === 'admin' && (
                <AdminLoginModal
                  session={session}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  onClose={() => setActiveTab('gallery')}
                  onResetData={handleResetData}
                />
              )}
            </div>

            {/* Central Main Panel Bottom: Guestbook Component (as explicitly requested!) */}
            <Guestbook
              entries={guestbookEntries}
              onAddEntry={handleAddGuestbookEntry}
              onDeleteEntry={handleDeleteGuestbookEntry}
              isAdmin={!!session?.isAdmin}
            />
          </main>

          {/* 3. Right Menu Tabs Column */}
          <RightTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            session={session}
          />
        </div>

        {/* Footer */}
        <footer className="mt-3 pt-2 text-center text-[11px] text-[#557082] flex flex-wrap items-center justify-between px-2 border-t border-[#b8ced8]/60">
          <span>
            © 2026 권용우의 스튜디오 미니홈피 · All Rights Reserved
          </span>
          <span className="text-[10px] text-[#7891a0]">
            YouTube &amp; Facebook Media Collector · Powered by Cyworld Retro Engine
          </span>
        </footer>

      </div>
    </div>
  );
}
