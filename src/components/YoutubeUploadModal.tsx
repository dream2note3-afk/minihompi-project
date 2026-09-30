import React, { useState, useEffect } from 'react';
import { MediaItem, UserSession } from '../types';
import { Youtube, Film, Plus, Sparkles, Check, Play, AlertCircle } from 'lucide-react';
import { extractYouTubeId, getYouTubeThumbnail } from '../utils/youtube';

interface YoutubeUploadProps {
  onAddMedia: (item: Omit<MediaItem, 'id' | 'likes' | 'views' | 'date'>) => void;
  session: UserSession | null;
  onOpenAdminLogin: () => void;
  onSuccessReturn: () => void;
}

const SAMPLE_YOUTUBE_PRESETS = [
  {
    title: '서울 야경 4K 시네마틱 항공 촬영 (Cinematic Drone Film)',
    url: 'https://www.youtube.com/watch?v=bTqVqk7FSmY',
    description: '서울의 밤과 불빛들을 담아낸 4K 고화질 드론 시네마틱 릴입니다.',
    album: '시네마틱 영상',
    tags: '서울야경,드론영상,4K,시네마틱'
  },
  {
    title: '올드 렌즈의 미학 - 수동 포커스 필름 감성 연출법',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    description: '50mm f/1.4 빈티지 렌즈로 담아내는 몽환적인 보케와 부드러운 하이라이트 팁.',
    album: '촬영 강좌 & 리뷰',
    tags: '올드렌즈,빈티지카메라,보케,촬영팁'
  },
  {
    title: '스튜디오 인물 라이팅 마스터 클래스 (Rembrandt Lighting)',
    url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    description: '키 라이트와 필 라이트의 황금 비율로 깊이 있는 인물 프로필 사진 만들기.',
    album: '스튜디오 워크숍',
    tags: '조명세팅,인물촬영,스튜디오조명,렘브란트'
  }
];

export const YoutubeUploadModal: React.FC<YoutubeUploadProps> = ({
  onAddMedia,
  session,
  onOpenAdminLogin,
  onSuccessReturn
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [extractedId, setExtractedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [album, setAlbum] = useState('스튜디오 영상');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const id = extractYouTubeId(youtubeUrl);
    setExtractedId(id);
  }, [youtubeUrl]);

  const applyPreset = (preset: typeof SAMPLE_YOUTUBE_PRESETS[0]) => {
    setYoutubeUrl(preset.url);
    setTitle(preset.title);
    setDescription(preset.description);
    setAlbum(preset.album);
    setTagsInput(preset.tags);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !youtubeUrl.trim()) return;

    const id = extractYouTubeId(youtubeUrl);
    const thumbnail = id
      ? getYouTubeThumbnail(id)
      : 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80';

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    onAddMedia({
      type: 'youtube',
      title: title.trim(),
      url: youtubeUrl.trim(),
      thumbnailUrl: thumbnail,
      youtubeId: id || undefined,
      description: description.trim() || '권용우 스튜디오 유튜브 영상',
      album: album.trim() || '유튜브 영상',
      tags: tags.length > 0 ? tags : ['유튜브', '영상'],
      pinned: isPinned
    });

    setSubmitted(true);
    setTimeout(() => {
      onSuccessReturn();
    }, 1200);
  };

  return (
    <div className="bg-white border border-[#bed2dc] rounded-lg p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e2edf2] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
            <Youtube className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1a2f3f] flex items-center gap-1.5">
              <span>영상업로드 (YouTube)</span>
              <span className="text-[10px] text-white bg-red-600 px-1.5 py-0.5 rounded font-medium">
                YouTube Linker
              </span>
            </h2>
            <p className="text-[11px] text-[#6d8494]">
              유튜브 링크를 붙여넣으면 썸네일과 플레이어 임베드가 자동으로 연동됩니다.
            </p>
          </div>
        </div>

        {session?.isAdmin ? (
          <span className="text-[11px] bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 font-medium">
            관리자 권한 활성화됨
          </span>
        ) : (
          <button
            type="button"
            onClick={onOpenAdminLogin}
            className="text-[11px] bg-[#fff5f5] text-red-600 hover:bg-[#ffe3e3] px-2 py-1 rounded border border-red-200 font-medium transition-colors flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            <span>관리자 로그인 안내</span>
          </button>
        )}
      </div>

      {submitted ? (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">
            유튜브 영상이 성공적으로 등록되었습니다!
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            사진&amp;영상 갤러리 탭으로 자동 이동합니다...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Quick Preset Selector */}
          <div className="p-2.5 bg-[#fef5f5] border border-[#fed6d6] rounded-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#842029] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-red-600" />
                빠른 예시 영상 링크 불러오기
              </span>
              <span className="text-[10px] text-[#a04e57]">클릭 시 자동 입력</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {SAMPLE_YOUTUBE_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="text-left p-1.5 bg-white border border-[#fcc2c2] hover:border-red-500 rounded text-[11px] text-[#491217] truncate hover:bg-[#fff0f0] transition-colors"
                >
                  <span className="font-medium truncate block">{p.title}</span>
                  <span className="text-[10px] text-[#934850]">{p.album}</span>
                </button>
              ))}
            </div>
          </div>

          {/* YouTube URL input with auto-detection */}
          <div>
            <label className="block text-xs font-bold text-[#2a3f50] mb-1">
              유튜브 주소 (URL 또는 비디오 ID) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                className="w-full p-2 pr-24 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-red-600 outline-hidden font-mono"
                required
              />
              {extractedId && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-100 text-red-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  ID: {extractedId}
                </span>
              )}
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                영상 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 권용우 스튜디오 2026 필름 시네마틱 릴"
                className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-red-600 outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                영상 분류 카테고리
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="예: 시네마틱 필름, 장비 리뷰, 일상 브이로그"
                className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-red-600 outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#2a3f50] mb-1">
              영상 상세 설명 및 스토리
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="영상 제작 배경, 사용된 음원, 연출 의도, 참여자 크레딧 등을 자유롭게 적어주세요."
              rows={2}
              className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-red-600 outline-hidden resize-none leading-relaxed"
            />
          </div>

          {/* Tags & Pin */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-[#2a3f50] mb-1">
                해시태그 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="시네마틱, 4K, 필름, 유튜브"
                className="w-full p-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-red-600 outline-hidden"
              />
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer mt-3 sm:mt-4 text-xs font-medium text-[#2d4253]">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="accent-[#ff6b2b]"
              />
              <span>대표작으로 상단 고정</span>
            </label>
          </div>

          {/* Auto Thumbnail Preview */}
          {extractedId && (
            <div className="p-2 bg-[#f8fafb] border border-[#d2e2ec] rounded-md">
              <span className="text-[11px] font-bold text-[#456173] block mb-1">
                자동 추출된 유튜브 썸네일 미리보기:
              </span>
              <div className="max-w-xs aspect-video bg-black rounded overflow-hidden relative border border-[#c4d6df]">
                <img
                  src={getYouTubeThumbnail(extractedId)}
                  alt="유튜브 썸네일 미리보기"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e2edf2]">
            <button
              type="button"
              onClick={onSuccessReturn}
              className="px-3 py-1.5 bg-white border border-[#bed2dc] hover:bg-[#edf3f6] text-[#4d6676] rounded text-xs font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>유튜브 영상 등록하기</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
