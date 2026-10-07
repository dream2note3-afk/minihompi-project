import React, { useState, useEffect, useRef } from 'react';
import { IlchonFriend, IlchonNote } from '../types';
import {
  Send,
  X,
  Minus,
  Maximize2,
  Trash2,
  Sparkles,
  Waves,
  Heart,
  Coffee,
  Camera,
  Film,
  Music
} from 'lucide-react';

interface IlchonChatModalProps {
  friend: IlchonFriend;
  notes: IlchonNote[];
  onSendNote: (text: string) => void;
  onClearNotes: () => void;
  onClose: () => void;
}

const QUICK_NOTES = [
  { label: '🌰 도토리 5개 선물', text: '🌰 도토리 5개를 일촌 선물로 보냈습니다! 예쁜 BGM/스킨 꾸미세요~' },
  { label: '🌊 파도타기 슈웅~', text: '🌊 미니홈피 구경 잘하고 가요! 파도타기 슈웅~~' },
  { label: '📸 사진 색감 대박!', text: '📸 이번 영상이랑 사진 색감 너무 따뜻하고 예뻐요!' },
  { label: '☕️ 커피 한잔 콜?', text: '☕️ 시간 될 때 스튜디오 근처에서 따뜻한 라떼 한잔해요!' }
];

export const IlchonChatModal: React.FC<IlchonChatModalProps> = ({
  friend,
  notes,
  onSendNote,
  onClearNotes,
  onClose
}) => {
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when notes update
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notes, isMinimized]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendNote(inputText.trim());
    setInputText('');
  };

  const handleQuickSend = (text: string) => {
    onSendNote(text);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-3 right-3 sm:right-6 z-50 animate-bounce-subtle">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-[#ff6b2b] hover:bg-[#ea580c] text-white px-3 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-2 text-xs font-bold transition-transform active:scale-95 cursor-pointer"
        >
          <span>💌</span>
          <span className="truncate max-w-[120px]">[{friend.relation}] {friend.name}</span>
          <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
          <Maximize2 className="w-3 h-3 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 right-2 sm:right-6 z-50 w-[95vw] sm:w-[350px] md:w-[370px] max-h-[520px] flex flex-col bg-white border-2 border-[#ff6b2b] rounded-t-xl rounded-b-lg shadow-2xl overflow-hidden font-sans animate-scaleUp">
      {/* 1. Retro NateOn / Cyworld Window Title Bar */}
      <div className="bg-gradient-to-r from-[#ff6b2b] to-[#ff8c42] text-white px-3 py-2 flex items-center justify-between select-none shadow-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm">💌</span>
          <span className="text-xs font-bold truncate">
            일촌 쪽지함 - {friend.name}
          </span>
          <span
            className={`w-2 h-2 rounded-full border border-white shrink-0 ${
              friend.isOnline ? 'bg-green-300 animate-pulse' : 'bg-gray-300'
            }`}
            title={friend.isOnline ? '현재 온라인' : '부재중 (오프라인)'}
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/20 transition-colors text-white"
            title="최소화"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/20 transition-colors text-white"
            title="닫기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Friend Mini Profile Banner */}
      <div className="bg-[#fff7ed] border-b border-[#fed7aa] p-2 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-white border border-[#fed7aa] flex items-center justify-center text-base shrink-0 shadow-2xs">
            {friend.avatarIcon || '👤'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 truncate">
              <span className="font-bold text-[#1f2937] text-xs truncate">{friend.name}</span>
              <span className="text-[10px] text-[#ff6b2b] font-medium shrink-0">[{friend.relation}]</span>
            </div>
            <p className="text-[10px] text-[#78716c] truncate italic">
              “{friend.statusMessage}”
            </p>
          </div>
        </div>

        {/* Clear chat history button */}
        {notes.length > 0 && (
          <button
            onClick={onClearNotes}
            className="text-[10px] text-gray-400 hover:text-red-500 p-1 transition-colors shrink-0"
            title="대화 기록 비우기"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 3. Messages Scroll Container */}
      <div className="flex-1 p-3 overflow-y-auto bg-[#fafaf9] flex flex-col gap-2.5 min-h-[220px] max-h-[280px]">
        {/* Retro Welcome Notice */}
        <div className="text-center my-1">
          <span className="inline-block bg-[#f5f5f4] text-[#78716c] text-[9px] px-2 py-0.5 rounded-full border border-[#e7e5e4]">
            📜 {friend.name}님과의 실시간 일촌 쪽지함입니다.
          </span>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400 flex flex-col items-center gap-1">
            <span className="text-2xl">📮</span>
            <span>주고받은 쪽지가 없습니다.</span>
            <span className="text-[10px] text-gray-500">첫 일촌 쪽지를 남겨보세요!</span>
          </div>
        ) : (
          notes.map((note) => {
            const isMe = note.isMine;

            return (
              <div
                key={note.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[88%] ${isMe ? 'self-end' : 'self-start'}`}
              >
                {/* Sender name for friend */}
                {!isMe && (
                  <div className="flex items-center gap-1 text-[10px] text-[#57534e] mb-0.5 ml-1">
                    <span>{friend.avatarIcon}</span>
                    <span className="font-bold">{note.senderName || friend.name}</span>
                  </div>
                )}

                {/* Bubble + Timestamp */}
                <div className={`flex items-end gap-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div
                    className={`p-2 rounded-lg text-xs leading-relaxed break-keep shadow-2xs ${
                      isMe
                        ? 'bg-[#ff6b2b] text-white rounded-tr-xs'
                        : 'bg-white text-[#292524] border border-[#e7e5e4] rounded-tl-xs'
                    }`}
                  >
                    {note.text}
                  </div>
                  <span className="text-[9px] text-gray-400 shrink-0 font-mono pb-0.5">
                    {note.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Cyworld Action Buttons */}
      <div className="bg-[#fffaf5] border-t border-[#fed7aa]/60 px-2 py-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-[#ff6b2b] font-bold shrink-0">빠른쪽지:</span>
        {QUICK_NOTES.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickSend(q.text)}
            className="text-[10px] bg-white hover:bg-[#fff7ed] border border-[#fed7aa] text-[#78716c] hover:text-[#ea580c] px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* 5. Message Input & Send Form */}
      <form onSubmit={handleSend} className="bg-white border-t border-[#e7e5e4] p-2 flex items-center gap-1.5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`${friend.name}님에게 쪽지 보내기...`}
          className="flex-1 text-xs p-1.5 bg-[#fafaf9] border border-[#d6d3d1] rounded-md outline-hidden focus:border-[#ff6b2b] text-[#1c1917] placeholder:text-gray-400"
          autoFocus
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-3 py-1.5 bg-[#ff6b2b] hover:bg-[#ea580c] disabled:bg-gray-300 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-3 h-3" />
          <span>전송</span>
        </button>
      </form>
    </div>
  );
};
