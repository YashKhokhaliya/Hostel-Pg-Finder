import React, { useState } from 'react';
import { X, Building2, Plus, Upload, Trash2, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const CreateHostelModal = ({ isOpen, onClose, verificationId, onSuccess }) => {
  const { showNotification } = useAuth();
  const [formData, setFormData] = useState({
    hostelName: '',
    type: 'hostel',
    rent: '',
    googleMapLink: '',
    address: '',
    state: 'Gujarat',
    city: 'ahmedabad',
    area: '',
  });

  const [allowedGenders, setAllowedGenders] = useState(['male']);
  const [facilities, setFacilities] = useState({
    wifi: true,
    ac: true,
    laundry: false,
    parking: true,
    food: true,
    hotWater: true,
    security: true,
  });

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenderToggle = (gender) => {
    setAllowedGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  const handleFacilityToggle = (key) => {
    setFacilities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePhotosChange = (e) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...filesArr]);
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verificationId) {
      showNotification('Missing verification ID', 'error');
      return;
    }

    if (photos.length < 2 || photos.length > 8) {
      showNotification('Please select between 2 and 8 photos of your property', 'warning');
      return;
    }

    if (allowedGenders.length === 0) {
      showNotification('Please select at least one allowed gender', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('hostelName', formData.hostelName);
      data.append('type', formData.type);
      data.append('rent', formData.rent);
      data.append('allowedGenders', JSON.stringify(allowedGenders));
      data.append('facilities', JSON.stringify(facilities));

      const locationObj = {
        googleMapLink: formData.googleMapLink,
        address: formData.address,
        state: formData.state,
        city: formData.city,
        area: formData.area,
      };
      data.append('location', JSON.stringify(locationObj));

      photos.forEach((photo) => {
        data.append('photos', photo);
      });

      const res = await api.post(`/hostels/create-hostel/${verificationId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showNotification('Hostel created successfully!', 'success');
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to create hostel', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 p-6 sm:p-8 glass-panel rounded-3xl border border-indigo-500/20 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-2 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Hostel / PG Listing</h2>
          <p className="mt-1 text-xs text-gray-400">Fill in the details to publish your property</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Hostel / PG Name
              </label>
              <input
                type="text"
                name="hostelName"
                required
                value={formData.hostelName}
                onChange={handleChange}
                placeholder="e.g. Royal Student Living"
                className="w-full py-2.5 px-3 text-sm bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Property Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full py-2.5 px-3 text-sm bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="hostel">Hostel</option>
                <option value="pg">PG (Paying Guest)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Monthly Rent (₹)
              </label>
              <input
                type="number"
                name="rent"
                required
                min={0}
                value={formData.rent}
                onChange={handleChange}
                placeholder="6000"
                className="w-full py-2.5 px-3 text-sm bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Allowed Genders
              </label>
              <div className="flex items-center gap-2 pt-1">
                {['male', 'female', 'other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGenderToggle(g)}
                    className={`py-1.5 px-3 text-xs font-semibold rounded-xl capitalize border transition-all ${
                      allowedGenders.includes(g)
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                        : 'bg-gray-900/60 border-gray-800 text-gray-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location fields */}
          <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Location Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block mb-1 text-[11px] font-medium text-gray-400">Area / Landmark</label>
                <input
                  type="text"
                  name="area"
                  required
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Navrangpura"
                  className="w-full py-2 px-3 text-xs bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-[11px] font-medium text-gray-400">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full py-2 px-3 text-xs bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ahmedabad">Ahmedabad</option>
                  <option value="vadodara">Vadodara</option>
                  <option value="surat">Surat</option>
                  <option value="rajkot">Rajkot</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[11px] font-medium text-gray-400">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Gujarat"
                  className="w-full py-2 px-3 text-xs bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-[11px] font-medium text-gray-400">Full Address</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="102 Sunshine Towers, Near LD Engineering College"
                className="w-full py-2 px-3 text-xs bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-[11px] font-medium text-gray-400">Google Map Share Link</label>
              <input
                type="url"
                name="googleMapLink"
                required
                value={formData.googleMapLink}
                onChange={handleChange}
                placeholder="https://maps.google.com/?q=..."
                className="w-full py-2 px-3 text-xs bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Facilities Checkboxes */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-300">
              Select Facilities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'wifi', label: 'Wi-Fi' },
                { key: 'ac', label: 'AC' },
                { key: 'laundry', label: 'Laundry' },
                { key: 'parking', label: 'Parking' },
                { key: 'food', label: 'Food / Mess' },
                { key: 'hotWater', label: 'Hot Water' },
                { key: 'security', label: 'Security' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleFacilityToggle(key)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-between ${
                    facilities[key]
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      facilities[key] ? 'bg-indigo-400 shadow-sm shadow-indigo-400' : 'bg-gray-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Upload Photos */}
          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
              Hostel Photos (Upload between 2 and 8 images)
            </label>
            <div className="relative flex items-center justify-center p-4 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/40 hover:border-indigo-500/50 transition-all cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotosChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
                <Upload className="w-5 h-5 text-indigo-400" />
                <span className="font-medium text-white">Click or drag images to upload</span>
                <span className="text-[10px] text-gray-500">{photos.length} photos selected</span>
              </div>
            </div>

            {/* Photos Preview Grid */}
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {photos.map((file, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden group border border-gray-700">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full gap-2 py-3 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Publish Hostel Listing</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateHostelModal;
