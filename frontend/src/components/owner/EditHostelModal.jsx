import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Trash2, Loader2, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const EditHostelModal = ({ isOpen, onClose, hostel, onSuccess }) => {
  const { showNotification } = useAuth();
  const [formData, setFormData] = useState({
    hostelname: '',
    address: '',
    type: 'hostel',
    googleMapLink: '',
    rent: '',
  });

  const [gender, setGender] = useState(['male']);
  const [facilities, setFacilities] = useState({});
  const [loading, setLoading] = useState(false);

  // Photos management
  const [newPhotos, setNewPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);

  useEffect(() => {
    if (hostel) {
      setFormData({
        hostelname: hostel.hostelName || '',
        address: hostel.location?.address || '',
        type: hostel.type || 'hostel',
        googleMapLink: hostel.location?.googleMapLink || '',
        rent: hostel.rent || '',
      });
      setGender(hostel.allowedGenders || ['male']);
      setFacilities(hostel.facilities || {});
    }
  }, [hostel]);

  if (!isOpen || !hostel) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenderToggle = (g) => {
    setGender((prev) => (prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]));
  };

  const handleFacilityToggle = (key) => {
    setFacilities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        hostelname: formData.hostelname,
        address: formData.address,
        type: formData.type,
        googleMapLink: formData.googleMapLink,
        rent: Number(formData.rent),
        gender: gender,
        facilities: facilities,
      };

      await api.patch('/hostels/update-hostel', payload);
      showNotification('Hostel information updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update hostel info', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhotos = async (e) => {
    e.preventDefault();
    if (!newPhotos.length) return;
    setUploadingPhotos(true);
    try {
      const data = new FormData();
      newPhotos.forEach((file) => data.append('photos', file));

      await api.patch(`/hostels/add-hostel-photos/${hostel._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showNotification('Photos added successfully!', 'success');
      setNewPhotos([]);
      onSuccess();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to upload new photos', 'error');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Delete this photo? Hostel must have at least 2 photos.')) return;
    setDeletingPhotoId(photoId);
    try {
      await api.delete(`/hostels/delete-hostel-photos/${hostel._id}`, {
        data: { photoIds: [photoId] },
      });
      showNotification('Photo deleted successfully!', 'info');
      onSuccess();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete photo', 'error');
    } finally {
      setDeletingPhotoId(null);
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

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Edit Hostel Details</h2>
          <p className="text-xs text-gray-400">Update property parameters, rent, facilities, and photos</p>
        </div>

        {/* Existing Photos list & Delete */}
        <div className="mb-6 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">
            Manage Property Photos ({hostel.photos?.length || 0} uploaded)
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {hostel.photos?.map((pt) => (
              <div key={pt._id} className="relative w-20 h-20 rounded-xl overflow-hidden group border border-gray-700">
                <img src={pt.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(pt._id)}
                  disabled={deletingPhotoId === pt._id}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                >
                  {deletingPhotoId === pt._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Add more photos */}
          <form onSubmit={handleAddPhotos} className="flex items-center gap-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && setNewPhotos(Array.from(e.target.files))}
              className="text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-300 hover:file:bg-indigo-600/30 cursor-pointer"
            />
            {newPhotos.length > 0 && (
              <button
                type="submit"
                disabled={uploadingPhotos}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all"
              >
                {uploadingPhotos ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload Photos'}
              </button>
            )}
          </form>
        </div>

        {/* Update Form */}
        <form onSubmit={handleUpdateInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Hostel Name
              </label>
              <input
                type="text"
                name="hostelname"
                required
                value={formData.hostelname}
                onChange={handleChange}
                className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="hostel">Hostel</option>
                <option value="pg">PG</option>
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
                value={formData.rent}
                onChange={handleChange}
                className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                Allowed Genders
              </label>
              <div className="flex items-center gap-2 pt-1">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGenderToggle(g)}
                    className={`py-1 px-3 text-xs font-semibold rounded-xl capitalize border transition-all ${
                      gender.includes(g)
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-gray-900/60 border-gray-800 text-gray-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
              Address
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
              Google Maps Link
            </label>
            <input
              type="url"
              name="googleMapLink"
              required
              value={formData.googleMapLink}
              onChange={handleChange}
              className="w-full py-2 px-3 text-sm bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Facilities Checkboxes */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-300">
              Facilities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'wifi', label: 'Wi-Fi' },
                { key: 'ac', label: 'AC' },
                { key: 'laundry', label: 'Laundry' },
                { key: 'parking', label: 'Parking' },
                { key: 'food', label: 'Food' },
                { key: 'hotWater', label: 'Hot Water' },
                { key: 'security', label: 'Security' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleFacilityToggle(key)}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-between ${
                    facilities[key]
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      facilities[key] ? 'bg-indigo-400' : 'bg-gray-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full gap-2 py-3 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Save Changes</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditHostelModal;
