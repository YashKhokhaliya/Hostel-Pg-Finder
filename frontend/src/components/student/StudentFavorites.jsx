import React, { useState, useEffect } from 'react';
import { Heart, Loader2, Home } from 'lucide-react';
import HostelCard from '../hostels/HostelCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const StudentFavorites = ({ onSelectHostel }) => {
  const { user, showNotification } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/favorites/get-all-favorite-hostels');
      if (res.data?.data) {
        setFavorites(res.data.data);
      }
    } catch (err) {
      showNotification('Failed to fetch favorite hostels', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner */}
      <div className="flex items-center gap-4 mb-8 p-6 glass-panel rounded-3xl border border-rose-500/20 shadow-xl">
        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <Heart className="w-8 h-8 fill-rose-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Saved Favorites</h1>
          <p className="text-xs text-gray-400">
            Quick access to your saved hostels and PGs for easy comparison.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-gray-800">
          <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Saved Favorites Yet</h3>
          <p className="text-xs text-gray-400">
            Click the heart icon on any hostel listing to save it to your personal favorites list.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((hostel) => (
            <HostelCard
              key={hostel._id}
              hostel={hostel}
              isFavoriteProp={true}
              onFavoriteToggle={fetchFavorites}
              onSelect={() => onSelectHostel(hostel._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentFavorites;
