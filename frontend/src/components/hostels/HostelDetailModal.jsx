import React, { useState, useEffect } from 'react';
import { X, MapPin, ExternalLink, Phone, Mail, User, ShieldCheck, Heart, Loader2 } from 'lucide-react';
import FacilityBadge from '../common/FacilityBadge';
import ReviewSection from './ReviewSection';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const HostelDetailModal = ({ hostelId, onClose }) => {
  const { user, showNotification } = useAuth();
  const [hostelData, setHostelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isFav, setIsFav] = useState(false);

  const fetchHostelDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/hostels/${hostelId}`);
      if (res.data?.data) {
        setHostelData(res.data.data);
        setIsFav(res.data.data.isFavorite || false);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to fetch hostel details', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hostelId) {
      fetchHostelDetails();
    }
  }, [hostelId]);

  if (!hostelId) return null;

  const photos = hostelData?.photos || [];
  const activePhoto = photos[activePhotoIdx]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80';

  const toggleFavorite = async () => {
    if (!user || user.role !== 'student') {
      showNotification('Please sign in as a student to favorite hostels', 'warning');
      return;
    }
    try {
      if (isFav) {
        await api.delete(`/favorites/${hostelId}/remove-from-list`);
        setIsFav(false);
        showNotification('Removed from favorites', 'info');
      } else {
        await api.patch(`/favorites/${hostelId}/add-to-list`);
        setIsFav(true);
        showNotification('Added to favorites!', 'success');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error updating favorites', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] my-6 glass-panel rounded-3xl border border-indigo-500/20 shadow-2xl overflow-y-auto">
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right z-20 p-2 text-gray-400 hover:text-white bg-gray-900/80 hover:bg-gray-800 rounded-xl transition-all border border-gray-700/60"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-gray-400">Loading details...</p>
          </div>
        ) : hostelData ? (
          <div className="p-6 sm:p-8">
            {/* Gallery Section */}
            <div className="space-y-3 mb-6">
              <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
                <img
                  src={activePhoto}
                  alt={hostelData.hostelName}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xl bg-indigo-600/90 text-white backdrop-blur-md shadow-lg">
                    {hostelData.type}
                  </span>
                  <span className="px-3 py-1 text-xs font-bold rounded-xl bg-emerald-500/90 text-white backdrop-blur-md shadow-lg">
                    Verified Listing
                  </span>
                </div>

                {user?.role === 'student' && (
                  <button
                    onClick={toggleFavorite}
                    className={`absolute top-4 right-16 p-2.5 rounded-xl backdrop-blur-md border transition-all ${
                      isFav
                        ? 'bg-rose-500/90 border-rose-400 text-white'
                        : 'bg-black/60 border-white/20 text-gray-300 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFav ? 'fill-white' : ''}`} />
                  </button>
                )}
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {photos.map((pt, idx) => (
                    <button
                      key={pt._id || idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activePhotoIdx === idx
                          ? 'border-indigo-500 scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={pt.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Basic Info */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-gray-800">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {hostelData.hostelName}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    {hostelData.location?.address}, {hostelData.location?.area}, {hostelData.location?.city},{' '}
                    {hostelData.location?.state}
                  </span>
                </div>
              </div>

              {/* Rent badge */}
              <div className="px-5 py-3 rounded-2xl glass-panel border border-indigo-500/30 text-right">
                <p className="text-xs text-gray-400 font-semibold uppercase">Monthly Rent</p>
                <p className="text-2xl font-extrabold text-white">
                  ₹{hostelData.rent?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Grid specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              {/* Allowed Genders & Google Maps link */}
              <div className="space-y-4 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Allowed Accommodation
                </h3>
                <div className="flex items-center gap-2">
                  {hostelData.allowedGenders?.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 text-xs font-bold rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize"
                    >
                      {g} Allowed
                    </span>
                  ))}
                </div>

                {hostelData.location?.googleMapLink && (
                  <a
                    href={hostelData.location.googleMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 mt-2 text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl transition-all"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Owner Info */}
              <div className="space-y-2 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Property Owner Contact
                </h3>
                <div className="flex items-center gap-3 pt-1">
                  {hostelData.owner?.profilePhoto?.url ? (
                    <img
                      src={hostelData.owner.profilePhoto.url}
                      alt={hostelData.owner.fullname}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-sm">
                      {hostelData.owner?.fullname?.[0]?.toUpperCase() || 'O'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white capitalize">
                      {hostelData.owner?.fullname || 'Property Manager'}
                    </p>
                    {hostelData.owner?.mobileNumber && (
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{hostelData.owner.mobileNumber}</span>
                      </p>
                    )}
                    {hostelData.owner?.email && (
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-indigo-400" />
                        <span>{hostelData.owner.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Facilities Section */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-3">
                Amenities & Facilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {hostelData.facilities &&
                  Object.entries(hostelData.facilities).map(([key, val]) => (
                    <FacilityBadge key={key} facilityKey={key} active={Boolean(val)} size="md" />
                  ))}
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewSection
              hostelId={hostelId}
              myRatingProp={hostelData.myrating}
              onRatingChanged={fetchHostelDetails}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HostelDetailModal;
