import React, { useState } from 'react';
import { X, Mail, Lock, KeyRound, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ForgotPasswordModal = ({ isOpen, onClose, openLogin }) => {
  const { forgetPasswordOtp, verifyOtpPasswordReset, resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setErrorMsg('');
    setLoading(true);
    try {
      await forgetPasswordOtp(email);
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send reset OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setErrorMsg('');
    setLoading(true);
    try {
      await verifyOtpPasswordReset(email, otp);
      setStep(3);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setErrorMsg('Password must contain at least 8 chars, 1 uppercase, 1 lowercase, 1 digit, and 1 special symbol.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(newPassword, confirmPassword);
      onClose();
      openLogin();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-indigo-500/20 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
          <p className="mt-1 text-sm text-gray-400">
            {step === 1 && 'Enter your account email to receive a password reset OTP'}
            {step === 2 && `Enter the OTP sent to ${email}`}
            {step === 3 && 'Enter your new password below'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full py-2.5 pl-10 pr-4 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 py-3 px-4 font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Send Reset OTP</span>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                6-Digit Reset OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full py-3 text-center tracking-[0.5em] text-xl font-bold bg-gray-900/80 border border-amber-500/40 rounded-xl text-amber-300 focus:outline-none focus:border-amber-400 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="flex items-center justify-center w-full gap-2 py-3 px-4 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify OTP</span>}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="NewPass@123"
                  className="w-full py-2.5 pl-10 pr-4 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="NewPass@123"
                  className="w-full py-2.5 pl-10 pr-4 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 py-3 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Update Password</span>}
            </button>
          </form>
        )}

        <div className="pt-4 mt-4 text-center border-t border-gray-800">
          <button
            onClick={() => {
              onClose();
              openLogin();
            }}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
