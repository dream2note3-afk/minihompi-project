import React, { useState, useRef, useMemo } from 'react';
import { GuestbookEntry, RetroSticker, IlchonFriend } from '../types';
import { MessageSquare, Send, Trash2, Smile, Sparkles, Stamp, Library, Filter, Search, Hash, RotateCcw, X, Check, Highlighter, UserPlus, Heart, Globe } from 'lucide-react';
import { RetroEmojiPicker, RETRO_EMOTIONS } from './RetroEmojiPicker';
import { RetroStickerPicker } from './RetroStickerPicker';
import { RetroStickerBadge } from './RetroStickerBadge';
import { PopularStickerStats } from './PopularStickerStats';
import { StickerLibraryModal } from './StickerLibraryModal';
import { RETRO_STICKERS } from '../data/retroStickers';

interface GuestbookProps {
  entries: GuestbookEntry[];
  onAddEntry: (entry: Omit<GuestbookEntry, 'id' | 'createdAt'>) => void;
  onDeleteEntry: (id: string) => void;
  isAdmin: boolean;
  onAddIlchon?: (friend: Omit<IlchonFriend, 'id'>) => void;
}

const AVATAR_OPTIONS = ['🐿️', '📷', '☕️', '🎬', '✨', '🌿', '🎧', '🎨', '🚀'];
const RELATION_OPTIONS = ['일촌', '스튜디오 동료', '팬클럽', '방문객', '영상제작자'];

interface KeywordFilter {
  id: string;
  label: string;
  emoji: string;
  keywords: string[];
  isStickerOnly?: boolean;
}

const PRESET_KEYWORD_FILTERS: KeywordFilter[] = [
  { id: 'all', label: '전체 발자국', emoji: '👣', keywords: [] },
  { id: 'video', label: '영상 후기', emoji: '🎬', keywords: ['영상', '쇼릴', '유튜브', '시네마틱', '4k', '노을', '한강', '리뷰', '편도'] },
  { id: 'photo', label: '사진/스튜디오', emoji: '📷', keywords: ['사진', '스튜디오', '라이카', '렌즈', '카메라', '포토', '필름', '스냅', '고화질'] },
  { id: 'bgm', label: 'BGM/음악', emoji: '🎵', keywords: ['bgm', '음악', '노래', '추억', '도토리', '플레이리스트', '카세트', '곡'] },
  { id: 'ilchon', label: '일촌/안부', emoji: '🤝', keywords: ['일촌', '안부', '파도타기', '놀러', '방문', '친구', '우정', '왔다감'] },
  { id: 'sticker', label: '스티커 첨부글', emoji: '🏷️', keywords: [], isStickerOnly: true },
  { id: 'cheer', label: '축하/응원', emoji: '✨', keywords: ['축하', '힐링', '대박', '응원', '화이팅', '좋아요', '최고', '번창', '오픈'] }
];

const POPULAR_TAGS = ['#노을', '#한강', '#라이카', '#힐링', '#색감', '#스튜디오', '#BGM', '#일촌', '#미니홈피'];

export type HighlighterColor = 'yellow' | 'pink' | 'mint' | 'cyan';

interface HighlightKeywordsOptions {
  color?: HighlighterColor;
  enabled?: boolean;
}

/**
 * Highlights all target keywords with an authentic retro fluorescent highlighter pen (형광펜) effect.
 * Handles multiple words, preserves original casing, applies bottom marker stroke and glowing fluorescent background.
 */
function highlightKeywords(
  text: string,
  keywords: string[],
  options: HighlightKeywordsOptions = {}
): React.ReactNode {
  const { color = 'yellow', enabled = true } = options;
  if (!text || !enabled || !keywords || keywords.length === 0) return text;

  // Filter out empty words, deduplicate, and sort by length descending so longer phrases match first
  const cleanKeywords = Array.from(
    new Set(keywords.map((k) => k.trim()).filter((k) => k.length > 0))
  ).sort((a, b) => b.length - a.length);

  if (cleanKeywords.length === 0) return text;

  // Escape special regex characters
  const escaped = cleanKeywords
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  const colorStyles: Record<HighlighterColor, { mark: string; stroke: string }> = {
    yellow: {
      mark: 'bg-gradient-to-r from-[#fff775] via-[#ffea55] to-[#fff775] text-[#262626] border-b-2 border-[#eab308] shadow-[0_1px_3px_rgba(234,179,8,0.25)]',
      stroke: 'text-amber-700'
    },
    pink: {
      mark: 'bg-gradient-to-r from-[#fed7e2] via-[#fbb6ce] to-[#fed7e2] text-[#1c1917] border-b-2 border-[#f43f5e] shadow-[0_1px_3px_rgba(244,63,94,0.25)]',
      stroke: 'text-pink-700'
    },
    mint: {
      mark: 'bg-gradient-to-r from-[#bbf7d0] via-[#86efac] to-[#bbf7d0] text-[#14532d] border-b-2 border-[#22c55e] shadow-[0_1px_3px_rgba(34,197,94,0.25)]',
      stroke: 'text-emerald-700'
    },
    cyan: {
      mark: 'bg-gradient-to-r from-[#bae6fd] via-[#7dd3fc] to-[#bae6fd] text-[#0c4a6e] border-b-2 border-[#0284c7] shadow-[0_1px_3px_rgba(2,132,199,0.25)]',
      stroke: 'text-cyan-700'
    }
  };

  const currentTheme = colorStyles[color] || colorStyles.yellow;

  return parts.map((part, i) => {
    const isMatch = cleanKeywords.some((k) => k.toLowerCase() === part.toLowerCase());
    if (isMatch) {
      return (
        <mark
          key={i}
          className={`${currentTheme.mark} font-bold px-1 py-0.5 rounded-[3px] mx-0.5 inline-block box-decoration-clone leading-tight transition-transform hover:scale-105 select-text`}
          title={`형광펜 하이라이트 키워드: ${part}`}
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

export const Guestbook: React.FC<GuestbookProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
  isAdmin,
  onAddIlchon
}) => {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🐿️');
  const [selectedRelation, setSelectedRelation] = useState('일촌');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedSticker, setSelectedSticker] = useState<RetroSticker | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keyword Filtering & Search State
  const [selectedKeywordFilter, setSelectedKeywordFilter] = useState('all');
  const [activeCustomTag, setActiveCustomTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fluorescent Highlighter Pen Controls
  const [highlighterEnabled, setHighlighterEnabled] = useState(true);
  const [highlighterColor, setHighlighterColor] = useState<HighlighterColor>('yellow');

  // Ilchon Friend Request State
  const [showIlchonModal, setShowIlchonModal] = useState(false);
  const [ilchonName, setIlchonName] = useState('');
  const [ilchonRelation, setIlchonRelation] = useState('영원한 일촌');
  const [ilchonAvatar, setIlchonAvatar] = useState('🧡');
  const [ilchonMessage, setIlchonMessage] = useState('');
  const [ilchonHompyTitle, setIlchonHompyTitle] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleQuickIlchonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ilchonName.trim() || !ilchonMessage.trim()) return;

    // 1. Add to Ilchon Friends (Firestore)
    if (onAddIlchon) {
      onAddIlchon({
        name: ilchonName.trim(),
        relation: ilchonRelation.trim() || '일촌',
        avatarIcon: ilchonAvatar,
        statusMessage: ilchonMessage.trim(),
        updatedAt: '방금 전',
        isOnline: true,
        minihompyTitle: ilchonHompyTitle.trim() || `${ilchonName.trim()}님의 미니홈피`
      });
    }

    // 2. Add to Guestbook (Firestore)
    onAddEntry({
      author: ilchonName.trim(),
      relation: ilchonRelation.trim() || '일촌',
      content: `[🧡 일촌 맺기] 권용우님과 '${ilchonRelation.trim()}' 일촌을 맺었습니다!\n\n${ilchonMessage.trim()}`,
      avatarIcon: ilchonAvatar,
      emotion: '행복해',
      sticker: RETRO_STICKERS.find((s) => s.id === 'best_friend') || RETRO_STICKERS[0]
    });

    setShowIlchonModal(false);
    setIlchonName('');
    setIlchonMessage('');
    setIlchonHompyTitle('');
    alert(`🎉 권용우님과 [${ilchonRelation}] 일촌이 맺어지고 방명록에 등록되었습니다! Firebase 실시간 클라우드에 저장되어 모든 접속자에게 표시됩니다.`);
  };

  const handleInsertEmoji = (emojiText: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart ?? content.length;
      const end = textarea.selectionEnd ?? content.length;
      const newContent = content.substring(0, start) + emojiText + content.substring(end);
      setContent(newContent);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = start + emojiText.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    } else {
      setContent((prev) => prev + emojiText);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const finalAuthor = author.trim() || '도토리친구';

    onAddEntry({
      author: finalAuthor,
      avatarIcon: selectedAvatar,
      content: content.trim(),
      relation: selectedRelation,
      emotion: selectedEmotion || undefined,
      sticker: selectedSticker || undefined
    });

    setContent('');
    setSelectedEmotion('');
    setSelectedSticker(null);
    setShowEmojiPicker(false);
    setShowStickerPicker(false);
    setIsSubmitting(false);
  };

  // Dynamically available custom tags that exist in entries
  const availableCustomTags = useMemo(() => {
    return POPULAR_TAGS.filter((tag) => {
      const clean = tag.replace(/^#/, '').toLowerCase();
      return entries.some((e) =>
        (e.content + ' ' + (e.emotion || '') + ' ' + e.relation + ' ' + (e.sticker?.name || '')).toLowerCase().includes(clean)
      );
    });
  }, [entries]);

  // Counts for preset filters
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PRESET_KEYWORD_FILTERS.forEach((filter) => {
      if (filter.id === 'all') {
        counts[filter.id] = entries.length;
      } else if (filter.isStickerOnly) {
        counts[filter.id] = entries.filter((e) => !!e.sticker).length;
      } else {
        counts[filter.id] = entries.filter((entry) => {
          const text = (
            entry.content + ' ' +
            (entry.emotion || '') + ' ' +
            entry.relation + ' ' +
            (entry.sticker?.name || '') + ' ' +
            (entry.sticker?.label || '')
          ).toLowerCase();
          return filter.keywords.some((kw) => text.includes(kw.toLowerCase()));
        }).length;
      }
    });
    return counts;
  }, [entries]);

  // Filtered entries according to keyword category, custom tag, and search query
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Keyword category filter
      if (selectedKeywordFilter !== 'all') {
        const filter = PRESET_KEYWORD_FILTERS.find((f) => f.id === selectedKeywordFilter);
        if (filter) {
          if (filter.isStickerOnly) {
            if (!entry.sticker) return false;
          } else if (filter.keywords.length > 0) {
            const lowerContent = (
              entry.content + ' ' +
              (entry.emotion || '') + ' ' +
              entry.relation + ' ' +
              (entry.sticker?.name || '') + ' ' +
              (entry.sticker?.label || '')
            ).toLowerCase();
            const matches = filter.keywords.some((kw) => lowerContent.includes(kw.toLowerCase()));
            if (!matches) return false;
          }
        }
      }

      // 2. Active custom tag chip
      if (activeCustomTag) {
        const lowerContent = (
          entry.content + ' ' +
          (entry.emotion || '') + ' ' +
          entry.relation + ' ' +
          (entry.sticker?.name || '')
        ).toLowerCase();
        if (!lowerContent.includes(activeCustomTag.toLowerCase())) {
          return false;
        }
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchAuthor = entry.author.toLowerCase().includes(q);
        const matchContent = entry.content.toLowerCase().includes(q);
        const matchRelation = entry.relation.toLowerCase().includes(q);
        const matchEmotion = (entry.emotion || '').toLowerCase().includes(q);
        const matchSticker =
          (entry.sticker?.name || '').toLowerCase().includes(q) ||
          (entry.sticker?.label || '').toLowerCase().includes(q);
        if (!matchAuthor && !matchContent && !matchRelation && !matchEmotion && !matchSticker) {
          return false;
        }
      }

      return true;
    });
  }, [entries, selectedKeywordFilter, activeCustomTag, searchQuery]);

  // All active keywords to highlight with fluorescent pen
  const activeKeywordsToHighlight = useMemo(() => {
    const list: string[] = [];

    // 1. Search Query
    if (searchQuery.trim()) {
      list.push(searchQuery.trim());
    }

    // 2. Active custom hashtag
    if (activeCustomTag && activeCustomTag.trim()) {
      list.push(activeCustomTag.trim());
    }

    // 3. Preset Category Filter
    if (selectedKeywordFilter !== 'all') {
      const filter = PRESET_KEYWORD_FILTERS.find((f) => f.id === selectedKeywordFilter);
      if (filter && filter.keywords.length > 0) {
        list.push(...filter.keywords);
      }
    }

    return Array.from(new Set(list));
  }, [searchQuery, activeCustomTag, selectedKeywordFilter]);

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-y-auto custom-retro-scrollbar pr-1">
      {/* Guestbook Section Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#ff7e39] text-white flex items-center justify-center text-xs shadow-2xs">
            <MessageSquare className="w-3 h-3" />
          </div>
          <h3 className="text-sm font-bold text-[#1f3a52] flex items-center gap-1.5">
            <span>방명록 (Guestbook)</span>
            <span className="text-xs font-normal text-[#5a7486]">
              총 <strong className="text-[#ff6b2b]">{entries.length}</strong>개의 발자국
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="text-xs bg-white hover:bg-[#fff5ee] text-[#2b7294] hover:text-[#e05619] border border-[#bcd3e0] px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="모든 레트로 스티커를 탐색하고 선택할 수 있는 라이브러리를 엽니다"
          >
            <Library className="w-3.5 h-3.5 text-[#ff6b2b]" />
            <span>스티커 라이브러리 (24종)</span>
          </button>
          <span className="hidden sm:inline-block text-[11px] text-[#718898] bg-[#f0f6fa] px-2 py-1 rounded border border-[#d2e2eb]">
            권용우 작가에게 따뜻한 한마디를 남겨주세요!
          </span>
        </div>
      </div>

      {/* Firebase Real-Time Cloud Sync Notice & Ilchon Banner for Visitors */}
      <div className="mb-3.5 bg-gradient-to-r from-[#eff6ff] via-[#f0fdf4] to-[#fff7ed] border border-[#bfdbfe] rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#93c5fd] text-blue-600 flex items-center justify-center text-base shadow-2xs shrink-0">
            🌐
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#1e40af]">일촌 맺기 &amp; 방명록</span>
              <span className="text-[10px] text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                다른 사람도 글 남기기 &amp; 일촌 맺기 가능
              </span>
            </div>
            <p className="text-[11px] text-[#475569] mt-0.5 leading-relaxed">
              방문하신 분 누구나 방명록에 발자국을 남기거나 권용우님과 일촌을 맺으실 수 있습니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowIlchonModal(true)}
          className="px-3 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>권용우님과 일촌 맺기 신청</span>
        </button>
      </div>

      {/* Popular Sticker Statistics Section */}
      <PopularStickerStats
        entries={entries}
        selectedSticker={selectedSticker}
        onSelectSticker={(stk) => {
          setSelectedSticker(stk);
          textareaRef.current?.focus();
        }}
        onOpenLibrary={() => setIsLibraryOpen(true)}
      />

      {/* Write Entry Form */}
      <form onSubmit={handleSubmit} className="bg-[#f7fafc] border border-[#bcd3df] rounded-lg p-3 shadow-2xs mb-4 flex flex-col gap-2.5">
        {/* Top Metadata Row: Avatar + Nickname + Relation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Avatar Selector */}
          <div className="flex items-center gap-1 bg-white border border-[#c5d8e2] px-2 py-1 rounded text-xs shadow-2xs">
            <span className="text-[11px] text-[#556e80]">미니미:</span>
            <div className="flex items-center gap-1">
              {AVATAR_OPTIONS.slice(0, 5).map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`w-6 h-6 flex items-center justify-center rounded text-sm transition-all cursor-pointer ${
                    selectedAvatar === emoji
                      ? 'bg-[#ffe8dc] scale-110 border border-[#ff9f68]'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Nickname Input */}
          <div className="flex items-center gap-1 bg-white border border-[#c5d8e2] px-2 py-1 rounded text-xs shadow-2xs">
            <span className="text-[11px] text-[#556e80]">작성자:</span>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="닉네임 (기본: 도토리친구)"
              maxLength={15}
              className="w-28 md:w-36 outline-hidden text-xs text-[#2a3f50] placeholder:text-[#a0b5c2]"
            />
          </div>

          {/* Relation Selector */}
          <div className="flex items-center gap-1 bg-white border border-[#c5d8e2] px-2 py-1 rounded text-xs shadow-2xs">
            <span className="text-[11px] text-[#556e80]">관계:</span>
            <select
              value={selectedRelation}
              onChange={(e) => setSelectedRelation(e.target.value)}
              className="bg-transparent outline-hidden text-xs text-[#2a3f50] cursor-pointer"
            >
              {RELATION_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Emotion Toolbar & Quick Emotion Chips + Retro Sticker Button */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Toggle Retro Emoji Picker Button */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker((prev) => !prev);
                if (!showEmojiPicker) setShowStickerPicker(false);
              }}
              className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1 transition-all cursor-pointer ${
                showEmojiPicker
                  ? 'bg-[#ffebe1] border-[#ff7e39] text-[#e05619] font-bold shadow-2xs ring-1 ring-[#ff7e39]/30'
                  : 'bg-white border-[#bcd2dc] text-[#3e5b6e] hover:bg-[#f2f7fa] hover:border-[#ff9f68]'
              }`}
              title="싸이월드 감성 레트로 이모티콘 피커 열기"
            >
              <Smile className="w-3.5 h-3.5 text-[#ff7e39]" />
              <span>레트로 이모티콘</span>
              <span className="text-[10px] text-[#8fa4b3]">
                {showEmojiPicker ? '▲ 접기' : '▼ 펼치기'}
              </span>
            </button>

            {/* Toggle Retro Sticker Picker Button */}
            <button
              type="button"
              onClick={() => {
                setShowStickerPicker((prev) => !prev);
                if (!showStickerPicker) setShowEmojiPicker(false);
              }}
              className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1 transition-all cursor-pointer ${
                showStickerPicker
                  ? 'bg-[#ffebe1] border-[#ff7e39] text-[#e05619] font-bold shadow-2xs ring-1 ring-[#ff7e39]/30'
                  : selectedSticker
                  ? 'bg-[#fff5ee] border-[#ff9f68] text-[#d64a0f] font-bold shadow-2xs'
                  : 'bg-white border-[#bcd2dc] text-[#3e5b6e] hover:bg-[#f2f7fa] hover:border-[#ff9f68]'
              }`}
              title="싸이월드 감성 레트로 스티커 첨부"
            >
              <Stamp className="w-3.5 h-3.5 text-[#ff7e39]" />
              <span>레트로 스티커</span>
              {selectedSticker ? (
                <span className="text-[10px] bg-[#ff6b2b] text-white px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                  첨부됨
                </span>
              ) : (
                <span className="text-[10px] text-[#8fa4b3]">
                  {showStickerPicker ? '▲ 접기' : '▼ 펼치기'}
                </span>
              )}
            </button>

            {/* Quick Emotion Pills */}
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-[11px] text-[#718898] ml-1">기분:</span>
              {RETRO_EMOTIONS.slice(0, 3).map((em) => {
                const isSelected = selectedEmotion === em.label;
                return (
                  <button
                    type="button"
                    key={em.id}
                    onClick={() => setSelectedEmotion(isSelected ? '' : em.label)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ff6b2b] text-white font-bold shadow-2xs scale-105'
                        : 'bg-white text-[#526a7a] border border-[#d2e0e8] hover:bg-[#ffebe1]'
                    }`}
                  >
                    <span>{em.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedEmotion && (
            <div className="flex items-center gap-1 text-[11px] text-[#e05619] font-bold bg-[#fff0ea] px-2 py-0.5 rounded border border-[#ffcdb8]">
              <span>선택된 기분: {selectedEmotion}</span>
              <button
                type="button"
                onClick={() => setSelectedEmotion('')}
                className="text-[10px] text-[#9a3a10] hover:text-red-600 ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Retro Emoji Picker Panel */}
        {showEmojiPicker && (
          <div className="relative z-20">
            <RetroEmojiPicker
              onInsertEmoji={handleInsertEmoji}
              selectedEmotion={selectedEmotion}
              onSelectEmotion={setSelectedEmotion}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}

        {/* Collapsible Retro Sticker Picker Panel */}
        {showStickerPicker && (
          <div className="relative z-20">
            <RetroStickerPicker
              selectedSticker={selectedSticker}
              onSelectSticker={(stk) => {
                setSelectedSticker(stk);
              }}
              onClose={() => setShowStickerPicker(false)}
              onOpenLibrary={() => setIsLibraryOpen(true)}
            />
          </div>
        )}

        {/* Selected Sticker Attached Banner Preview */}
        {selectedSticker && (
          <div className="flex items-center justify-between p-2 bg-[#fffcf7] border border-[#ffcdb8] rounded-md shadow-2xs animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-bold text-[#e05619] flex items-center gap-1 shrink-0">
                <Stamp className="w-3.5 h-3.5" /> 첨부된 스티커:
              </span>
              <RetroStickerBadge
                sticker={selectedSticker}
                size="sm"
                onRemove={() => setSelectedSticker(null)}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowStickerPicker(true)}
                className="text-[11px] text-[#2b7294] hover:text-[#184c66] hover:underline font-medium cursor-pointer"
              >
                스티커 변경
              </button>
              <button
                type="button"
                onClick={() => setSelectedSticker(null)}
                className="text-[11px] text-[#869dae] hover:text-red-500 font-medium cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        )}

        {/* Message Input & Submit Button */}
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="영상 후기나 안부 인사를 남겨주세요. 상단의 레트로 이모지 피커를 열어 귀여운 이모티콘을 추가할 수 있습니다! (예: 한강 노을 영상 최고예요! ദ്ദി(˵ •̀ ᴗ - ˵ ) 🐿️)"
            rows={2}
            className="flex-1 p-2 bg-white border border-[#b8ceda] rounded text-xs text-[#223340] placeholder:text-[#9bb1be] focus:border-[#2b7294] outline-hidden resize-none leading-relaxed"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 bg-[#ff6b2b] hover:bg-[#ea5616] disabled:bg-[#d5d5d5] text-white rounded text-xs font-bold shadow-xs flex flex-col items-center justify-center gap-1 shrink-0 transition-colors active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>남기기</span>
          </button>
        </div>
      </form>

      {/* Guestbook Keyword Filtering & Search UI */}
      <div className="bg-[#f8fbfd] border border-[#d2e2ec] rounded-xl p-3 shadow-2xs mb-3 flex flex-col gap-2.5">
        {/* Top Header & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="w-5 h-5 rounded bg-[#2b7294] text-white flex items-center justify-center text-xs shadow-2xs">
              <Filter className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-[#1f374a]">
              키워드별 발자국 모아보기
            </span>
            <span className="text-[11px] text-[#6d8697]">
              (총 <strong className="text-[#ff6b2b]">{entries.length}</strong>개 중 <strong className="text-[#2b7294]">{filteredEntries.length}</strong>개 표시)
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#8fa4b3] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="내용, 작성자, 키워드 검색..."
              className="w-full pl-8 pr-7 py-1 bg-white border border-[#c6d9e4] rounded-md text-xs text-[#1f374a] placeholder:text-[#a0b5c2] focus:border-[#ff6b2b] outline-hidden shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#8fa4b3] hover:text-red-500 font-bold cursor-pointer"
                title="검색어 지우기"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Preset Category Keyword Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {PRESET_KEYWORD_FILTERS.map((f) => {
            const count = filterCounts[f.id] || 0;
            const isSelected = selectedKeywordFilter === f.id;
            return (
              <button
                type="button"
                key={f.id}
                onClick={() => {
                  setSelectedKeywordFilter(f.id);
                  setActiveCustomTag(null);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#ff6b2b] text-white font-bold shadow-xs scale-102'
                    : count > 0
                    ? 'bg-white text-[#4d6677] border border-[#cfe0eb] hover:bg-[#fff5ee] hover:border-[#ffaa78]'
                    : 'bg-white/60 text-[#9bb0be] border border-[#e2edf3] hover:bg-white'
                }`}
              >
                <span>{f.emoji}</span>
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                    isSelected
                      ? 'bg-white/25 text-white'
                      : 'bg-[#edf4f8] text-[#5a778a]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Popular Hashtags / Sub-Keywords Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-[#e6edf2] text-xs">
          <span className="text-[11px] text-[#718898] font-bold flex items-center gap-0.5 shrink-0">
            <Hash className="w-3 h-3 text-[#ff6b2b]" />
            인기 태그:
          </span>
          {availableCustomTags.map((tag) => {
            const clean = tag.replace(/^#/, '');
            const isActive = activeCustomTag === clean;
            return (
              <button
                type="button"
                key={tag}
                onClick={() => {
                  if (isActive) {
                    setActiveCustomTag(null);
                  } else {
                    setActiveCustomTag(clean);
                  }
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2b7294] text-white font-bold shadow-2xs'
                    : 'bg-white text-[#527083] border border-[#d2e1eb] hover:bg-[#f0f6fa] hover:text-[#2b7294]'
                }`}
              >
                {tag}
              </button>
            );
          })}

          {(selectedKeywordFilter !== 'all' || activeCustomTag || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedKeywordFilter('all');
                setActiveCustomTag(null);
                setSearchQuery('');
              }}
              className="ml-auto text-[11px] text-[#8ea4b3] hover:text-[#e05619] font-medium flex items-center gap-1 cursor-pointer shrink-0"
              title="모든 필터를 초기화하고 전체 글 보기"
            >
              <RotateCcw className="w-3 h-3" />
              <span>필터 초기화</span>
            </button>
          )}
        </div>

        {/* Fluorescent Highlighter Control & Indicator Bar */}
        {activeKeywordsToHighlight.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-dashed border-[#d8e6ef] bg-[#fffef5] px-2.5 py-1.5 rounded-lg border border-[#fef08a]">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="text-[11px] font-bold text-[#854d0e] flex items-center gap-1 shrink-0">
                <Highlighter className="w-3.5 h-3.5 text-[#eab308]" />
                <span>형광펜 하이라이트:</span>
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {activeKeywordsToHighlight.slice(0, 7).map((kw) => (
                  <span
                    key={kw}
                    className="text-[10px] bg-gradient-to-r from-[#fff382] via-[#ffe566] to-[#fff382] text-[#292524] font-bold px-1.5 py-0.2 rounded border-b border-[#eab308] shadow-2xs"
                  >
                    "{kw}"
                  </span>
                ))}
                {activeKeywordsToHighlight.length > 7 && (
                  <span className="text-[10px] text-[#854d0e] font-medium">
                    외 {activeKeywordsToHighlight.length - 7}개
                  </span>
                )}
              </div>
            </div>

            {/* Highlighter On/Off & Color Picker */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Color options */}
              <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md border border-[#e5e7eb] shadow-2xs">
                <span className="text-[10px] text-[#718898] mr-0.5">잉크:</span>
                <button
                  type="button"
                  onClick={() => setHighlighterColor('yellow')}
                  className={`w-3.5 h-3.5 rounded-full bg-[#fde047] border transition-transform cursor-pointer ${
                    highlighterColor === 'yellow'
                      ? 'border-[#854d0e] scale-125 ring-1 ring-[#eab308]'
                      : 'border-transparent hover:scale-110 opacity-70'
                  }`}
                  title="네온 옐로우 형광펜"
                />
                <button
                  type="button"
                  onClick={() => setHighlighterColor('pink')}
                  className={`w-3.5 h-3.5 rounded-full bg-[#f472b6] border transition-transform cursor-pointer ${
                    highlighterColor === 'pink'
                      ? 'border-[#831843] scale-125 ring-1 ring-[#f43f5e]'
                      : 'border-transparent hover:scale-110 opacity-70'
                  }`}
                  title="레트로 핑크 형광펜"
                />
                <button
                  type="button"
                  onClick={() => setHighlighterColor('mint')}
                  className={`w-3.5 h-3.5 rounded-full bg-[#4ade80] border transition-transform cursor-pointer ${
                    highlighterColor === 'mint'
                      ? 'border-[#14532d] scale-125 ring-1 ring-[#22c55e]'
                      : 'border-transparent hover:scale-110 opacity-70'
                  }`}
                  title="빈티지 민트 형광펜"
                />
                <button
                  type="button"
                  onClick={() => setHighlighterColor('cyan')}
                  className={`w-3.5 h-3.5 rounded-full bg-[#38bdf8] border transition-transform cursor-pointer ${
                    highlighterColor === 'cyan'
                      ? 'border-[#0c4a6e] scale-125 ring-1 ring-[#0284c7]'
                      : 'border-transparent hover:scale-110 opacity-70'
                  }`}
                  title="소다 시안 형광펜"
                />
              </div>

              {/* Toggle ON/OFF */}
              <button
                type="button"
                onClick={() => setHighlighterEnabled((prev) => !prev)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 ${
                  highlighterEnabled
                    ? 'bg-[#fef08a] text-[#854d0e] border border-[#eab308]/60 shadow-2xs hover:bg-[#fde047]'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
                title="형광펜 하이라이트 켜기/끄기"
              >
                <Highlighter className="w-3 h-3" />
                <span>{highlighterEnabled ? '형광펜 ON' : '형광펜 OFF'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guestbook Entries List */}
      <div className="flex flex-col gap-2 pb-4">
        {entries.length === 0 ? (
          <div className="p-6 text-center bg-[#f8fafb] border border-dashed border-[#ccdbe2] rounded-lg text-xs text-[#708796]">
            아직 작성된 방명록이 없습니다. 첫 번째 발자국을 남겨보세요! ✨
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center bg-[#f8fafb] border border-dashed border-[#ccdbe2] rounded-lg text-xs text-[#708796] flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f0f5f8] flex items-center justify-center text-sm shadow-2xs">
              🔍
            </div>
            <span className="font-bold text-[#2a4356]">
              선택한 키워드나 검색어에 해당하는 방명록이 없습니다.
            </span>
            <p className="text-[11px] text-[#869dae]">
              다른 키워드 버튼을 누르거나 필터를 초기화해 보세요!
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedKeywordFilter('all');
                setActiveCustomTag(null);
                setSearchQuery('');
              }}
              className="mt-1 px-3 py-1 bg-white hover:bg-[#ffebe1] text-[#ff6b2b] border border-[#ffcdb5] rounded-md font-bold text-xs shadow-2xs cursor-pointer transition-colors"
            >
              전체 방명록 보기
            </button>
          </div>
        ) : (
          filteredEntries.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#d6e3ea] rounded-md p-2.5 shadow-2xs hover:border-[#b7cfdc] transition-colors flex items-start gap-2.5"
            >
              {/* Avatar Icon */}
              <div className="w-8 h-8 rounded-full bg-[#f2f7f9] border border-[#cde0e9] flex items-center justify-center text-lg shrink-0 select-none shadow-2xs">
                {item.avatarIcon}
              </div>

              {/* Content body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-[#203a4e] break-keep">
                      {highlightKeywords(item.author, activeKeywordsToHighlight, {
                        color: highlighterColor,
                        enabled: highlighterEnabled
                      })}
                    </span>
                    <span className="text-[10px] sm:text-[11px] bg-[#eef5f8] text-[#346281] px-1.5 py-0.2 rounded border border-[#d0e1ea] shrink-0 font-medium">
                      {item.relation}
                    </span>

                    {/* Emotion Badge if set */}
                    {item.emotion && (
                      <span className="text-[10px] sm:text-[11px] bg-[#fff5ee] text-[#d95213] border border-[#ffcdb5] px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5 shrink-0 shadow-2xs">
                        <span>{item.emotion}</span>
                      </span>
                    )}

                    <span className="text-[10px] text-[#869dae] font-mono shrink-0">
                      {item.createdAt}
                    </span>
                  </div>

                  {/* Admin delete permission */}
                  {isAdmin && (
                    <button
                      onClick={() => onDeleteEntry(item.id)}
                      className="text-[#99abb8] hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="관리자 권한으로 삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#334756] leading-relaxed break-keep break-words whitespace-pre-wrap">
                  {highlightKeywords(item.content, activeKeywordsToHighlight, {
                    color: highlighterColor,
                    enabled: highlighterEnabled
                  })}
                </p>

                {/* Attached Retro Sticker Stamp */}
                {item.sticker && (
                  <div className="mt-2 pt-2 border-t border-dashed border-[#e6edf2] flex items-center justify-between flex-wrap gap-1.5">
                    <span className="text-[10px] text-[#8ea4b3] font-mono flex items-center gap-1">
                      <span>🏷️ 첨부 스티커</span>
                    </span>
                    <RetroStickerBadge sticker={item.sticker} size="sm" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Sticker Library Modal */}
      <StickerLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        entries={entries}
        selectedSticker={selectedSticker}
        onSelectSticker={(stk) => {
          setSelectedSticker(stk);
          textareaRef.current?.focus();
        }}
      />

      {/* Ilchon Request Modal for Visitors */}
      {showIlchonModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-3 animate-fadeIn"
          onClick={() => setShowIlchonModal(false)}
        >
          <div
            className="bg-white border-2 border-[#ff6b2b] rounded-2xl max-w-sm w-full p-4 sm:p-5 shadow-2xl flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#fed7aa]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤝</span>
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b]">권용우님과 일촌 맺기</h3>
                  <p className="text-[10px] text-[#64748b]">미니홈피에서 소중한 인연을 맺어보세요.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIlchonModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickIlchonSubmit} className="flex flex-col gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  방문자 이름 / 닉네임 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ilchonName}
                  onChange={(e) => setIlchonName(e.target.value)}
                  placeholder="예: 김미숙, 박서준, 영희"
                  className="w-full p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg outline-hidden focus:border-[#ff6b2b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  권용우님과의 일촌명 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1 mb-1">
                  {['영원한 일촌', '시네마틱 동지', '카메라 메이트', '도토리 친구', '음악 친구'].map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setIlchonRelation(rel)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer ${
                        ilchonRelation === rel
                          ? 'bg-[#ff6b2b] text-white border-[#ff6b2b]'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={ilchonRelation}
                  onChange={(e) => setIlchonRelation(e.target.value)}
                  placeholder="직접 입력: 예) 대학 동기, 사진 동호회"
                  className="w-full p-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded text-xs outline-hidden focus:border-[#ff6b2b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  미니미 아바타 선택
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['🧡', '🐿️', '📷', '🎬', '☕️', '✨', '🎧', '🌿', '🐱'].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setIlchonAvatar(icon)}
                      className={`w-7 h-7 rounded-full text-sm border flex items-center justify-center transition-all cursor-pointer ${
                        ilchonAvatar === icon
                          ? 'border-[#ff6b2b] bg-[#fff7ed] scale-110 shadow-xs'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  인사말 / 하고 싶은 말 <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={ilchonMessage}
                  onChange={(e) => setIlchonMessage(e.target.value)}
                  placeholder="예: 미니홈피 너무 예뻐요! 일촌 맺고 자주 소통해요~ 🧡"
                  className="w-full p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg outline-hidden focus:border-[#ff6b2b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  내 미니홈피 제목 (선택)
                </label>
                <input
                  type="text"
                  value={ilchonHompyTitle}
                  onChange={(e) => setIlchonHompyTitle(e.target.value)}
                  placeholder="예: 미숙이의 소소한 일상"
                  className="w-full p-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowIlchonModal(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#ff6b2b] hover:bg-[#ea580c] text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>일촌 맺기 &amp; 방명록 등록</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
