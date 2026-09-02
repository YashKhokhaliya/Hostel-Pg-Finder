import React from 'react';
import { Search, Filter, RotateCcw, Building2, MapPin, DollarSign, Users } from 'lucide-react';

const HostelFilterBar = ({ filters, setFilters, onReset, onSearch }) => {
  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenderToggle = (genderVal) => {
    setFilters((prev) => {
      const current = prev.gender || [];
      const exists = current.includes(genderVal);
      const updated = exists
        ? current.filter((g) => g !== genderVal)
        : [...current, genderVal];
      return { ...prev, gender: updated };
    });
  };

  const handleTypeToggle = (typeVal) => {
    setFilters((prev) => {
      const current = prev.type || [];
      const exists = current.includes(typeVal);
      const updated = exists
        ? current.filter((t) => t !== typeVal)
        : [...current, typeVal];
      return { ...prev, type: updated };
    });
  };

  return (
    <div className="w-full p-4 mb-8 glass-panel rounded-2xl border border-indigo-500/20 shadow-xl">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-indigo-400">
        <Filter className="w-4 h-4" />
        <span>Filter Hostels & PGs</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* City & State */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">City</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={filters.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g. ahmedabad"
              className="w-full py-2 pl-9 pr-3 text-sm bg-gray-900/80 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* State */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">State</label>
          <input
            type="text"
            value={filters.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="e.g. gujarat"
            className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Rent Range */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">Rent Range (₹ / mo)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.minRange || ''}
              onChange={(e) => handleChange('minRange', e.target.value)}
              placeholder="Min"
              className="w-1/2 py-2 px-3 text-sm bg-gray-900/80 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <span className="text-gray-600 text-xs">-</span>
            <input
              type="number"
              value={filters.maxRange || ''}
              onChange={(e) => handleChange('maxRange', e.target.value)}
              placeholder="Max"
              className="w-1/2 py-2 px-3 text-sm bg-gray-900/80 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">Type</label>
          <div className="flex items-center gap-2 pt-0.5">
            {['hostel', 'pg'].map((t) => {
              const isSelected = (filters.type || []).includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeToggle(t)}
                  className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl uppercase transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gender filter & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-800/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-400">Allowed Genders:</span>
          <div className="flex items-center gap-1.5">
            {['male', 'female', 'other'].map((g) => {
              const isSelected = (filters.gender || []).includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGenderToggle(g)}
                  className={`py-1 px-3 text-xs font-semibold rounded-lg capitalize transition-all border ${
                    isSelected
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostelFilterBar;
