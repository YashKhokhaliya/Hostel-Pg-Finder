import React, { useState } from 'react';
import { Heart, MapPin, ExternalLink, User, ShieldCheck } from 'lucide-react';
import FacilityBadge from '../common/FacilityBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const HostelCard = ({ hostel, onSelect, isFavoriteProp, onFavoriteToggle }) => {
  const { user, showNotification } = useAuth();
  const [isFav, setIsFav] = useState(isFavoriteProp || false);
  const [favLoading, setFavLoading] = useState(false);

  const mainPhoto = hostel.photos?.[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!user || user.role !== 'student') {
      showNotification('Please log in as a Student to save favorites', 'warning');
      return;
    }

    setFavLoading(true);
    try {
      if (isFav) {
        await api.delete(`/favorites/${hostel._id}/remove-from-list`);
        setIsFav(false);
        showNotification('Removed from favorites', 'info');
      } else {
        await api.patch(`/favorites/${hostel._id}/add-to-list`);
        setIsFav(true);
        showNotification('Added to favorites!', 'success');
      }
      if (onFavoriteToggle) onFavoriteToggle(hostel._id, !isFav);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update favorite status', 'error');
    } finally {
      setFavLoading(false);
    }
  };

  const activeFacilities = hostel.facilities
    ? Object.entries(hostel.facilities)
        .filter(([_, val]) => Boolean(val))
        .map(([key]) => key)
    : [];

  return (
    <div
      onClick={() => onSelect(hostel)}
      className="group relative flex flex-col h-full glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
    >
      {/* Photo Header */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-900">
        <img
          src={mainPhoto}
          alt={hostel.hostelName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/30" />

        {/* Badges top bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider rounded-lg bg-indigo-600/90 text-white backdrop-blur-md shadow-md border border-indigo-400/30">
              {hostel.type}
            </span>
          </div>

          {user?.role === 'student' && (
            <button
              onClick={handleFavoriteClick}
              disabled={favLoading}
              className={`p-2 rounded-xl backdrop-blur-md border transition-all pointer-events-auto shadow-md ${
                isFav
                  ? 'bg-rose-500/90 border-rose-400 text-white'
                  : 'bg-black/50 border-white/20 text-gray-300 hover:text-white hover:bg-rose-500/30'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
            </button>
          )}
        </div>

        {/* Rent badge bottom left */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-white tracking-tight">
              ₹{hostel.rent?.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-300 font-medium">/ month</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4 justify-between">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
            {hostel.hostelName}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">
              {hostel.location?.area ? `${hostel.location.area}, ` : ''}
              {hostel.location?.city || ''}
              {hostel.location?.state ? `, ${hostel.location.state}` : ''}
            </span>
          </div>

          {/* Allowed genders */}
          {hostel.allowedGenders && hostel.allowedGenders.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">For:</span>
              <div className="flex items-center gap-1">
                {hostel.allowedGenders.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/20 capitalize"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Facilities pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {activeFacilities.slice(0, 4).map((f) => (
              <FacilityBadge key={f} facilityKey={f} size="sm" />
            ))}
            {activeFacilities.length > 4 && (
              <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-800/60 rounded-md">
                +{activeFacilities.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-4 flex items-center justify-between border-t border-gray-800/60 text-xs">
          {hostel.owner?.fullname && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[120px] capitalize">{hostel.owner.fullname}</span>
            </div>
          )}
          <span className="flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
            <span>View Details</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default HostelCard;
