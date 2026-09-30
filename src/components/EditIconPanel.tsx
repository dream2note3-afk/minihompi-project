import React, { useState, useRef } from 'react';
import { ProfileConfig, UserSession } from '../types';
import { ProfileAvatarVisual } from './ProfileAvatarVisual';
import { INITIAL_PROFILE_CONFIG } from '../data/initialData';
import { Sparkles, Check, RotateCcw, Camera, Palette, Tag, MessageSquare, AlertCircle, ArrowLeft, Upload, FileImage, Trash2, FolderUp } from 'lucide-react';

interface EditIconPanelProps {
  currentConfig: ProfileConfig;
  onSaveConfig: (newConfig: ProfileConfig) => void;
  session: UserSession | null;
  onOpenAdminLogin: () => void;
  onReturnToGallery: () => void;
}

const AVATAR_PRESETS = [
  {
    type: 'preset_director' as const,
    label: '스튜디오 디렉터',
    desc: '클래식 레트로 디렉터 아바타'
  },
  {
    type: 'preset_camera' as const,
    label: '빈티지 필름 카메라',
    desc: '중형 아날로그 카메라 & 렌즈'
  },
  {
    type: 'preset_cinema' as const,
    label: '시네마 릴 & 슬레이트',
    desc: '영화 연출 & 슬레이트 테마'
  },
  {
    type: 'preset_atelier' as const,
    label: '아틀리에 암실 작업실',
    desc: '사진 인화 & 포토그래퍼 작업실'
  }
];

const STATUS_LAMPS = [
  { color: '#e63946', label: '빨간색 (ON)', text: '현재 활동 중 (ON)' },
  { color: '#10b981', label: '초록색 (LIVE)', text: '촬영/녹화 중 (LIVE)' },
  { color: '#f59e0b', label: '주황색 (BUSY)', text: '영상 편집 중 (BUSY)' },
  { color: '#8b5cf6', label: '보라색 (IDEA)', text: '영감 충전 중 (IDEA)' },
  { color: '#3b82f6', label: '파란색 (ONLINE)', text: '미니홈피 접속 중' }
];

const BADGE_PRESETS = ['DIRECTOR', 'FILMMAKER', 'PHOTOGRAPHER', 'CREATOR', 'PRODUCER'];

export const EditIconPanel: React.FC<EditIconPanelProps> = ({
  currentConfig,
  onSaveConfig,
  session,
  onOpenAdminLogin,
  onReturnToGallery
}) => {
  const [formData, setFormData] = useState<ProfileConfig>({ ...currentConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAndSetImageFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(JPG, PNG, GIF, WebP 등)만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      // Optimize image dimensions for crispness & fast localStorage
      const img = new Image();
      img.onload = () => {
        const maxDim = 500;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setFormData((prev) => ({
            ...prev,
            avatarType: 'uploaded_file',
            uploadedFileDataUrl: optimizedDataUrl,
            uploadedFileName: file.name
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            avatarType: 'uploaded_file',
            uploadedFileDataUrl: dataUrl,
            uploadedFileName: file.name
          }));
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSetImageFile(file);
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
      processAndSetImageFile(file);
    }
  };

  const handleRemoveUploadedFile = () => {
    setFormData((prev) => ({
      ...prev,
      uploadedFileDataUrl: undefined,
      uploadedFileName: undefined,
      avatarType: 'preset_director'
    }));
  };

  const handlePresetSelect = (type: ProfileConfig['avatarType']) => {
    setFormData((prev) => ({
      ...prev,
      avatarType: type
    }));
  };

  const handleStatusColorSelect = (color: string, defaultText: string) => {
    setFormData((prev) => ({
      ...prev,
      statusDotColor: color,
      statusDotTitle: defaultText
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleResetToDefault = () => {
    if (confirm('아이콘 설정을 초기 기본값으로 되돌리시겠습니까?')) {
      setFormData({ ...INITIAL_PROFILE_CONFIG });
      onSaveConfig({ ...INITIAL_PROFILE_CONFIG });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-[#bed2dc] rounded-lg p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e2edf2] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#ff7e39] text-white flex items-center justify-center shadow-xs">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1a2f3f] flex items-center gap-1.5">
              <span>권용우의 아이콘 수정 (Edit Profile Icon)</span>
              <span className="text-[10px] text-white bg-[#ff7e39] px-1.5 py-0.5 rounded font-medium">
                Profile Customizer
              </span>
            </h2>
            <p className="text-[11px] text-[#6d8494]">
              미니홈피 좌측 사이드바에 표시되는 프로필 사진, 아이콘 이름, 상태 마크를 자유롭게 편집합니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReturnToGallery}
          className="text-xs text-[#486578] hover:text-[#1a2f3f] bg-[#f0f6fa] border border-[#c6d9e4] hover:bg-[#e4eff5] px-2.5 py-1 rounded flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>갤러리로 돌아가기</span>
        </button>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-xs text-green-700 flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          <span className="font-bold">
            아이콘 설정이 성공적으로 저장되었습니다! 좌측 사이드바에 즉시 적용되었습니다.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Main Grid: Form Inputs (Left) & Real-time Live Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Form Controls Column (2 spans) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* 1. Icon Title Setting */}
            <div className="bg-[#f8fafb] border border-[#d6e3ea] rounded-md p-3">
              <label className="block text-xs font-bold text-[#1f3a52] mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#ff7e39]" />
                <span>아이콘 타이틀 명칭</span>
                <span className="text-[11px] text-[#718898] font-normal">(사이드바 이미지 아래 표시)</span>
              </label>
              <input
                type="text"
                value={formData.iconTitle}
                onChange={(e) => setFormData({ ...formData, iconTitle: e.target.value })}
                placeholder="예: 권용우의 아이콘"
                className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#ff7e39] outline-hidden font-bold"
                required
              />
            </div>

            {/* 2. Avatar Visual Selection */}
            <div className="bg-[#f8fafb] border border-[#d6e3ea] rounded-md p-3">
              <label className="block text-xs font-bold text-[#1f3a52] mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-[#ff7e39]" />
                  <span>프로필 사진 &amp; 아이콘 비주얼 선택</span>
                </span>
                <span className="text-[10px] text-[#718898]">화일 직접 업로드 또는 프리셋</span>
              </label>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                className="hidden"
              />

              {/* A. DIRECT LOCAL FILE UPLOAD SECTION */}
              <div className="mb-3 p-3 bg-white border-2 border-dashed border-[#b8ced8] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="avatarType"
                      checked={formData.avatarType === 'uploaded_file'}
                      onChange={() => {
                        if (formData.uploadedFileDataUrl) {
                          handlePresetSelect('uploaded_file');
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                      className="accent-[#ff7e39]"
                    />
                    <span className="text-xs font-bold text-[#1a2f3f] flex items-center gap-1.5">
                      <FolderUp className="w-4 h-4 text-[#ff7e39]" />
                      <span>내 컴퓨터에서 사진 화일로 직접 수정 / 등록</span>
                    </span>
                  </label>

                  {formData.avatarType === 'uploaded_file' && formData.uploadedFileDataUrl && (
                    <span className="bg-[#eafaf1] text-[#1b7943] text-[10px] font-bold px-2 py-0.5 rounded border border-[#a3e4c0]">
                      현재 화일 적용중
                    </span>
                  )}
                </div>

                {formData.uploadedFileDataUrl ? (
                  /* Uploaded File Summary & Change */
                  <div className="flex items-center justify-between gap-3 p-2 bg-[#f0f6fa] border border-[#cde0e9] rounded-md">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-12 rounded overflow-hidden border border-[#b8ccd6] bg-black shrink-0 shadow-2xs">
                        <img
                          src={formData.uploadedFileDataUrl}
                          alt="업로드된 프로필 사진"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1f374a] truncate flex items-center gap-1">
                          <FileImage className="w-3.5 h-3.5 text-[#2b7294] shrink-0" />
                          <span className="truncate">{formData.uploadedFileName || '내 프로필 사진 화일.jpg'}</span>
                        </div>
                        <span className="text-[10px] text-[#6d8494] block mt-0.5">
                          화일 업로드 완료 · 자동 해상도 최적화 적용됨
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-white hover:bg-[#e4eff5] text-[#2b7294] border border-[#bed2dc] rounded text-[11px] font-medium transition-colors"
                      >
                        화일 변경
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveUploadedFile}
                        className="p-1 text-[#8fa6b5] hover:text-red-600 rounded transition-colors"
                        title="업로드된 화일 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop Upload Zone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`py-4 px-3 flex flex-col items-center justify-center text-center rounded-md border border-dashed cursor-pointer transition-all ${
                      isDragging
                        ? 'bg-[#fff5ee] border-[#ff7e39] scale-[1.01]'
                        : 'bg-[#fafcfd] border-[#c8dbe4] hover:bg-[#f2f7fa] hover:border-[#2b7294]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#e8f1f5] text-[#2b7294] flex items-center justify-center mb-1.5 shadow-2xs">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#1e3442]">
                      여기를 클릭하여 사진 화일을 선택하세요
                    </span>
                    <span className="text-[10px] text-[#718898] mt-0.5">
                      또는 내 컴퓨터의 사진 파일을 이곳으로 드래그 앤 드롭 (JPG, PNG, GIF, WebP)
                    </span>
                  </div>
                )}
              </div>

              {/* B. Preset Cards */}
              <span className="text-[11px] font-bold text-[#3d5668] block mb-1.5">
                또는 레트로 스튜디오 기본 아바타 선택:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = formData.avatarType === preset.type;
                  return (
                    <button
                      type="button"
                      key={preset.type}
                      onClick={() => handlePresetSelect(preset.type)}
                      className={`p-2 rounded-md border text-left flex flex-col items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-[#fff5ee] border-[#ff7e39] shadow-xs ring-1 ring-[#ff7e39]'
                          : 'bg-white border-[#ccdbe2] hover:border-[#a0b6bf] hover:bg-[#fafcfd]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded overflow-hidden border border-[#d0dbe1] shadow-2xs">
                        <ProfileAvatarVisual config={{ ...formData, avatarType: preset.type }} />
                      </div>
                      <span className="text-[11px] font-bold text-[#2a3f50] text-center line-clamp-1">
                        {preset.label}
                      </span>
                      <span className="text-[9px] text-[#718898] text-center line-clamp-1">
                        {preset.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* C. Custom Image URL Option */}
              <div className="pt-2 border-t border-dashed border-[#ccdbe2]">
                <label className="flex items-center gap-2 mb-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="avatarType"
                    checked={formData.avatarType === 'custom_url'}
                    onChange={() => handlePresetSelect('custom_url')}
                    className="accent-[#ff7e39]"
                  />
                  <span className="text-xs font-bold text-[#2a3f50]">
                    웹 이미지 URL 직접 입력 (페이스북/웹 사진 주소)
                  </span>
                </label>

                {formData.avatarType === 'custom_url' && (
                  <div className="mt-1 pl-5">
                    <input
                      type="url"
                      value={formData.customImageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, customImageUrl: e.target.value })}
                      placeholder="https://... (페이스북 또는 프로필 사진 링크)"
                      className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#ff7e39] outline-hidden font-mono"
                    />
                    <p className="text-[10px] text-[#718898] mt-1">
                      * 본인의 페이스북 프로필 사진 또는 고화질 웹 이미지 링크를 입력하면 실시간으로 교체됩니다.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Small Button Mark & Status Settings (User prompt detail: 이름 '권용우의 아이콘'와 작은 빨간색 버튼 마크) */}
            <div className="bg-[#f8fafb] border border-[#d6e3ea] rounded-md p-3">
              <label className="block text-xs font-bold text-[#1f3a52] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block animate-pulse shadow-xs"
                    style={{ backgroundColor: formData.statusDotColor }}
                  />
                  <span>작은 상태 램프 버튼 마크 (활동 램프)</span>
                </span>
                <span className="text-[10px] text-[#718898]">원하는 색상 클릭</span>
              </label>

              {/* Color Selectors */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {STATUS_LAMPS.map((lamp) => {
                  const isSelected = formData.statusDotColor === lamp.color;
                  return (
                    <button
                      type="button"
                      key={lamp.color}
                      onClick={() => handleStatusColorSelect(lamp.color, lamp.text)}
                      className={`px-2 py-1 rounded text-xs border flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-white border-[#2b7294] shadow-xs font-bold'
                          : 'bg-white border-[#d2e0e8] hover:bg-[#f1f6f9] text-[#556e80]'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: lamp.color }}
                      />
                      <span className="text-[11px]">{lamp.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Status Hover Tooltip */}
              <div>
                <label className="block text-[11px] text-[#556e80] mb-0.5">
                  버튼 마크 마우스 호버 시 상태 문구 (Tooltip)
                </label>
                <input
                  type="text"
                  value={formData.statusDotTitle}
                  onChange={(e) => setFormData({ ...formData, statusDotTitle: e.target.value })}
                  placeholder="예: 현재 활동 중 (ON)"
                  className="w-full p-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#ff7e39] outline-hidden"
                />
              </div>
            </div>

            {/* 4. Role Badge Text & Welcome Introduction */}
            <div className="bg-[#f8fafb] border border-[#d6e3ea] rounded-md p-3">
              <label className="block text-xs font-bold text-[#1f3a52] mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-[#ff7e39]" />
                <span>스튜디오 소개글 및 역할 뱃지</span>
              </label>

              {/* Role badge selection */}
              <div className="mb-2">
                <span className="text-[11px] text-[#556e80] block mb-1">
                  사진 우측 하단 역할 뱃지:
                </span>
                <div className="flex flex-wrap gap-1 mb-1">
                  {BADGE_PRESETS.map((badge) => (
                    <button
                      type="button"
                      key={badge}
                      onClick={() => setFormData({ ...formData, roleBadgeText: badge })}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                        formData.roleBadgeText === badge
                          ? 'bg-[#1a2f3f] text-white border-[#1a2f3f]'
                          : 'bg-white text-[#4f6778] border-[#cddce4] hover:bg-[#eaf1f5]'
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.roleBadgeText}
                  onChange={(e) => setFormData({ ...formData, roleBadgeText: e.target.value.toUpperCase() })}
                  placeholder="직접 입력 (예: DIRECTOR)"
                  maxLength={15}
                  className="w-40 p-1 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] font-mono"
                />
              </div>

              {/* Main Welcome Message */}
              <div className="mb-2">
                <label className="block text-[11px] text-[#556e80] mb-0.5">
                  메인 환영 인사말 (기본: “권용우의 스튜디오 방문을 환영합니다!“)
                </label>
                <input
                  type="text"
                  value={formData.welcomeMessage}
                  onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                  placeholder="“권용우의 스튜디오 방문을 환영합니다!“"
                  className="w-full p-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#ff7e39] outline-hidden font-medium"
                />
              </div>

              {/* Sub description */}
              <div>
                <label className="block text-[11px] text-[#556e80] mb-0.5">
                  서브 소개 문구
                </label>
                <textarea
                  value={formData.subMessage}
                  onChange={(e) => setFormData({ ...formData, subMessage: e.target.value })}
                  rows={2}
                  className="w-full p-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#ff7e39] outline-hidden resize-none leading-relaxed"
                />
              </div>
            </div>

          </div>

          {/* Real-Time Live Preview Column (1 span) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1f3a52] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#ff7e39]" />
                실시간 사이드바 미리보기
              </span>
              <span className="text-[10px] text-[#718898]">Live Preview</span>
            </div>

            {/* Sidebar Preview Box */}
            <div className="bg-white border-2 border-dashed border-[#b8ced8] rounded-lg p-3 flex flex-col items-center shadow-xs">
              {/* Profile Image with frame */}
              <div className="relative w-full aspect-square max-w-[160px] rounded-md overflow-hidden border border-[#9dbbca] shadow-inner bg-[#eaf1f5]">
                <ProfileAvatarVisual config={formData} />

                {/* Badge over photo */}
                <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                  <Camera className="w-2.5 h-2.5 text-[#ff9f43]" />
                  <span>{formData.roleBadgeText || 'DIRECTOR'}</span>
                </div>
              </div>

              {/* Name: '권용우의 아이콘' + small red button mark */}
              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center">
                <span className="text-xs font-bold text-[#1a2f3f] tracking-tight">
                  {formData.iconTitle || '권용우의 아이콘'}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-xs inline-block animate-pulse"
                  style={{ backgroundColor: formData.statusDotColor }}
                  title={formData.statusDotTitle}
                />
              </div>

              {/* Status title note */}
              <span className="text-[9px] text-[#7891a0] font-mono mt-0.5">
                상태: {formData.statusDotTitle}
              </span>

              {/* Korean introduction */}
              <div className="mt-2 w-full p-2 bg-[#f8fafb] border border-[#d9e5ec] rounded text-center">
                <p className="text-xs leading-relaxed text-[#2c3e50] font-medium break-keep">
                  {formData.welcomeMessage}
                </p>
                <p className="mt-1 text-[10px] text-[#6d8494] break-keep">
                  {formData.subMessage}
                </p>
              </div>

              <div className="mt-3 p-2 bg-[#f0f6fa] rounded text-[10px] text-[#557183] text-center w-full">
                이 모습 그대로 좌측 사이드바에 실시간 반영됩니다.
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#e2edf2] flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-1.5 bg-[#f7f9fa] border border-[#bed2dc] hover:bg-[#eaf1f5] text-[#556e80] rounded text-xs flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>기본 아이콘으로 초기화</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReturnToGallery}
              className="px-3.5 py-1.5 bg-white border border-[#bed2dc] hover:bg-[#edf3f6] text-[#4d6676] rounded text-xs font-medium transition-colors"
            >
              닫기
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-[#ff6b2b] hover:bg-[#ea5616] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>권용우의 아이콘 수정 저장하기</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
