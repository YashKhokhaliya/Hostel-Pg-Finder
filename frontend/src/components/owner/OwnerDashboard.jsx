import React, { useState, useEffect } from 'react';
import { Building2, Plus, ShieldCheck, Clock, AlertTriangle, Trash2, Edit3, Loader2, Home } from 'lucide-react';
import HostelCard from '../hostels/HostelCard';
import VerifyPropertyModal from './VerifyPropertyModal';
import CreateHostelModal from './CreateHostelModal';
import EditHostelModal from './EditHostelModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const OwnerDashboard = ({ onSelectHostel }) => {
  const { user, showNotification } = useAuth();
  const [myHostels, setMyHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification state & modals
  const [verification, setVerification] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHostelForEdit, setSelectedHostelForEdit] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMyHostels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hostels/get-my-hostel');
      if (res.data?.data) {
        setMyHostels(res.data.data);
      }
    } catch (err) {
      showNotification('Failed to fetch your hostels', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyHostels();
  }, []);

  const handleDeleteHostel = async (hostelId) => {
    if (!window.confirm('Are you sure you want to permanently delete this hostel listing?')) return;
    setDeletingId(hostelId);
    try {
      await api.delete(`/hostels/delete-hostel/${hostelId}`);
      showNotification('Hostel deleted successfully', 'info');
      fetchMyHostels();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete hostel', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-6 glass-panel rounded-3xl border border-indigo-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Owner Management Portal</h1>
            <p className="text-xs text-gray-400">
              Manage your hostel listings, upload property documents, and view tenant ratings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsVerifyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Property</span>
          </button>

          {verification?.status === 'accepted' && !verification?.used && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Hostel</span>
            </button>
          )}
        </div>
      </div>

      {/* Verification Status Card if present */}
      {verification && (
        <div className="mb-8 p-4 rounded-2xl glass-card border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {verification.status === 'pending' && <Clock className="w-5 h-5 text-amber-400" />}
              {verification.status === 'accepted' && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
              {verification.status === 'rejected' && <AlertTriangle className="w-5 h-5 text-rose-400" />}

              <div>
                <p className="text-sm font-bold text-white capitalize">
                  Verification Status: <span className="text-indigo-400">{verification.status}</span>
                </p>
                <p className="text-xs text-gray-400">City: {verification.city}</p>
              </div>
            </div>

            {verification.status === 'accepted' && !verification.used && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md"
              >
                Create Listing Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* My Hostels Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">My Published Hostels ({myHostels.length})</h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : myHostels.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-3xl border border-gray-800">
            <Home className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Hostels Listed Yet</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
              To list a new hostel, click "Verify Property" to submit legal documentation to your city admin. Once approved, you can publish your hostel.
            </p>
            <button
              onClick={() => setIsVerifyModalOpen(true)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg"
            >
              Start Property Verification
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myHostels.map((hostel) => (
              <div key={hostel._id} className="relative group">
                <HostelCard hostel={hostel} onSelect={() => onSelectHostel(hostel._id)} />
                {/* Action buttons bar */}
                <div className="flex items-center justify-end gap-2 mt-2 px-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHostelForEdit(hostel);
                      setIsEditModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-xl transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHostel(hostel._id);
                    }}
                    disabled={deletingId === hostel._id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-600/20 hover:bg-rose-600/30 rounded-xl transition-all"
                  >
                    {deletingId === hostel._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <VerifyPropertyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onSuccess={(vData) => {
          setVerification(vData);
          if (vData.status === 'accepted') {
            setIsCreateModalOpen(true);
          }
        }}
      />

      <CreateHostelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        verificationId={verification?._id}
        onSuccess={fetchMyHostels}
      />

      <EditHostelModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedHostelForEdit(null);
        }}
        hostel={selectedHostelForEdit}
        onSuccess={fetchMyHostels}
      />
    </div>
  );
};

export default OwnerDashboard;
