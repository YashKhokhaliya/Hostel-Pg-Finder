import React, { useState } from 'react';
import { X, ShieldCheck, FileText, MapPin, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const VerifyPropertyModal = ({ isOpen, onClose, onSuccess }) => {
  const { showNotification } = useAuth();
  const [city, setCity] = useState('ahmedabad');
  const [documentType, setDocumentType] = useState('Property document');
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentFile) {
      showNotification('Please upload a property document', 'warning');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('city', city);
      formData.append('documentType', documentType);
      formData.append('document', documentFile);

      const res = await api.post('/hostels/verify-hostel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showNotification('Verification request submitted for admin review!', 'success');
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Verification submission failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-indigo-500/20 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Property Verification</h2>
          <p className="mt-1 text-xs text-gray-400">
            Submit your legal property ownership document to get verified by city admins.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
              City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full py-2.5 px-3 text-sm bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="ahmedabad">Ahmedabad</option>
              <option value="vadodara">Vadodara</option>
              <option value="surat">Surat</option>
              <option value="rajkot">Rajkot</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full py-2.5 px-3 text-sm bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="Property document">Property document</option>
              <option value="Property tax receipt">Property tax receipt</option>
              <option value="Lease agreement">Lease agreement</option>
              <option value="Owner authorization / NOC">Owner authorization / NOC</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
              Upload Document File (PDF / Image)
            </label>
            <div className="relative flex items-center justify-center p-4 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/40 hover:border-emerald-500/50 transition-all cursor-pointer">
              <input
                type="file"
                required
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files?.[0] && setDocumentFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-1.5 text-xs text-gray-400">
                <Upload className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-white">
                  {documentFile ? documentFile.name : 'Click to select document file'}
                </span>
                <span className="text-[10px] text-gray-500">Max size 10MB</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full gap-2 py-3 px-4 mt-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Submit for Verification</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyPropertyModal;
