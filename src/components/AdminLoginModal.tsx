import React, { useState } from 'react';
import { UserSession, VisitorStatsData } from '../types';
import { changeAdminPassword } from '../services/firestoreSync';
import { AdminVisitStats } from './AdminVisitStats';
import {
  ShieldCheck,
  Mail,
  Key,
  CheckCircle,
  LogOut,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface AdminLoginProps {
  session: UserSession | null;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  onLogout: () => void;
  onClose: () => void;
  onResetData: () => void;
  statsData?: VisitorStatsData;
  onSimulateVisit?: () => void;
  onRefreshStats?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginProps> = ({
  session,
  onLogin,
  onLogout,
  onClose,
  onResetData,
  statsData,
  onSimulateVisit,
  onRefreshStats
}) => {
  const [emailInput, setEmailInput] = useState('dream2note3@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password change state (when logged in)
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [changeMsg, setChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const ADMIN_EMAIL = 'dream2note3@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await onLogin(emailInput.trim(), passwordInput.trim());
      if (result.success) {
        setSuccessMsg(result.message);
        setPasswordInput('');
      } else {
        setErrorMsg(result.message);
      }
    } catch {
      setErrorMsg('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setChangeMsg({ type: 'error', text: '새 비밀번호를 입력해주세요.' });
      return;
    }
    if (newPassword.trim().length < 4) {
      setChangeMsg({ type: 'error', text: '비밀번호는 최소 4글자 이상이어야 합니다.' });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setChangeMsg({ type: 'error', text: '새 비밀번호와 확인 입력이 일치하지 않습니다.' });
      return;
    }

    setIsChangingPass(true);
    try {
      await changeAdminPassword(newPassword.trim());
      setChangeMsg({
        type: 'success',
        text: '관리자 비밀번호가 성공적으로 변경되었습니다! 모든 단말기에서 적용됩니다.'
      });
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch {
      setChangeMsg({ type: 'error', text: '비밀번호 변경 처리 중 오류가 발생했습니다.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="bg-white border border-[#bed2dc] rounded-lg p-4 shadow-xs flex-1 min-h-0 overflow-y-auto custom-retro-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e2edf2] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6c5ce7] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1a2f3f] flex items-center gap-1.5">
              <span>관리자 인증 센터</span>
              <span className="text-[10px] text-white bg-[#6c5ce7] px-1.5 py-0.5 rounded font-medium">
                dream2note3
              </span>
            </h2>
            <p className="text-[11px] text-[#6d8494]">
              관리자 계정: <strong className="text-[#6c5ce7] font-mono">{ADMIN_EMAIL}</strong>
            </p>
          </div>
        </div>

        {session?.isAdmin && (
          <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>최고 관리자 인증됨</span>
          </span>
        )}
      </div>

      {session?.isAdmin ? (
        /* Logged In State */
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-[#f0fbf5] border border-[#b2e5cb] rounded-lg flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-bold text-emerald-950">
                  권용우 스튜디오 최고 관리자 (Super Admin)
                </h4>
                <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                  권한 활성화 완료
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1 font-mono">
                인증된 계정: {session.email}
              </p>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-emerald-900">
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>유튜브 영상 등록 / 수정 / 삭제 / 대표작 고정</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>페이스북 사진 등록 / 수정 / 삭제 / 대표작 고정</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>국내 여행&amp;맛집 등록 / 수정 / 삭제</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>구매CD 검토 등록 / 수정 / 삭제</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>권용우의 아이콘 &amp; 프로필 커스텀 변경</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>방명록 관리자 삭제 권한</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 VISIT STATISTICS SECTION (Recharts Visual Analytics) */}
          {statsData && (
            <AdminVisitStats
              statsData={statsData}
              onRefresh={onRefreshStats}
              onSimulateVisit={onSimulateVisit}
            />
          )}

          {/* Change Password Form */}
          <div className="p-3.5 bg-[#f8fafc] border border-[#d2e0e8] rounded-lg flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1f374a]">
              <Key className="w-4 h-4 text-[#ff6b2b]" />
              <span>관리자 비밀번호 변경</span>
            </div>
            <p className="text-[11px] text-[#6d8494]">
              비밀번호를 변경하면 클라우드에 즉시 저장되어 모든 단말기 로그인 시 적용됩니다.
            </p>

            {changeMsg && (
              <div
                className={`p-2 rounded text-xs flex items-center gap-1.5 ${
                  changeMsg.type === 'success'
                    ? 'bg-[#eaf7ee] border border-[#a6dfb5] text-[#1b6b33]'
                    : 'bg-[#fff5f5] border border-[#fed7d7] text-red-600'
                }`}
              >
                {changeMsg.type === 'success' ? (
                  <Check className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{changeMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-2 mt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#455d6e] mb-1">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onInput={(e) => setNewPassword((e.target as HTMLInputElement).value)}
                    placeholder="최소 4자리 이상 입력"
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    style={{ fontSize: '16px' }}
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-base sm:text-xs text-[#2a3f50]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#455d6e] mb-1">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    onInput={(e) => setNewPasswordConfirm((e.target as HTMLInputElement).value)}
                    placeholder="새 비밀번호 다시 입력"
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    style={{ fontSize: '16px' }}
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-base sm:text-xs text-[#2a3f50]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isChangingPass || !newPassword.trim()}
                  className="px-3.5 py-1.5 bg-[#2b7294] hover:bg-[#205b77] text-white rounded text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:bg-gray-300"
                >
                  {isChangingPass ? '변경 저장 중...' : '비밀번호 변경하기'}
                </button>
              </div>
            </form>
          </div>

          {/* Action buttons: Logout & Close */}
          <div className="flex items-center justify-between pt-3 border-t border-[#edf2f7]">
            <button
              type="button"
              onClick={onResetData}
              className="text-[11px] text-[#8fa2b0] hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
              title="데이터 초기화"
            >
              <RotateCcw className="w-3 h-3" />
              <span>초기 데이터로 복원</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-white border border-[#bed2dc] text-[#556e80] rounded text-xs font-medium hover:bg-[#f6fafc] transition-colors cursor-pointer"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>관리자 로그아웃 (방문자 모드로 전환)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Logged Out / Visitor State: Password Form */
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-[#fdf6ec] border border-[#f5dab1] rounded-lg text-xs text-[#8c5b16] flex items-start gap-2">
            <Lock className="w-4 h-4 text-[#e08214] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">관리자 전용 로그인 페이지입니다.</p>
              <p className="text-[11px] text-[#9c6a28] mt-0.5 leading-relaxed">
                배포된 미니홈피의 게시물 등록, 수정, 삭제 및 프로필 변경 권한은
                <strong className="text-[#bf5b10] font-mono ml-1">{ADMIN_EMAIL}</strong> 계정의 비밀번호 인증을 거친 관리자만 행사할 수 있습니다.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-[#fff5f5] border border-[#fed7d7] text-red-600 rounded text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-[#eaf7ee] border border-[#a6dfb5] text-[#1b6b33] rounded text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-[#374f61] mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#6c5ce7]" />
                <span>관리자 이메일</span>
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="관리자 이메일 입력"
                className="w-full p-2 bg-[#f8fafc] border border-[#bed2dc] rounded text-xs text-[#2a3f50] font-mono font-medium focus:bg-white"
                required
              />
            </div>

            <div>
              <div className="mb-1">
                <label className="text-xs font-bold text-[#374f61] flex items-center gap-1" htmlFor="admin-password-input">
                  <Key className="w-3.5 h-3.5 text-[#ff6b2b]" />
                  <span>비밀번호 (Password)</span>
                </label>
              </div>
              <div className="relative">
                <input
                  id="admin-password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onInput={(e) => setPasswordInput((e.target as HTMLInputElement).value)}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="text"
                  style={{ fontSize: '16px' }}
                  className="w-full p-2.5 sm:p-2 pr-9 bg-white border border-[#bed2dc] rounded text-base sm:text-xs text-[#2a3f50] font-sans focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] outline-hidden"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-[#f0f6fa] border border-[#cde0e9] rounded text-[11px] text-[#556e80] flex flex-col gap-1">
              <span className="font-bold text-[#204c68]">💡 관리자 인증 안내:</span>
              <p className="leading-relaxed">
                • 올바른 비밀번호를 입력하면 이 단말기에서 즉시 모든 관리자 권한이 활성화됩니다.
                <br />
                • 로그인 후 이 화면에서 비밀번호를 언제든지 새 비밀번호로 변경할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 bg-white border border-[#bed2dc] text-[#556e80] rounded text-xs font-medium hover:bg-[#f6fafc] transition-colors cursor-pointer"
              >
                취소 (방문자 모드 유지)
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !passwordInput.trim()}
                className="px-5 py-2 bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:bg-gray-300"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isSubmitting ? '인증 처리 중...' : '관리자 로그인'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
