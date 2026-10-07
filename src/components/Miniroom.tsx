import React, { useState, useRef, useEffect } from 'react';
import { bgmEngine, BgmTrack } from '../utils/audioSynth';
import {
  Home,
  RotateCcw,
  Save,
  Trash2,
  Sparkles,
  Palette,
  Move,
  FlipHorizontal,
  ChevronUp,
  ChevronDown,
  Disc3,
  Music,
  Play,
  Pause,
  ExternalLink,
  ArrowLeft,
  Check,
  Plus,
  Minus,
  Camera,
  Download,
  UserCheck,
  X
} from 'lucide-react';

export interface MiniroomItem {
  instanceId: string;
  itemId: string;
  name: string;
  category: 'furniture' | 'gear' | 'decor' | 'character';
  icon: string; // Emoji or visual icon representation
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale?: number;
  flipped?: boolean;
  zIndex: number;
}

export type RoomThemeId = 'atelier' | 'classic_sky' | 'natural_wood' | 'cafe_brick';

interface RoomTheme {
  id: RoomThemeId;
  name: string;
  wallBg: string;
  floorBg: string;
  baseboard: string;
  tagColor: string;
}

const ROOM_THEMES: RoomTheme[] = [
  {
    id: 'atelier',
    name: '스튜디오 아틀리에',
    wallBg: 'linear-gradient(to bottom, #2b394a 0%, #1e2834 100%)',
    floorBg: 'repeating-linear-gradient(45deg, #a37c56, #a37c56 12px, #8d6945 12px, #8d6945 24px)',
    baseboard: '#4a3727',
    tagColor: '#ff6b2b'
  },
  {
    id: 'classic_sky',
    name: '클래식 싸이 스카이',
    wallBg: 'linear-gradient(to bottom, #dbeafe 0%, #bfdbfe 100%)',
    floorBg: 'repeating-linear-gradient(0deg, #f1f5f9, #f1f5f9 16px, #e2e8f0 16px, #e2e8f0 32px)',
    baseboard: '#94a3b8',
    tagColor: '#2563eb'
  },
  {
    id: 'natural_wood',
    name: '내추럴 코지 룸',
    wallBg: 'linear-gradient(to bottom, #fef3c7 0%, #fde68a 100%)',
    floorBg: 'repeating-linear-gradient(90deg, #c7a379, #c7a379 14px, #b58d60 14px, #b58d60 28px)',
    baseboard: '#785633',
    tagColor: '#d97706'
  },
  {
    id: 'cafe_brick',
    name: '빈티지 카페 로프트',
    wallBg: 'linear-gradient(to bottom, #e2e8f0 0%, #cbd5e1 100%)',
    floorBg: 'repeating-linear-gradient(45deg, #713f12, #713f12 18px, #58310c 18px, #58310c 36px)',
    baseboard: '#38220f',
    tagColor: '#7c3aed'
  }
];

// Catalog of available items to drag and drop
interface CatalogItem {
  id: string;
  name: string;
  category: 'furniture' | 'gear' | 'decor' | 'character';
  icon: string;
  defaultScale?: number;
  description: string;
}

const CATALOG_ITEMS: CatalogItem[] = [
  // Furniture
  { id: 'desk', name: '원목 편집 데스크', category: 'furniture', icon: '🖥️', defaultScale: 1.1, description: '영상 편집용 듀얼모니터 책상' },
  { id: 'bed', name: '아늑한 싱글 침대', category: 'furniture', icon: '🛏️', defaultScale: 1.2, description: '따뜻한 체크무늬 이불 침대' },
  { id: 'window', name: '햇살 블라인드 창문', category: 'furniture', icon: '🪟', defaultScale: 1.1, description: '채광 좋은 대형 스튜디오 창' },
  { id: 'director_chair', name: '감독 의자', category: 'furniture', icon: '🪑', defaultScale: 1.0, description: 'KWON DIRECTOR 전용 의자' },
  { id: 'bookshelf', name: 'LP & 도서 수납장', category: 'furniture', icon: '📚', defaultScale: 1.1, description: '음반과 필름 서적이 가득한 책장' },
  { id: 'sofa', name: '빈티지 1인용 소파', category: 'furniture', icon: '🛋️', defaultScale: 1.05, description: '휴식용 가죽 암체어' },

  // Studio Gear
  { id: 'cinema_camera', name: '시네마 카메라 삼각대', category: 'gear', icon: '🎥', defaultScale: 1.1, description: '전문 4K 시네마틱 촬영 장비' },
  { id: 'retro_tv', name: '레트로 브라운관 TV', category: 'gear', icon: '📺', defaultScale: 1.0, description: '90년대 감성 빈티지 모니터' },
  { id: 'turntable', name: 'LP 턴테이블 오디오', category: 'gear', icon: '📻', defaultScale: 0.95, description: 'BGM이 흘러나오는 LP 플레이어' },
  { id: 'studio_light', name: '스튜디오 조명 스탠드', category: 'gear', icon: '💡', defaultScale: 1.1, description: '소프트박스 지속광 조명' },
  { id: 'guitar', name: '어쿠스틱 통기타', category: 'gear', icon: '🎸', defaultScale: 0.95, description: '감성 연주용 어쿠스틱 기타' },

  // Decor
  { id: 'plant', name: '몬스테라 화분', category: 'decor', icon: '🪴', defaultScale: 0.95, description: '공기정화 실내 대형 식물' },
  { id: 'slate', name: '영화 촬영 슬레이트', category: 'decor', icon: '🎬', defaultScale: 0.9, description: 'Take 1, Scene 1 필름 클랩보드' },
  { id: 'poster', name: '벽걸이 필름 포스터', category: 'decor', icon: '🖼️', defaultScale: 1.0, description: '스튜디오 대표작 포스터 액자' },
  { id: 'coffee', name: '모닝 드립커피', category: 'decor', icon: '☕', defaultScale: 0.8, description: '따뜻한 아메리카노 머그잔' },
  { id: 'retro_clock', name: '벽걸이 뻐꾸기 시계', category: 'decor', icon: '🕰️', defaultScale: 0.9, description: '정각마다 울리는 레트로 시계' },

  // Character & Pets
  { id: 'avatar_director', name: '권용우 감독 미니미', category: 'character', icon: '🧍‍♂️', defaultScale: 1.25, description: '카메라를 든 권용우 감독 아바타' },
  { id: 'pet_dog', name: '스튜디오 마스코트 댕댕이', category: 'character', icon: '🐶', defaultScale: 0.95, description: '꼬리를 흔드는 귀여운 반려견' },
  { id: 'cat', name: '창가 낮잠 냥이', category: 'character', icon: '🐱', defaultScale: 0.9, description: '햇볕 아래 웅크린 고양이' }
];

const INITIAL_ROOM_ITEMS: MiniroomItem[] = [
  { instanceId: 'win_1', itemId: 'window', name: '햇살 블라인드 창문', category: 'furniture', icon: '🪟', x: 20, y: 15, scale: 1.2, zIndex: 1 },
  { instanceId: 'poster_1', itemId: 'poster', name: '벽걸이 필름 포스터', category: 'decor', icon: '🖼️', x: 75, y: 18, scale: 1.0, zIndex: 1 },
  { instanceId: 'desk_1', itemId: 'desk', name: '원목 편집 데스크', category: 'furniture', icon: '🖥️', x: 28, y: 55, scale: 1.15, zIndex: 2 },
  { instanceId: 'chair_1', itemId: 'director_chair', name: '감독 의자', category: 'furniture', icon: '🪑', x: 42, y: 60, scale: 1.0, zIndex: 3 },
  { instanceId: 'avatar_1', itemId: 'avatar_director', name: '권용우 감독 미니미', category: 'character', icon: '🧍‍♂️', x: 40, y: 48, scale: 1.3, zIndex: 4 },
  { instanceId: 'cam_1', itemId: 'cinema_camera', name: '시네마 카메라 삼각대', category: 'gear', icon: '🎥', x: 65, y: 50, scale: 1.1, flipped: true, zIndex: 3 },
  { instanceId: 'turntable_1', itemId: 'turntable', name: 'LP 턴테이블 오디오', category: 'gear', icon: '📻', x: 80, y: 58, scale: 1.0, zIndex: 3 },
  { instanceId: 'dog_1', itemId: 'pet_dog', name: '스튜디오 마스코트 댕댕이', category: 'character', icon: '🐶', x: 55, y: 72, scale: 1.0, zIndex: 5 },
  { instanceId: 'plant_1', itemId: 'plant', name: '몬스테라 화분', category: 'decor', icon: '🪴', x: 85, y: 70, scale: 1.0, zIndex: 4 }
];

const STORAGE_KEY = 'kwon_studio_miniroom_items_v1';
const THEME_STORAGE_KEY = 'kwon_studio_miniroom_theme_v1';

interface MiniroomProps {
  onOpenBgmManager?: () => void;
  onReturnToGallery?: () => void;
  onSetAsProfilePhoto?: (dataUrl: string) => void;
}

export const Miniroom: React.FC<MiniroomProps> = ({
  onOpenBgmManager,
  onReturnToGallery,
  onSetAsProfilePhoto
}) => {
  // Room state
  const [items, setItems] = useState<MiniroomItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ROOM_ITEMS;
  });

  const [currentThemeId, setCurrentThemeId] = useState<RoomThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as RoomThemeId | null;
      if (saved && ROOM_THEMES.some((t) => t.id === saved)) return saved;
    } catch {
      // fallback
    }
    return 'atelier';
  });

  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [catalogCategory, setCatalogCategory] = useState<'all' | 'furniture' | 'gear' | 'decor' | 'character'>('all');
  const [saveToast, setSaveToast] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [justSnappedId, setJustSnappedId] = useState<string | null>(null);

  // BGM Engine Subscription
  const [currentTrack, setCurrentTrack] = useState<BgmTrack>(bgmEngine.getCurrentTrack());
  const [isPlaying, setIsPlaying] = useState<boolean>(bgmEngine.getIsPlaying());

  useEffect(() => {
    const unsub = bgmEngine.subscribe(() => {
      setCurrentTrack(bgmEngine.getCurrentTrack());
      setIsPlaying(bgmEngine.getIsPlaying());
    });
    return unsub;
  }, []);

  const currentTheme = ROOM_THEMES.find((t) => t.id === currentThemeId) || ROOM_THEMES[0];

  // Dragging state
  const [draggingInstanceId, setDraggingInstanceId] = useState<string | null>(null);
  const roomCanvasRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });

  // Handle Drag Start
  const handlePointerDown = (e: React.PointerEvent, item: MiniroomItem) => {
    e.stopPropagation();
    setSelectedInstanceId(item.instanceId);
    setDraggingInstanceId(item.instanceId);

    const canvas = roomCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const itemPxX = (item.x / 100) * rect.width;
    const itemPxY = (item.y / 100) * rect.height;

    dragOffsetRef.current = {
      offsetX: e.clientX - (rect.left + itemPxX),
      offsetY: e.clientY - (rect.top + itemPxY)
    };

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  // Handle Drag Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingInstanceId) return;
    const canvas = roomCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left - dragOffsetRef.current.offsetX;
    const rawY = e.clientY - rect.top - dragOffsetRef.current.offsetY;

    const percentX = Math.max(5, Math.min(95, Math.round((rawX / rect.width) * 100)));
    const percentY = Math.max(5, Math.min(95, Math.round((rawY / rect.height) * 100)));

    setItems((prev) =>
      prev.map((it) => (it.instanceId === draggingInstanceId ? { ...it, x: percentX, y: percentY } : it))
    );
  };

  // Handle Drag End with Smooth Snap Animation
  const handlePointerUp = () => {
    if (draggingInstanceId) {
      const draggedItem = items.find((i) => i.instanceId === draggingInstanceId);
      if (draggedItem && snapToGrid) {
        // Snap to nearest 4% grid increment
        const step = 4;
        const snappedX = Math.round(draggedItem.x / step) * step;
        const snappedY = Math.round(draggedItem.y / step) * step;

        setItems((prev) =>
          prev.map((it) =>
            it.instanceId === draggingInstanceId
              ? {
                  ...it,
                  x: Math.max(6, Math.min(94, snappedX)),
                  y: Math.max(10, Math.min(90, snappedY))
                }
              : it
          )
        );

        // Trigger pleasant snap pulse effect
        setJustSnappedId(draggingInstanceId);
        setTimeout(() => setJustSnappedId(null), 500);
      }
      setDraggingInstanceId(null);
    }
  };

  // Adjust Scale for Selected Item
  const handleScaleSelected = (delta: number) => {
    if (!selectedInstanceId) return;
    setItems((prev) =>
      prev.map((it) => {
        if (it.instanceId === selectedInstanceId) {
          const currentScale = it.scale || 1.0;
          const nextScale = Math.max(0.6, Math.min(2.0, Math.round((currentScale + delta) * 10) / 10));
          return { ...it, scale: nextScale };
        }
        return it;
      })
    );
  };

  // Add Item from Catalog
  const handleAddItem = (catItem: CatalogItem) => {
    const newItem: MiniroomItem = {
      instanceId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      itemId: catItem.id,
      name: catItem.name,
      category: catItem.category,
      icon: catItem.icon,
      x: 50 + (Math.random() * 20 - 10),
      y: 50 + (Math.random() * 20 - 10),
      scale: catItem.defaultScale || 1.0,
      flipped: false,
      zIndex: items.length + 1
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedInstanceId(newItem.instanceId);
  };

  // Flip Selected Item
  const handleFlipSelected = () => {
    if (!selectedInstanceId) return;
    setItems((prev) =>
      prev.map((it) => (it.instanceId === selectedInstanceId ? { ...it, flipped: !it.flipped } : it))
    );
  };

  // Delete Selected Item
  const handleDeleteSelected = () => {
    if (!selectedInstanceId) return;
    setItems((prev) => prev.filter((it) => it.instanceId !== selectedInstanceId));
    setSelectedInstanceId(null);
  };

  // Bring to front
  const handleBringToFront = () => {
    if (!selectedInstanceId) return;
    const maxZ = Math.max(...items.map((i) => i.zIndex), 0);
    setItems((prev) =>
      prev.map((it) => (it.instanceId === selectedInstanceId ? { ...it, zIndex: maxZ + 1 } : it))
    );
  };

  // Send to back
  const handleSendToBack = () => {
    if (!selectedInstanceId) return;
    setItems((prev) =>
      prev.map((it) => (it.instanceId === selectedInstanceId ? { ...it, zIndex: 1 } : it))
    );
  };

  // Save Layout
  const handleSaveLayout = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(THEME_STORAGE_KEY, currentThemeId);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch {
      // ignore
    }
  };

  // Reset to initial
  const handleResetLayout = () => {
    if (confirm('미니룸 배치를 기본 상태로 초기화하시겠습니까?')) {
      setItems(INITIAL_ROOM_ITEMS);
      setCurrentThemeId('atelier');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(THEME_STORAGE_KEY);
    }
  };

  // ============================================================
  // 📷 CANVAS API: Capture Decorated Miniroom as Photo
  // ============================================================
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  const captureRoomAsCanvas = (): string => {
    const canvas = document.createElement('canvas');
    // High-resolution canvas dimensions
    const width = 800;
    const height = 500;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // 1. Wall Background Gradient
    if (currentThemeId === 'atelier') {
      const grad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      grad.addColorStop(0, '#2b394a');
      grad.addColorStop(1, '#1e2834');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height * 0.6);

      // Studio light cone
      const rad = ctx.createRadialGradient(width / 2, 0, 20, width / 2, height * 0.5, 320);
      rad.addColorStop(0, 'rgba(254, 243, 199, 0.18)');
      rad.addColorStop(1, 'rgba(254, 243, 199, 0)');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, width, height * 0.6);
    } else if (currentThemeId === 'classic_sky') {
      const grad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      grad.addColorStop(0, '#dbeafe');
      grad.addColorStop(1, '#bfdbfe');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height * 0.6);
    } else if (currentThemeId === 'natural_wood') {
      const grad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      grad.addColorStop(0, '#fef3c7');
      grad.addColorStop(1, '#fde68a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height * 0.6);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      grad.addColorStop(0, '#e2e8f0');
      grad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height * 0.6);
    }

    // Baseboard Divider
    ctx.fillStyle = currentTheme.baseboard;
    ctx.fillRect(0, height * 0.6 - 4, width, 10);

    // 2. 3D Floor
    const floorY = height * 0.6;
    const floorH = height * 0.4;
    if (currentThemeId === 'atelier') {
      ctx.fillStyle = '#a37c56';
      ctx.fillRect(0, floorY, width, floorH);
      ctx.strokeStyle = '#8d6945';
      ctx.lineWidth = 3;
      for (let x = -width; x < width * 2; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, floorY);
        ctx.lineTo(x + floorH * 0.8, height);
        ctx.stroke();
      }
    } else if (currentThemeId === 'classic_sky') {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, floorY, width, floorH);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      for (let y = floorY; y < height; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (currentThemeId === 'natural_wood') {
      ctx.fillStyle = '#c7a379';
      ctx.fillRect(0, floorY, width, floorH);
      ctx.strokeStyle = '#b58d60';
      ctx.lineWidth = 2.5;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, floorY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#713f12';
      ctx.fillRect(0, floorY, width, floorH);
    }

    // 3. Draw props sorted by zIndex and Y position
    const sorted = [...items].sort((a, b) => (a.zIndex === b.zIndex ? a.y - b.y : a.zIndex - b.zIndex));

    for (const item of sorted) {
      const pxX = (item.x / 100) * width;
      const pxY = (item.y / 100) * height;
      const scale = item.scale || 1.0;

      ctx.save();
      ctx.translate(pxX, pxY);
      if (item.flipped) {
        ctx.scale(-1, 1);
      }

      // Soft ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 24 * scale, 26 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Emoji prop icon
      ctx.font = `${Math.round(52 * scale)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, 0, 0);

      ctx.restore();
    }

    // 4. Retro Cyworld Miniroom Title Stamp
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.roundRect(16, 16, 210, 30, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ff9f43';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('📷 권용우의 스튜디오 미니룸', 26, 31);
    ctx.restore();

    return canvas.toDataURL('image/png');
  };

  const handleCaptureRoom = () => {
    const dataUrl = captureRoomAsCanvas();
    if (dataUrl) {
      setCapturedImageUrl(dataUrl);
      setShowCaptureModal(true);
      setProfileSuccessMsg(false);
    }
  };

  const handleApplyToProfile = () => {
    if (!capturedImageUrl) return;
    if (onSetAsProfilePhoto) {
      onSetAsProfilePhoto(capturedImageUrl);
      setProfileSuccessMsg(true);
      setTimeout(() => {
        setProfileSuccessMsg(false);
      }, 3500);
    }
  };

  const handleDownloadPhoto = () => {
    if (!capturedImageUrl) return;
    const a = document.createElement('a');
    a.href = capturedImageUrl;
    a.download = `kwon_studio_miniroom_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredCatalog = CATALOG_ITEMS.filter((item) => {
    if (catalogCategory === 'all') return true;
    return item.category === catalogCategory;
  });

  const selectedItem = items.find((i) => i.instanceId === selectedInstanceId);

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3.5 overflow-y-auto custom-retro-scrollbar pr-1 animate-fadeIn">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e2edf2]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#ff6b2b] text-white flex items-center justify-center shadow-xs">
            <Home className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1f374a] flex items-center gap-2">
              <span>권용우의 스튜디오 미니룸 (Miniroom)</span>
              <span className="text-[10px] bg-[#fff5ee] text-[#ff6b2b] px-1.5 py-0.2 rounded border border-[#fed7aa] font-medium font-mono">
                소품 {items.length}개 배치중
              </span>
            </h3>
            <p className="text-[11px] text-[#6d8494]">
              가구, 시네마 촬영 장비, 미니미를 자유롭게 드래그하여 나만의 스튜디오 공간을 꾸며보세요.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
              snapToGrid
                ? 'bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe] shadow-2xs'
                : 'bg-white text-[#64748b] border-[#cbd5e1]'
            }`}
            title="가구 배치 시 그리드 자동 스냅"
          >
            <span>🧲</span>
            <span>스냅 {snapToGrid ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={handleCaptureRoom}
            className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="미니룸을 캔버스 캡처하여 프로필 사진으로 설정하거나 이미지로 다운로드합니다"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>내 방 사진 저장</span>
          </button>

          <button
            type="button"
            onClick={handleSaveLayout}
            className="px-3 py-1.5 bg-[#ff6b2b] hover:bg-[#ea580c] text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>배치 저장</span>
          </button>

          <button
            type="button"
            onClick={handleResetLayout}
            className="px-2.5 py-1.5 bg-white border border-[#c4d7e2] text-[#557082] hover:bg-[#f0f6fa] rounded text-xs font-medium flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            title="초기 배치로 리셋"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">초기화</span>
          </button>

          {onReturnToGallery && (
            <button
              type="button"
              onClick={onReturnToGallery}
              className="px-2.5 py-1.5 bg-[#f0f6fa] hover:bg-[#e4eff4] border border-[#c4d7e2] text-[#345164] rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>갤러리로</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="p-2.5 bg-[#eaf7ee] border border-[#a6dfb5] text-[#1b6b33] rounded-lg text-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <Check className="w-4 h-4 text-[#1b6b33] stroke-[3]" />
          <span className="font-bold">미니룸 가구 배치가 성공적으로 저장되었습니다!</span>
        </div>
      )}

      {/* 2. Interactive Room Canvas with 🌟 NOW PLAYING BGM OVERLAY 🌟 */}
      <div className="relative rounded-2xl overflow-hidden border-4 border-[#334155] shadow-2xl select-none">
        {/* ========================================================================= */}
        {/* 🌟 USER REQUEST: NOW PLAYING BGM OVERLAY COMPONENT 🌟 */}
        {/* ========================================================================= */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          <div
            onClick={onOpenBgmManager}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/25 shadow-xl text-white cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
            title="클릭 시 BGM 관리 & 반복 설정 메뉴로 이동합니다"
          >
            {/* Animated Turntable / Soundwave Icon */}
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-transform ${
              isPlaying ? 'bg-[#ff6b2b] text-white animate-spin [animation-duration:3s]' : 'bg-gray-700 text-gray-300'
            }`}>
              <Disc3 className="w-3.5 h-3.5" />
            </div>

            {/* Track Info */}
            <div className="flex flex-col text-left max-w-[130px] sm:max-w-[190px]">
              <div className="flex items-center gap-1 leading-none">
                <span className="text-[9px] text-[#ff9f43] font-bold font-mono tracking-tight">
                  NOW BGM
                </span>
                {isPlaying ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                ) : (
                  <span className="text-[9px] text-gray-400">일시정지</span>
                )}
              </div>
              <span className="text-[11px] font-bold truncate group-hover:text-[#ff9f43] transition-colors">
                {currentTrack.title}
              </span>
            </div>

            {/* Jump to BGM Settings Hint */}
            <div className="pl-1 border-l border-white/20 text-gray-300 group-hover:text-white flex items-center">
              <ExternalLink className="w-3.5 h-3.5 text-[#ff9f43]" />
            </div>
          </div>

          {/* Quick Play/Pause Mini Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              bgmEngine.togglePlay();
            }}
            className="w-7 h-7 rounded-full bg-black/75 hover:bg-black/90 border border-white/25 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            title={isPlaying ? 'BGM 일시정지' : 'BGM 재생'}
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Room Theme Tag */}
        <div className="absolute top-3 left-3 z-30 pointer-events-none">
          <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs border border-white/20 text-white text-[10px] font-mono flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.tagColor }} />
            <span>{currentTheme.name}</span>
          </div>
        </div>

        {/* Main 2.5D Room Canvas Area */}
        <div
          ref={roomCanvasRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => setSelectedInstanceId(null)}
          className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] overflow-hidden cursor-default"
          style={{ background: currentTheme.wallBg }}
        >
          {/* Wall Decorative Base Lines */}
          <div className="absolute top-0 left-0 right-0 h-[60%] border-b-4 opacity-70" style={{ borderColor: currentTheme.baseboard }}>
            {/* Studio Atmospheric Lamp Light Cone */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-full bg-radial from-amber-200/10 via-amber-300/5 to-transparent pointer-events-none" />
          </div>

          {/* 3D Isometric Floor */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[40%] shadow-inner"
            style={{
              background: currentTheme.floorBg,
              boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.3)'
            }}
          >
            {/* Wooden Baseboard Strip */}
            <div className="w-full h-3" style={{ backgroundColor: currentTheme.baseboard }} />
          </div>

          {/* Magnetic Alignment Crosshairs when Dragging */}
          {draggingInstanceId && (() => {
            const dragged = items.find((i) => i.instanceId === draggingInstanceId);
            if (!dragged) return null;
            return (
              <>
                <div
                  className="absolute top-0 bottom-0 border-l border-dashed border-[#ff6b2b]/50 pointer-events-none z-20"
                  style={{ left: `${dragged.x}%` }}
                />
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-[#ff6b2b]/50 pointer-events-none z-20"
                  style={{ top: `${dragged.y}%` }}
                />
              </>
            );
          })()}

          {/* Draggable Room Props */}
          {items.map((item) => {
            const isSelected = item.instanceId === selectedInstanceId;
            const isDragging = item.instanceId === draggingInstanceId;
            const isJustSnapped = item.instanceId === justSnappedId;

            return (
              <div
                key={item.instanceId}
                onPointerDown={(e) => handlePointerDown(e, item)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedInstanceId(item.instanceId);
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing select-none ${
                  isDragging ? 'scale-115 opacity-95 z-40' : 'hover:scale-105'
                }`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  zIndex: isSelected ? 30 : item.zIndex,
                  touchAction: 'none',
                  // 🌟 Smooth snap animation with elastic bounce settle when dropped
                  transition: isDragging
                    ? 'none'
                    : 'left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {/* 🌟 Snap Feedback Ripple Disk */}
                {isJustSnapped && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-8 rounded-full border-2 border-[#ff6b2b] bg-[#ff6b2b]/25 animate-ping pointer-events-none" />
                )}

                {/* 🌟 Selection Highlight Floor Aura */}
                {isSelected && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full bg-[#ff6b2b]/35 border-2 border-[#ff6b2b] shadow-[0_0_18px_rgba(255,107,43,0.85)] animate-pulse pointer-events-none" />
                )}

                {/* Visual Prop Container */}
                <div
                  className={`relative p-1.5 rounded-xl transition-all ${
                    isSelected
                      ? 'ring-2 ring-[#ff6b2b] bg-white/35 backdrop-blur-2xs shadow-xl scale-110 -translate-y-1'
                      : 'hover:bg-white/10'
                  }`}
                  style={{
                    transform: `${item.flipped ? 'scaleX(-1)' : 'scaleX(1)'} scale(${item.scale || 1.0})`
                  }}
                >
                  {/* 🌟 4-Corner Reticle Brackets on Selection */}
                  {isSelected && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#ff6b2b]" />
                      <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-[#ff6b2b]" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-[#ff6b2b]" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#ff6b2b]" />
                    </>
                  )}

                  {/* Emoji / Prop Visual with Glow */}
                  <span
                    className={`text-4xl sm:text-5xl select-none block leading-none transition-all ${
                      isSelected
                        ? 'filter drop-shadow-[0_0_12px_rgba(255,107,43,0.8)]'
                        : 'filter drop-shadow-[0_8px_8px_rgba(0,0,0,0.35)]'
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Soft Floor Shadow */}
                  <div className="w-3/4 h-2 bg-black/25 rounded-full blur-2xs mx-auto -mt-1 pointer-events-none" />
                </div>

                {/* Selected Item Label & Handle Indicator */}
                {isSelected && (
                  <div className="absolute -bottom-5 left-1/2 -translate-y-0 -translate-x-1/2 whitespace-nowrap bg-black/90 text-white px-2 py-0.5 rounded text-[10px] font-bold font-mono shadow-md border border-[#ff6b2b]/60 pointer-events-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b2b] animate-ping" />
                    <span>{item.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Floating Controls for Selected Item */}
        {selectedItem && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-[#1e293b]/95 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 animate-fadeIn text-xs">
            <span className="text-[11px] font-bold text-[#ff9f43] font-mono pr-1 border-r border-white/20">
              {selectedItem.icon} {selectedItem.name}
            </span>

            {/* Scale Adjust Buttons */}
            <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded border border-white/15">
              <button
                type="button"
                onClick={() => handleScaleSelected(-0.1)}
                className="p-0.5 hover:bg-white/20 rounded text-gray-200 hover:text-white"
                title="크기 축소 (-10%)"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[10px] font-mono font-bold w-7 text-center">
                {Math.round((selectedItem.scale || 1.0) * 100)}%
              </span>
              <button
                type="button"
                onClick={() => handleScaleSelected(0.1)}
                className="p-0.5 hover:bg-white/20 rounded text-gray-200 hover:text-white"
                title="크기 확대 (+10%)"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleFlipSelected}
              className="p-1 hover:bg-white/20 rounded transition-colors text-gray-200 hover:text-white"
              title="좌우 반전 (Flip)"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleBringToFront}
              className="p-1 hover:bg-white/20 rounded transition-colors text-gray-200 hover:text-white"
              title="맨 앞으로 가져오기 (Bring to front)"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleSendToBack}
              className="p-1 hover:bg-white/20 rounded transition-colors text-gray-200 hover:text-white"
              title="맨 뒤로 보내기 (Send to back)"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDeleteSelected}
              className="p-1 hover:bg-red-600/80 rounded transition-colors text-red-400 hover:text-white"
              title="소품 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Theme Selector & Catalog Box */}
      <div className="bg-[#fafbfc] border border-[#d2e0e8] rounded-xl p-3 sm:p-4 flex flex-col gap-3">
        {/* Wall & Floor Theme Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#e2edf2]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1f374a]">
            <Palette className="w-4 h-4 text-[#ff6b2b]" />
            <span>미니룸 룸 테마 (벽지 &amp; 바닥재)</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {ROOM_THEMES.map((theme) => {
              const isCurrent = theme.id === currentThemeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setCurrentThemeId(theme.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-white border-[#ff6b2b] text-[#ff6b2b] font-bold shadow-xs ring-2 ring-[#ff6b2b]/20'
                      : 'bg-white border-[#cddce4] text-[#4d6677] hover:bg-[#f0f6fa]'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.tagColor }} />
                  <span>{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Categories */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-bold text-[#557082] mr-1">소품 카테고리:</span>
            {(['all', 'furniture', 'gear', 'decor', 'character'] as const).map((cat) => {
              const labels = {
                all: '전체 소품',
                furniture: '가구',
                gear: '스튜디오 장비',
                decor: '인테리어',
                character: '미니미&펫'
              };
              const isSelected = catalogCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCatalogCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#2b7294] text-white font-bold'
                      : 'bg-white border border-[#c4d7e2] text-[#4d6677] hover:bg-[#f0f6fa]'
                  }`}
                >
                  {labels[cat]}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-[#718898]">
            소품을 클릭하여 방에 즉시 추가하세요
          </span>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {filteredCatalog.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAddItem(item)}
              className="p-2.5 bg-white hover:bg-[#fff9f5] border border-[#d2e0e8] hover:border-[#ff6b2b] rounded-lg text-center flex flex-col items-center gap-1.5 transition-all shadow-2xs hover:shadow-sm cursor-pointer group"
            >
              <span className="text-3xl group-hover:scale-115 transition-transform filter drop-shadow-xs">
                {item.icon}
              </span>
              <span className="text-[11px] font-bold text-[#1f374a] group-hover:text-[#ff6b2b] transition-colors truncate max-w-full">
                {item.name}
              </span>
              <span className="text-[9px] text-[#2b7294] bg-[#eef6f9] group-hover:bg-[#ff6b2b] group-hover:text-white px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5 transition-colors">
                <Plus className="w-2.5 h-2.5" />
                배치하기
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Instructions & Cyworld Note */}
      <div className="bg-[#f0f6fa] border border-[#c6dbe6] rounded-lg p-3 text-xs text-[#486375] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#ff6b2b] shrink-0" />
          <span>
            <strong>사용 팁:</strong> 배치된 소품을 손가락이나 마우스로 원하는 위치로 끌어다 놓고, 상단의 <strong>[NOW BGM]</strong> 오버레이를 클릭하면 재생목록 및 반복 설정을 바로 변경할 수 있습니다.
          </span>
        </div>

        {onOpenBgmManager && (
          <button
            type="button"
            onClick={onOpenBgmManager}
            className="px-2.5 py-1 bg-white hover:bg-[#ffece0] text-[#e05619] border border-[#ffcdb5] rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <Music className="w-3.5 h-3.5" />
            <span>BGM 상세 설정 바로가기</span>
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* 📷 CAPTURE MODAL: Preview, Set as Profile & Download */}
      {/* ============================================================ */}
      {showCaptureModal && capturedImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#cbd5e1] shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[#1e293b] to-[#334155] text-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0284c7] text-white flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold flex items-center gap-1.5">
                    <span>내 방 사진 캡처 완료</span>
                    <span className="text-[10px] bg-sky-500/25 text-sky-200 border border-sky-400/40 px-1.5 py-0.2 rounded font-mono">
                      Canvas API
                    </span>
                  </h4>
                  <p className="text-[10px] text-gray-300">
                    현재 꾸며진 미니룸을 고해상도 이미지로 저장하거나 프로필로 설정합니다.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCaptureModal(false)}
                className="p-1 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Image Preview */}
            <div className="p-4 flex flex-col gap-3">
              <div className="relative rounded-xl overflow-hidden border-2 border-[#e2e8f0] shadow-inner bg-slate-900">
                <img
                  src={capturedImageUrl}
                  alt="미니룸 캡처"
                  className="w-full h-auto object-contain max-h-[300px]"
                />
                <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-2xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/20">
                  800 × 500 px
                </span>
              </div>

              {/* Success Notification */}
              {profileSuccessMsg && (
                <div className="p-2.5 bg-[#eaf7ee] border border-[#a6dfb5] text-[#1b6b33] rounded-lg text-xs flex items-center gap-2 animate-fadeIn font-bold shadow-2xs">
                  <Check className="w-4 h-4 text-[#1b6b33] shrink-0 stroke-[3]" />
                  <span>🎉 프로필 사진으로 설정되었습니다! 미니홈피 좌측 프로필 영역에 즉시 반영되었습니다.</span>
                </div>
              )}

              <p className="text-[11px] text-[#64748b] leading-relaxed">
                현재 배치된 모든 가구, 소품, 벽지 및 조명이 캔버스 API를 통해 정밀하게 렌더링되었습니다.
                아래 버튼을 눌러 미니홈피 프로필 사진으로 즉시 등록하거나 기기에 다운로드하세요.
              </p>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowCaptureModal(false)}
                className="px-3 py-1.5 bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#475569] rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                닫기
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownloadPhoto}
                  className="px-3 py-1.5 bg-white border border-[#0284c7] hover:bg-[#f0f9ff] text-[#0284c7] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="PNG 파일로 기기에 다운로드"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>기기에 다운로드</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyToProfile}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-[#ff6b2b] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-102 cursor-pointer"
                  title="미니홈피 프로필 사진으로 즉시 등록"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>프로필 사진으로 즉시 설정</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
