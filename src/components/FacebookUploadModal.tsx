import React, { useState } from 'react';
import { MediaItem, UserSession } from '../types';
import { Facebook, Image, Plus, Link, Check, Sparkles, AlertCircle } from 'lucide-react';

interface FacebookUploadProps {
  onAddMedia: (item: Omit<MediaItem, 'id' | 'likes' | 'views' | 'date'>) => void;
  session: UserSession | null;
  onOpenAdminLogin: () => void;
  onSuccessReturn: () => void;
}

const SAMPLE_FACEBOOK_PRESETS = [
  {
    title: '스튜디오 자연광 촬영 비하인드 컷',
    url: 'https://www.facebook.com/photo/?fbid=109283746152',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80',
    description: '따스한 오후 3시 햇살이 드리워진 스튜디오 작업실에서 담은 35mm 필름 스냅 사진입니다.',
    album: '스튜디오 일상',
    tags: '스튜디오,필름,자연광,비하인드'
  },
  {
    title: '남산 타워 야경 장노출 포토워크',
    url: 'https://www.facebook.com/photo/?fbid=209283746153',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: '서울의 밤을 비추는 불빛들을 삼각대와 ND필터로 정성스럽게 장노출 촬영했습니다.',
    album: '서울 스냅',
    tags: '남산타워,서울야경,장노출,페이스북포토'
  },
  {
    title: '제주도 오름과 갈대밭 스냅사진',
    url: 'https://www.facebook.com/photo/?fbid=309283746154',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    description: '가을바람이 넘실대는 제주 오름에서 담아낸 부드러운 파스텔 톤의 풍경 기록.',
    album: '제주 기행',
    tags: '제주도,갈대밭,풍경스냅,힐링'
  }
];

export const FacebookUploadModal: React.FC<FacebookUploadProps> = ({
  onAddMedia,
  session,
  onOpenAdminLogin,
  onSuccessReturn
}) => {
  const [title, setTitle] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [album, setAlbum] = useState('페이스북 사진첩');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const applyPreset = (preset: typeof SAMPLE_FACEBOOK_PRESETS[0]) => {
    setTitle(preset.title);
    setFacebookUrl(preset.url);
    setImageUrl(preset.thumbnailUrl);
    setDescription(preset.description);
    setAlbum(preset.album);
    setTagsInput(preset.tags);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    onAddMedia({
      type: 'facebook',
      title: title.trim(),
      url: facebookUrl.trim() || 'https://www.facebook.com',
      thumbnailUrl: imageUrl.trim(),
      description: description.trim() || '권용우 스튜디오 페이스북 사진',
      album: album.trim() || '페이스북 사진첩',
      tags: tags.length > 0 ? tags : ['페이스북', '사진'],
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
          <div className="w-7 h-7 rounded-lg bg-[#1877f2] text-white flex items-center justify-center shadow-xs">
            <Facebook className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1a2f3f] flex items-center gap-1.5">
              <span>사진업로드 (FaceBook)</span>
              <span className="text-[10px] text-white bg-[#1877f2] px-1.5 py-0.5 rounded font-medium">
                FB Photo Linker
              </span>
            </h2>
            <p className="text-[11px] text-[#6d8494]">
              페이스북에 게시된 사진과 포스트 링크를 스튜디오 미니홈피에 수집·등록합니다.
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
            페이스북 사진이 성공적으로 등록되었습니다!
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            사진&amp;영상 갤러리 탭으로 자동 이동합니다...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Quick Preset Selector */}
          <div className="p-2.5 bg-[#f5f9fc] border border-[#d2e2ec] rounded-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#324f64] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#ff7e39]" />
                빠른 예시 사진 불러오기
              </span>
              <span className="text-[10px] text-[#718b9b]">클릭 시 자동 입력</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {SAMPLE_FACEBOOK_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="text-left p-1.5 bg-white border border-[#c6d9e4] hover:border-[#1877f2] rounded text-[11px] text-[#2c4355] truncate hover:bg-[#f0f6fa] transition-colors"
                >
                  <span className="font-medium truncate block">{p.title}</span>
                  <span className="text-[10px] text-[#768e9e]">{p.album}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                사진 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 서울 한강 일몰 35mm 감성 스냅"
                className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#1877f2] outline-hidden"
                required
              />
            </div>

            {/* Album */}
            <div>
              <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                사진첩 앨범 분류
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="예: 서울 스냅, 인물 포토북, 여행기록"
                className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#1877f2] outline-hidden"
              />
            </div>

            {/* Image Direct URL */}
            <div>
              <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                이미지 주소 (Photo URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... (이미지 고화질 주소)"
                className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#1877f2] outline-hidden font-mono"
                required
              />
            </div>

            {/* Facebook Post URL */}
            <div>
              <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                페이스북 원본 게시물 링크 (선택)
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://www.facebook.com/..."
                className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#1877f2] outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#2a3f50] mb-1">
              사진 소개 및 촬영 노트
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="촬영 카메라 기종, 렌즈 세팅, 사진에 얽힌 스토리나 단상을 자유롭게 기록해주세요."
              rows={2}
              className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#1877f2] outline-hidden resize-none leading-relaxed"
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
                placeholder="스냅, 풍경, 자연광, 페이스북사진"
                className="w-full p-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#1877f2] outline-hidden"
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

          {/* Image Live Preview */}
          {imageUrl && (
            <div className="mt-1 p-2 bg-[#f8fafb] border border-[#d2e2ec] rounded-md">
              <span className="text-[11px] font-bold text-[#456173] block mb-1">
                미리보기 화면:
              </span>
              <div className="max-w-xs aspect-video bg-[#1e293b] rounded overflow-hidden relative border border-[#c4d6df]">
                <img
                  src={imageUrl}
                  alt="미리보기"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                  Facebook 사진
                </span>
              </div>
            </div>
          )}

          {/* Submit button */}
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
              className="px-4 py-1.5 bg-[#1877f2] hover:bg-[#1264ce] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>페이스북 사진 등록하기</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
