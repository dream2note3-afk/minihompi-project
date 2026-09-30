import React, { useState } from 'react';
import { GuestbookEntry } from '../types';
import { MessageSquare, Send, Trash2, Shield, Smile, Sparkles } from 'lucide-react';

interface GuestbookProps {
  entries: GuestbookEntry[];
  onAddEntry: (entry: Omit<GuestbookEntry, 'id' | 'createdAt'>) => void;
  onDeleteEntry: (id: string) => void;
  isAdmin: boolean;
}

const AVATAR_OPTIONS = ['🐿️', '📷', '☕️', '🎬', '✨', '🌿', '🎧', '🎨', '🚀'];
const RELATION_OPTIONS = ['일촌', '스튜디오 동료', '팬클럽', '방문객', '영상제작자'];

export const Guestbook: React.FC<GuestbookProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
  isAdmin
}) => {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🐿️');
  const [selectedRelation, setSelectedRelation] = useState('일촌');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const finalAuthor = author.trim() || '도토리친구';

    onAddEntry({
      author: finalAuthor,
      avatarIcon: selectedAvatar,
      content: content.trim(),
      relation: selectedRelation
    });

    setContent('');
    setIsSubmitting(false);
  };

  return (
    <div className="mt-6 border-t-2 border-dashed border-[#c2d7e2] pt-5">
      {/* Guestbook Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#ff7e39] text-white flex items-center justify-center text-xs">
            <MessageSquare className="w-3 h-3" />
          </div>
          <h3 className="text-sm font-bold text-[#1f3a52] flex items-center gap-1.5">
            <span>방명록 (Guestbook)</span>
            <span className="text-xs font-normal text-[#5a7486]">
              총 <strong className="text-[#ff6b2b]">{entries.length}</strong>개의 발자국
            </span>
          </h3>
        </div>
        <span className="text-[11px] text-[#718898] bg-[#f0f6fa] px-2 py-0.5 rounded border border-[#d2e2eb]">
          권용우 작가에게 따뜻한 한마디를 남겨주세요!
        </span>
      </div>

      {/* Write Entry Form */}
      <form onSubmit={handleSubmit} className="bg-[#f7fafc] border border-[#bcd3df] rounded-lg p-3 shadow-2xs mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {/* Avatar Selector */}
          <div className="flex items-center gap-1 bg-white border border-[#c5d8e2] px-2 py-1 rounded text-xs">
            <span className="text-[11px] text-[#556e80]">미니미:</span>
            <div className="flex items-center gap-1">
              {AVATAR_OPTIONS.slice(0, 5).map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`w-6 h-6 flex items-center justify-center rounded text-sm transition-all ${
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
          <div className="flex items-center gap-1 bg-white border border-[#c5d8e2] px-2 py-1 rounded text-xs">
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
          <div className="flex items-center gap-1 bg-white border border-[#c5d8e2] px-2 py-1 rounded text-xs">
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

        {/* Message Input & Submit Button */}
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="영상 후기나 안부 인사를 남겨주세요. (예: 한강 노을 영상 너무 멋져요! 파도타기 놀러왔습니다~)"
            rows={2}
            className="flex-1 p-2 bg-white border border-[#b8ceda] rounded text-xs text-[#223340] placeholder:text-[#9bb1be] focus:border-[#2b7294] outline-hidden resize-none leading-relaxed"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 bg-[#ff6b2b] hover:bg-[#ea5616] disabled:bg-[#d5d5d5] text-white rounded text-xs font-bold shadow-xs flex flex-col items-center justify-center gap-1 shrink-0 transition-colors active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>작성</span>
          </button>
        </div>
      </form>

      {/* Guestbook Entries List */}
      <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <div className="p-6 text-center bg-[#f8fafb] border border-dashed border-[#ccdbe2] rounded-lg text-xs text-[#708796]">
            아직 작성된 방명록이 없습니다. 첫 번째 발자국을 남겨보세요! ✨
          </div>
        ) : (
          entries.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#d6e3ea] rounded-md p-2.5 shadow-2xs hover:border-[#b7cfdc] transition-colors flex items-start gap-2.5"
            >
              {/* Avatar Icon */}
              <div className="w-8 h-8 rounded-full bg-[#f2f7f9] border border-[#cde0e9] flex items-center justify-center text-lg shrink-0 select-none">
                {item.avatarIcon}
              </div>

              {/* Content body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-[#203a4e]">
                      {item.author}
                    </span>
                    <span className="text-[10px] bg-[#eef5f8] text-[#346281] px-1.5 py-0.2 rounded border border-[#d0e1ea]">
                      {item.relation}
                    </span>
                    <span className="text-[10px] text-[#869dae] font-mono">
                      {item.createdAt}
                    </span>
                  </div>

                  {/* Admin delete permission */}
                  {isAdmin && (
                    <button
                      onClick={() => onDeleteEntry(item.id)}
                      className="text-[#99abb8] hover:text-red-600 transition-colors p-1"
                      title="관리자 권한으로 삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#334756] leading-relaxed break-keep">
                  {item.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
