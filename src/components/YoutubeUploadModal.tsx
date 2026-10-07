import React, { useState, useEffect } from 'react';
import { MediaItem, MediaType, UserSession } from '../types';
import { Video, Image, Youtube, Facebook, Sparkles, Check, AlertCircle, Link as LinkIcon, Pin, HardDrive } from 'lucide-react';
import { extractYouTubeId, getYouTubeThumbnail } from '../utils/youtube';
import { isGoogleDriveUrl, extractGoogleDriveFileId, getGoogleDriveThumbnailUrl } from '../utils/googleDrive';

interface YoutubeUploadProps {
  onAddMedia: (item: Omit<MediaItem, 'id' | 'likes' | 'views' | 'date'>) => void;
  session: UserSession | null;
  onOpenAdminLogin: () => void;
  onSuccessReturn: () => void;
}

const SAMPLE_PRESETS = [
  {
    title: '서울 야경 4K 시네마틱 항공 촬영 (Drone Film)',
    type: 'youtube' as MediaType,
    url: 'https://www.youtube.com/watch?v=bTqVqk7FSmY',
    thumbnailUrl: 'https://img.youtube.com/vi/bTqVqk7FSmY/hqdefault.jpg',
    description: '서울의 밤과 불빛들을 담아낸 4K 고화질 드론 시네마틱 릴입니다.',
    album: '시네마틱 영상',
    tags: '서울야경,드론영상,4K,시네마틱'
  },
  {
    title: '올드 렌즈의 미학 - 수동 포커스 필름 감성 연출법',
    type: 'youtube' as MediaType,
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    thumbnailUrl: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    description: '50mm f/1.4 빈티지 렌즈로 담아내는 몽환적인 보케와 부드러운 하이라이트 팁.',
    album: '촬영 강좌 & 리뷰',
    tags: '올드렌즈,빈티지카메라,보케,촬영팁'
  },
  {
    title: '페이스북 스튜디오 라이브 비디오 현장 컷',
    type: 'facebook' as MediaType,
    url: 'https://www.facebook.com/watch/?v=109283746152',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80',
    description: '스튜디오 작업실 촬영 현장을 담은 페이스북 릴스/영상 기록.',
    album: '현장 스케치',
    tags: '페이스북,현장영상,스튜디오'
  }
];

export const YoutubeUploadModal: React.FC<YoutubeUploadProps> = ({
  onAddMedia,
  session,
  onOpenAdminLogin,
  onSuccessReturn
}) => {
  const [mediaType, setMediaType] = useState<MediaType>('youtube');
  const [title, setTitle] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [album, setAlbum] = useState('스튜디오 영상');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [detectedType, setDetectedType] = useState<'youtube' | 'facebook' | 'gdrive' | 'web' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Auto-detect URL format when inputUrl changes
  useEffect(() => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setDetectedType(null);
      return;
    }

    // Google Drive video detection
    if (isGoogleDriveUrl(trimmed) || trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
      setDetectedType('gdrive');
      const fileId = extractGoogleDriveFileId(trimmed);
      if (fileId) {
        setThumbnailUrl(getGoogleDriveThumbnailUrl(fileId, 1200));
      }
      setMediaType('youtube');
      if (!tagsInput) {
        setTagsInput('구글드라이브, 영상, 스튜디오');
      }
      return;
    }

    const ytId = extractYouTubeId(trimmed);
    if (ytId) {
      setDetectedType('youtube');
      setThumbnailUrl(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
      setMediaType('youtube');
      return;
    }

    if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch') || trimmed.includes('fb.me')) {
      setDetectedType('facebook');
      if (!thumbnailUrl) {
        setThumbnailUrl('https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80');
      }
      return;
    }

    if (/\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(trimmed)) {
      setDetectedType('web');
      setThumbnailUrl(trimmed);
      return;
    }

    setDetectedType('web');
  }, [inputUrl]);

  const applyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setTitle(preset.title);
    setInputUrl(preset.url);
    setThumbnailUrl(preset.thumbnailUrl);
    setDescription(preset.description);
    setAlbum(preset.album);
    setTagsInput(preset.tags);
    setMediaType(preset.type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !inputUrl.trim()) return;

    const trimmedUrl = inputUrl.trim();
    const ytId = extractYouTubeId(trimmedUrl);

    // Final type: if it has YouTube ID, can be 'youtube', otherwise user-chosen mediaType
    const finalType: MediaType = ytId ? 'youtube' : mediaType;

    const fallbackThumbnail = ytId
      ? getYouTubeThumbnail(ytId)
      : (thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    onAddMedia({
      type: finalType,
      title: title.trim(),
      url: trimmedUrl,
      thumbnailUrl: fallbackThumbnail,
      youtubeId: ytId || undefined,
      description: description.trim() || '권용우 스튜디오 영상 아카이브',
      album: album.trim() || '스튜디오 영상',
      tags: tags.length > 0 ? tags : [finalType === 'youtube' ? '유튜브' : '페이스북', '영상'],
      pinned: isPinned
    });

    setSubmitted(true);
    setTimeout(() => {
      onSuccessReturn();
    }, 1200);
  };

  return (
    <div className="bg-white border border-[#bed2dc] rounded-lg p-4 shadow-xs flex-1 min-h-0 overflow-y-auto custom-retro-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e2edf2] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#e50914] text-white flex items-center justify-center shadow-xs">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1a2f3f] flex items-center gap-1.5">
              <span>영상 업로드</span>
              <span className="text-[10px] text-white bg-[#e50914] px-1.5 py-0.5 rounded font-medium">
                YouTube · Facebook 모두 지원
              </span>
            </h2>
            <p className="text-[11px] text-[#6d8494]">
              YouTube, Facebook, 웹 영상 링크 등 플랫폼 구분 없이 간편하게 등록하실 수 있습니다.
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
            className="text-[11px] bg-[#fff5f5] text-red-600 hover:bg-[#ffe3e3] px-2 py-1 rounded border border-red-200 font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            <AlertCircle className="w-3 h-3" />
            <span>관리자 로그인 필요</span>
          </button>
        )}
      </div>

      {submitted ? (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">
            영상이 성공적으로 등록되었습니다!
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            갤러리 탭으로 자동 이동합니다...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Quick Preset Selector */}
          <div className="p-2.5 bg-[#f5f9fc] border border-[#d2e2ec] rounded-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#324f64] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#ff7e39]" />
                빠른 예시 링크 불러오기
              </span>
              <span className="text-[10px] text-[#718b9b]">클릭 시 자동 입력</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {SAMPLE_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="text-left p-1.5 bg-white border border-[#c6d9e4] hover:border-[#e50914] rounded text-[11px] text-[#2c4355] truncate hover:bg-[#f0f6fa] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1 truncate">
                    {p.type === 'youtube' ? (
                      <Youtube className="w-3 h-3 text-red-600 shrink-0" />
                    ) : (
                      <Facebook className="w-3 h-3 text-blue-600 shrink-0" />
                    )}
                    <span className="font-medium truncate">{p.title}</span>
                  </div>
                  <span className="text-[10px] text-[#768e9e] block mt-0.5">{p.album}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Media Type Toggle */}
          <div className="flex items-center gap-2 p-2 bg-[#fafbfc] border border-[#dce6ed] rounded">
            <span className="text-xs font-bold text-[#384f60]">미디어 구분:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMediaType('youtube')}
                className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  mediaType === 'youtube'
                    ? 'bg-[#e50914] text-white shadow-2xs'
                    : 'bg-white border border-[#bed2dc] text-[#556e80] hover:bg-[#f0f4f8]'
                }`}
              >
                <Video className="w-3 h-3" />
                <span>영상 (Video)</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaType('facebook')}
                className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  mediaType === 'facebook'
                    ? 'bg-[#1877f2] text-white shadow-2xs'
                    : 'bg-white border border-[#bed2dc] text-[#556e80] hover:bg-[#f0f4f8]'
                }`}
              >
                <Image className="w-3 h-3" />
                <span>사진 (Photo)</span>
              </button>
            </div>
            <span className="text-[11px] text-[#78909e] hidden sm:inline ml-auto">
              ※ YouTube 링크는 썸네일과 플레이어가 자동 연동됩니다.
            </span>
          </div>

          {/* Main URL Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#2a3f50] flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-[#ff6b2b]" />
                <span>영상 링크 주소 (YouTube, Facebook, 영상 링크 모두 가능)</span>
                <span className="text-red-500">*</span>
              </label>

              {detectedType && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                  detectedType === 'youtube'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : detectedType === 'gdrive'
                    ? 'bg-[#e8f5e9] text-[#0f5132] border border-[#a3cfbb]'
                    : detectedType === 'facebook'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {detectedType === 'youtube' && <Youtube className="w-3 h-3 text-red-600" />}
                  {detectedType === 'gdrive' && <HardDrive className="w-3 h-3 text-[#0f9d58]" />}
                  {detectedType === 'facebook' && <Facebook className="w-3 h-3 text-blue-600" />}
                  <span>
                    {detectedType === 'youtube'
                      ? 'YouTube 영상 감지됨'
                      : detectedType === 'gdrive'
                      ? 'Google Drive 동영상 감지됨'
                      : detectedType === 'facebook'
                      ? 'Facebook 링크 감지됨'
                      : '웹 링크 감지됨'}
                  </span>
                </span>
              )}
            </div>

            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://www.youtube.com/... 또는 https://www.facebook.com/... 영상 주소 입력"
              className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#e50914] outline-hidden font-mono"
              required
            />
            <p className="text-[11px] text-[#7a8e9c] mt-1">
              💡 유튜브 영상 링크, 페이스북 릴스/영상 링크 등 플랫폼 구분 없이 모두 등록하실 수 있습니다.
            </p>
          </div>

          {/* Title & Album */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                영상 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 서울 야경 4K 시네마틱 항공 촬영"
                className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#e50914] outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                앨범 분류
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="예: 시네마틱 영상, 촬영 강좌, 여행 브이로그"
                className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#e50914] outline-hidden"
              />
            </div>
          </div>

          {/* Thumbnail Preview & URL */}
          <div>
            <label className="block text-xs font-bold text-[#2a3f50] mb-1 flex items-center justify-between">
              <span>썸네일 이미지 주소 (YouTube는 자동 생성)</span>
              {thumbnailUrl && (
                <span className="text-[10px] text-emerald-600 font-medium">
                  ✓ 썸네일 미리보기 생성됨
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="유튜브 링크 입력 시 썸네일이 자동으로 불러와집니다."
                className="flex-1 p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#e50914] outline-hidden font-mono"
              />
              {thumbnailUrl && (
                <div className="w-12 h-9 rounded border border-[#bed2dc] overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#2a3f50] mb-1">
              영상 소개 및 설명 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="영상 기획 의도, 촬영 장비, 연출 포인트 등을 기록해주세요."
              rows={2}
              className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#e50914] outline-hidden resize-none leading-relaxed"
            />
          </div>

          {/* Tags & Pin */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#edf2f7]">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-[#2a3f50] mb-1">
                해시태그 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="시네마틱, 드론영상, 4K, 감성"
                className="w-full p-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#e50914] outline-hidden"
              />
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto sm:mt-4">
              <label className="flex items-center gap-1.5 text-xs text-[#2a3f50] font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-[#ff6b2b] focus:ring-0"
                />
                <span className="flex items-center gap-0.5">
                  <Pin className="w-3 h-3 text-[#ff6b2b]" />
                  <span>대표작 고정</span>
                </span>
              </label>

              <button
                type="submit"
                className="px-5 py-2 bg-[#e50914] hover:bg-[#c40811] text-white rounded text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                영상 등록 완료
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
