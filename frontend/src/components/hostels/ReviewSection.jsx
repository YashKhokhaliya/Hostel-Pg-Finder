import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, Edit3, Send, Loader2, User } from 'lucide-react';
import RatingStars from '../common/RatingStars';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const ReviewSection = ({ hostelId, myRatingProp, onRatingChanged }) => {
  const { user, showNotification } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, ratingCount: 0 });
  const [loading, setLoading] = useState(true);

  // Form states
  const [stars, setStars] = useState(myRatingProp?.rating || 5);
  const [comment, setComment] = useState(myRatingProp?.comment || '');
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myRating, setMyRating] = useState(myRatingProp || null);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ratings/get-hostel-ratings/${hostelId}`);
      if (res.data?.data) {
        setRatings(res.data.data.hostelRatings?.docs || []);
        setStats({
          averageRating: res.data.data.averageRating || 0,
          ratingCount: res.data.data.ratingCount || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load ratings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
    if (myRatingProp) {
      setMyRating(myRatingProp);
      setStars(myRatingProp.rating);
      setComment(myRatingProp.comment || '');
    }
  }, [hostelId, myRatingProp]);

  const handleAddRating = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'student') {
      showNotification('Only students can submit reviews', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/ratings/add-rating/${hostelId}`, {
        rating: stars,
        comment,
      });
      showNotification('Review added successfully!', 'success');
      setMyRating(res.data.data);
      setIsEditing(false);
      fetchRatings();
      if (onRatingChanged) onRatingChanged();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRating = async (e) => {
    e.preventDefault();
    if (!myRating?._id) return;
    setSubmitting(true);
    try {
      const res = await api.patch(`/ratings/update-rating/${myRating._id}`, {
        rating: stars,
        comment,
      });
      showNotification('Review updated!', 'success');
      setMyRating(res.data.data);
      setIsEditing(false);
      fetchRatings();
      if (onRatingChanged) onRatingChanged();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!window.confirm('Are you sure you want to remove your review?')) return;
    setSubmitting(true);
    try {
      await api.delete(`/ratings/${hostelId}/remove-rating`);
      showNotification('Review removed', 'info');
      setMyRating(null);
      setComment('');
      setStars(5);
      setIsEditing(false);
      fetchRatings();
      if (onRatingChanged) onRatingChanged();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to remove review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <span>Reviews & Ratings</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Real feedback from verified students</p>
        </div>

        {/* Rating Summary Pill */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gray-900/80 border border-gray-800">
          <div className="flex items-center gap-1 text-amber-400 font-extrabold text-lg">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</span>
          </div>
          <div className="h-4 w-px bg-gray-700" />
          <span className="text-xs font-semibold text-gray-400">
            {stats.ratingCount} {stats.ratingCount === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>
      </div>

      {/* Add / Edit Review Form for Students */}
      {user?.role === 'student' && (
        <div className="mb-6 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-white">
              {myRating && !isEditing ? 'Your Submitted Review' : myRating ? 'Edit Your Review' : 'Write a Review'}
            </h4>
            {myRating && !isEditing && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRating}
                  disabled={submitting}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {(!myRating || isEditing) ? (
            <form onSubmit={myRating ? handleUpdateRating : handleAddRating} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-300">Rating Score:</span>
                <RatingStars rating={stars} interactive={true} onRate={setStars} size="lg" />
              </div>

              <div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  placeholder="Share your living experience, food quality, safety, clean rooms..."
                  className="w-full p-3 text-sm bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{myRating ? 'Update Review' : 'Submit Review'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-1">
              <RatingStars rating={myRating.rating} size="sm" />
              {myRating.comment && (
                <p className="text-sm text-gray-200 mt-2 bg-gray-900/60 p-3 rounded-xl border border-gray-800/60">
                  "{myRating.comment}"
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ratings List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : ratings.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-gray-900/40 border border-gray-800">
          <p className="text-sm text-gray-400">No reviews yet for this hostel. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ratings.map((rev) => (
            <div key={rev._id} className="p-4 rounded-xl glass-card border border-gray-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  {rev.user?.profilePhoto ? (
                    <img
                      src={rev.user.profilePhoto}
                      alt={rev.user.username}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-500/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
                      {rev.user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-white capitalize">
                      {rev.user?.fullname || rev.user?.username || 'Student'}
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>

                <RatingStars rating={rev.rating} size="sm" />
              </div>

              {rev.comment && (
                <p className="text-xs text-gray-300 leading-relaxed pl-9">{rev.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
