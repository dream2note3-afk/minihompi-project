import React, { useState, useRef, useEffect } from 'react';
import { bgmEngine, BgmTrack } from '../utils/audioSynth';
import { Music, Upload, Play, Pause, Trash2, Check, Sparkles, FolderUp, FileAudio, X, Disc3 } from 'lucide-react';

interface BgmManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BgmManagerModal: React.FC<BgmManagerModalProps> = ({ isOpen, onClose }) => {
  const [playlist, setPlaylist] = useState<BgmTrack[]>(bgmEngine.getPlaylist());
  const [currentTrackIndex, setCurrentTrackIndex] = useState(bgmEngine.getTrackIndex());
  const [isPlaying, setIsPlaying] = useState(bgmEngine.getIsPlaying());
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [artistInput, setArtistInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = bgmEngine.subscribe(() => {
      setPlaylist(bgmEngine.getPlaylist());
      setCurrentTrackIndex(bgmEngine.getTrackIndex());
      setIsPlaying(bgmEngine.getIsPlaying());
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      alert('오디오 파일(MP3, WAV, OGG, M4A, FLAC 등)만 선택할 수 있습니다.');
      return;
    }

    setSelectedFile(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    setTitleInput(cleanName);
    setArtistInput('권용우 스튜디오 (My BGM)');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await bgmEngine.addCustomAudioTrack(selectedFile, titleInput, artistInput);
      setSuccessMsg(`"${titleInput}" 배경음악이 성공적으로 등록되어 재생을 시작했습니다!`);
      setSelectedFile(null);
      setTitleInput('');
      setArtistInput('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      alert('음악 파일 처리 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCustomTrack = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 배경음악을 목록에서 삭제하시겠습니까?')) {
      await bgmEngine.removeCustomAudioTrack(id);
    }
  };

  const customTracks = playlist.filter((t) => t.isCustom);
  const builtinTracks = playlist.filter((t) => !t.isCustom);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-[#2b7294] rounded-xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#f2f7fa] px-4 py-3 border-b border-[#c8dbe4] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#ff6b2b] text-white flex items-center justify-center shadow-xs">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1a2f3f] flex items-center gap-1.5">
                <span>배경음악(BGM) 설정 및 직접 올리기</span>
                <span className="text-[10px] text-white bg-[#2b7294] px-1.5 py-0.2 rounded font-medium">
                  BGM Studio
                </span>
              </h3>
              <p className="text-[11px] text-[#6d8494]">
                내 컴퓨터의 MP3/오디오 파일을 올려 미니홈피 배경음악으로 설정할 수 있습니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#6d8494] hover:bg-[#e2edf3] hover:text-[#1e3442] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4 text-[#333333]">
          
          {/* Notification banner */}
          {successMsg && (
            <div className="p-2.5 bg-green-50 border border-green-200 rounded-md text-xs text-green-700 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
            className="hidden"
          />

          {/* 1. Upload Form Box */}
          <div className="bg-[#f9fafc] border border-[#cbdce5] rounded-lg p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1f3a52] flex items-center gap-1.5">
                <FolderUp className="w-4 h-4 text-[#ff6b2b]" />
                <span>내 컴퓨터에서 음악 파일 직접 올리기 (MP3, WAV, M4A)</span>
              </span>
              <span className="text-[10px] text-[#718898]">브라우저 영구 보존</span>
            </div>

            {!selectedFile ? (
              /* Dropzone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`py-5 px-4 flex flex-col items-center justify-center text-center rounded-md border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? 'bg-[#fff5ee] border-[#ff6b2b] scale-[1.01]'
                    : 'bg-white border-[#bcd0db] hover:bg-[#f2f7fa] hover:border-[#2b7294]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#eaf2f6] text-[#2b7294] flex items-center justify-center mb-1.5 shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#1e3442]">
                  클릭하여 내 음악 파일 선택하기
                </span>
                <span className="text-[10px] text-[#718898] mt-0.5">
                  또는 MP3/WAV/M4A/OGG 오디오 파일을 이곳으로 드래그 앤 드롭
                </span>
              </div>
            ) : (
              /* Upload Form with file selected */
              <form onSubmit={handleUploadSubmit} className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between p-2 bg-[#eef5f8] border border-[#bcd0db] rounded">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileAudio className="w-4 h-4 text-[#2b7294] shrink-0" />
                    <span className="text-xs font-bold text-[#1f374a] truncate">
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] text-[#718898] font-mono shrink-0">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-red-500 hover:text-red-700 px-1 py-0.5"
                  >
                    취소
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2a3f50] mb-0.5">
                      곡 제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      placeholder="곡 제목 입력"
                      className="w-full p-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#ff6b2b] outline-hidden font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2a3f50] mb-0.5">
                      아티스트명
                    </label>
                    <input
                      type="text"
                      value={artistInput}
                      onChange={(e) => setArtistInput(e.target.value)}
                      placeholder="아티스트 또는 나의 스튜디오"
                      className="w-full p-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#ff6b2b] outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="px-3 py-1.5 bg-white border border-[#bed2dc] text-[#556e80] rounded text-xs"
                  >
                    다시 선택
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !titleInput.trim()}
                    className="px-4 py-1.5 bg-[#ff6b2b] hover:bg-[#ea5616] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:bg-[#d0d0d0] transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? '등록 처리 중...' : '배경음악 등록 & 즉시 재생'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 2. Playlist Section */}
          <div className="flex flex-col gap-3">
            
            {/* Custom User Tracks */}
            {customTracks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#2b7294] flex items-center gap-1">
                    <Disc3 className="w-3.5 h-3.5" />
                    <span>직접 올린 나의 배경음악 ({customTracks.length})</span>
                  </span>
                  <span className="text-[10px] text-[#718898]">클릭 시 즉시 재생</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {customTracks.map((track) => {
                    const globalIdx = playlist.findIndex((t) => t.id === track.id);
                    const isCurrent = globalIdx === currentTrackIndex;

                    return (
                      <div
                        key={track.id}
                        onClick={() => bgmEngine.selectTrack(globalIdx)}
                        className={`p-2 rounded-md border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-[#fff5ee] border-[#ff7e39] shadow-xs'
                            : 'bg-white border-[#d2e0e8] hover:bg-[#f6fafc]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isCurrent) {
                                bgmEngine.togglePlay();
                              } else {
                                bgmEngine.selectTrack(globalIdx);
                              }
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                              isCurrent && isPlaying ? 'bg-[#ff6b2b]' : 'bg-[#2b7294]'
                            }`}
                          >
                            {isCurrent && isPlaying ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#1f374a] truncate flex items-center gap-1.5">
                              <span className="truncate">{track.title}</span>
                              <span className="text-[9px] bg-[#e3eff6] text-[#245874] px-1.5 py-0.2 rounded font-mono shrink-0">
                                MY BGM
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] text-[#ff6b2b] font-bold flex items-center gap-0.5 animate-pulse shrink-0">
                                  ● 재생중
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#6d8494] truncate block">
                              {track.artist} · {track.fileName}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomTrack(track.id, e)}
                          className="p-1.5 text-[#8fa6b5] hover:text-red-600 rounded transition-colors shrink-0"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Built-in Classic Cyworld Tracks */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#495e6d] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff7e39]" />
                  <span>싸이월드 감성 레트로 명곡 BGM 프리셋</span>
                </span>
                <span className="text-[10px] text-[#718898]">레트로 신디사이저 멜로디</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {builtinTracks.map((track) => {
                  const globalIdx = playlist.findIndex((t) => t.id === track.id);
                  const isCurrent = globalIdx === currentTrackIndex;

                  return (
                    <div
                      key={track.id}
                      onClick={() => bgmEngine.selectTrack(globalIdx)}
                      className={`p-2 rounded-md border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#fff5ee] border-[#ff7e39] shadow-xs'
                          : 'bg-white border-[#d2e0e8] hover:bg-[#f6fafc]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrent) {
                              bgmEngine.togglePlay();
                            } else {
                              bgmEngine.selectTrack(globalIdx);
                            }
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                            isCurrent && isPlaying ? 'bg-[#ff6b2b]' : 'bg-[#5c7382]'
                          }`}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#1f374a] truncate flex items-center gap-1.5">
                            <span className="truncate">{track.title}</span>
                            {isCurrent && (
                              <span className="text-[10px] text-[#ff6b2b] font-bold flex items-center gap-0.5 animate-pulse shrink-0">
                                ● 재생중
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#6d8494] truncate block">
                            {track.artist}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-[#8aa0ae] font-mono shrink-0">
                        CLASSIC
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#fafcfd] border-t border-[#e2edf2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[#526c7e]">
            <Music className="w-3.5 h-3.5 text-[#ff6b2b]" />
            <span className="font-bold">현재 BGM:</span>
            <span className="truncate max-w-[200px] text-[#1f374a]">
              {bgmEngine.getCurrentTrack()?.title}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2b7294] hover:bg-[#205b77] text-white rounded text-xs font-bold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
