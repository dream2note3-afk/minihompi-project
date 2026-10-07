// IndexedDB Helper for Storing User-Uploaded Background Music Audio Files
// Enhanced for iPad/iOS Safari WebKit compatibility

export interface StoredAudioTrack {
  id: string;
  title: string;
  artist: string;
  fileName: string;
  blob: Blob;
  dataUrl?: string; // Base64 Data URL fallback for iPad/iOS Safari
  createdAt: number;
}

const DB_NAME = 'kwon_studio_bgm_db';
const DB_VERSION = 2;
const STORE_NAME = 'user_audio_tracks';
const CD_AUDIO_STORE = 'my_cd_audio_tracks';

export interface StoredCdAudio {
  id: string; // MyCdAlbum.id
  fileName: string;
  blob: Blob;
  dataUrl?: string;
  updatedAt: number;
}

/**
 * Normalizes audio MIME types especially for iPad/iOS Safari where
 * files selected from the iOS "Files" app often have empty MIME type ("")
 * or generic "application/octet-stream".
 */
export function getNormalizedAudioBlob(source: Blob, fileName: string): Blob {
  let mimeType = source.type;
  if (!mimeType || mimeType === 'application/octet-stream' || mimeType === 'binary/octet-stream') {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'mp3':
        mimeType = 'audio/mpeg';
        break;
      case 'm4a':
        mimeType = 'audio/x-m4a';
        break;
      case 'wav':
        mimeType = 'audio/wav';
        break;
      case 'aac':
        mimeType = 'audio/aac';
        break;
      case 'ogg':
        mimeType = 'audio/ogg';
        break;
      case 'flac':
        mimeType = 'audio/flac';
        break;
      default:
        mimeType = 'audio/mpeg';
    }
  }
  return new Blob([source], { type: mimeType });
}

/**
 * Converts a file or blob into a Base64 data URL.
 * Essential for iPad Safari when Object URLs face cross-origin or sandbox restrictions.
 */
export function readFileAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CD_AUDIO_STORE)) {
        db.createObjectStore(CD_AUDIO_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudioTrackToDB(
  id: string,
  rawBlob: Blob,
  title: string,
  artist: string,
  fileName: string,
  customDataUrl?: string
): Promise<void> {
  const db = await getDB();
  const normalizedBlob = getNormalizedAudioBlob(rawBlob, fileName);
  let dataUrl = customDataUrl;

  if (!dataUrl) {
    try {
      dataUrl = await readFileAsDataUrl(normalizedBlob);
    } catch {
      // ignore
    }
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const item: StoredAudioTrack = {
      id,
      title,
      artist,
      fileName,
      blob: normalizedBlob,
      dataUrl,
      createdAt: Date.now()
    };
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllAudioTracksFromDB(): Promise<StoredAudioTrack[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAudioTrackFromDB(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Saves a CD representative track audio file into IndexedDB
 */
export async function saveCdAudioToDB(
  albumId: string,
  rawBlob: Blob,
  fileName: string,
  customDataUrl?: string
): Promise<void> {
  const db = await getDB();
  const normalizedBlob = getNormalizedAudioBlob(rawBlob, fileName);
  let dataUrl = customDataUrl;

  if (!dataUrl) {
    try {
      dataUrl = await readFileAsDataUrl(normalizedBlob);
    } catch {
      // ignore
    }
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(CD_AUDIO_STORE, 'readwrite');
    const store = tx.objectStore(CD_AUDIO_STORE);
    const item: StoredCdAudio = {
      id: albumId,
      fileName,
      blob: normalizedBlob,
      dataUrl,
      updatedAt: Date.now()
    };
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves a CD representative track audio file from IndexedDB
 */
export async function getCdAudioFromDB(albumId: string): Promise<StoredCdAudio | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CD_AUDIO_STORE, 'readonly');
    const store = tx.objectStore(CD_AUDIO_STORE);
    const req = store.get(albumId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves all stored CD audio tracks
 */
export async function getAllCdAudioFromDB(): Promise<StoredCdAudio[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CD_AUDIO_STORE, 'readonly');
    const store = tx.objectStore(CD_AUDIO_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Searches for CD audio by albumId, and falls back to fileName or title matching.
 * This guarantees previously uploaded audio files continue playing even if album ID was re-generated!
 */
export async function findCdAudio(albumId: string, fileName?: string, title?: string): Promise<StoredCdAudio | null> {
  // 1. Direct albumId match
  try {
    const direct = await getCdAudioFromDB(albumId);
    if (direct && (direct.blob || direct.dataUrl)) {
      return direct;
    }
  } catch (err) {
    console.warn('Direct CD audio fetch note:', err);
  }

  // 2. Fallback: Search all records for matching fileName or title
  try {
    const all = await getAllCdAudioFromDB();
    if (all.length > 0) {
      const cleanFileName = fileName?.trim().toLowerCase();
      const cleanTitle = title?.trim().toLowerCase();

      // Find by fileName
      let matched = all.find((item) => {
        if (!cleanFileName || !item.fileName) return false;
        const itemFileName = item.fileName.trim().toLowerCase();
        return (
          itemFileName === cleanFileName ||
          itemFileName.includes(cleanFileName) ||
          cleanFileName.includes(itemFileName)
        );
      });

      // Find by title in fileName
      if (!matched && cleanTitle) {
        matched = all.find((item) => {
          if (!item.fileName) return false;
          return item.fileName.toLowerCase().includes(cleanTitle);
        });
      }

      // If only 1 record exists in DB and user is trying to play, use it
      if (!matched && all.length === 1) {
        matched = all[0];
      }

      if (matched) {
        // Link this matched record to the current albumId for fast subsequent lookups
        await saveCdAudioToDB(albumId, matched.blob, matched.fileName, matched.dataUrl).catch(() => {});
        return matched;
      }
    }
  } catch (err) {
    console.warn('Fallback CD audio search note:', err);
  }

  return null;
}

/**
 * Deletes a CD representative track audio file from IndexedDB
 */
export async function deleteCdAudioFromDB(albumId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CD_AUDIO_STORE, 'readwrite');
    const store = tx.objectStore(CD_AUDIO_STORE);
    const req = store.delete(albumId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
