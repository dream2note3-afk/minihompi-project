import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  MediaItem,
  TravelSpot,
  CdReviewItem,
  GuestbookEntry,
  ProfileConfig,
  IlchonFriend,
  IlchonNote,
  DailyVisitStat,
  VisitorStatsData,
  MyCdAlbum
} from '../types';
import {
  INITIAL_MEDIA_ITEMS,
  INITIAL_TRAVEL_SPOTS,
  INITIAL_CD_REVIEWS,
  INITIAL_GUESTBOOK_ENTRIES,
  INITIAL_PROFILE_CONFIG,
  INITIAL_ILCHON_FRIENDS,
  INITIAL_ILCHON_NOTES,
  INITIAL_MY_CD_ALBUMS
} from '../data/initialData';

// Firestore collection names
export const COLLECTIONS = {
  MEDIA: 'media_items',
  TRAVEL: 'travel_spots',
  CD_REVIEWS: 'cd_reviews',
  MY_CD_COLLECTION: 'my_cd_collection',
  GUESTBOOK: 'guestbook_entries',
  PROFILE: 'profile_config',
  ILCHON: 'ilchon_friends',
  ILCHON_NOTES: 'ilchon_notes',
  STATS: 'stats'
} as const;

/**
 * Deeply sanitizes any payload by stripping out `undefined` properties.
 * Firestore strictly errors out on `undefined` field values.
 */
export function sanitizePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizePayload(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = sanitizePayload(value);
      }
    }
    return clean as T;
  }
  return obj;
}

/**
 * Ensures all initial data exists in Firestore cloud database.
 * Uses individual `setDoc(..., { merge: true })` with sanitized payloads
 * so no initial items are missing, and no document is rejected due to undefined fields.
 */
export async function syncInitialDataToCloud(): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).__cloudInitialChecked) return;
  if (typeof window !== 'undefined') (window as any).__cloudInitialChecked = true;
  try {
    // 1. Media Items
    const mediaSnap = await getDocs(collection(db, COLLECTIONS.MEDIA));
    if (mediaSnap.empty) {
      console.log('🌱 Seeding initial media items to Firestore cloud...');
      for (const item of INITIAL_MEDIA_ITEMS) {
        await setDoc(doc(db, COLLECTIONS.MEDIA, item.id), sanitizePayload(item), { merge: true });
      }
    }

    // 2. Travel Spots
    const travelSnap = await getDocs(collection(db, COLLECTIONS.TRAVEL));
    if (travelSnap.empty) {
      console.log('🌱 Seeding initial travel spots to Firestore cloud...');
      for (const spot of INITIAL_TRAVEL_SPOTS) {
        await setDoc(doc(db, COLLECTIONS.TRAVEL, spot.id), sanitizePayload(spot), { merge: true });
      }
    }

    // 3. CD Reviews
    const cdSnap = await getDocs(collection(db, COLLECTIONS.CD_REVIEWS));
    if (cdSnap.empty) {
      console.log('🌱 Seeding initial CD reviews to Firestore cloud...');
      for (const cd of INITIAL_CD_REVIEWS) {
        await setDoc(doc(db, COLLECTIONS.CD_REVIEWS, cd.id), sanitizePayload(cd), { merge: true });
      }
    }

    // 3-1. My CD Collection (소장 CD / 음원 아카이브)
    const myCdSnap = await getDocs(collection(db, COLLECTIONS.MY_CD_COLLECTION));
    if (myCdSnap.empty) {
      console.log('🌱 Seeding initial My CD Collection to Firestore cloud...');
      for (const album of INITIAL_MY_CD_ALBUMS) {
        await setDoc(doc(db, COLLECTIONS.MY_CD_COLLECTION, album.id), sanitizePayload(album), { merge: true });
      }
    }

    // 4. Guestbook Entries
    const gbSnap = await getDocs(collection(db, COLLECTIONS.GUESTBOOK));
    if (gbSnap.empty) {
      console.log('🌱 Seeding initial guestbook to Firestore cloud...');
      for (const gb of INITIAL_GUESTBOOK_ENTRIES) {
        await setDoc(doc(db, COLLECTIONS.GUESTBOOK, gb.id), sanitizePayload(gb), { merge: true });
      }
    }

    // 5. Profile Config
    const profileRef = doc(db, COLLECTIONS.PROFILE, 'default');
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
      console.log('🌱 Seeding initial profile config to Firestore cloud...');
      await setDoc(profileRef, sanitizePayload(INITIAL_PROFILE_CONFIG), { merge: true });
    }

    // 6. Ilchon Friends
    const ilchonSnap = await getDocs(collection(db, COLLECTIONS.ILCHON));
    if (ilchonSnap.empty) {
      console.log('🌱 Seeding initial Ilchon friends to Firestore cloud...');
      for (const friend of INITIAL_ILCHON_FRIENDS) {
        await setDoc(doc(db, COLLECTIONS.ILCHON, friend.id), sanitizePayload(friend), { merge: true });
      }
    }

    // 7. Ilchon Notes
    const notesSnap = await getDocs(collection(db, COLLECTIONS.ILCHON_NOTES));
    if (notesSnap.empty) {
      console.log('🌱 Seeding initial Ilchon notes to Firestore cloud...');
      for (const note of INITIAL_ILCHON_NOTES) {
        await setDoc(doc(db, COLLECTIONS.ILCHON_NOTES, note.id), sanitizePayload(note), { merge: true });
      }
    }

    // 8. Visitor Stats
    const statsRef = doc(db, COLLECTIONS.STATS, 'visitors');
    const statsSnap = await getDoc(statsRef);
    if (!statsSnap.exists()) {
      await setDoc(statsRef, { today: 28, total: 12845 }, { merge: true });
    }

    console.log('✅ All initial cloud dataset verified in Firestore!');
  } catch (err) {
    console.warn('Initial cloud sync note:', err);
  }
}

// Backward compatible alias
export const initializeDatabaseIfEmpty = syncInitialDataToCloud;

/**
 * Ensures initial cloud database collections exist and connects real-time sync.
 * Does NOT overwrite existing cloud data with client-side initial defaults.
 */
export async function syncLocalDatasetToCloud(
  _localMedia?: MediaItem[],
  _localTravel?: TravelSpot[],
  _localCd?: CdReviewItem[],
  _localGuestbook?: GuestbookEntry[],
  _localProfile?: ProfileConfig,
  _localIlchon?: IlchonFriend[],
  _localNotes?: IlchonNote[]
): Promise<void> {
  try {
    // 1. Ensure cloud collections exist with seed dataset if empty
    await syncInitialDataToCloud();
    console.log('✅ Real-time multi-device cloud dataset synchronized!');
  } catch (e) {
    console.warn('Real-time sync note:', e);
  }
}

// ==========================================
// REAL-TIME LISTENERS (Multi-device Sync)
// ==========================================

export function subscribeToMedia(callback: (items: MediaItem[]) => void): () => void {
  const colRef = collection(db, COLLECTIONS.MEDIA);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id
      } as MediaItem));
      // Sort: pinned first, then by date desc
      items.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.date || '').localeCompare(a.date || '');
      });
      callback(items);
    },
    (err) => console.error('Real-time media sync error:', err)
  );
}

export function subscribeToTravel(callback: (items: TravelSpot[]) => void): () => void {
  const colRef = collection(db, COLLECTIONS.TRAVEL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as TravelSpot);
      items.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.dateAdded || '').localeCompare(a.dateAdded || '');
      });
      callback(items);
    },
    (err) => console.error('Real-time travel sync error:', err)
  );
}

export function subscribeToCdReviews(callback: (items: CdReviewItem[]) => void): () => void {
  const colRef = collection(db, COLLECTIONS.CD_REVIEWS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as CdReviewItem);
      items.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.dateAdded || '').localeCompare(a.dateAdded || '');
      });
      callback(items);
    },
    (err) => console.error('Real-time CD sync error:', err)
  );
}

export function subscribeToMyCdCollection(callback: (albums: MyCdAlbum[]) => void): () => void {
  const colRef = collection(db, COLLECTIONS.MY_CD_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const albums = snapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id
      } as MyCdAlbum));
      albums.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.dateAdded || '').localeCompare(a.dateAdded || '');
      });
      callback(albums);
    },
    (err) => console.error('Real-time My CD collection sync error:', err)
  );
}

export function subscribeToGuestbook(callback: (entries: GuestbookEntry[]) => void): () => void {
  const colRef = collection(db, COLLECTIONS.GUESTBOOK);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const entries = snapshot.docs.map((d) => d.data() as GuestbookEntry);
      entries.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(entries);
    },
    (err) => console.error('Real-time guestbook sync error:', err)
  );
}

export function subscribeToProfile(callback: (profile: ProfileConfig) => void): () => void {
  const docRef = doc(db, COLLECTIONS.PROFILE, 'default');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ProfileConfig;
        if (
          data.welcomeMessage === '“권용우의 스튜디오 방문을 환영합니다!“' ||
          data.welcomeMessage === '“권용우의 스튜디오 방문을 환영합니다!”' ||
          data.welcomeMessage === '권용우의 스튜디오 방문을 환영합니다!' ||
          data.welcomeMessage === '권용우의 스튜디오 방문을 환영합니다'
        ) {
          data.welcomeMessage = '“권용우의 행복한 인생 방문을 환영합니다!“';
        }
        // If an uploaded icon file data url exists and not explicitly set to another custom preset, ensure avatarType is uploaded_file
        if (data.uploadedFileDataUrl && (data.avatarType === 'preset_director' || !data.avatarType)) {
          data.avatarType = 'uploaded_file';
        }
        callback(data);
      }
    },
    (err) => console.error('Real-time profile sync error:', err)
  );
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function generateDefaultVisitHistory(currentToday: number, currentTotal: number): DailyVisitStat[] {
  const result: DailyVisitStat[] = [];
  const now = new Date();
  
  // Realistic visitor pattern for the past 13 days
  const pattern = [25, 32, 28, 45, 54, 38, 41, 35, 48, 59, 44, 39, 47];
  
  let cumulative = currentTotal - currentToday;
  for (let i = pattern.length - 1; i >= 0; i--) {
    cumulative -= pattern[i];
  }

  for (let i = 13; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${month}/${day}`;
    const fullDate = `${d.getFullYear()}-${month}-${day}`;
    const dayName = DAY_NAMES[d.getDay()];
    const dailyCount = pattern[13 - i] || 35;
    cumulative += dailyCount;

    result.push({
      date: dateStr,
      fullDate,
      dayName,
      daily: dailyCount,
      total: cumulative,
      pageViews: dailyCount * 4
    });
  }

  // Today entry
  const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
  const todayDay = String(now.getDate()).padStart(2, '0');
  result.push({
    date: `${todayMonth}/${todayDay}`,
    fullDate: `${now.getFullYear()}-${todayMonth}-${todayDay}`,
    dayName: DAY_NAMES[now.getDay()],
    daily: currentToday,
    total: currentTotal,
    pageViews: currentToday * 5
  });

  return result;
}

export function subscribeToStats(
  callback: (stats: VisitorStatsData) => void
): () => void {
  const docRef = doc(db, COLLECTIONS.STATS, 'visitors');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const today = data.today || 24;
        const total = data.total || 12845;
        const history = Array.isArray(data.history) && data.history.length > 0
          ? (data.history as DailyVisitStat[])
          : generateDefaultVisitHistory(today, total);

        callback({
          today,
          total,
          lastDate: data.lastDate,
          history
        });
      } else {
        const today = 24;
        const total = 12845;
        callback({
          today,
          total,
          history: generateDefaultVisitHistory(today, total)
        });
      }
    },
    (err) => console.error('Real-time stats sync error:', err)
  );
}

export function subscribeToIlchon(callback: (friends: IlchonFriend[]) => void): () => void {
  const colRef = collection(db, COLLECTIONS.ILCHON);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const friends = snapshot.docs.map((d) => d.data() as IlchonFriend);
      // Online friends first, then by name
      friends.sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
      callback(friends);
    },
    (err) => console.error('Real-time Ilchon sync error:', err)
  );
}

export function subscribeToAllIlchonNotes(callback: (notes: IlchonNote[]) => void): () => void {
  const colRef = collection(db, COLLECTIONS.ILCHON_NOTES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const notes = snapshot.docs.map((d) => d.data() as IlchonNote);
      callback(notes);
    },
    (err) => console.error('Real-time Ilchon notes sync error:', err)
  );
}

// ==========================================
// CLOUD MUTATION HELPERS
// (Always using sanitized payloads and setDoc merge: true)
// ==========================================

export async function cloudSaveMedia(item: MediaItem): Promise<void> {
  const clean = sanitizePayload(item);
  await setDoc(doc(db, COLLECTIONS.MEDIA, item.id), clean, { merge: true });
}

export async function cloudAddMedia(item: MediaItem): Promise<void> {
  await cloudSaveMedia(item);
}

export async function cloudUpdateMedia(id: string, updated: Partial<MediaItem>): Promise<void> {
  const clean = sanitizePayload(updated);
  await setDoc(doc(db, COLLECTIONS.MEDIA, id), clean, { merge: true });
}

export async function cloudDeleteMedia(id: string): Promise<void> {
  if (!id) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.MEDIA, id));
  } catch (err) {
    console.warn('Direct deleteDoc note:', err);
  }

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.MEDIA));
    for (const d of snap.docs) {
      if (d.id === id || d.data().id === id) {
        await deleteDoc(d.ref);
      }
    }
  } catch (err) {
    console.warn('Sweep delete note:', err);
  }
}

export async function cloudSaveTravelSpot(spot: TravelSpot): Promise<void> {
  const clean = sanitizePayload(spot);
  await setDoc(doc(db, COLLECTIONS.TRAVEL, spot.id), clean, { merge: true });
}

export async function cloudAddTravelSpot(spot: TravelSpot): Promise<void> {
  await cloudSaveTravelSpot(spot);
}

export async function cloudUpdateTravelSpot(id: string, updated: Partial<TravelSpot>): Promise<void> {
  const clean = sanitizePayload(updated);
  await setDoc(doc(db, COLLECTIONS.TRAVEL, id), clean, { merge: true });
}

export async function cloudDeleteTravelSpot(id: string): Promise<void> {
  if (!id) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TRAVEL, id));
  } catch (err) {
    console.warn('Direct travel delete note:', err);
  }
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.TRAVEL));
    for (const d of snap.docs) {
      if (d.id === id || d.data().id === id) {
        await deleteDoc(d.ref);
      }
    }
  } catch (err) {
    console.warn('Sweep travel delete note:', err);
  }
}

export async function cloudSaveCdReview(cd: CdReviewItem): Promise<void> {
  const clean = sanitizePayload(cd);
  await setDoc(doc(db, COLLECTIONS.CD_REVIEWS, cd.id), clean, { merge: true });
}

export async function cloudAddCdReview(cd: CdReviewItem): Promise<void> {
  await cloudSaveCdReview(cd);
}

export async function cloudUpdateCdReview(id: string, updated: Partial<CdReviewItem>): Promise<void> {
  const clean = sanitizePayload(updated);
  await setDoc(doc(db, COLLECTIONS.CD_REVIEWS, id), clean, { merge: true });
}

export async function cloudDeleteCdReview(id: string): Promise<void> {
  if (!id) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.CD_REVIEWS, id));
  } catch (err) {
    console.warn('Direct cd delete note:', err);
  }
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.CD_REVIEWS));
    for (const d of snap.docs) {
      if (d.id === id || d.data().id === id) {
        await deleteDoc(d.ref);
      }
    }
  } catch (err) {
    console.warn('Sweep cd delete note:', err);
  }
}

/**
 * Automatically downsizes and compresses large cover data URLs to fit Firestore's 1MB limit.
 */
export async function compressCoverDataUrl(dataUrl: string, maxDim = 400, quality = 0.8): Promise<string> {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }
  if (dataUrl.length < 50000) return dataUrl;

  try {
    return await new Promise<string>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  } catch {
    return dataUrl;
  }
}

export async function cloudSaveMyCdAlbum(album: MyCdAlbum): Promise<void> {
  const compressedCover = album.coverImageUrl ? await compressCoverDataUrl(album.coverImageUrl) : album.coverImageUrl;
  const clean = sanitizePayload({ ...album, coverImageUrl: compressedCover });
  await setDoc(doc(db, COLLECTIONS.MY_CD_COLLECTION, album.id), clean, { merge: true });
}

export async function cloudAddMyCdAlbum(album: MyCdAlbum): Promise<void> {
  await cloudSaveMyCdAlbum(album);
}

export async function cloudSyncLocalAlbumsToCloud(localAlbums: MyCdAlbum[]): Promise<number> {
  let synced = 0;
  for (const album of localAlbums) {
    try {
      await cloudSaveMyCdAlbum(album);
      synced++;
    } catch (e) {
      console.warn('Sync album error:', album.songTitle, e);
    }
  }
  return synced;
}

export async function cloudUpdateMyCdAlbum(id: string, updated: Partial<MyCdAlbum>): Promise<void> {
  const clean = sanitizePayload(updated);
  await setDoc(doc(db, COLLECTIONS.MY_CD_COLLECTION, id), clean, { merge: true });
}

export async function cloudDeleteMyCdAlbum(id: string): Promise<void> {
  if (!id) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.MY_CD_COLLECTION, id));
  } catch (err) {
    console.warn('Direct my cd delete note:', err);
  }
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.MY_CD_COLLECTION));
    for (const d of snap.docs) {
      if (d.id === id || d.data().id === id) {
        await deleteDoc(d.ref);
      }
    }
  } catch (err) {
    console.warn('Sweep my cd delete note:', err);
  }
}

export async function cloudSaveGuestbook(entry: GuestbookEntry): Promise<void> {
  const clean = sanitizePayload(entry);
  await setDoc(doc(db, COLLECTIONS.GUESTBOOK, entry.id), clean, { merge: true });
}

export async function cloudAddGuestbook(entry: GuestbookEntry): Promise<void> {
  await cloudSaveGuestbook(entry);
}

export async function cloudDeleteGuestbook(id: string): Promise<void> {
  if (!id) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.GUESTBOOK, id));
  } catch (err) {
    console.warn('Direct guestbook delete note:', err);
  }
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.GUESTBOOK));
    for (const d of snap.docs) {
      if (d.id === id || d.data().id === id) {
        await deleteDoc(d.ref);
      }
    }
  } catch (err) {
    console.warn('Sweep guestbook delete note:', err);
  }
}

export async function cloudSaveProfile(profile: ProfileConfig): Promise<void> {
  const clean = sanitizePayload(profile);
  await setDoc(doc(db, COLLECTIONS.PROFILE, 'default'), clean, { merge: true });
}

export async function cloudSaveIlchon(friend: IlchonFriend): Promise<void> {
  const clean = sanitizePayload(friend);
  await setDoc(doc(db, COLLECTIONS.ILCHON, friend.id), clean, { merge: true });
}

export async function cloudAddIlchon(friend: IlchonFriend): Promise<void> {
  await cloudSaveIlchon(friend);
}

export async function cloudUpdateIlchon(id: string, updated: Partial<IlchonFriend>): Promise<void> {
  const clean = sanitizePayload(updated);
  await setDoc(doc(db, COLLECTIONS.ILCHON, id), clean, { merge: true });
}

export async function cloudDeleteIlchon(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ILCHON, id));
}

export async function cloudSendIlchonNote(note: IlchonNote): Promise<void> {
  const clean = sanitizePayload(note);
  await setDoc(doc(db, COLLECTIONS.ILCHON_NOTES, note.id), clean, { merge: true });
}

export async function cloudDeleteIlchonNotes(friendId: string): Promise<void> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.ILCHON_NOTES));
  for (const d of snapshot.docs) {
    if (d.data().friendId === friendId) {
      await deleteDoc(d.ref);
    }
  }
}

export interface BgmCloudConfig {
  playMode: 'all' | 'repeat_one' | 'repeat_selected' | 'repeat_custom' | 'random';
  selectedTrackIds: string[];
  updatedAt?: string;
}

export async function cloudSaveBgmConfig(config: BgmCloudConfig): Promise<void> {
  const clean = sanitizePayload(config);
  await setDoc(doc(db, COLLECTIONS.PROFILE, 'bgm_settings'), clean, { merge: true });
}

export function subscribeToBgmConfig(callback: (config: BgmCloudConfig) => void): () => void {
  const docRef = doc(db, COLLECTIONS.PROFILE, 'bgm_settings');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as BgmCloudConfig);
      }
    },
    (err) => console.warn('BGM cloud sync error:', err)
  );
}

export async function cloudIncrementVisitors(): Promise<void> {
  if (typeof window !== 'undefined' && sessionStorage.getItem('kwon_visited_inc')) return;
  if (typeof window !== 'undefined') sessionStorage.setItem('kwon_visited_inc', '1');
  try {
    const statsRef = doc(db, COLLECTIONS.STATS, 'visitors');
    const snap = await getDoc(statsRef);
    const now = new Date();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayKey = `${now.getFullYear()}-${todayMonth}-${todayDay}`;
    const todayShort = `${todayMonth}/${todayDay}`;
    const dayName = DAY_NAMES[now.getDay()];

    if (snap.exists()) {
      const data = snap.data();
      const lastDate = data.lastDate || todayKey;
      let todayCount = data.today || 0;
      let totalCount = (data.total || 12840) + 1;
      let history: DailyVisitStat[] = Array.isArray(data.history) && data.history.length > 0
        ? [...data.history]
        : generateDefaultVisitHistory(todayCount, totalCount);

      if (lastDate !== todayKey) {
        // New calendar day!
        todayCount = 1;
        history.push({
          date: todayShort,
          fullDate: todayKey,
          dayName,
          daily: todayCount,
          total: totalCount,
          pageViews: todayCount * 4
        });
        if (history.length > 30) history = history.slice(-30);
      } else {
        todayCount += 1;
        const lastIdx = history.length - 1;
        if (lastIdx >= 0) {
          history[lastIdx] = {
            ...history[lastIdx],
            daily: todayCount,
            total: totalCount,
            pageViews: todayCount * 4
          };
        }
      }

      await setDoc(
        statsRef,
        {
          today: todayCount,
          total: totalCount,
          lastDate: todayKey,
          history: sanitizePayload(history)
        },
        { merge: true }
      );
    } else {
      const initialToday = 25;
      const initialTotal = 12846;
      const history = generateDefaultVisitHistory(initialToday, initialTotal);
      await setDoc(
        statsRef,
        {
          today: initialToday,
          total: initialTotal,
          lastDate: todayKey,
          history: sanitizePayload(history)
        },
        { merge: true }
      );
    }
  } catch (e) {
    console.warn('Visitor counter cloud update note:', e);
  }
}

// ==========================================
// ADMIN PASSWORD AUTHENTICATION (dream2note3@gmail.com)
// ==========================================

const DEFAULT_ADMIN_PASSWORD = 'kwon2026!';

export async function verifyAdminPassword(inputPass: string): Promise<boolean> {
  const trimmed = inputPass.trim();
  if (!trimmed) return false;

  try {
    const authRef = doc(db, COLLECTIONS.PROFILE, 'admin_auth');
    const snap = await getDoc(authRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.password) {
        return data.password === trimmed;
      }
    }
  } catch (e) {
    console.warn('Admin password cloud check note:', e);
  }

  // Local storage backup check
  try {
    const local = localStorage.getItem('kwon_admin_pass');
    if (local) return local === trimmed;
  } catch {
    // ignore
  }

  // Master initial default password
  return trimmed === DEFAULT_ADMIN_PASSWORD || trimmed === 'dream2026!';
}

export async function changeAdminPassword(newPassword: string): Promise<void> {
  const trimmed = newPassword.trim();
  if (trimmed.length < 4) {
    throw new Error('비밀번호는 최소 4글자 이상이어야 합니다.');
  }

  try {
    const authRef = doc(db, COLLECTIONS.PROFILE, 'admin_auth');
    await setDoc(
      authRef,
      {
        adminEmail: 'dream2note3@gmail.com',
        password: trimmed,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Admin password cloud save note:', e);
  }

  try {
    localStorage.setItem('kwon_admin_pass', trimmed);
  } catch {
    // ignore
  }
}
