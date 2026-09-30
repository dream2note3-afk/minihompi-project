import React, { useState } from 'react';
import { MediaItem } from '../types';
import { Youtube, Facebook, Play, Heart, Eye, ExternalLink, Trash2, Pin, Sparkles, Search, Film, Image as ImageIcon } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../utils/youtube';

interface MediaGalleryProps {
  items: MediaItem[];
  onToggleLike: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onTogglePin: (id: string) => void;
  isAdmin: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  onToggleLike,
  onDeleteItem,
  onTogglePin,
  isAdmin
}) => {
  const [filterType, setFilterType] = useState<'all' | 'youtube' | 'facebook'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<MediaItem | null>(null);

  const filteredItems = items.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-[#f4f8fa] p-2 rounded-lg border border-[#cde0e9]">
        {/* Segmented Filter Buttons */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-[#c4d7e2]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
              filterType === 'all'
                ? 'bg-[#2b7294] text-white shadow-2xs font-bold'
                : 'text-[#506c7e] hover:bg-[#eaf2f6]'
            }`}
          >
            전체 ({items.length})
          </button>
          <button
            onClick={() => setFilterType('youtube')}
            className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all ${
              filterType === 'youtube'
                ? 'bg-red-600 text-white shadow-2xs font-bold'
                : 'text-[#506c7e] hover:bg-[#eaf2f6]'
            }`}
          >
            <Youtube className="w-3 h-3" />
            <span>유튜브 영상</span>
          </button>
          <button
            onClick={() => setFilterType('facebook')}
            className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all ${
              filterType === 'facebook'
                ? 'bg-blue-600 text-white shadow-2xs font-bold'
                : 'text-[#506c7e] hover:bg-[#eaf2f6]'
            }`}
          >
            <Facebook className="w-3 h-3" />
            <span>페이스북 사진</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-[200px]">
          <Search className="w-3 h-3 text-[#7992a2] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목, 태그 검색..."
            className="w-full pl-7 pr-2 py-1 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] placeholder:text-[#9bb1be] outline-hidden focus:border-[#2b7294]"
          />
        </div>
      </div>

      {/* Media Grid Cards */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center bg-[#fdfdfd] border border-dashed border-[#ccdbe2] rounded-lg">
          <p className="text-xs text-[#6e8594]">
            검색 결과 또는 등록된 미디어가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredItems.map((item) => {
            const isYt = item.type === 'youtube';

            return (
              <div
                key={item.id}
                className="group bg-white border border-[#cddfe7] rounded-lg overflow-hidden shadow-2xs hover:shadow-md hover:border-[#adc8d6] transition-all flex flex-col relative"
              >
                {/* Pinned Ribbon */}
                {item.pinned && (
                  <div className="absolute top-2 left-2 z-10 bg-[#ff6b2b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>대표작</span>
                  </div>
                )}

                {/* Thumbnail Area */}
                <div
                  className="relative aspect-video bg-[#2c3e50] overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (isYt) {
                      setSelectedVideo(item);
                    } else {
                      setSelectedPhoto(item);
                    }
                  }}
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback visual
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Fallback styling block behind image in case image fails */}
                  <div className="absolute inset-0 bg-linear-to-tr from-[#1b2b3a] to-[#3a5874] flex items-center justify-center -z-1">
                    {isYt ? (
                      <Film className="w-8 h-8 text-white/40" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-white/40" />
                    )}
                  </div>

                  {/* Overlay Play / Expand Icon */}
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    {isYt ? (
                      <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Facebook className="w-4 h-4 fill-current" />
                      </div>
                    )}
                  </div>

                  {/* Type Badge & Album */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    {item.album && (
                      <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-xs">
                        {item.album}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white flex items-center gap-1 shadow-xs ${
                        isYt ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                    >
                      {isYt ? 'YouTube 영상' : 'Facebook 사진'}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1f374a] line-clamp-1 group-hover:text-[#2b7294] transition-colors">
                      {item.title}
                    </h4>

                    <p className="mt-1 text-[11px] text-[#556e80] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-[#42647c] bg-[#eef4f7] px-1.5 py-0.2 rounded border border-[#d6e3ea]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Metadata & Actions */}
                  <div className="mt-3 pt-2 border-t border-[#e2edf2] flex items-center justify-between text-[11px] text-[#6d8494]">
                    <div className="flex items-center gap-2 font-mono">
                      <span>{item.date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3" />
                        {item.views.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Like button */}
                      <button
                        onClick={() => onToggleLike(item.id)}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#fff0f3] text-[#e63946] border border-[#ffccd5] hover:bg-[#ffe3e8] active:scale-95 transition-all"
                        title="좋아요"
                      >
                        <Heart className="w-3 h-3 fill-current" />
                        <span className="font-mono text-[10px] font-bold">{item.likes}</span>
                      </button>

                      {/* Direct External Link */}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-1 rounded text-[#597587] hover:text-[#1d3546] hover:bg-[#e8f1f5] transition-colors"
                        title="원본 링크 열기"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {/* Admin Tools: Pin & Delete */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onTogglePin(item.id)}
                            className={`p-1 rounded transition-colors ${
                              item.pinned ? 'text-[#ff6b2b] bg-[#fff2ec]' : 'text-[#8da4b3] hover:text-[#ff6b2b]'
                            }`}
                            title={item.pinned ? '대표작 해제' : '대표작 지정'}
                          >
                            <Pin className="w-3 h-3 fill-current" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1 rounded text-[#8da4b3] hover:text-red-600 transition-colors"
                            title="삭제 (관리자)"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* YouTube Modal Player */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white border-2 border-[#ff6b2b] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#f7fafc] px-3.5 py-2.5 border-b border-[#d8e5ec] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded">
                  YouTube 플레이어
                </span>
                <h3 className="text-xs font-bold text-[#1f374a] truncate">
                  {selectedVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[#6d8494] hover:bg-[#e4eff4] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Embedded YouTube Iframe */}
            <div className="relative aspect-video bg-black">
              {selectedVideo.youtubeId ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.youtubeId)}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center">
                  <p className="text-sm font-bold">외부 영상 링크</p>
                  <a
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    YouTube에서 시청하기
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#fafcfd] text-xs text-[#486375] flex items-center justify-between">
              <p className="text-[11px] truncate flex-1 mr-2">{selectedVideo.description}</p>
              <a
                href={selectedVideo.url}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-white border border-[#b8ced8] text-[#2b7294] font-medium rounded text-[11px] flex items-center gap-1 hover:bg-[#e8f2f6] shrink-0"
              >
                <span>새 탭에서 열기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Photo Viewer Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white border-2 border-[#1877f2] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#f0f4fa] px-3.5 py-2.5 border-b border-[#c8d9e6] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 bg-[#1877f2] text-white text-[11px] font-bold rounded flex items-center gap-1">
                  <Facebook className="w-3 h-3 fill-current" />
                  페이스북 사진
                </span>
                <h3 className="text-xs font-bold text-[#1f374a] truncate">
                  {selectedPhoto.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[#6d8494] hover:bg-[#e4eff4] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* High-res Image preview */}
            <div className="bg-[#0f172a] flex items-center justify-center min-h-[260px] max-h-[60vh] overflow-hidden">
              <img
                src={selectedPhoto.thumbnailUrl}
                alt={selectedPhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            {/* Photo description and link to Facebook */}
            <div className="p-3.5 bg-white border-t border-[#e2edf2] flex flex-col gap-2">
              <p className="text-xs text-[#2b4152] leading-relaxed">
                {selectedPhoto.description}
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px] text-[#6d8494]">
                <div className="flex items-center gap-2">
                  <span>등록일: {selectedPhoto.date}</span>
                  <span>·</span>
                  <span>좋아요 {selectedPhoto.likes}개</span>
                </div>
                <a
                  href={selectedPhoto.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-[#1877f2] hover:bg-[#1567d3] text-white font-medium rounded text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Facebook className="w-3 h-3 fill-current" />
                  <span>페이스북 원본 게시물 보기</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
