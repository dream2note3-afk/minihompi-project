/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MediaItem, GuestbookEntry, UserSession, ActiveTab, ProfileConfig, TravelSpot, CdReviewItem, ThemePaletteId, IlchonFriend, IlchonNote, VisitorStatsData, MyCdAlbum } from './types';
import { INITIAL_MEDIA_ITEMS, INITIAL_GUESTBOOK_ENTRIES, INITIAL_PROFILE_CONFIG, INITIAL_TRAVEL_SPOTS, INITIAL_CD_REVIEWS, INITIAL_ILCHON_FRIENDS, INITIAL_ILCHON_NOTES, INITIAL_MY_CD_ALBUMS } from './data/initialData';
import { getThemePalette } from './utils/themePalettes';
import { TopHeader } from './components/TopHeader';
import { LeftSidebar } from './components/LeftSidebar';
import { RightTabs } from './components/RightTabs';
import { MediaGallery } from './components/MediaGallery';
import { FacebookUploadModal } from './components/FacebookUploadModal';
import { YoutubeUploadModal } from './components/YoutubeUploadModal';
import { TravelFoodGallery } from './components/TravelFoodGallery';
import { CdReviewGallery } from './components/CdReviewGallery';
import { MyCdCollectionGallery } from './components/MyCdCollectionGallery';
import { AdminLoginModal } from './components/AdminLoginModal';
import { EditIconPanel } from './components/EditIconPanel';
import { Guestbook } from './components/Guestbook';
import { BgmManagerPanel } from './components/BgmManagerPanel';
import { Miniroom } from './components/Miniroom';
import { IlchonChatModal } from './components/IlchonChatModal';
import { bgmEngine } from './utils/audioSynth';
import { Volume2, VolumeX } from 'lucide-react';
import {
  connectRealtimeSync,
  broadcastServerUpdate,
  fetchFullSyncFromServer
} from './services/realtimeSync';
import {
  initializeDatabaseIfEmpty,
  syncLocalDatasetToCloud,
  subscribeToMedia,
  subscribeToTravel,
  subscribeToCdReviews,
  subscribeToMyCdCollection,
  subscribeToGuestbook,
  subscribeToProfile,
  subscribeToStats,
  subscribeToBgmConfig,
  subscribeToIlchon,
  subscribeToAllIlchonNotes,
  cloudSaveBgmConfig,
  cloudSaveMedia,
  cloudAddMedia,
  cloudUpdateMedia,
  cloudDeleteMedia,
  cloudSaveTravelSpot,
  cloudAddTravelSpot,
  cloudUpdateTravelSpot,
  cloudDeleteTravelSpot,
  cloudSaveCdReview,
  cloudAddCdReview,
  cloudUpdateCdReview,
  cloudDeleteCdReview,
  cloudSaveMyCdAlbum,
  cloudAddMyCdAlbum,
  cloudUpdateMyCdAlbum,
  cloudDeleteMyCdAlbum,
  cloudAddGuestbook,
  cloudDeleteGuestbook,
  cloudSaveProfile,
  cloudAddIlchon,
  cloudUpdateIlchon,
  cloudDeleteIlchon,
  cloudSendIlchonNote,
  cloudDeleteIlchonNotes,
  cloudIncrementVisitors,
  verifyAdminPassword
} from './services/firestoreSync';

const STORAGE_KEYS = {
  MEDIA: 'kwon_studio_media_v1',
  GUESTBOOK: 'kwon_studio_guestbook_v1',
  SESSION: 'kwon_studio_session_v1',
  VISITS: 'kwon_studio_visits_v1',
  PROFILE: 'kwon_studio_profile_v1',
  TRAVEL: 'kwon_studio_travel_v1',
  CD_REVIEWS: 'kwon_studio_cd_reviews_v1',
  MY_CD_COLLECTION: 'kwon_studio_my_cd_collection_v1',
  ILCHON: 'kwon_studio_ilchon_v1',
  NOTES: 'kwon_studio_notes_v1'
};

const PERMANENTLY_DELETED_CD_IDS = new Set([
  'mycd-dannyboy',
  'mycd-1',
  'mycd-2',
  'mycd-3',
  'mycd-4',
  'mycd-5',
  'mycd-6'
]);

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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.iconTitle && parsed.welcomeMessage) {
          if (
            parsed.welcomeMessage === '“권용우의 스튜디오 방문을 환영합니다!“' ||
            parsed.welcomeMessage === '“권용우의 스튜디오 방문을 환영합니다!”' ||
            parsed.welcomeMessage === '권용우의 스튜디오 방문을 환영합니다!' ||
            parsed.welcomeMessage === '권용우의 스튜디오 방문을 환영합니다'
          ) {
            parsed.welcomeMessage = '“권용우의 행복한 인생 방문을 환영합니다!“';
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PROFILE_CONFIG;
  });

  // Travel Spots & Gourmet state with localStorage
  const [travelSpots, setTravelSpots] = useState<TravelSpot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRAVEL);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TRAVEL_SPOTS;
  });

  // Music CD & Store Reviews state with localStorage
  const [cdReviews, setCdReviews] = useState<CdReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CD_REVIEWS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CD_REVIEWS;
  });

  // My CD Collection (소장 CD / 음원 아카이브) state with localStorage
  const [myCdAlbums, setMyCdAlbums] = useState<MyCdAlbum[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MY_CD_COLLECTION);
      if (saved) {
        const parsed: MyCdAlbum[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((a) => !PERMANENTLY_DELETED_CD_IDS.has(a.id) && a.id !== 'mycd-1791369288259');
          const albumMap = new Map<string, MyCdAlbum>();
          INITIAL_MY_CD_ALBUMS.forEach((a) => {
            if (!PERMANENTLY_DELETED_CD_IDS.has(a.id) && a.id !== 'mycd-1791369288259') {
              albumMap.set(a.id, a);
            }
          });
          filtered.forEach((a) => {
            if (!PERMANENTLY_DELETED_CD_IDS.has(a.id) && a.id !== 'mycd-1791369288259') {
              albumMap.set(a.id, a);
            }
          });
          const merged = Array.from(albumMap.values());
          try {
            localStorage.setItem(STORAGE_KEYS.MY_CD_COLLECTION, JSON.stringify(merged));
          } catch {}
          return merged;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_MY_CD_ALBUMS.filter((a) => !PERMANENTLY_DELETED_CD_IDS.has(a.id) && a.id !== 'mycd-1791369288259');
  });

  // Ilchon (Close Friends) state with localStorage
  const [ilchonFriends, setIlchonFriends] = useState<IlchonFriend[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ILCHON);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ILCHON_FRIENDS;
  });

  // Active Ilchon friend for the paper note chat window
  const [activeChatFriend, setActiveChatFriend] = useState<IlchonFriend | null>(null);

  // Ilchon Notes state with localStorage
  const [allNotes, setAllNotes] = useState<IlchonNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ILCHON_NOTES;
  });

  // User session state (Default: null / Guest mode so visitors cannot access admin features)
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && parsed.isAdmin) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    // Default to Guest visitor
    return null;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('gallery');

  // Visitor statistics
  const [todayVisits, setTodayVisits] = useState(24);
  const [totalVisits, setTotalVisits] = useState(12840);
  const [statsData, setStatsData] = useState<VisitorStatsData>(() => ({
    today: 24,
    total: 12840,
    history: []
  }));
  const [cloudSynced, setCloudSynced] = useState(false);

  // Initialize and synchronize across all devices via Server-Sent Events & Cloud
  useEffect(() => {
    let isMounted = true;

    // 0. Connect Server-Sent Events (SSE) for instant, quota-free multi-device synchronization
    const unsubSSE = connectRealtimeSync({
      onProfile: (newProf: any) => {
        if (!isMounted || !newProf) return;
        // Guard: If it's a syncNeeded signal or incomplete payload, fetch fresh profile from server!
        if (newProf.syncNeeded || !newProf.iconTitle || !newProf.welcomeMessage) {
          fetchFullSyncFromServer().then((data) => {
            if (data?.profile && data.profile.iconTitle) {
              setProfile(data.profile);
              try {
                localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
              } catch {}
              setCloudSynced(true);
            }
          });
          return;
        }
        setProfile(newProf);
        try {
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProf));
        } catch {}
        setCloudSynced(true);
      },
      onMedia: (action, item, id) => {
        if (!isMounted) return;
        if (action === 'add' && item) {
          setMediaItems((prev) => [item, ...prev.filter((m) => m.id !== item.id)]);
        } else if (action === 'update' && id) {
          setMediaItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...item } : m)));
        } else if (action === 'delete' && id) {
          setMediaItems((prev) => prev.filter((m) => m.id !== id));
        } else if (action === 'set' && Array.isArray(item)) {
          setMediaItems(item);
        }
        setCloudSynced(true);
      },
      onTravel: (action, item, id) => {
        if (!isMounted) return;
        if (action === 'add' && item) {
          setTravelSpots((prev) => [item, ...prev.filter((t) => t.id !== item.id)]);
        } else if (action === 'update' && id) {
          setTravelSpots((prev) => prev.map((t) => (t.id === id ? { ...t, ...item } : t)));
        } else if (action === 'delete' && id) {
          setTravelSpots((prev) => prev.filter((t) => t.id !== id));
        } else if (action === 'set' && Array.isArray(item)) {
          setTravelSpots(item);
        }
        setCloudSynced(true);
      },
      onCdReviews: (action, item, id) => {
        if (!isMounted) return;
        if (action === 'add' && item) {
          setCdReviews((prev) => [item, ...prev.filter((c) => c.id !== item.id)]);
        } else if (action === 'update' && id) {
          setCdReviews((prev) => prev.map((c) => (c.id === id ? { ...c, ...item } : c)));
        } else if (action === 'delete' && id) {
          setCdReviews((prev) => prev.filter((c) => c.id !== id));
        } else if (action === 'set' && Array.isArray(item)) {
          setCdReviews(item);
        }
        setCloudSynced(true);
      },
      onMyCd: async (action, item, id) => {
        if (!isMounted) return;
        // Always fetch the freshest album list from server to ensure 100% real-time consistency across devices!
        try {
          const res = await fetch('/api/albums');
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.albums)) {
              const deletedSet = new Set([
                ...PERMANENTLY_DELETED_CD_IDS,
                ...(json.deletedCdIds || [])
              ]);
              setMyCdAlbums((prevLocal) => {
                const map = new Map<string, MyCdAlbum>();
                INITIAL_MY_CD_ALBUMS.forEach((a) => {
                  if (!deletedSet.has(a.id) && a.id !== 'mycd-1791369288259') {
                    map.set(a.id, a);
                  }
                });
                json.albums.forEach((a: MyCdAlbum) => {
                  if (!deletedSet.has(a.id) && a.id !== 'mycd-1791369288259') {
                    map.set(a.id, a);
                  }
                });
                prevLocal.forEach((a) => {
                  if (!deletedSet.has(a.id) && !map.has(a.id) && a.id !== 'mycd-1791369288259') {
                    map.set(a.id, a);
                  }
                });
                const cleanAlbums = Array.from(map.values());
                cleanAlbums.sort((a, b) => {
                  if (a.pinned && !b.pinned) return -1;
                  if (!a.pinned && b.pinned) return 1;
                  return (b.dateAdded || '').localeCompare(a.dateAdded || '');
                });
                try {
                  localStorage.setItem(STORAGE_KEYS.MY_CD_COLLECTION, JSON.stringify(cleanAlbums));
                } catch {}
                return cleanAlbums;
              });
              setCloudSynced(true);
              return;
            }
          }
        } catch {
          // fallback to inline action
        }

        if (action === 'add' && item && !PERMANENTLY_DELETED_CD_IDS.has(item.id)) {
          setMyCdAlbums((prev) => [item, ...prev.filter((a) => a.id !== item.id && !PERMANENTLY_DELETED_CD_IDS.has(a.id))]);
        } else if (action === 'update' && id && !PERMANENTLY_DELETED_CD_IDS.has(id)) {
          setMyCdAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, ...item } : a)));
        } else if (action === 'delete' && id) {
          setMyCdAlbums((prev) => prev.filter((a) => a.id !== id));
        } else if (action === 'set' && Array.isArray(item)) {
          setMyCdAlbums(item.filter((a: MyCdAlbum) => !PERMANENTLY_DELETED_CD_IDS.has(a.id)));
        }
        setCloudSynced(true);
      },
      onGuestbook: (action, item, id) => {
        if (!isMounted) return;
        if (action === 'add' && item) {
          setGuestbookEntries((prev) => [item, ...prev.filter((g) => g.id !== item.id)]);
        } else if (action === 'delete' && id) {
          setGuestbookEntries((prev) => prev.filter((g) => g.id !== id));
        } else if (action === 'set' && Array.isArray(item)) {
          setGuestbookEntries(item);
        }
        setCloudSynced(true);
      },
      onIlchon: (action, item, id) => {
        if (!isMounted) return;
        if (action === 'add' && item) {
          setIlchonFriends((prev) => [item, ...prev.filter((f) => f.id !== item.id)]);
        } else if (action === 'update' && id) {
          setIlchonFriends((prev) => prev.map((f) => (f.id === id ? { ...f, ...item } : f)));
        } else if (action === 'set' && Array.isArray(item)) {
          setIlchonFriends(item);
        }
        setCloudSynced(true);
      },
      onStats: (stats) => {
        if (!isMounted || !stats) return;
        setTodayVisits(stats.today);
        setTotalVisits(stats.total);
      }
    });

    // 1. Initial Full Sync from Central Server
    fetchFullSyncFromServer().then((data) => {
      if (isMounted && data) {
        if (data.profile && data.profile.iconTitle && data.profile.welcomeMessage) {
          setProfile(data.profile);
          try {
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
          } catch {}
        }
        if (Array.isArray(data.media) && data.media.length > 0) setMediaItems(data.media);
        if (Array.isArray(data.travel) && data.travel.length > 0) setTravelSpots(data.travel);
        if (Array.isArray(data.cdReviews) && data.cdReviews.length > 0) setCdReviews(data.cdReviews);
        if (Array.isArray(data.myCdAlbums)) {
          const deletedSet = new Set([
            ...PERMANENTLY_DELETED_CD_IDS,
            ...(data.deletedCdIds || [])
          ]);
          setMyCdAlbums((prevLocal) => {
            const map = new Map<string, MyCdAlbum>();
            INITIAL_MY_CD_ALBUMS.forEach((a) => {
              if (!deletedSet.has(a.id) && a.id !== 'mycd-1791369288259') {
                map.set(a.id, a);
              }
            });
            data.myCdAlbums.forEach((a: MyCdAlbum) => {
              if (!deletedSet.has(a.id) && a.id !== 'mycd-1791369288259') {
                map.set(a.id, a);
              }
            });
            prevLocal.forEach((a) => {
              if (!deletedSet.has(a.id) && !map.has(a.id) && a.id !== 'mycd-1791369288259') {
                map.set(a.id, a);
              }
            });
            const cleanAlbums = Array.from(map.values());
            cleanAlbums.sort((a, b) => {
              if (a.pinned && !b.pinned) return -1;
              if (!a.pinned && b.pinned) return 1;
              return (b.dateAdded || '').localeCompare(a.dateAdded || '');
            });
            try {
              localStorage.setItem(STORAGE_KEYS.MY_CD_COLLECTION, JSON.stringify(cleanAlbums));
            } catch {}
            return cleanAlbums;
          });
        }
        if (Array.isArray(data.guestbook) && data.guestbook.length > 0) setGuestbookEntries(data.guestbook);
        if (Array.isArray(data.ilchon) && data.ilchon.length > 0) setIlchonFriends(data.ilchon);
        if (data.stats) {
          setTodayVisits(data.stats.today);
          setTotalVisits(data.stats.total);
        }
        setCloudSynced(true);
      }
    });

    // 2. Increment visitor stats safely
    cloudIncrementVisitors();

    // 3. Subscribe to Real-time Collections (Firestore fallback when quota permits)
    const unsubMedia = subscribeToMedia((items) => {
      if (isMounted && items && items.length > 0) {
        setMediaItems(items);
        setCloudSynced(true);
      }
    });

    const unsubTravel = subscribeToTravel((spots) => {
      if (isMounted && spots && spots.length > 0) {
        setTravelSpots(spots);
        setCloudSynced(true);
      }
    });

    const unsubCd = subscribeToCdReviews((cds) => {
      if (isMounted && cds && cds.length > 0) {
        setCdReviews(cds);
        setCloudSynced(true);
      }
    });

    const unsubMyCd = subscribeToMyCdCollection((cloudAlbums) => {
      if (isMounted && cloudAlbums && cloudAlbums.length > 0) {
        setMyCdAlbums((prevLocal) => {
          const deletedSet = PERMANENTLY_DELETED_CD_IDS;
          const map = new Map<string, MyCdAlbum>();
          INITIAL_MY_CD_ALBUMS.forEach((a) => {
            if (!deletedSet.has(a.id) && a.id !== 'mycd-1791369288259') {
              map.set(a.id, a);
            }
          });
          cloudAlbums.forEach((ca) => {
            if (!deletedSet.has(ca.id) && ca.id !== 'mycd-1791369288259') {
              map.set(ca.id, ca);
            }
          });
          prevLocal.forEach((la) => {
            if (!deletedSet.has(la.id) && !map.has(la.id) && la.id !== 'mycd-1791369288259') {
              map.set(la.id, la);
            }
          });
          const merged = Array.from(map.values());
          merged.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return (b.dateAdded || '').localeCompare(a.dateAdded || '');
          });
          try {
            localStorage.setItem(STORAGE_KEYS.MY_CD_COLLECTION, JSON.stringify(merged));
          } catch {}
          return merged;
        });
        setCloudSynced(true);
      }
    });

    const unsubGuestbook = subscribeToGuestbook((entries) => {
      if (isMounted && entries && entries.length > 0) {
        setGuestbookEntries(entries);
        setCloudSynced(true);
      }
    });

    const unsubProfile = subscribeToProfile((prof) => {
      if (isMounted && prof) {
        setProfile(prof);
        setCloudSynced(true);
      }
    });

    const unsubIlchon = subscribeToIlchon((friends) => {
      if (isMounted && friends && friends.length > 0) {
        setIlchonFriends(friends);
        setCloudSynced(true);
      }
    });

    const unsubNotes = subscribeToAllIlchonNotes((notes) => {
      if (isMounted && notes && notes.length > 0) {
        setAllNotes(notes);
        setCloudSynced(true);
      }
    });

    const unsubStats = subscribeToStats((stats) => {
      if (isMounted && stats) {
        setStatsData(stats);
        setTodayVisits(stats.today);
        setTotalVisits(stats.total);
      }
    });

    // 4. Synchronize BGM playback repeat mode across all devices
    bgmEngine.setOnConfigChange((cfg) => {
      cloudSaveBgmConfig(cfg).catch((err) => console.warn('BGM cloud save note:', err));
    });

    const unsubBgm = subscribeToBgmConfig((cfg) => {
      if (isMounted && cfg) {
        bgmEngine.applyRemoteConfig(cfg.playMode, cfg.selectedTrackIds);
      }
    });

    return () => {
      isMounted = false;
      unsubSSE();
      unsubMedia();
      unsubTravel();
      unsubCd();
      unsubMyCd();
      unsubGuestbook();
      unsubProfile();
      unsubIlchon();
      unsubNotes();
      unsubStats();
      unsubBgm();
    };
  }, []);

  // Global Keyboard Left / Right arrow volume control when not in my_cd_collection tab
  const [globalVolumeToast, setGlobalVolumeToast] = useState<{ volume: number; visible: boolean }>({
    volume: 0.8,
    visible: false
  });
  const globalVolumeToastTimer = React.useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if user is typing in form inputs or textareas
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // If user is currently in my_cd_collection tab, it handles its own playback and volume
      if (activeTab === 'my_cd_collection') {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const cur = bgmEngine.getVolume();
        const nextVol = Math.max(0, Math.round((cur - 0.05) * 100) / 100);
        bgmEngine.setVolume(nextVol);
        setGlobalVolumeToast({ volume: nextVol, visible: true });
        if (globalVolumeToastTimer.current) window.clearTimeout(globalVolumeToastTimer.current);
        globalVolumeToastTimer.current = window.setTimeout(() => {
          setGlobalVolumeToast((prev) => ({ ...prev, visible: false }));
        }, 1200);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const cur = bgmEngine.getVolume();
        const nextVol = Math.min(1, Math.round((cur + 0.05) * 100) / 100);
        bgmEngine.setVolume(nextVol);
        setGlobalVolumeToast({ volume: nextVol, visible: true });
        if (globalVolumeToastTimer.current) window.clearTimeout(globalVolumeToastTimer.current);
        globalVolumeToastTimer.current = window.setTimeout(() => {
          setGlobalVolumeToast((prev) => ({ ...prev, visible: false }));
        }, 1200);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (globalVolumeToastTimer.current) window.clearTimeout(globalVolumeToastTimer.current);
    };
  }, [activeTab]);

  // Sync to localStorage as offline fallback
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
      if (profile && profile.iconTitle && profile.welcomeMessage) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      }
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRAVEL, JSON.stringify(travelSpots));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [travelSpots]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CD_REVIEWS, JSON.stringify(cdReviews));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [cdReviews]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MY_CD_COLLECTION, JSON.stringify(myCdAlbums));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [myCdAlbums]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ILCHON, JSON.stringify(ilchonFriends));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [ilchonFriends]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(allNotes));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [allNotes]);

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

  // Authentication Handlers
  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const isTargetAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    if (!isTargetAdmin) {
      return {
        success: false,
        message: `관리자 계정(${ADMIN_EMAIL})만 관리자 로그인이 가능합니다.`
      };
    }

    const isPasswordCorrect = await verifyAdminPassword(password);
    if (!isPasswordCorrect) {
      return {
        success: false,
        message: '비밀번호가 일치하지 않습니다. 비밀번호를 다시 확인해주세요.'
      };
    }

    const newSession: UserSession = {
      email: ADMIN_EMAIL,
      name: '권용우',
      isAdmin: true
    };
    setSession(newSession);
    return {
      success: true,
      message: `권용우 최고 관리자(${ADMIN_EMAIL})로 성공적으로 인증되었습니다!`
    };
  };

  const handleLogout = () => {
    setSession(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch {
      // ignore
    }
  };

  // Media Handlers (Updated for Cloud multi-device persistence)
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
    broadcastServerUpdate('media', 'add', created);
    cloudAddMedia(created).catch((err) => console.warn('Cloud add media note:', err));
  };

  const handleUpdateMediaItem = (id: string, updated: Partial<MediaItem>) => {
    let fullItem: MediaItem | undefined;
    setMediaItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          fullItem = { ...item, ...updated };
          return fullItem;
        }
        return item;
      })
    );
    if (fullItem) {
      broadcastServerUpdate('media', 'update', updated, id);
      cloudSaveMedia(fullItem).catch((err) => console.warn('Cloud save media note:', err));
    }
  };

  const handleDeleteItem = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
    broadcastServerUpdate('media', 'delete', null, id);
    cloudDeleteMedia(id).catch((err) => console.warn('Cloud delete media note:', err));
  };

  const handleTogglePin = (id: string) => {
    let targetItem: MediaItem | undefined;
    setMediaItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          targetItem = { ...item, pinned: !item.pinned };
          return targetItem;
        }
        return item;
      })
    );
    if (targetItem) {
      broadcastServerUpdate('media', 'update', { pinned: targetItem.pinned }, id);
      cloudSaveMedia(targetItem).catch((err) => console.warn('Cloud pin note:', err));
    }
  };

  const handleToggleLike = (id: string) => {
    let targetItem: MediaItem | undefined;
    setMediaItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          targetItem = { ...item, likes: item.likes + 1 };
          return targetItem;
        }
        return item;
      })
    );
    if (targetItem) {
      broadcastServerUpdate('media', 'update', { likes: targetItem.likes }, id);
      cloudSaveMedia(targetItem).catch((err) => console.warn('Cloud like note:', err));
    }
  };

  // Guestbook Handlers (Updated for Cloud multi-device persistence)
  const handleAddGuestbookEntry = (entryData: Omit<GuestbookEntry, 'id' | 'createdAt'>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newEntry: GuestbookEntry = {
      ...entryData,
      id: `gb-${Date.now()}`,
      createdAt: timeStr
    };

    setGuestbookEntries((prev) => [newEntry, ...prev]);
    broadcastServerUpdate('guestbook', 'add', newEntry);
    cloudAddGuestbook(newEntry).catch((err) => console.warn('Cloud guestbook note:', err));
  };

  const handleDeleteGuestbookEntry = (id: string) => {
    setGuestbookEntries((prev) => prev.filter((entry) => entry.id !== id));
    broadcastServerUpdate('guestbook', 'delete', null, id);
    cloudDeleteGuestbook(id).catch((err) => console.warn('Cloud guestbook delete note:', err));
  };

  const handleSaveProfileConfig = (newConfig: ProfileConfig) => {
    if (!newConfig || !newConfig.iconTitle) return;
    setProfile(newConfig);
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newConfig));
    } catch {}
    broadcastServerUpdate('profile', 'set', newConfig);
    cloudSaveProfile(newConfig).catch((err) => console.warn('Cloud profile save note:', err));
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
          const updated: ProfileConfig = {
            ...profile,
            avatarType: 'uploaded_file',
            uploadedFileDataUrl: optimized,
            uploadedFileName: file.name
          };
          setProfile(updated);
          try {
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
          } catch {}
          broadcastServerUpdate('profile', 'set', updated);
          cloudSaveProfile(updated).catch((err) => console.warn('Cloud profile save note:', err));
        } else {
          const updated: ProfileConfig = {
            ...profile,
            avatarType: 'uploaded_file',
            uploadedFileDataUrl: dataUrl,
            uploadedFileName: file.name
          };
          setProfile(updated);
          try {
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
          } catch {}
          broadcastServerUpdate('profile', 'set', updated);
          cloudSaveProfile(updated).catch((err) => console.warn('Cloud profile save note:', err));
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Travel & Gourmet Handlers (Updated for Cloud multi-device persistence)
  const handleAddTravelSpot = (newSpotData: Omit<TravelSpot, 'id' | 'dateAdded'>) => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    const newSpot: TravelSpot = {
      ...newSpotData,
      id: `travel-${Date.now()}`,
      dateAdded: todayStr
    };
    setTravelSpots((prev) => [newSpot, ...prev]);
    broadcastServerUpdate('travel', 'add', newSpot);
    cloudAddTravelSpot(newSpot).catch((err) => console.warn('Cloud travel add note:', err));
  };

  const handleUpdateTravelSpot = (id: string, updated: Partial<TravelSpot>) => {
    let fullSpot: TravelSpot | undefined;
    setTravelSpots((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          fullSpot = { ...item, ...updated };
          return fullSpot;
        }
        return item;
      })
    );
    if (fullSpot) {
      broadcastServerUpdate('travel', 'update', updated, id);
      cloudSaveTravelSpot(fullSpot).catch((err) => console.warn('Cloud travel update note:', err));
    }
  };

  const handleDeleteTravelSpot = (id: string) => {
    setTravelSpots((prev) => prev.filter((item) => item.id !== id));
    broadcastServerUpdate('travel', 'delete', null, id);
    cloudDeleteTravelSpot(id).catch((err) => console.warn('Cloud travel delete note:', err));
  };

  const handleTogglePinTravelSpot = (id: string) => {
    let targetSpot: TravelSpot | undefined;
    setTravelSpots((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          targetSpot = { ...item, pinned: !item.pinned };
          return targetSpot;
        }
        return item;
      })
    );
    if (targetSpot) {
      broadcastServerUpdate('travel', 'update', { pinned: targetSpot.pinned }, id);
      cloudSaveTravelSpot(targetSpot).catch((err) => console.warn('Cloud travel pin note:', err));
    }
  };

  // Music CD & Store Reviews Handlers (Updated for Cloud multi-device persistence)
  const handleAddCdReview = (newCdData: Omit<CdReviewItem, 'id' | 'dateAdded'>) => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    const newCd: CdReviewItem = {
      ...newCdData,
      id: `cd-${Date.now()}`,
      dateAdded: todayStr
    };
    setCdReviews((prev) => [newCd, ...prev]);
    broadcastServerUpdate('cd_reviews', 'add', newCd);
    cloudAddCdReview(newCd).catch((err) => console.warn('Cloud cd add note:', err));
  };

  const handleUpdateCdReview = (id: string, updated: Partial<CdReviewItem>) => {
    let fullCd: CdReviewItem | undefined;
    setCdReviews((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          fullCd = { ...item, ...updated };
          return fullCd;
        }
        return item;
      })
    );
    if (fullCd) {
      broadcastServerUpdate('cd_reviews', 'update', updated, id);
      cloudSaveCdReview(fullCd).catch((err) => console.warn('Cloud cd update note:', err));
    }
  };

  const handleDeleteCdReview = (id: string) => {
    setCdReviews((prev) => prev.filter((item) => item.id !== id));
    broadcastServerUpdate('cd_reviews', 'delete', null, id);
    cloudDeleteCdReview(id).catch((err) => console.warn('Cloud cd delete note:', err));
  };

  const handleTogglePinCdReview = (id: string) => {
    let targetCd: CdReviewItem | undefined;
    setCdReviews((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          targetCd = { ...item, pinned: !item.pinned };
          return targetCd;
        }
        return item;
      })
    );
    if (targetCd) {
      broadcastServerUpdate('cd_reviews', 'update', { pinned: targetCd.pinned }, id);
      cloudSaveCdReview(targetCd).catch((err) => console.warn('Cloud cd pin note:', err));
    }
  };

  // My CD Collection Handlers (소장 CD / 음원 아카이브)
  const handleAddMyCdAlbum = (newAlbum: MyCdAlbum) => {
    setMyCdAlbums((prev) => [newAlbum, ...prev]);
    broadcastServerUpdate('my_cd_collection', 'add', newAlbum);
    cloudAddMyCdAlbum(newAlbum).catch((err) => console.warn('Cloud my cd add note:', err));
  };

  const handleAddMultipleMyCdAlbums = (newAlbums: MyCdAlbum[]) => {
    setMyCdAlbums((prev) => {
      const combined = [...newAlbums, ...prev];
      fetch('/api/albums/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albums: combined })
      }).catch(() => {});
      return combined;
    });
    newAlbums.forEach((album) => {
      cloudAddMyCdAlbum(album).catch((err) => console.warn('Cloud my cd batch add note:', err));
    });
  };

  const handleUpdateMyCdAlbum = (id: string, updated: Partial<MyCdAlbum>) => {
    let fullAlbum: MyCdAlbum | undefined;
    setMyCdAlbums((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          fullAlbum = { ...item, ...updated };
          return fullAlbum;
        }
        return item;
      })
    );
    if (fullAlbum) {
      broadcastServerUpdate('my_cd_collection', 'update', fullAlbum, id);
      cloudSaveMyCdAlbum(fullAlbum).catch((err) => console.warn('Cloud my cd update note:', err));
    }
  };

  const handleDeleteMyCdAlbum = (id: string) => {
    setMyCdAlbums((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.MY_CD_COLLECTION, JSON.stringify(filtered));
      } catch {}
      return filtered;
    });
    broadcastServerUpdate('my_cd_collection', 'delete', null, id);
    cloudDeleteMyCdAlbum(id).catch((err) => console.warn('Cloud my cd delete note:', err));
  };

  const handleAddIlchon = (newFriendData: Omit<IlchonFriend, 'id'>) => {
    const newFriend: IlchonFriend = {
      ...newFriendData,
      id: `ilchon-${Date.now()}`
    };
    setIlchonFriends((prev) => [newFriend, ...prev]);
    broadcastServerUpdate('ilchon', 'add', newFriend);
    cloudAddIlchon(newFriend).catch((err) => console.warn('Cloud ilchon add note:', err));
  };

  const handleUpdateIlchonStatus = (id: string, newStatus: string) => {
    setIlchonFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, statusMessage: newStatus, updatedAt: '방금 전' } : f))
    );
    broadcastServerUpdate('ilchon', 'update', { statusMessage: newStatus, updatedAt: '방금 전' }, id);
    cloudUpdateIlchon(id, { statusMessage: newStatus, updatedAt: '방금 전' }).catch((err) =>
      console.warn('Cloud ilchon update note:', err)
    );
  };

  const handleDeleteIlchon = (id: string) => {
    setIlchonFriends((prev) => prev.filter((f) => f.id !== id));
    broadcastServerUpdate('ilchon', 'delete', null, id);
    cloudDeleteIlchon(id).catch((err) => console.warn('Cloud ilchon delete note:', err));
  };

  const handleSendIlchonNote = (text: string) => {
    if (!activeChatFriend) return;

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newNote: IlchonNote = {
      id: `note-${Date.now()}`,
      friendId: activeChatFriend.id,
      sender: 'me',
      senderName: profile.iconTitle ? profile.iconTitle.replace('의 아이콘', '') : '권용우',
      text,
      timestamp: timeStr,
      isMine: true
    };

    setAllNotes((prev) => [...prev, newNote]);
    cloudSendIlchonNote(newNote).catch((err) => console.warn('Cloud send note error:', err));

    // Smart Cyworld interactive reply simulation from online friend
    const currentFriend = activeChatFriend;
    if (currentFriend.isOnline) {
      setTimeout(() => {
        const friendReplies: Record<string, string[]> = {
          'ilchon-1': [ // 김민준
            '용우 형님! 역시 눈썰미가 대단하세요 ㅎㅎ 오늘 촬영 마치고 밤에 또 쪽지 드릴게요 🎬',
            '오 그 조명 각도 저도 다음 릴 제작할 때 레퍼런스로 써보려고요! 조리개 색감 짱입니다 👍',
            '형님 미니홈피 BGM 선곡 감성 완전 추억돋아서 계속 틀어놓고 있어요 🎵'
          ],
          'ilchon-2': [ // 이지은
            '맞아요! 을지로 현상소 사장님이 이번 롤 콘트라스트 완벽하다고 칭찬해주셨어요 🎞️',
            '용우님 이번 주말에 날씨 좋으면 출사 같이 가요! 맛있는 핸드드립 커피 사드릴게요 📸☕️',
            '제주도 사진첩 업로드하신 거 봤어요! 비양도 노을 컷 진짜 예술이에요 ✨'
          ],
          'ilchon-3': [ // 도토리수집가
            '도토리 선물 너무 감사해요! 싸이월드 미니룸 스킨 꾸미는 데 보탤게요 🌰✨',
            '항상 따뜻한 사진과 영상 감사합니다! 오늘도 기분 좋은 하루 보내세요 🍀'
          ],
          'ilchon-4': [ // 박진우
            'LP 잡음 필터링 작업 중인데 아날로그 질감이 살아있네요 🎧 새 음반 청음하러 스튜디오 놀러오세요!',
            '오늘 스튜디오 음향 밸런스 점검 끝났습니다! 언제든 말씀하세요 💿'
          ],
          'ilchon-5': [ // 최유나
            '따뜻한 라떼 마시며 사진 셀렉 중이에요 ☕️ 오늘 촬영 파이팅입니다!',
            '스튜디오 아틀리에 분위기 너무 멋져요! 조만간 미니홈피 파도타기 또 올게요 🌿'
          ]
        };

        const defaultReplies = [
          `${currentFriend.name}: 쪽지 확인했습니다! 미니홈피 방문 감사해요 ☕️`,
          `${currentFriend.name}: 지금 작업 중인데 마무리하고 또 연락드릴게요! 🎬`,
          `${currentFriend.name}: 늘 멋진 작품들 잘 보고 있습니다. 오늘도 행복한 하루 보내세요! ✨`
        ];

        const replies = friendReplies[currentFriend.id] || defaultReplies;
        const replyText = replies[Math.floor(Math.random() * replies.length)];

        const replyTime = new Date();
        const replyTimeStr = `${replyTime.getHours()}:${String(replyTime.getMinutes()).padStart(2, '0')}`;
        const replyNote: IlchonNote = {
          id: `note-${Date.now() + 1}`,
          friendId: currentFriend.id,
          sender: 'friend',
          senderName: currentFriend.name,
          text: replyText,
          timestamp: replyTimeStr,
          isMine: false,
          avatarIcon: currentFriend.avatarIcon
        };

        setAllNotes((prev) => [...prev, replyNote]);
        cloudSendIlchonNote(replyNote).catch((err) => console.warn('Cloud reply note error:', err));
      }, 1200);
    }
  };

  const handleClearIlchonNotes = () => {
    if (!activeChatFriend) return;
    const friendId = activeChatFriend.id;
    setAllNotes((prev) => prev.filter((n) => n.friendId !== friendId));
    cloudDeleteIlchonNotes(friendId).catch((err) => console.warn('Cloud clear notes error:', err));
  };

  const handleResetData = () => {
    setMediaItems(INITIAL_MEDIA_ITEMS);
    setGuestbookEntries(INITIAL_GUESTBOOK_ENTRIES);
    setProfile(INITIAL_PROFILE_CONFIG);
    setTravelSpots(INITIAL_TRAVEL_SPOTS);
    setCdReviews(INITIAL_CD_REVIEWS);
    setIlchonFriends(INITIAL_ILCHON_FRIENDS);
    setAllNotes(INITIAL_ILCHON_NOTES);
  };

  const mediaCount = {
    youtube: mediaItems.filter((i) => i.type === 'youtube').length,
    facebook: mediaItems.filter((i) => i.type === 'facebook').length,
    travel: travelSpots.length,
    cd: cdReviews.length
  };

  const currentTheme = getThemePalette(profile.themePalette);

  const handleQuickThemeSelect = (themeId: ThemePaletteId) => {
    const updated: ProfileConfig = { ...profile, themePalette: themeId };
    setProfile(updated);
    cloudSaveProfile(updated).catch((err) => console.warn('Cloud theme save note:', err));
  };

  return (
    <div className="min-h-screen py-1 px-1 sm:py-2 sm:px-2 md:py-2 md:px-3 lg:px-4 flex flex-col items-center justify-start w-full md:h-screen md:max-h-screen md:overflow-hidden">
      {/* Outer Cyworld Container with Dynamic Theme Palette - Full Width for PC & iPad */}
      <div
        className="w-full max-w-[99vw] xl:max-w-[98.5vw] 2xl:max-w-[98vw] cyworld-outer-box p-2 sm:p-2.5 md:p-3 transition-colors duration-300 md:h-full md:max-h-full md:flex md:flex-col md:overflow-hidden"
        style={{
          backgroundColor: currentTheme.bgHex,
          borderColor: currentTheme.borderHex
        }}
      >
        
        {/* Top Header: Logo Tile + Title + Visitor Stats + BGM Player + Quick Skin Palette Switcher */}
        <div className="shrink-0">
          <TopHeader
            todayVisits={todayVisits}
            totalVisits={totalVisits}
            cloudSynced={cloudSynced}
            themePalette={profile.themePalette}
            onSelectTheme={handleQuickThemeSelect}
            onOpenThemeSettings={session?.isAdmin ? () => setActiveTab('edit_profile') : undefined}
            isAdmin={!!session?.isAdmin}
          />
        </div>

        {/* CSS Grid Responsive Layout: Mobile natural single-column flow & Desktop 3-column retro binder */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_auto_1fr_130px] lg:grid-cols-[235px_auto_1fr_136px] xl:grid-cols-[245px_auto_1fr_140px] gap-2 sm:gap-2.5 md:gap-2 lg:gap-2.5 items-stretch mt-1 md:flex-1 md:min-h-0 md:h-full md:overflow-hidden">
          
          {/* 1. Navigation Tabs: Top of grid on mobile (order-1), Right Column on desktop (md:order-4) */}
          <div className="order-1 md:order-4 w-full shrink-0 md:overflow-y-auto custom-retro-scrollbar">
            <RightTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              session={session}
            />
          </div>

          {/* 2. Left Sidebar Column: Under tabs on mobile (order-2), Left Column on desktop (md:order-1) */}
          <div className="order-2 md:order-1 cyworld-inner-box p-2.5 sm:p-3 bg-white flex flex-col w-full md:h-full md:overflow-y-auto custom-retro-scrollbar">
            <LeftSidebar
              session={session}
              onOpenAdminLogin={() => setActiveTab('admin')}
              onOpenEditProfile={() => setActiveTab('edit_profile')}
              onQuickFileUpload={handleQuickFileUpload}
              mediaCount={mediaCount}
              profile={profile}
              onSelectTab={setActiveTab}
              ilchonFriends={ilchonFriends}
              onAddIlchon={handleAddIlchon}
              onUpdateIlchonStatus={handleUpdateIlchonStatus}
              onDeleteIlchon={handleDeleteIlchon}
              onOpenChat={setActiveChatFriend}
            />
          </div>

          {/* 3. Retro Binder Rings Divider (desktop only) */}
          <div className="hidden md:flex md:order-2 flex-col justify-around py-12 px-0.5 z-10 select-none h-full self-stretch shrink-0">
            {[1, 2, 3, 4, 5, 6].map((ring) => (
              <div key={ring} className="w-3 h-6 cyworld-ring my-2 shrink-0" />
            ))}
          </div>

          {/* 4. Central Main Panel Column: Under sidebar on mobile (order-3), Center Column on desktop (md:order-3) */}
          <main className="order-3 md:order-3 cyworld-inner-box p-2.5 sm:p-3 md:p-3.5 bg-white min-w-0 flex flex-col md:h-full md:max-h-full md:overflow-hidden">
            {/* Main Panel Content Title bar (소장 CD 탭에서는 아래 박스와 내용이 중복되므로 사진라인 제거하고 박스가 최상단에 바로 오도록 설정) */}
            {activeTab !== 'my_cd_collection' && (
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#bcd0dc] shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#ff6b2b] rounded-xs" />
                  <h2 className="text-sm font-bold text-[#1f374a] tracking-tight">
                    {activeTab === 'gallery' && '스튜디오 갤러리 (사진 & 영상 모아보기)'}
                    {activeTab === 'upload_facebook' && '사진 업로드 (Google Drive · Facebook · YouTube 모든 링크 지원)'}
                    {activeTab === 'upload_youtube' && '영상 업로드 (YouTube · Facebook 모든 링크 지원)'}
                    {activeTab === 'travel_food' && '국내 여행&맛집 (주요 여행지 & 미식 핫플 아카이브)'}
                    {activeTab === 'cd_review' && '구매CD 검토 (소장 음반 & 온/오프라인 판매처 링크)'}
                    {activeTab === 'guestbook' && '방명록 & 일촌 맺기 (누구나 자유롭게 발자국 남기고 일촌 신청)'}
                    {activeTab === 'bgm_manage' && '음악 재생 & 반복 설정 메뉴 (1곡반복·선택반복·업로드)'}
                    {activeTab === 'edit_profile' && '권용우의 아이콘 수정 (프로필 & 아바타 커스텀)'}
                    {activeTab === 'admin' && '관리자 센터 (dream2note3@gmail.com)'}
                  </h2>
                </div>

                <div className="text-[11px] text-[#6d8494] font-medium hidden sm:block">
                  권용우의 공식 미니홈피 스튜디오
                </div>
              </div>
            )}

            {/* Dynamic View by Tab Container */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {activeTab === 'gallery' && (
                <MediaGallery
                  items={mediaItems}
                  onToggleLike={handleToggleLike}
                  onDeleteItem={handleDeleteItem}
                  onTogglePin={handleTogglePin}
                  onUpdateItem={handleUpdateMediaItem}
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

              {activeTab === 'travel_food' && (
                <TravelFoodGallery
                  items={travelSpots}
                  onAddItem={handleAddTravelSpot}
                  onUpdateItem={handleUpdateTravelSpot}
                  onDeleteItem={handleDeleteTravelSpot}
                  onTogglePin={handleTogglePinTravelSpot}
                  isAdmin={!!session?.isAdmin}
                />
              )}

              {activeTab === 'cd_review' && (
                <CdReviewGallery
                  items={cdReviews}
                  onAddItem={handleAddCdReview}
                  onUpdateItem={handleUpdateCdReview}
                  onDeleteItem={handleDeleteCdReview}
                  onTogglePin={handleTogglePinCdReview}
                  isAdmin={!!session?.isAdmin}
                />
              )}

              {activeTab === 'my_cd_collection' && (
                <MyCdCollectionGallery
                  albums={myCdAlbums}
                  onAddAlbum={handleAddMyCdAlbum}
                  onAddAlbums={handleAddMultipleMyCdAlbums}
                  onUpdateAlbum={handleUpdateMyCdAlbum}
                  onDeleteAlbum={handleDeleteMyCdAlbum}
                  isAdmin={!!session?.isAdmin}
                />
              )}

              {activeTab === 'guestbook' && (
                <Guestbook
                  entries={guestbookEntries}
                  onAddEntry={handleAddGuestbookEntry}
                  onDeleteEntry={handleDeleteGuestbookEntry}
                  isAdmin={!!session?.isAdmin}
                  onAddIlchon={handleAddIlchon}
                />
              )}

              {activeTab === 'miniroom' && (
                <Miniroom
                  onOpenBgmManager={() => setActiveTab('bgm_manage')}
                  onReturnToGallery={() => setActiveTab('gallery')}
                  onSetAsProfilePhoto={(dataUrl: string) => {
                    handleSaveProfileConfig({
                      ...profile,
                      avatarType: 'uploaded_file',
                      uploadedFileDataUrl: dataUrl,
                      uploadedFileName: 'miniroom_profile.png'
                    });
                  }}
                />
              )}

              {activeTab === 'bgm_manage' && (
                <BgmManagerPanel onReturnToGallery={() => setActiveTab('gallery')} />
              )}

              {activeTab === 'edit_profile' && (
                session?.isAdmin ? (
                  <EditIconPanel
                    currentConfig={profile}
                    onSaveConfig={handleSaveProfileConfig}
                    session={session}
                    onOpenAdminLogin={() => setActiveTab('admin')}
                    onReturnToGallery={() => setActiveTab('gallery')}
                  />
                ) : (
                  <div className="p-8 text-center bg-[#fafbfc] border border-[#bed2dc] rounded-lg flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#fdeee7] text-[#ff6b2b] flex items-center justify-center text-xl font-bold">
                      🔒
                    </div>
                    <h3 className="text-sm font-bold text-[#1f3a52]">관리자 전용 설정 페이지입니다.</h3>
                    <p className="text-xs text-[#526f84] max-w-sm break-keep leading-relaxed">
                      아이콘, 아바타, 테마 색상 및 환영 인사말 변경은 관리자로 로그인한 경우에만 접근할 수 있습니다.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className="px-4 py-2 bg-[#ff6b2b] hover:bg-[#ea580c] text-white rounded text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      관리자 로그인하기
                    </button>
                  </div>
                )
              )}

              {activeTab === 'admin' && (
                <AdminLoginModal
                  session={session}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  onClose={() => setActiveTab('gallery')}
                  onResetData={handleResetData}
                  statsData={statsData}
                  onSimulateVisit={cloudIncrementVisitors}
                />
              )}
            </div>
          </main>
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

      {/* Floating Global Volume HUD (타 탭에서 키보드 좌/우 방향키로 배경음악 볼륨 조절 시 피드백 표시) */}
      {globalVolumeToast.visible && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1e1b4b]/95 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-mono font-bold border border-purple-400/50 animate-fadeIn pointer-events-none select-none">
          {globalVolumeToast.volume === 0 ? (
            <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#ff6b2b] shrink-0" />
          )}
          <span className="whitespace-nowrap">BGM 볼륨 {Math.round(globalVolumeToast.volume * 100)}%</span>
          <div className="w-24 h-1.5 bg-purple-950 rounded-full overflow-hidden border border-purple-500/30">
            <div
              className="h-full bg-linear-to-r from-[#ff6b2b] to-[#ea580c] transition-all duration-75"
              style={{ width: `${Math.round(globalVolumeToast.volume * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-purple-300 font-normal">
            (좌/우 방향키)
          </span>
        </div>
      )}

      {/* Floating Retro Cyworld Ilchon Paper Note Chat Modal Window */}
      {activeChatFriend && (
        <IlchonChatModal
          friend={activeChatFriend}
          notes={allNotes.filter((n) => n.friendId === activeChatFriend.id)}
          onSendNote={handleSendIlchonNote}
          onClearNotes={handleClearIlchonNotes}
          onClose={() => setActiveChatFriend(null)}
        />
      )}
    </div>
  );
}
