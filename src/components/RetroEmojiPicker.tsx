import React, { useState } from 'react';
import { Smile, Sparkles, Heart, Coffee, X } from 'lucide-react';

interface RetroEmojiPickerProps {
  onInsertEmoji: (emojiText: string) => void;
  selectedEmotion?: string;
  onSelectEmotion?: (emotion: string) => void;
  onClose?: () => void;
}

type TabType = 'cyworld' | 'faces' | 'kaomoji';

interface EmojiItem {
  val: string;
  label: string;
}

const CYWORLD_EMOJIS: EmojiItem[] = [
  { val: '🐿️', label: '도토리' },
  { val: '🍀', label: '네잎클로버' },
  { val: '🧡', label: '일촌하트' },
  { val: '📸', label: '카메라' },
  { val: '🎵', label: '미니홈피BGM' },
  { val: '☕', label: '커피한잔' },
  { val: '✨', label: '반짝반짝' },
  { val: '🌊', label: '파도타기' },
  { val: '🎈', label: '풍선' },
  { val: '💌', label: '일촌쪽지' },
  { val: '🎁', label: '선물상자' },
  { val: '🌈', label: '무지개' },
  { val: '🏡', label: '미니홈피' },
  { val: '🍰', label: '조각케이크' },
  { val: '🌻', label: '해바라기' },
  { val: '⭐', label: '별빛' },
  { val: '🍬', label: '사탕' },
  { val: '🧸', label: '곰인형' }
];

const FACE_EMOJIS: EmojiItem[] = [
  { val: '😊', label: '미소' },
  { val: '🥰', label: '행복' },
  { val: '😎', label: '멋짐' },
  { val: '😭', label: '감동눈물' },
  { val: '🥳', label: '축하' },
  { val: '😴', label: '나른함' },
  { val: '🤗', label: '토닥토닥' },
  { val: '🤩', label: '반함' },
  { val: '😋', label: '맛있어' },
  { val: '🥺', label: '애틋함' },
  { val: '👍', label: '최고' },
  { val: '👏', label: '짝짝짝' },
  { val: '🙏', label: '감사' },
  { val: '💖', label: '반짝하트' },
  { val: '🔥', label: '열정' },
  { val: '😍', label: '하트눈' },
  { val: '😜', label: '장난' },
  { val: '🤔', label: '궁금' }
];

const KAOMOJI_EMOTICONS: EmojiItem[] = [
  { val: '(^▽^)', label: '방긋' },
  { val: '(ㅠ_ㅠ)', label: '훌쩍' },
  { val: '(*^^*)', label: '발그레' },
  { val: '(>_<)', label: '아자!' },
  { val: '(づ￣ ³￣)づ', label: '쪽~' },
  { val: 'ദ്ദി(˵ •̀ ᴗ - ˵ )', label: '따봉' },
  { val: '(★_★)', label: '초롱초롱' },
  { val: '(・_・;)', label: '뻘쭘' },
  { val: '(ง •̀_•́)ง', label: '파이팅' },
  { val: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', label: '반짝축복' }
];

export const RETRO_EMOTIONS = [
  { id: 'happy', label: '🍀 행복해요', icon: '🍀' },
  { id: 'healing', label: '🎵 힐링중', icon: '🎵' },
  { id: 'dotori', label: '🐿️ 도토리선물', icon: '🐿️' },
  { id: 'surfing', label: '🌊 파도타기', icon: '🌊' },
  { id: 'warm', label: '☕ 따뜻해', icon: '☕' },
  { id: 'congrats', label: '🥳 축하해요', icon: '🥳' },
  { id: 'love', label: '🧡 일촌사랑', icon: '🧡' }
];

export const RetroEmojiPicker: React.FC<RetroEmojiPickerProps> = ({
  onInsertEmoji,
  selectedEmotion,
  onSelectEmotion,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('cyworld');
  const [lastClicked, setLastClicked] = useState<string | null>(null);

  const handleEmojiClick = (val: string) => {
    setLastClicked(val);
    onInsertEmoji(val);
    setTimeout(() => setLastClicked(null), 350);
  };

  return (
    <div className="bg-white border-2 border-[#ff7e39] rounded-xl shadow-lg p-2.5 sm:p-3 w-full max-w-sm flex flex-col gap-2.5 animate-fadeIn text-[#203a4e]">
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#ffd2bd]">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#ff7e39] text-white flex items-center justify-center text-xs shadow-2xs">
            <Smile className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-[#1f374a] tracking-tight">
            싸이월드 감성 레트로 이모지 피커
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded-full text-[#718898] hover:bg-[#ffece2] hover:text-[#e05619] transition-colors cursor-pointer text-xs font-bold"
            title="닫기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Emotion Badge Selector (오늘 나의 기분) */}
      {onSelectEmotion && (
        <div className="flex flex-col gap-1 bg-[#fff8f5] p-2 rounded-lg border border-[#ffddcf]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#b44816]">
            <span>오늘 내 기분 설정:</span>
            {selectedEmotion && (
              <button
                type="button"
                onClick={() => onSelectEmotion('')}
                className="text-[10px] text-[#718898] hover:text-red-600 underline cursor-pointer"
              >
                선택 해제
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {RETRO_EMOTIONS.map((em) => {
              const isSelected = selectedEmotion === em.label;
              return (
                <button
                  type="button"
                  key={em.id}
                  onClick={() => onSelectEmotion(isSelected ? '' : em.label)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#ff6b2b] text-white font-bold shadow-xs scale-105'
                      : 'bg-white text-[#4d6677] border border-[#ffcdb8] hover:bg-[#ffebe1]'
                  }`}
                >
                  <span>{em.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#e5edf2] pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('cyworld')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'cyworld'
              ? 'bg-[#ff7e39] text-white shadow-2xs'
              : 'text-[#556e80] hover:bg-[#f0f6fa]'
          }`}
        >
          🧡 싸이월드 ({CYWORLD_EMOJIS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('faces')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'faces'
              ? 'bg-[#ff7e39] text-white shadow-2xs'
              : 'text-[#556e80] hover:bg-[#f0f6fa]'
          }`}
        >
          😊 표정 ({FACE_EMOJIS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('kaomoji')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'kaomoji'
              ? 'bg-[#ff7e39] text-white shadow-2xs'
              : 'text-[#556e80] hover:bg-[#f0f6fa]'
          }`}
        >
          (^▽^) 문자콘
        </button>
      </div>

      {/* Emoji Grid */}
      <div className="min-h-[110px] max-h-[140px] overflow-y-auto pr-1">
        {activeTab === 'cyworld' && (
          <div className="grid grid-cols-6 gap-1.5">
            {CYWORLD_EMOJIS.map((em) => (
              <button
                type="button"
                key={em.val}
                onClick={() => handleEmojiClick(em.val)}
                className={`h-9 flex flex-col items-center justify-center rounded-lg bg-[#f7fafc] hover:bg-[#ffebe1] hover:scale-115 border border-[#e2edf2] hover:border-[#ff9f68] transition-all cursor-pointer text-lg select-none relative ${
                  lastClicked === em.val ? 'scale-90 bg-[#ffd9c7]' : ''
                }`}
                title={em.label}
              >
                <span>{em.val}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'faces' && (
          <div className="grid grid-cols-6 gap-1.5">
            {FACE_EMOJIS.map((em) => (
              <button
                type="button"
                key={em.val}
                onClick={() => handleEmojiClick(em.val)}
                className={`h-9 flex flex-col items-center justify-center rounded-lg bg-[#f7fafc] hover:bg-[#ffebe1] hover:scale-115 border border-[#e2edf2] hover:border-[#ff9f68] transition-all cursor-pointer text-lg select-none relative ${
                  lastClicked === em.val ? 'scale-90 bg-[#ffd9c7]' : ''
                }`}
                title={em.label}
              >
                <span>{em.val}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'kaomoji' && (
          <div className="flex flex-wrap gap-1.5">
            {KAOMOJI_EMOTICONS.map((em) => (
              <button
                type="button"
                key={em.val}
                onClick={() => handleEmojiClick(em.val)}
                className={`px-2 py-1 rounded bg-[#f7fafc] hover:bg-[#ffebe1] hover:border-[#ff9f68] border border-[#e2edf2] text-xs font-mono font-medium text-[#204a6e] hover:text-[#e05619] transition-all cursor-pointer active:scale-95 ${
                  lastClicked === em.val ? 'bg-[#ffd9c7]' : ''
                }`}
                title={em.label}
              >
                {em.val}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-[10px] text-[#718898] bg-[#f8fafb] px-2 py-1 rounded border border-[#e8f0f4] flex items-center justify-between">
        <span>클릭 시 방명록 입력창에 자동 삽입됩니다.</span>
        <span className="font-mono text-[#ff7e39] font-bold">CYWORLD RETRO</span>
      </div>
    </div>
  );
};
