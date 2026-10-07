import React, { useState, useEffect } from 'react';
import { MediaItem, MediaType, UserSession } from '../types';
import { Image, Video, Facebook, Youtube, Sparkles, Check, AlertCircle, Link as LinkIcon, Pin, Upload, HardDrive, HelpCircle, Info } from 'lucide-react';
import { extractYouTubeId, getYouTubeThumbnail } from '../utils/youtube';
import {
  isGoogleDriveUrl,
  getGoogleDriveDirectImageUrl,
  extractGoogleDriveFileId,
  transformIfGoogleDriveUrl,
  handleGoogleDriveImageError
} from '../utils/googleDrive';
import { GoogleDrivePermissionTooltip } from './GoogleDrivePermissionTooltip';

interface FacebookUploadProps {
  onAddMedia: (item: Omit<MediaItem, 'id' | 'likes' | 'views' | 'date'>) => void;
  session: UserSession | null;
  onOpenAdminLogin: () => void;
  onSuccessReturn: () => void;
}

const SAMPLE_PRESETS = [
  {
    title: '구글 드라이브 클라우드 사진 아카이브',
    type: 'facebook' as MediaType,
    url: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    description: '구글 드라이브(Google Drive)에 보관된 고화질 원본 사진 링크를 등록한 샘플입니다.',
    album: '구글 드라이브 사진',
    tags: '구글드라이브,클라우드,사진,고화질'
  },
  {
    title: '스튜디오 자연광 촬영 비하인드 컷',
    type: 'facebook' as MediaType,
    url: 'https://www.facebook.com/photo/?fbid=109283746152',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80',
    description: '따스한 오후 햇살이 드리워진 스튜디오 작업실에서 담은 35mm 필름 스냅 사진입니다.',
    album: '스튜디오 일상',
    tags: '페이스북,스튜디오,필름,자연광'
  },
  {
    title: '서울 야경 4K 시네마틱 드론 영상',
    type: 'youtube' as MediaType,
    url: 'https://www.youtube.com/watch?v=bTqVqk7FSmY',
    thumbnailUrl: 'https://img.youtube.com/vi/bTqVqk7FSmY/hqdefault.jpg',
    description: '서울의 밤을 비추는 불빛들을 담아낸 4K 고화질 시네마틱 영상입니다.',
    album: '시네마틱 영상',
    tags: '유튜브,서울야경,드론영상,4K'
  }
];

export const FacebookUploadModal: React.FC<FacebookUploadProps> = ({
  onAddMedia,
  session,
  onOpenAdminLogin,
  onSuccessReturn
}) => {
  const [mediaType, setMediaType] = useState<MediaType>('facebook');
  const [title, setTitle] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [album, setAlbum] = useState('사진 갤러리');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [detectedType, setDetectedType] = useState<'gdrive' | 'youtube' | 'facebook' | 'web' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showDriveHelpModal, setShowDriveHelpModal] = useState(false);

  // Auto-detect URL format when inputUrl changes
  useEffect(() => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setDetectedType(null);
      return;
    }

    // Google Drive URL Detection
    if (isGoogleDriveUrl(trimmed)) {
      setDetectedType('gdrive');
      setMediaType('facebook');
      const directImg = getGoogleDriveDirectImageUrl(trimmed);
      setThumbnailUrl(directImg);
      if (album === '사진 갤러리' || !album) {
        setAlbum('구글 드라이브 사진');
      }
      return;
    }

    const ytId = extractYouTubeId(trimmed);
    if (ytId) {
      setDetectedType('youtube');
      setMediaType('youtube');
      // If user hasn't typed custom thumbnail, auto set YouTube high-res thumbnail
      setThumbnailUrl(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
      return;
    }

    if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch') || trimmed.includes('fb.me')) {
      setDetectedType('facebook');
      setMediaType('facebook');
      if (!thumbnailUrl) {
        setThumbnailUrl('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80');
      }
      return;
    }

    // Direct image URL or general web
    if (/\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(trimmed)) {
      setDetectedType('web');
      setMediaType('facebook');
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
    const isGDrive = isGoogleDriveUrl(trimmedUrl);

    // Final type: if it has YouTube ID, can be 'youtube', otherwise 'facebook'
    const finalType: MediaType = ytId ? 'youtube' : mediaType;

    const fallbackThumbnail = ytId
      ? getYouTubeThumbnail(ytId)
      : isGDrive
      ? getGoogleDriveDirectImageUrl(trimmedUrl)
      : (thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80');

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
      description: description.trim() || (isGDrive ? '구글 드라이브 사진 아카이브' : '권용우 스튜디오 아카이브'),
      album: album.trim() || (isGDrive ? '구글 드라이브' : '사진 갤러리'),
      tags: tags.length > 0 ? tags : [isGDrive ? '구글드라이브' : finalType === 'youtube' ? '영상' : '사진', '아카이브'],
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
          <div className="w-8 h-8 rounded-lg bg-[#0f9d58] text-white flex items-center justify-center shadow-xs">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1a2f3f] flex items-center gap-1.5 flex-wrap">
              <span>사진 업로드</span>
              <span className="text-[10px] text-white bg-[#0f9d58] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                Google Drive 지원
              </span>
              <span className="text-[10px] text-white bg-[#2b7294] px-1.5 py-0.5 rounded font-medium">
                Facebook · YouTube 지원
              </span>
            </h2>
            <p className="text-[11px] text-[#6d8494]">
              구글 드라이브(Google Drive) 사진 링크, Facebook 사진/게시물, YouTube 영상 등 어떤 링크든 고화질로 등록됩니다.
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
            게시물이 성공적으로 등록되었습니다!
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            갤러리 탭으로 자동 이동합니다...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Google Drive Guide Box */}
          <div className="bg-[#f0f9f4] border border-[#bce2cd] rounded-lg p-2.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between flex-wrap gap-1.5">
              <span className="text-xs font-bold text-[#0f5132] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#0f9d58]" />
                <span>구글 드라이브(Google Drive) 사진 링크 등록 방법</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowDriveHelpModal(true)}
                  className="text-[10px] font-bold bg-white hover:bg-[#0f9d58] text-[#0f5132] hover:text-white px-2 py-0.5 rounded border border-[#80ca9e] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="구글 드라이브 파일 공유 권한 공개 설정 방법 상세 가이드 열기"
                >
                  <HelpCircle className="w-3 h-3 text-[#0f9d58]" />
                  <span>공개 권한 설정 가이드</span>
                </button>
                <span className="text-[10px] font-bold bg-[#d1e7dd] text-[#0f5132] px-2 py-0.5 rounded-full">
                  초간단 3단계
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#1e4635]">
              <div className="bg-white p-2 rounded border border-[#cbe5d7] flex flex-col gap-0.5 shadow-2xs">
                <strong className="text-[#0f9d58]">1. 공유 링크 복사</strong>
                <span className="text-[#4b6357]">Google Drive에서 사진 우클릭 → [공유] → [링크 복사] 클릭</span>
              </div>
              <div className="bg-white p-2 rounded border border-[#cbe5d7] flex flex-col gap-0.5 shadow-2xs">
                <strong className="text-[#0f9d58]">2. 보기 권한 확인</strong>
                <span className="text-[#4b6357]">일반 액세스가 <strong>'링크가 있는 모든 사용자'</strong>인지 확인</span>
              </div>
              <div className="bg-white p-2 rounded border border-[#cbe5d7] flex flex-col gap-0.5 shadow-2xs">
                <strong className="text-[#0f9d58]">3. 링크 붙여넣기</strong>
                <span className="text-[#4b6357]">아래 주소창에 붙여넣으면 고화질 사진으로 즉시 자동 변환!</span>
              </div>
            </div>
          </div>

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
                  className="text-left p-1.5 bg-white border border-[#c6d9e4] hover:border-[#2b7294] rounded text-[11px] text-[#2c4355] truncate hover:bg-[#f0f6fa] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1 truncate">
                    {p.url.includes('drive.google.com') ? (
                      <HardDrive className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : p.type === 'youtube' ? (
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
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setMediaType('facebook')}
                className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  mediaType === 'facebook' && detectedType === 'gdrive'
                    ? 'bg-[#0f9d58] text-white shadow-2xs'
                    : mediaType === 'facebook'
                    ? 'bg-[#1877f2] text-white shadow-2xs'
                    : 'bg-white border border-[#bed2dc] text-[#556e80] hover:bg-[#f0f4f8]'
                }`}
              >
                {detectedType === 'gdrive' ? (
                  <HardDrive className="w-3 h-3" />
                ) : (
                  <Image className="w-3 h-3" />
                )}
                <span>{detectedType === 'gdrive' ? '구글 드라이브 사진' : '사진 (Photo)'}</span>
              </button>
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
            </div>
            <span className="text-[11px] text-[#78909e] hidden sm:inline ml-auto">
              ※ 링크 입력 시 구글 드라이브·페이스북·유튜브 자동 감지
            </span>
          </div>

          {/* Main URL Input */}
          <div>
            <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-bold text-[#2a3f50] flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-[#ff6b2b]" />
                  <span>링크 주소 (구글 드라이브, 페이스북, 유튜브, 이미지 링크)</span>
                  <span className="text-red-500">*</span>
                </label>

                {/* Google Drive Permission Guide Tooltip Button */}
                <button
                  type="button"
                  onClick={() => setShowDriveHelpModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#1b5e20] border border-[#a5d6a7] transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
                  title="구글 드라이브 파일 공유 권한 공개 설정 방법 안내 가이드 팝업"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#2e7d32]" />
                  <span>공유 권한 설정 가이드</span>
                </button>
              </div>

              {detectedType && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                  detectedType === 'gdrive'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : detectedType === 'youtube'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : detectedType === 'facebook'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {detectedType === 'gdrive' && <HardDrive className="w-3 h-3 text-emerald-600" />}
                  {detectedType === 'youtube' && <Youtube className="w-3 h-3 text-red-600" />}
                  {detectedType === 'facebook' && <Facebook className="w-3 h-3 text-blue-600" />}
                  <span>
                    {detectedType === 'gdrive'
                      ? 'Google Drive 사진 링크 감지됨'
                      : detectedType === 'youtube'
                      ? 'YouTube 링크 감지됨'
                      : detectedType === 'facebook'
                      ? 'Facebook 링크 감지됨'
                      : '웹 이미지 링크 감지됨'}
                  </span>
                </span>
              )}
            </div>

            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/... 또는 https://www.facebook.com/... 또는 https://www.youtube.com/..."
              className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#0f9d58] outline-hidden font-mono"
              required
            />

            {detectedType === 'gdrive' ? (
              <div className="mt-2 p-2.5 bg-[#f0f9f4] border border-[#a2d8bc] rounded-md text-[11px] text-[#0f5132] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-start sm:items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58] shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <strong className="text-[#0f5132] block">구글 드라이브 사진 링크가 확인되었습니다!</strong>
                    <span className="text-[10px] text-[#3b6e51]">
                      파일 권한이 <strong>'링크가 있는 모든 사용자(뷰어)'</strong>로 설정되어 있어야 모든 방문자에게 사진이 정상 표시됩니다.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDriveHelpModal(true)}
                  className="px-2.5 py-1 bg-white hover:bg-[#0f9d58] text-[#0f5132] hover:text-white border border-[#0f9d58] rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                  title="구글 드라이브 공유 권한 공개 설정 방법 상세 가이드 열기"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>공개 권한 설정 가이드</span>
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-[#7a8e9c] mt-1">
                💡 <strong>구글 드라이브(Google Drive) 사진 링크</strong>, 페이스북 사진/영상, 유튜브 영상 등 어떤 주소든 구분 없이 자유롭게 붙여넣으세요.
              </p>
            )}
          </div>

          {/* Title & Album */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 스튜디오 촬영 비하인드 컷"
                className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#2b7294] outline-hidden"
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
                placeholder="예: 구글 드라이브 사진, 스튜디오 일상, 서울 스냅"
                className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#2b7294] outline-hidden"
              />
            </div>
          </div>

          {/* Thumbnail Preview & URL */}
          <div>
            <label className="block text-xs font-bold text-[#2a3f50] mb-1 flex items-center justify-between">
              <span>썸네일 / 대표 이미지 주소 (선택 또는 자동생성)</span>
              {thumbnailUrl && (
                <span className="text-[10px] text-emerald-600 font-medium">
                  ✓ 미리보기 이미지 생성 완료
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="구글 드라이브나 유튜브 링크는 썸네일이 자동 생성됩니다."
                className="flex-1 p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#2b7294] outline-hidden font-mono"
              />
              {thumbnailUrl && (
                <div className="w-14 h-10 rounded border border-[#bed2dc] overflow-hidden bg-gray-100 shrink-0 relative flex items-center justify-center">
                  <img
                    src={transformIfGoogleDriveUrl(thumbnailUrl)}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      handleGoogleDriveImageError(e.currentTarget, thumbnailUrl);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#2a3f50] mb-1">
              소개 및 스토리 기록 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="사진이나 영상에 얽힌 스토리나 단상을 자유롭게 기록해주세요."
              rows={2}
              className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#2b7294] outline-hidden resize-none leading-relaxed"
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
                placeholder="스냅, 풍경, 자연광, 비하인드"
                className="w-full p-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#2b7294] outline-hidden"
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
                className="px-5 py-2 bg-[#2b7294] hover:bg-[#205b77] text-white rounded text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                사진 등록 완료
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Google Drive Sharing Permission Guide Tooltip Modal */}
      <GoogleDrivePermissionTooltip
        isOpen={showDriveHelpModal}
        onClose={() => setShowDriveHelpModal(false)}
      />
    </div>
  );
};
