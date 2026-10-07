import React from 'react';
import {
  HardDrive,
  Users,
  Lock,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Copy,
  X,
  ShieldCheck,
  Eye,
  HelpCircle,
  ExternalLink,
  Check
} from 'lucide-react';

interface GoogleDrivePermissionTooltipProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDrivePermissionTooltip: React.FC<GoogleDrivePermissionTooltipProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-[#0f9d58] rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-5 flex flex-col gap-4 text-[#1a2f3f]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#e2edf2]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#e8f5e9] text-[#0f9d58] border border-[#a5d6a7] flex items-center justify-center shadow-xs shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-[#1f374a]">
                  구글 드라이브 사진 공유 권한 설정 가이드
                </h3>
                <span className="text-[10px] bg-[#0f9d58] text-white px-1.5 py-0.2 rounded font-bold">
                  필수 체크
                </span>
              </div>
              <p className="text-[11px] text-[#6d8494] mt-0.5">
                다른 방문자에게 사진이 정상 표시되려면 <strong>'링크가 있는 모든 사용자'</strong>로 공개되어야 합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#6d8494] hover:bg-[#e8f0f5] text-sm font-bold shrink-0 cursor-pointer transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Alert: 제한됨 vs 링크가 있는 모든 사용자 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Wrong setting */}
          <div className="p-2.5 rounded-lg border border-red-200 bg-red-50/70 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
              <Lock className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>❌ 제한됨 (사진 엑스박스)</span>
            </div>
            <p className="text-[10px] text-red-600 leading-relaxed">
              기본값인 '제한됨' 상태면 본인에게만 보이고 <strong>다른 방문자에게는 사진이 뜨지 않습니다.</strong>
            </p>
          </div>

          {/* Correct setting */}
          <div className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/80 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>✅ 링크가 있는 모든 사용자 (추천)</span>
            </div>
            <p className="text-[10px] text-emerald-700 leading-relaxed">
              공개 범위를 '링크가 있는 모든 사용자'로 설정해야 <strong>누구나 미니홈피에서 고화질로 감상</strong>할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Step-by-Step Instructions with Visual Mockups */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-[#1f4e79] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0f9d58]" />
            <span>구글 드라이브에서 30초 만에 권한 설정하는 방법</span>
          </span>

          {/* Step 1 */}
          <div className="p-3 bg-[#f8fafc] border border-[#d6e4ed] rounded-lg flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#1f374a]">
              <span className="w-5 h-5 rounded-full bg-[#0f9d58] text-white flex items-center justify-center text-[10px] shrink-0 font-mono">
                1
              </span>
              <span>구글 드라이브에서 사진 우클릭 후 [공유] 클릭</span>
            </div>
            <p className="text-[11px] text-[#557085] pl-6.5 leading-relaxed">
              Google Drive 웹 또는 앱에서 등록하고 싶은 사진 파일을 마우스 오른쪽 버튼으로 클릭한 뒤, 메뉴에서 <strong>[공유] ➔ [공유]</strong>를 선택합니다.
            </p>
          </div>

          {/* Step 2 (Core) */}
          <div className="p-3 bg-[#f0f9f4] border-2 border-[#76cca0] rounded-lg flex flex-col gap-2 text-xs shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#0f5132]">
                <span className="w-5 h-5 rounded-full bg-[#0f9d58] text-white flex items-center justify-center text-[10px] shrink-0 font-mono">
                  2
                </span>
                <span>'일반 액세스'를 '링크가 있는 모든 사용자'로 변경 (★핵심)</span>
              </div>
              <span className="text-[10px] bg-[#d1e7dd] text-[#0f5132] px-1.5 py-0.5 rounded font-bold">
                가장 중요
              </span>
            </div>

            {/* Visual simulation box of Google Drive dialog */}
            <div className="p-2 bg-white rounded border border-[#b8dfcb] text-[11px] flex flex-col gap-1.5 shadow-2xs pl-6.5 sm:pl-3">
              <div className="flex items-center justify-between text-[#2b4c39]">
                <span className="font-semibold text-[10px] text-[#5c806c]">일반 액세스 권한 드롭다운</span>
                <span className="text-[9px] bg-[#eef7f2] text-[#0f5132] px-1 rounded font-mono">권한: 뷰어(Viewer)</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-[#f5fbf8] border border-[#a2d8bc] rounded">
                <Globe className="w-4 h-4 text-[#0f9d58] shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-[#0f5132] block text-[11px]">링크가 있는 모든 사용자</span>
                  <span className="text-[9px] text-[#558269] block">인터넷에 연결된 링크가 있는 모든 사용자가 볼 수 있음</span>
                </div>
                <Check className="w-4 h-4 text-[#0f9d58] shrink-0" />
              </div>
            </div>

            <p className="text-[11px] text-[#2c5e44] pl-6.5 leading-relaxed">
              드롭다운을 클릭하여 <span className="underline font-bold">제한됨</span>에서 <strong>[링크가 있는 모든 사용자]</strong>로 바꾸고, 우측 권한은 <strong>[뷰어]</strong>로 설정합니다.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3 bg-[#f8fafc] border border-[#d6e4ed] rounded-lg flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#1f374a]">
              <span className="w-5 h-5 rounded-full bg-[#0f9d58] text-white flex items-center justify-center text-[10px] shrink-0 font-mono">
                3
              </span>
              <span>좌측 하단 [링크 복사] 클릭 후 입력창에 붙여넣기</span>
            </div>
            <p className="text-[11px] text-[#557085] pl-6.5 leading-relaxed">
              공유 창 좌측 하단의 <strong>[링크 복사]</strong> 버튼을 누른 후, 본 미니홈피 사진 업로드 창의 링크 주소란에 <strong>Ctrl + V (붙여넣기)</strong> 하시면 됩니다.
            </p>
            <div className="pl-6.5 text-[10px] text-[#6b8598] font-mono bg-white p-1.5 rounded border border-[#dbe6ee]">
              예시: https://drive.google.com/file/d/1BxiMVs.../view?usp=sharing
            </div>
          </div>
        </div>

        {/* Tip & FAQ Box */}
        <div className="p-3 bg-[#fffbeb] border border-[#fde68a] rounded-lg text-xs text-[#92400e] flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>알아두면 유용한 팁 &amp; 주의사항</span>
          </div>
          <ul className="list-disc list-inside text-[11px] text-[#a16207] space-y-1 leading-relaxed">
            <li>
              <strong>회사/학교(Google Workspace) 계정</strong>의 경우 조직 외부 공유가 관리자 정책에 의해 차단되어 있을 수 있습니다. 이 경우 개인 구글 계정(@gmail.com)을 이용하시면 제한 없이 공유됩니다.
            </li>
            <li>
              구글 드라이브 원본 파일이 삭제되거나 휴지통으로 이동하면 미니홈피에서도 사진이 나오지 않으므로, 원본 파일은 드라이브에 안전하게 보관해 두세요.
            </li>
            <li>
              링크를 붙여넣으면 본 시스템이 자동으로 고화질 직링크(CDN) 주소로 변환하여 실시간 썸네일을 생성합니다.
            </li>
          </ul>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e2edf2]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0f9d58] hover:bg-[#0c7a45] text-white rounded text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>가이드 확인 완료 (닫기)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
