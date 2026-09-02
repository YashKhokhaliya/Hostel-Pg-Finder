import React, { useState } from 'react';
import { X, Mail, Lock, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginModal = ({ isOpen, onClose, openRegister, openForgotPassword }) => {
  const { requestLoginOtp, login } = useAuth();
  const [step, setStep] = useState(1); // 1: Email & Password, 2: OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await requestLoginOtp(email, password);
      setStep(2);
    } catch (err) {
      // Handled by auth context notification
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    try {
      await login(email, otp);
      onClose();
      // Reset modal state
      setStep(1);
      setEmail('');
      setPassword('');
      setOtp('');
    } catch (err) {
      // Handled by auth context
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
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {step === 1 ? 'Welcome Back' : 'Verify Security OTP'}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {step === 1
              ? 'Enter your credentials to receive a login OTP'
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full py-2.5 pl-10 pr-4 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openForgotPassword();
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-2.5 pl-10 pr-4 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 py-3 px-4 mt-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Request Login OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Enter OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full py-3 text-center tracking-[0.5em] text-xl font-bold bg-gray-900/80 border border-indigo-500/40 rounded-xl text-indigo-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="flex items-center justify-center w-full gap-2 py-3 px-4 mt-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Verify OTP & Sign In</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Change email or password
            </button>
          </form>
        )}

        <div className="pt-4 mt-6 text-center border-t border-gray-800">
          <p className="text-xs text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => {
                onClose();
                openRegister();
              }}
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Register Now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
