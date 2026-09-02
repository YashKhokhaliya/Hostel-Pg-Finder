import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, MapPin, Upload, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterModal = ({ isOpen, onClose, openLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    email: '',
    password: '',
    gender: 'male',
    number: '',
    role: 'student',
    city: 'ahmedabad',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Pre-validations matching backend rules
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrorMsg('Password must contain at least 8 chars, 1 uppercase, 1 lowercase, 1 digit, and 1 special symbol.');
      return;
    }

    const usernameRegex = /^[A-Za-z0-9]{4,}$/;
    if (!usernameRegex.test(formData.username)) {
      setErrorMsg('Username must be at least 4 alphanumeric characters without spaces.');
      return;
    }

    const numberRegex = /^(?:\+91)?[6-9]\d{9}$/;
    if (!numberRegex.test(formData.number)) {
      setErrorMsg('Enter a valid 10-digit mobile number.');
      return;
    }

    if (formData.role === 'admin' && !formData.city) {
      setErrorMsg('City is required for Admin registration.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (photo) {
        data.append('photo', photo);
      }

      await register(data);
      onClose();
      openLogin();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 p-6 glass-panel rounded-2xl border border-indigo-500/20 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-2 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create an Account</h2>
          <p className="mt-1 text-sm text-gray-400">Join Hostel & PG Finder today</p>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Role selector */}
          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
              I am a
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['student', 'owner', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: r }))}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl capitalize transition-all border ${
                    formData.role === r
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="yash123"
                className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                required
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Yash Kanzariya"
                className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Mobile Number
              </label>
              <input
                type="text"
                name="number"
                required
                value={formData.number}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Pass@1234"
                className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {formData.role === 'admin' && (
            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Assigned Admin City
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="ahmedabad">Ahmedabad</option>
                <option value="vadodara">Vadodara</option>
                <option value="surat">Surat</option>
                <option value="rajkot">Rajkot</option>
              </select>
            </div>
          )}

          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
              Profile Photo (Optional)
            </label>
            <div className="relative flex items-center justify-center p-3 border border-dashed border-gray-700 rounded-xl bg-gray-900/40 hover:border-indigo-500/50 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>{photo ? photo.name : 'Upload Profile Picture'}</span>
              </div>
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
              <span>Register Account</span>
            )}
          </button>
        </form>

        <div className="pt-4 mt-4 text-center border-t border-gray-800">
          <p className="text-xs text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => {
                onClose();
                openLogin();
              }}
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
