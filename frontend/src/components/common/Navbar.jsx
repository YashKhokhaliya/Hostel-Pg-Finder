import React, { useState } from 'react';
import { Home, Heart, Building2, ShieldCheck, User, LogOut, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({
  activeTab,
  setActiveTab,
  openLogin,
  openRegister,
  openProfileModal,
}) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">StayHub</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PG & Hostel
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Find your home away from home</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'explore'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Explore</span>
            </button>

            {user?.role === 'student' && (
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'favorites'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Favorites</span>
              </button>
            )}

            {user?.role === 'owner' && (
              <button
                onClick={() => setActiveTab('owner')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'owner'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>My Listings</span>
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'admin'
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Approvals</span>
              </button>
            )}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-gray-800 bg-gray-900/60 hover:border-indigo-500/40 transition-all"
                >
                  {user.profilePhoto?.url ? (
                    <img
                      src={user.profilePhoto.url}
                      alt={user.username}
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-sm">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-white leading-tight capitalize">
                      {user.fullname || user.username}
                    </p>
                    <p className="text-[10px] font-semibold text-indigo-400 capitalize">
                      {user.role} {user.city ? `(${user.city})` : ''}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 p-2 rounded-2xl glass-panel border border-indigo-500/20 shadow-2xl z-50 animate-fade-in"
                  >
                    <div className="px-3 py-2 border-b border-gray-800">
                      <p className="text-xs font-bold text-white capitalize">{user.fullname}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        openProfileModal();
                      }}
                      className="flex items-center w-full gap-2 px-3 py-2 mt-1 text-xs font-semibold text-gray-300 hover:text-white hover:bg-indigo-600/20 rounded-xl transition-all"
                    >
                      <User className="w-4 h-4 text-indigo-400" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center w-full gap-2 px-3 py-2 mt-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={openLogin}
                  className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-xl transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={openRegister}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
