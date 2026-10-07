import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import {
  INITIAL_PROFILE_CONFIG,
  INITIAL_MEDIA_ITEMS,
  INITIAL_TRAVEL_SPOTS,
  INITIAL_CD_REVIEWS,
  INITIAL_MY_CD_ALBUMS,
  INITIAL_GUESTBOOK_ENTRIES,
  INITIAL_ILCHON_FRIENDS,
  INITIAL_ILCHON_NOTES
} from './src/data/initialData';

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

// Data storage file path
const DATA_DIR = path.resolve('data');
const DB_FILE = path.join(DATA_DIR, 'minihompy_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory Database Store
interface ServerDB {
  profile: any;
  media: any[];
  travel: any[];
  cdReviews: any[];
  myCdAlbums: any[];
  deletedCdIds: string[];
  guestbook: any[];
  ilchon: any[];
  notes: any[];
  stats: { today: number; total: number; lastDate: string; history?: any[] };
  bgmConfig?: any;
}

function loadInitialDB(): ServerDB {
  const initialDeleted = ['mycd-dannyboy', 'mycd-1', 'mycd-2', 'mycd-3', 'mycd-4', 'mycd-5', 'mycd-6'];
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        console.log('📦 Loaded existing database from disk');
        const mergedDeleted = Array.from(new Set([...initialDeleted, ...(parsed.deletedCdIds || [])]));
        const deletedSet = new Set(mergedDeleted);
        const albumMap = new Map<string, any>();
        INITIAL_MY_CD_ALBUMS.forEach((a: any) => {
          if (!deletedSet.has(a.id) && a.id !== 'mycd-1791369288259') {
            albumMap.set(a.id, a);
          }
        });
        (parsed.myCdAlbums || []).forEach((a: any) => {
          if (!deletedSet.has(a.id) && a.id !== 'mycd-1791369288259') {
            albumMap.set(a.id, a);
          }
        });
        const existingAlbums = Array.from(albumMap.values());

        return {
          profile: parsed.profile || INITIAL_PROFILE_CONFIG,
          media: parsed.media || INITIAL_MEDIA_ITEMS,
          travel: parsed.travel || INITIAL_TRAVEL_SPOTS,
          cdReviews: parsed.cdReviews || INITIAL_CD_REVIEWS,
          myCdAlbums: existingAlbums,
          deletedCdIds: mergedDeleted,
          guestbook: parsed.guestbook || INITIAL_GUESTBOOK_ENTRIES,
          ilchon: parsed.ilchon || INITIAL_ILCHON_FRIENDS,
          notes: parsed.notes || INITIAL_ILCHON_NOTES,
          stats: parsed.stats || { today: 28, total: 12845, lastDate: new Date().toISOString().slice(0, 10) },
          bgmConfig: parsed.bgmConfig || null
        };
      }
    }
  } catch (err) {
    console.warn('Could not read existing db file, using defaults:', err);
  }

  const deletedSet = new Set(initialDeleted);
  return {
    profile: INITIAL_PROFILE_CONFIG,
    media: INITIAL_MEDIA_ITEMS,
    travel: INITIAL_TRAVEL_SPOTS,
    cdReviews: INITIAL_CD_REVIEWS,
    myCdAlbums: INITIAL_MY_CD_ALBUMS.filter((a) => !deletedSet.has(a.id)),
    deletedCdIds: initialDeleted,
    guestbook: INITIAL_GUESTBOOK_ENTRIES,
    ilchon: INITIAL_ILCHON_FRIENDS,
    notes: INITIAL_ILCHON_NOTES,
    stats: { today: 28, total: 12845, lastDate: new Date().toISOString().slice(0, 10) },
    bgmConfig: null
  };
}

const db: ServerDB = loadInitialDB();

// Debounced save to disk to ensure high performance
let saveTimeout: NodeJS.Timeout | null = null;
function persistDB() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save db to disk:', err);
    }
  }, 200);
}

// Save initial file once
persistDB();

// Active Server-Sent Events (SSE) connections for zero-latency multi-device sync
type SseClient = {
  id: number;
  res: express.Response;
};
let sseClients: SseClient[] = [];
let nextClientId = 1;

function broadcastEvent(type: string, action: string, data: any, id?: string) {
  let safeData = data;
  try {
    const raw = JSON.stringify(data);
    // Never strip profile; only strip huge multi-megabyte payloads for bulk collection arrays
    if (type !== 'profile' && raw.length > 262144) {
      safeData = { id, action, syncNeeded: true };
    }
  } catch {}

  const payload = `data: ${JSON.stringify({ type, action, data: safeData, id, timestamp: Date.now() })}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch {
      // client disconnected
    }
  });
}

async function startServer() {
  const app = express();

  // Support up to 50MB for high-resolution images & album cover uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers for seamless cross-device communication
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // 1. SSE Real-Time Sync Stream
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const clientId = nextClientId++;
    sseClients.push({ id: clientId, res });

    // Send initial handshake
    res.write(`data: ${JSON.stringify({ type: 'handshake', clientId, timestamp: Date.now() })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter((c) => c.id !== clientId);
    });
  });

  // Periodic Keepalive ping for SSE
  setInterval(() => {
    sseClients.forEach((client) => {
      try {
        client.res.write(': keepalive\n\n');
      } catch {}
    });
  }, 20000);

  // 2. Full Sync Endpoint
  app.get('/api/sync', (req, res) => {
    res.json({
      success: true,
      timestamp: Date.now(),
      data: db
    });
  });

  // 3. Granular Real-Time Update Endpoint
  app.post('/api/update', (req, res) => {
    const { type, action = 'set', data, id } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Missing type parameter' });
    }

    switch (type) {
      case 'profile':
        db.profile = { ...db.profile, ...data };
        break;

      case 'media':
        if (action === 'add') {
          db.media = [data, ...db.media.filter((m) => m.id !== data.id)];
        } else if (action === 'update' && id) {
          db.media = db.media.map((m) => (m.id === id ? { ...m, ...data } : m));
        } else if (action === 'delete' && id) {
          db.media = db.media.filter((m) => m.id !== id);
        } else if (action === 'set' && Array.isArray(data)) {
          db.media = data;
        }
        break;

      case 'travel':
        if (action === 'add') {
          db.travel = [data, ...db.travel.filter((t) => t.id !== data.id)];
        } else if (action === 'update' && id) {
          db.travel = db.travel.map((t) => (t.id === id ? { ...t, ...data } : t));
        } else if (action === 'delete' && id) {
          db.travel = db.travel.filter((t) => t.id !== id);
        } else if (action === 'set' && Array.isArray(data)) {
          db.travel = data;
        }
        break;

      case 'cd_reviews':
        if (action === 'add') {
          db.cdReviews = [data, ...db.cdReviews.filter((c) => c.id !== data.id)];
        } else if (action === 'update' && id) {
          db.cdReviews = db.cdReviews.map((c) => (c.id === id ? { ...c, ...data } : c));
        } else if (action === 'delete' && id) {
          db.cdReviews = db.cdReviews.filter((c) => c.id !== id);
        } else if (action === 'set' && Array.isArray(data)) {
          db.cdReviews = data;
        }
        break;

      case 'my_cd_collection':
        if (action === 'add') {
          const deletedSet = new Set(db.deletedCdIds || []);
          if (!deletedSet.has(data.id)) {
            db.myCdAlbums = [data, ...db.myCdAlbums.filter((a) => a.id !== data.id)];
          }
        } else if (action === 'update' && id) {
          const deletedSet = new Set(db.deletedCdIds || []);
          if (!deletedSet.has(id)) {
            db.myCdAlbums = db.myCdAlbums.map((a) => (a.id === id ? { ...a, ...data } : a));
          }
        } else if (action === 'delete' && id) {
          db.deletedCdIds = Array.from(new Set([...(db.deletedCdIds || []), id]));
          db.myCdAlbums = db.myCdAlbums.filter((a) => a.id !== id);
        } else if (action === 'set' && Array.isArray(data)) {
          const deletedSet = new Set(db.deletedCdIds || []);
          db.myCdAlbums = data.filter((a) => !deletedSet.has(a.id));
        }
        break;

      case 'guestbook':
        if (action === 'add') {
          db.guestbook = [data, ...db.guestbook.filter((g) => g.id !== data.id)];
        } else if (action === 'delete' && id) {
          db.guestbook = db.guestbook.filter((g) => g.id !== id);
        } else if (action === 'set' && Array.isArray(data)) {
          db.guestbook = data;
        }
        break;

      case 'ilchon':
        if (action === 'add') {
          db.ilchon = [data, ...db.ilchon.filter((f) => f.id !== data.id)];
        } else if (action === 'update' && id) {
          db.ilchon = db.ilchon.map((f) => (f.id === id ? { ...f, ...data } : f));
        } else if (action === 'set' && Array.isArray(data)) {
          db.ilchon = data;
        }
        break;

      case 'stats':
        db.stats = { ...db.stats, ...data };
        break;

      case 'bgm':
        db.bgmConfig = data;
        break;

      default:
        console.warn('Unknown update type:', type);
        break;
    }

    persistDB();
    broadcastEvent(type, action, data, id);

    res.json({ success: true, timestamp: Date.now() });
  });

  // 4. Dedicated Albums Endpoints for High-Res, Instant Multi-Device Sync
  app.get('/api/albums', (req, res) => {
    const deletedSet = new Set(db.deletedCdIds || []);
    const cleanAlbums = db.myCdAlbums.filter((a) => !deletedSet.has(a.id));
    res.json({
      success: true,
      count: cleanAlbums.length,
      albums: cleanAlbums,
      deletedCdIds: db.deletedCdIds || []
    });
  });

  app.post('/api/albums/sync', (req, res) => {
    const albums = req.body.albums || req.body.items;
    if (!Array.isArray(albums)) {
      return res.status(400).json({ error: 'albums array required' });
    }

    const deletedSet = new Set(db.deletedCdIds || []);
    const validIncoming = albums.filter((a) => !deletedSet.has(a.id));

    const map = new Map<string, any>();
    // First keep existing non-deleted albums
    db.myCdAlbums.forEach((a) => {
      if (!deletedSet.has(a.id)) map.set(a.id, a);
    });
    // Overlay incoming valid non-deleted albums from client
    validIncoming.forEach((a) => {
      if (!deletedSet.has(a.id)) map.set(a.id, a);
    });
    db.myCdAlbums = Array.from(map.values());

    persistDB();
    broadcastEvent('my_cd_collection', 'sync', { count: db.myCdAlbums.length, syncNeeded: true });

    res.json({ success: true, count: db.myCdAlbums.length });
  });

  // 5. Batch Sync / Upload Endpoint
  app.post('/api/sync/batch', (req, res) => {
    const items = req.body.items || req.body.albums;
    const type = req.body.type;
    if (!type || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    if (type === 'my_cd_collection') {
      const deletedSet = new Set(db.deletedCdIds || []);
      const validItems = items.filter((a) => !deletedSet.has(a.id));

      const map = new Map<string, any>();
      db.myCdAlbums.forEach((a) => {
        if (!deletedSet.has(a.id)) map.set(a.id, a);
      });
      validItems.forEach((a) => {
        if (!deletedSet.has(a.id)) map.set(a.id, a);
      });
      db.myCdAlbums = Array.from(map.values());
      persistDB();
      broadcastEvent('my_cd_collection', 'sync', { count: db.myCdAlbums.length, syncNeeded: true });
    }

    res.json({ success: true, count: items.length });
  });

  // 5. Visitor Counter Increment Endpoint
  app.post('/api/stats/visit', (req, res) => {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    if (db.stats.lastDate !== todayKey) {
      db.stats.today = 1;
      db.stats.lastDate = todayKey;
    } else {
      db.stats.today += 1;
    }
    db.stats.total += 1;
    persistDB();
    broadcastEvent('stats', 'set', db.stats);
    res.json({ success: true, stats: db.stats });
  });

  // Frontend Serving: Vite dev server in development, static files in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Minihompy Real-time Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
