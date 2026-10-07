import React, { useState } from 'react';
import { IlchonFriend } from '../types';
import {
  Users,
  Edit2,
  Plus,
  Trash2,
  Waves,
  Check,
  X,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface IlchonListProps {
  friends: IlchonFriend[];
  onAddFriend: (friend: Omit<IlchonFriend, 'id'>) => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onDeleteFriend: (id: string) => void;
  onOpenChat?: (friend: IlchonFriend) => void;
  isAdmin?: boolean;
}

const AVATAR_OPTIONS = ['🎬', '📷', '🐿️', '🎧', '☕️', '✨', '🌿', '🎨', '🌊', '🐱'];
const RELATION_PRESETS = ['시네마틱 동지', '필름스냅 메이트', '영원한 일촌', '사운드 엔지니어', '아틀리에 동료', '스튜디오 패밀리', '도토리 친구'];

export const IlchonList: React.FC<IlchonListProps> = ({
  friends,
  onAddFriend,
  onUpdateStatus,
  onDeleteFriend,
  onOpenChat,
  isAdmin = false
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatusText, setNewStatusText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [waveModalFriend, setWaveModalFriend] = useState<IlchonFriend | null>(null);

  // Add friend form state
  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState(RELATION_PRESETS[0]);
  const [formAvatar, setFormAvatar] = useState('🎬');
  const [formStatus, setFormStatus] = useState('');
  const [formHompyTitle, setFormHompyTitle] = useState('');

  const onlineCount = friends.filter((f) => f.isOnline).length;

  const handleStartEdit = (friend: IlchonFriend) => {
    setEditingId(friend.id);
    setNewStatusText(friend.statusMessage);
  };

  const handleSaveStatus = (id: string) => {
    if (!newStatusText.trim()) return;
    onUpdateStatus(id, newStatusText.trim());
    setEditingId(null);
  };

  const handleCreateFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formStatus.trim()) return;

    onAddFriend({
      name: formName.trim(),
      relation: formRelation.trim() || '일촌',
      avatarIcon: formAvatar,
      statusMessage: formStatus.trim(),
      updatedAt: '방금 전',
      isOnline: true,
      minihompyTitle: formHompyTitle.trim() || `${formName.trim()}님의 미니홈피`
    });

    setFormName('');
    setFormStatus('');
    setFormHompyTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full bg-[#f8fafc] border border-[#bcd2dc] rounded-lg p-2.5 shadow-2xs flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#d8e6ee]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🧡</span>
          <h4 className="text-xs font-bold text-[#1f3a52]">
            나의 일촌 ({friends.length})
          </h4>
          <span className="text-[10px] text-[#0f766e] bg-[#ecfdf5] px-1.5 py-0.2 rounded border border-[#a7f3d0] font-medium flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            온라인 {onlineCount}
          </span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="text-[10px] text-[#ff6b2b] hover:text-[#d94f13] bg-white border border-[#fed7aa] hover:bg-[#fff7ed] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 transition-colors cursor-pointer shadow-2xs"
          title="새로운 일촌 맺기"
        >
          <Plus className="w-3 h-3" />
          <span>일촌 맺기</span>
        </button>
      </div>

      {/* Friends List */}
      <div className="flex flex-col gap-2 max-h-[310px] overflow-y-auto pr-0.5">
        {friends.length === 0 ? (
          <div className="text-center py-4 text-xs text-[#7d93a1]">
            등록된 일촌이 없습니다. 일촌을 맺어보세요!
          </div>
        ) : (
          friends.map((friend) => {
            const isEditing = editingId === friend.id;

            return (
              <div
                key={friend.id}
                className="bg-white border border-[#d6e3ea] rounded-md p-2 hover:border-[#adc8d6] transition-all flex flex-col gap-1.5 shadow-2xs group relative"
              >
                {/* Top Row: Avatar + Name + Relation + Actions */}
                <div className="flex items-center justify-between gap-1">
                  <div
                    onClick={() => onOpenChat?.(friend)}
                    className="flex items-center gap-1.5 min-w-0 cursor-pointer hover:opacity-85 transition-opacity"
                    title={`${friend.name}님과 실시간 일촌 쪽지 나누기`}
                  >
                    {/* Avatar with Online Lamp */}
                    <div className="relative shrink-0 w-6 h-6 rounded-full bg-[#f0f5f8] border border-[#cadbe4] flex items-center justify-center text-xs">
                      <span>{friend.avatarIcon || '👤'}</span>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                          friend.isOnline ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={friend.isOnline ? '접속 중 (Online)' : '오프라인 (Offline)'}
                      />
                    </div>

                    <div className="truncate flex items-baseline gap-1">
                      <span className="text-[11px] font-bold text-[#1f374a] truncate hover:text-[#ff6b2b] transition-colors">
                        {friend.name}
                      </span>
                      <span className="text-[9px] text-[#ff6b2b] font-medium shrink-0">
                        [{friend.relation}]
                      </span>
                    </div>
                  </div>

                  {/* Actions: Paper Note (쪽지) + Wave Surf + Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenChat?.(friend)}
                      className="px-1.5 py-0.5 bg-[#fff7ed] hover:bg-[#ffedd5] text-[#ea580c] border border-[#fed7aa] rounded text-[9px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer shadow-2xs"
                      title={`${friend.name}님과 일촌 쪽지 나누기`}
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>쪽지</span>
                    </button>

                    <button
                      onClick={() => setWaveModalFriend(friend)}
                      className="px-1.5 py-0.5 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1d4ed8] border border-[#bfdbfe] rounded text-[9px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer shadow-2xs"
                      title={`${friend.name}님의 미니홈피로 파도타기 이동`}
                    >
                      <Waves className="w-2.5 h-2.5 text-[#2563eb]" />
                      <span>파도타기</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => onDeleteFriend(friend.id)}
                        className="text-gray-400 hover:text-red-500 p-0.5 transition-colors"
                        title="일촌 삭제"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Message Bubble */}
                <div className="bg-[#f8fafb] border border-[#e2edf2] rounded p-1.5 text-xs">
                  {isEditing ? (
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={newStatusText}
                        onChange={(e) => setNewStatusText(e.target.value)}
                        className="w-full text-xs p-1 bg-white border border-[#ff6b2b] rounded outline-hidden text-[#1a2f3f]"
                        placeholder="새 상태메시지 입력..."
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveStatus(friend.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-[10px]"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleSaveStatus(friend.id)}
                          className="px-2 py-0.5 bg-[#ff6b2b] hover:bg-[#e05619] text-white rounded text-[10px] font-bold flex items-center gap-0.5"
                        >
                          <Check className="w-2.5 h-2.5" />
                          <span>저장</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-1 group/status">
                      <p className="text-[11px] text-[#344d5e] leading-snug line-clamp-2">
                        “{friend.statusMessage}”
                      </p>
                      <button
                        onClick={() => handleStartEdit(friend)}
                        className="text-[#9ab1bf] hover:text-[#ff6b2b] opacity-0 group-hover:opacity-100 transition-opacity p-0.5 shrink-0"
                        title="상태 메시지 변경하기"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}

                  {/* Status update timestamp note */}
                  <div className="flex items-center justify-between text-[9px] text-[#8ea4b3] mt-1 pt-1 border-t border-[#ebf2f6]">
                    <span>{friend.updatedAt || '실시간'}</span>
                    <span className="text-[9px] text-[#2b7294] font-medium">
                      {friend.isOnline ? '🟢 대화가능' : '⚪️ 부재중'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Ilchon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#ff6b2b] rounded-xl max-w-sm w-full p-4 shadow-xl flex flex-col gap-3 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold text-[#1f3a52] flex items-center gap-1.5">
                <span>🧡 새 일촌 맺기 (Add Ilchon Friend)</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFriend} className="flex flex-col gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#2a3f50] mb-0.5">
                  친구 이름 (Name)
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: 송중기, 한효주"
                  className="w-full p-1.5 border border-[#bed2dc] rounded text-xs outline-hidden focus:border-[#ff6b2b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2a3f50] mb-0.5">
                  일촌 관계명 (Relation)
                </label>
                <div className="flex flex-wrap gap-1 mb-1">
                  {RELATION_PRESETS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormRelation(r)}
                      className={`px-1.5 py-0.5 rounded text-[10px] border ${
                        formRelation === r
                          ? 'bg-[#ff6b2b] text-white border-[#ff6b2b]'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formRelation}
                  onChange={(e) => setFormRelation(e.target.value)}
                  placeholder="직접 입력..."
                  className="w-full p-1 border border-[#bed2dc] rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2a3f50] mb-0.5">
                  아바타 아이콘
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {AVATAR_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormAvatar(icon)}
                      className={`w-7 h-7 rounded-full text-sm border flex items-center justify-center transition-all ${
                        formAvatar === icon
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
                <label className="block text-[11px] font-bold text-[#2a3f50] mb-0.5">
                  상태 메시지 (Status Message)
                </label>
                <input
                  type="text"
                  required
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  placeholder="예: 스튜디오에서 편집 중... ☕️"
                  className="w-full p-1.5 border border-[#bed2dc] rounded text-xs outline-hidden focus:border-[#ff6b2b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2a3f50] mb-0.5">
                  미니홈피 타이틀 (선택)
                </label>
                <input
                  type="text"
                  value={formHompyTitle}
                  onChange={(e) => setFormHompyTitle(e.target.value)}
                  placeholder="예: 중기의 필름 다이어리"
                  className="w-full p-1.5 border border-[#bed2dc] rounded text-xs outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t mt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#ff6b2b] hover:bg-[#ea580c] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>일촌 등록하기</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wave Surf Modal Simulation */}
      {waveModalFriend && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#3b82f6] rounded-xl max-w-sm w-full p-4 shadow-xl flex flex-col gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] flex items-center justify-center mx-auto text-xl shadow-xs">
              🌊
            </div>

            <div>
              <div className="text-[10px] text-[#ff6b2b] font-mono font-bold">
                CYWORLD WAVE SURFING
              </div>
              <h3 className="text-sm font-bold text-[#1e3a5f] mt-0.5">
                '{waveModalFriend.name}' 님의 미니홈피로 파도타기!
              </h3>
              <p className="text-xs text-[#506879] mt-1 font-medium">
                "{waveModalFriend.minihompyTitle || `${waveModalFriend.name}님의 미니홈피`}"
              </p>
            </div>

            <div className="bg-[#f0f7fb] border border-[#cbe0ec] rounded-lg p-2.5 text-xs text-left">
              <div className="flex items-center gap-1.5 mb-1 text-[#244256] font-bold">
                <span>{waveModalFriend.avatarIcon}</span>
                <span>[{waveModalFriend.relation}] {waveModalFriend.name}</span>
                <span className="text-[10px] text-green-600 font-normal">
                  {waveModalFriend.isOnline ? '● 접속중' : '○ 오프라인'}
                </span>
              </div>
              <p className="text-[11px] text-[#4b6375] italic bg-white p-2 rounded border border-[#d8e6ef]">
                “{waveModalFriend.statusMessage}”
              </p>
            </div>

            <div className="text-[11px] text-[#6d8494]">
              🌊 파도타기 슈웅~ 권용우 작가의 일촌 네트워크를 통해 성공적으로 연결되었습니다!
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => setWaveModalFriend(null)}
                className="w-full py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded text-xs font-bold shadow-xs transition-colors"
              >
                파도타기 완료 (닫기)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
