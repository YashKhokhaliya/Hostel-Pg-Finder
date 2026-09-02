import React, { useState } from 'react';
import { X, User, Lock, Upload, Trash2, KeyRound, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserProfileModal = ({ isOpen, onClose }) => {
  const {
    user,
    updatePassword,
    updateProfilePhoto,
    removeProfilePhoto,
    deleteAccount,
    showNotification,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('photo'); // 'photo', 'password', 'danger'

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Photo file
  const [photoFile, setPhotoFile] = useState(null);

  if (!isOpen || !user) return null;

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoFile) return;
    setLoading(true);
    try {
      await updateProfilePhoto(photoFile);
      setPhotoFile(null);
    } catch (err) {
      // Notification handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Remove profile photo?')) return;
    setLoading(true);
    try {
      await removeProfilePhoto();
    } catch (err) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('New password and confirm password must match', 'warning');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(oldPassword, newPassword, confirmPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account? This action cannot be undone!')) return;
    setLoading(true);
    try {
      await deleteAccount();
      onClose();
    } catch (err) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 glass-panel rounded-3xl border border-indigo-500/20 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-800">
          {user.profilePhoto?.url ? (
            <img
              src={user.profilePhoto.url}
              alt={user.username}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xl">
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white capitalize">{user.fullname || user.username}</h2>
            <p className="text-xs text-gray-400">{user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Role: {user.role} {user.city ? `(${user.city})` : ''}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-gray-900/80 border border-gray-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'photo' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Avatar
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'password' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'danger' ? 'bg-rose-600/30 text-rose-300' : 'text-gray-400 hover:text-rose-400'
            }`}
          >
            Account
          </button>
        </div>

        {/* Tab 1: Profile Photo */}
        {activeTab === 'photo' && (
          <div className="space-y-4">
            <form onSubmit={handlePhotoUpload} className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Change Profile Picture
              </label>
              <div className="relative flex items-center justify-center p-4 border border-dashed border-gray-700 rounded-xl bg-gray-900/40 hover:border-indigo-500/50 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setPhotoFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>{photoFile ? photoFile.name : 'Select Image File'}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !photoFile}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Upload New Avatar'}
              </button>
            </form>

            {user.profilePhoto?.url && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={loading}
                className="w-full py-2 px-4 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl border border-rose-500/20 transition-all"
              >
                Remove Current Photo
              </button>
            )}
          </div>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Current Password
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update Password'}
            </button>
          </form>
        )}

        {/* Tab 3: Danger Zone */}
        {activeTab === 'danger' && (
          <div className="space-y-4 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-white">Delete Account</h3>
              <p className="text-xs text-gray-400 mt-1">
                Permanently delete your profile, ratings, and listings. This action is non-reversible.
              </p>
            </div>

            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete My Account'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
