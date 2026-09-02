import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import NotificationToast from './components/common/NotificationToast';
import HostelFilterBar from './components/hostels/HostelFilterBar';
import HostelCard from './components/hostels/HostelCard';
import HostelDetailModal from './components/hostels/HostelDetailModal';
import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';
import ForgotPasswordModal from './components/auth/ForgotPasswordModal';
import UserProfileModal from './components/profile/UserProfileModal';
import OwnerDashboard from './components/owner/OwnerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import StudentFavorites from './components/student/StudentFavorites';
import { Search, Sparkles, Building2, ShieldCheck, MapPin, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import api from './api/axios';

const MainApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('explore');

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState(null);

  // Search & Filters state
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    minRange: '',
    maxRange: '',
    type: [],
    gender: [],
  });

  const [page, setPage] = useState(1);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHostels = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage);

      if (filters.city?.trim()) params.append('city', filters.city.trim().toLowerCase());
      if (filters.state?.trim()) params.append('state', filters.state.trim().toLowerCase());
      if (filters.minRange) params.append('minRange', filters.minRange);
      if (filters.maxRange) params.append('maxRange', filters.maxRange);

      if (filters.type && filters.type.length > 0) {
        filters.type.forEach((t) => params.append('type', t));
      }

      if (filters.gender && filters.gender.length > 0) {
        filters.gender.forEach((g) => params.append('gender', g));
      }

      const res = await api.get(`/hostels/get-all-hostel?${params.toString()}`);
      if (res.data?.data) {
        setHostels(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch hostels', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'explore') {
      fetchHostels(page);
    }
  }, [activeTab, page]);

  const handleSearch = () => {
    setPage(1);
    fetchHostels(1);
  };

  const handleResetFilters = () => {
    setFilters({
      city: '',
      state: '',
      minRange: '',
      maxRange: '',
      type: [],
      gender: [],
    });
    setPage(1);
    fetchHostels(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-gray-100 selection:bg-indigo-500 selection:text-white">
      <NotificationToast />

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openLogin={() => setIsLoginOpen(true)}
        openRegister={() => setIsRegisterOpen(true)}
        openProfileModal={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'explore' && (
          <div>
            {/* Hero Section */}
            <div className="relative py-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-gray-800/80 bg-gradient-to-b from-indigo-950/40 via-gray-950 to-[#0b0f19]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

              <div className="max-w-4xl mx-auto relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Verified PG & Student Accommodation Finder</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Find Your Perfect <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Hostel or PG</span>
                </h1>

                <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
                  Browse thousands of verified student hostels, single/shared PGs with real reviews, transparent rent pricing, and direct owner contacts across major cities.
                </p>
              </div>
            </div>

            {/* Filter Bar & Listings Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <HostelFilterBar
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetFilters}
                onSearch={handleSearch}
              />

              {/* Grid Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Available Accommodations</h2>
                  <p className="text-xs text-gray-400">Showing page {page} results</p>
                </div>

                <button
                  onClick={() => fetchHostels(page)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-xl transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Listings Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-sm text-gray-400">Searching properties...</p>
                </div>
              ) : hostels.length === 0 ? (
                <div className="p-12 text-center glass-panel rounded-3xl border border-gray-800">
                  <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">No Hostels Found</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
                    We couldn't find any hostels or PGs matching your exact filters. Try adjusting city or price range.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hostels.map((hostel) => (
                    <HostelCard
                      key={hostel._id}
                      hostel={hostel}
                      onSelect={(h) => setSelectedHostelId(h._id)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination controls */}
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-300 bg-gray-900 border border-gray-800 hover:border-indigo-500 rounded-xl disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-bold text-gray-400 px-3 py-2 rounded-xl bg-gray-900/60 border border-gray-800">
                  Page {page}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={hostels.length < 20 || loading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-300 bg-gray-900 border border-gray-800 hover:border-indigo-500 rounded-xl disabled:opacity-40 transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <StudentFavorites onSelectHostel={(id) => setSelectedHostelId(id)} />
        )}

        {activeTab === 'owner' && (
          <OwnerDashboard onSelectHostel={(id) => setSelectedHostelId(id)} />
        )}

        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        openRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        openForgotPassword={() => {
          setIsLoginOpen(false);
          setIsForgotOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        openLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        openLogin={() => {
          setIsForgotOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Hostel Details Modal */}
      {selectedHostelId && (
        <HostelDetailModal
          hostelId={selectedHostelId}
          onClose={() => setSelectedHostelId(null)}
        />
      )}
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;
