import {
  ProfileConfig,
  MediaItem,
  TravelSpot,
  CdReviewItem,
  MyCdAlbum,
  GuestbookEntry,
  IlchonFriend,
  IlchonNote
} from '../types';

export interface SyncHandlers {
  onProfile?: (profile: ProfileConfig) => void;
  onMedia?: (action: string, item: any, id?: string) => void;
  onTravel?: (action: string, spot: any, id?: string) => void;
  onCdReviews?: (action: string, item: any, id?: string) => void;
  onMyCd?: (action: string, album: any, id?: string) => void;
  onGuestbook?: (action: string, entry: any, id?: string) => void;
  onIlchon?: (action: string, friend: any, id?: string) => void;
  onNotes?: (notes: IlchonNote[]) => void;
  onStats?: (stats: { today: number; total: number }) => void;
}

let eventSource: EventSource | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

export function connectRealtimeSync(handlers: SyncHandlers): () => void {
  // Disconnect any existing connection
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  function initSSE() {
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        // Connected to server
      };

      eventSource.onmessage = (event) => {
        if (!event.data) return;
        try {
          const payload = JSON.parse(event.data);
          const { type, action, data, id } = payload;

          if (type === 'handshake') {
            return;
          }

          if (type === 'profile' && handlers.onProfile) {
            handlers.onProfile(data);
          } else if (type === 'media' && handlers.onMedia) {
            handlers.onMedia(action, data, id);
          } else if (type === 'travel' && handlers.onTravel) {
            handlers.onTravel(action, data, id);
          } else if (type === 'cd_reviews' && handlers.onCdReviews) {
            handlers.onCdReviews(action, data, id);
          } else if (type === 'my_cd_collection' && handlers.onMyCd) {
            handlers.onMyCd(action, data, id);
          } else if (type === 'guestbook' && handlers.onGuestbook) {
            handlers.onGuestbook(action, data, id);
          } else if (type === 'ilchon' && handlers.onIlchon) {
            handlers.onIlchon(action, data, id);
          } else if (type === 'notes' && handlers.onNotes) {
            handlers.onNotes(data);
          } else if (type === 'stats' && handlers.onStats) {
            handlers.onStats(data);
          }
        } catch {
          // ignore non-json SSE message
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Auto-reconnect after 3 seconds
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            initSSE();
          }, 3000);
        }
      };
    } catch {
      // EventSource not supported or failed
    }
  }

  initSSE();

  return () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };
}

/**
 * Sends a real-time update to the server which broadcasts it immediately to all other connected devices.
 */
export async function broadcastServerUpdate(
  type: 'profile' | 'media' | 'travel' | 'cd_reviews' | 'my_cd_collection' | 'guestbook' | 'ilchon' | 'stats' | 'bgm',
  action: 'set' | 'add' | 'update' | 'delete',
  data: any,
  id?: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, action, data, id })
    });
    return res.ok;
  } catch (err) {
    console.warn('Realtime update broadcast note:', err);
    return false;
  }
}

/**
 * Fetches the entire current dataset from the server on startup or manual refresh.
 */
export async function fetchFullSyncFromServer(): Promise<{
  profile: ProfileConfig;
  media: MediaItem[];
  travel: TravelSpot[];
  cdReviews: CdReviewItem[];
  myCdAlbums: MyCdAlbum[];
  deletedCdIds?: string[];
  guestbook: GuestbookEntry[];
  ilchon: IlchonFriend[];
  notes: IlchonNote[];
  stats: { today: number; total: number };
} | null> {
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

/**
 * Increments the visit count on the server and broadcasts to all devices.
 */
export async function incrementServerVisit(): Promise<{ today: number; total: number } | null> {
  try {
    const res = await fetch('/api/stats/visit', { method: 'POST' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.stats;
  } catch {
    return null;
  }
}
