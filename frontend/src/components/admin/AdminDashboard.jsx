import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, CheckCircle2, XCircle, Eye, User, Phone, Mail, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const AdminDashboard = () => {
  const { user, showNotification } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [reqDetails, setReqDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admins/get-request');
      if (res.data?.data) {
        setRequests(res.data.data);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to load verification requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequestById = async (verifyId) => {
    try {
      setDetailsLoading(true);
      const res = await api.get(`/admins/get-request/${verifyId}`);
      if (res.data?.data) {
        setReqDetails(res.data.data);
      }
    } catch (err) {
      showNotification('Failed to fetch request details', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUpdateStatus = async (verifyId, status) => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      showNotification('Please enter a rejection reason', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      await api.patch(`/admins/get-request/${verifyId}/status`, {
        status,
        reason: status === 'rejected' ? rejectionReason : undefined,
      });

      showNotification(`Verification request ${status} successfully!`, 'success');
      setSelectedReq(null);
      setReqDetails(null);
      setRejectionReason('');
      fetchRequests();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update request status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-6 glass-panel rounded-3xl border border-purple-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">City Admin Portal</h1>
            <p className="text-xs text-gray-400">
              Review and approve property verification documents for city:{' '}
              <span className="text-purple-300 font-bold uppercase">{user?.city || 'All'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-300 bg-gray-900 hover:text-white rounded-xl border border-gray-800 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Requests</span>
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-gray-800">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-white mb-1">No Pending Verification Requests</h3>
          <p className="text-xs text-gray-400">All property verification requests for your city have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Pending Requests List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-2">
              Pending Approvals ({requests.length})
            </h2>

            {requests.map((req) => (
              <div
                key={req._id}
                onClick={() => {
                  setSelectedReq(req);
                  fetchRequestById(req._id);
                }}
                className={`p-4 rounded-2xl glass-card border transition-all cursor-pointer ${
                  selectedReq?._id === req._id
                    ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                    : 'border-gray-800 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Verification ID: #{req._id.slice(-6)}</p>
                      <p className="text-xs text-gray-400">
                        Submitted: {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-600/20 rounded-xl">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Request Inspection Panel */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-2">
              Document Inspector
            </h2>

            {detailsLoading ? (
              <div className="flex items-center justify-center p-12 glass-panel rounded-3xl border border-gray-800">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
            ) : reqDetails ? (
              <div className="p-6 glass-panel rounded-3xl border border-purple-500/30 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Owner Details
                  </h3>
                  <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="w-4 h-4 text-purple-400" />
                      <span className="font-bold text-white capitalize">{reqDetails.owner?.fullname}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      <span>{reqDetails.owner?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>{reqDetails.owner?.mobileNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Uploaded Legal Document View */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Property Document Preview
                  </h3>
                  {reqDetails.document?.url ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-black">
                      <img
                        src={reqDetails.document.url}
                        alt="Property Verification Document"
                        className="w-full max-h-72 object-contain py-2"
                      />
                      <a
                        href={reqDetails.document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center py-2 bg-gray-900 hover:bg-gray-800 text-xs font-semibold text-purple-300 border-t border-gray-800 transition-colors"
                      >
                        Open Document in Full Window ↗
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Document URL unavailable</p>
                  )}
                </div>

                {/* Accept / Reject Controls */}
                <div className="pt-4 border-t border-gray-800 space-y-3">
                  <div>
                    <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                      Rejection Reason (If rejecting)
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Invalid document upload or unclear address"
                      className="w-full py-2 px-3 text-xs bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdateStatus(reqDetails._id, 'accepted')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Document</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(reqDetails._id, 'rejected')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 font-semibold text-xs text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Reject Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center glass-panel rounded-3xl border border-gray-800">
                <p className="text-xs text-gray-500">Select a pending request from the list to inspect legal documents.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
