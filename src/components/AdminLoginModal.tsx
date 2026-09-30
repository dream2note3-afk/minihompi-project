import React, { useState } from 'react';
import { UserSession } from '../types';
import { ShieldCheck, Mail, Key, CheckCircle, LogOut, Lock, AlertCircle, Award } from 'lucide-react';

interface AdminLoginProps {
  session: UserSession | null;
  onLogin: (email: string) => boolean;
  onLogout: () => void;
  onClose: () => void;
  onResetData: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginProps> = ({
  session,
  onLogin,
  onLogout,
  onClose,
  onResetData
}) => {
  const [emailInput, setEmailInput] = useState('dream2note3@gmail.com');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const ADMIN_EMAIL = 'dream2note3@gmail.com';

  const handleQuickAdminLogin = () => {
    const success = onLogin(ADMIN_EMAIL);
    if (success) {
      setSuccessMsg(`관리자 (${ADMIN_EMAIL})로 로그인되었습니다! 모든 권한이 활성화됩니다.`);
      setErrorMsg('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const email = emailInput.trim();
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      onLogin(email);
      setSuccessMsg(`관리자 (${email})로 인증되었습니다.`);
      setErrorMsg('');
    } else {
      onLogin(email);
      setSuccessMsg(`일반 사용자 (${email})로 로그인되었습니다. 관리자 권한은 ${ADMIN_EMAIL} 계정에만 부여됩니다.`);
      setErrorMsg('');
    }
  };

  return (
    <div className="bg-white border border-[#bed2dc] rounded-lg p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e2edf2] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6c5ce7] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1a2f3f] flex items-center gap-1.5">
              <span>관리자 인증 시스템</span>
              <span className="text-[10px] text-white bg-[#6c5ce7] px-1.5 py-0.5 rounded font-medium">
                Admin Auth
              </span>
            </h2>
            <p className="text-[11px] text-[#6d8494]">
              관리자 이메일: <strong className="text-[#6c5ce7]">{ADMIN_EMAIL}</strong>
            </p>
          </div>
        </div>
      </div>

      {session?.isAdmin ? (
        /* Logged in state */
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-[#f0fbf5] border border-[#b2e5cb] rounded-lg flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-bold text-green-900">
                  권용우 스튜디오 최고 관리자 (Super Admin)
                </h4>
                <span className="bg-green-600 text-white text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                  모든 관리 권한 활성화됨
                </span>
              </div>
              <p className="text-[11px] text-green-800 mt-1 font-mono">
                현재 접속 계정: {session.email}
              </p>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-green-900">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600 shrink-0" />
                  <span>유튜브 영상 등록/수정/삭제 권한</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600 shrink-0" />
                  <span>페이스북 사진 등록/수정/삭제 권한</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600 shrink-0" />
                  <span>대표 콘텐츠(Pin) 상단 고정 권한</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600 shrink-0" />
                  <span>방명록 메시지 관리 및 삭제 권한</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#e2edf2]">
            <button
              onClick={() => {
                if (confirm('초기 데모 데이터(영상 3건, 사진 3건, 방명록 3건)로 재설정하시겠습니까?')) {
                  onResetData();
                  alert('기본 데이터로 초기화되었습니다.');
                }
              }}
              className="px-3 py-1.5 bg-[#f5f8fa] border border-[#c4d7e2] text-[#426175] hover:bg-[#e7f0f5] rounded text-xs transition-colors"
            >
              기본 데이터셋 복원
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>관리자 로그아웃</span>
            </button>
          </div>
        </div>
      ) : (
        /* Not logged in state */
        <div className="flex flex-col gap-4">
          {/* Admin guide card */}
          <div className="p-3.5 bg-[#f7f5fc] border border-[#d6cee8] rounded-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <Award className="w-4 h-4 text-[#6c5ce7]" />
              <h4 className="text-xs font-bold text-[#443869]">
                원클릭 관리자 즉시 로그인
              </h4>
            </div>
            <p className="text-[11px] text-[#635783] leading-relaxed mb-3">
              요청하신 관리자 이메일 <strong>dream2note3@gmail.com</strong> 버튼을 누르면
              별도의 복잡한 절차 없이 즉시 모든 관리 권한이 부여됩니다.
            </p>

            <button
              type="button"
              onClick={handleQuickAdminLogin}
              className="w-full py-2.5 px-4 bg-[#6c5ce7] hover:bg-[#5949d6] text-white rounded-md text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>dream2note3@gmail.com (원클릭 관리자 로그인)</span>
            </button>
          </div>

          {/* Or manual email login */}
          <form onSubmit={handleSubmit} className="border-t border-[#e2edf2] pt-3 flex flex-col gap-3">
            <span className="text-[11px] font-bold text-[#465f70]">
              또는 다른 이메일 주소 직접 입력:
            </span>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="w-3.5 h-3.5 text-[#7992a2] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="이메일 주소 입력"
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#6c5ce7] outline-hidden font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 bg-[#2b7294] hover:bg-[#205b77] text-white rounded text-xs font-bold shrink-0 transition-colors"
              >
                로그인
              </button>
            </div>
          </form>

          {/* Feedback message */}
          {successMsg && (
            <div className="p-2.5 bg-green-50 border border-green-200 rounded text-xs text-green-700 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
