import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  MessageSquare, Star, Filter, Search, RefreshCw, X, Check,
  ChevronLeft, ChevronRight, Eye, Trash2, Sparkles, Clock,
  CheckCircle, XCircle, BarChart3, ThumbsUp, Heart, Users,
  Edit, MoreVertical, Archive, RotateCcw, AlertTriangle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Star Rating Display Component
const StarRating = ({ rating, size = 'sm' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5' };
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    featured: 'bg-violet-100 text-violet-700 border-violet-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    archived: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const icons = {
    pending: Clock,
    approved: CheckCircle,
    featured: Sparkles,
    rejected: XCircle,
    archived: Archive,
  };

  const Icon = icons[status] || Clock;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${
        styles[status] || styles.pending
      }`}
    >
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Testimonial Detail Modal
const TestimonialDetailModal = ({ testimonial, isOpen, onClose, onAction, loading }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [priority, setPriority] = useState(50);

  if (!isOpen || !testimonial) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Testimonial Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Author Info */}
          <div className="flex items-start gap-4">
            <div className="relative">
              {/* Use displayPhoto virtual if available, otherwise fallback to customPhoto or avatar */}
              {(testimonial.displayPhoto || testimonial.authorInfo?.customPhoto || testimonial.authorInfo?.avatar) ? (
                <img
                  src={testimonial.displayPhoto || 
                       (testimonial.authorInfo?.photoType === 'custom' && testimonial.authorInfo?.customPhoto) || 
                       testimonial.authorInfo?.avatar}
                  alt={testimonial.authorInfo?.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-violet-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center ring-2 ring-violet-100">
                  <span className="text-white font-semibold text-2xl">
                    {testimonial.authorInfo?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">
                {testimonial.authorInfo?.name}
              </h4>
              <p className="text-gray-500 text-sm">
                {testimonial.authorInfo?.title}
                {testimonial.authorInfo?.company && ` at ${testimonial.authorInfo.company}`}
              </p>
              {testimonial.authorInfo?.location && (
                <p className="text-gray-400 text-sm">{testimonial.authorInfo.location}</p>
              )}
              {testimonial.user?.email && (
                <p className="text-gray-400 text-xs mt-1">{testimonial.user.email}</p>
              )}
            </div>
            <StatusBadge status={testimonial.status} />
          </div>

          {/* Rating & Meta */}
          <div className="flex items-center gap-4 py-3 border-y border-gray-100">
            <div className="flex items-center gap-2">
              <StarRating rating={testimonial.rating} size="md" />
              <span className="text-gray-500 text-sm">({testimonial.rating}/5)</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm">
              {testimonial.category?.replace(/_/g, ' ')}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm">
              {new Date(testimonial.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Headline */}
          {testimonial.headline && (
            <div>
              <label className="text-sm font-medium text-gray-500">Headline</label>
              <p className="text-gray-900 font-semibold mt-1">{testimonial.headline}</p>
            </div>
          )}

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-gray-500">Testimonial</label>
            <p className="text-gray-700 mt-1 leading-relaxed bg-gray-50 p-4 rounded-xl">
              "{testimonial.content}"
            </p>
          </div>

          {/* Engagement Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Eye className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-gray-900">
                {testimonial.engagement?.views || 0}
              </p>
              <p className="text-xs text-gray-500">Views</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-gray-900">
                {testimonial.engagement?.likes || 0}
              </p>
              <p className="text-xs text-gray-500">Likes</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <ThumbsUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-gray-900">
                {testimonial.engagement?.helpful || 0}
              </p>
              <p className="text-xs text-gray-500">Helpful</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Sparkles className="w-5 h-5 text-violet-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-gray-900">
                {testimonial.featured?.priority || 0}
              </p>
              <p className="text-xs text-gray-500">Priority</p>
            </div>
          </div>

          {/* Moderation Info */}
          {testimonial.moderation?.moderatedAt && (
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="text-sm font-medium text-gray-500">Moderation History</label>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Moderated by:</span>{' '}
                  {testimonial.moderation.moderatedBy?.name || 'Admin'}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(testimonial.moderation.moderatedAt).toLocaleString()}
                </p>
                {testimonial.moderation.rejectionReason && (
                  <p className="text-sm text-red-600">
                    <span className="font-medium">Rejection Reason:</span>{' '}
                    {testimonial.moderation.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <label className="text-sm font-medium text-red-700">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this testimonial is being rejected..."
                rows={3}
                className="w-full mt-2 px-4 py-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    onAction('reject', { reason: rejectionReason });
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Feature Priority */}
          {testimonial.status === 'approved' && (
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
              <label className="text-sm font-medium text-violet-700">Feature with Priority</label>
              <div className="flex items-center gap-4 mt-2">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-violet-700 font-medium w-12">{priority}</span>
                <button
                  onClick={() => onAction('feature', { priority })}
                  disabled={loading}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Feature
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex flex-wrap gap-2">
          {testimonial.status === 'pending' && (
            <>
              <button
                onClick={() => onAction('approve')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </>
          )}

          {testimonial.status === 'featured' && (
            <button
              onClick={() => onAction('unfeature')}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Unfeature
            </button>
          )}

          {testimonial.status === 'rejected' && (
            <button
              onClick={() => onAction('approve')}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Re-approve
            </button>
          )}

          <button
            onClick={() => onAction('delete')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Admin Testimonials Component
export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modal
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const showMessage = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Fetch testimonials
  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        status,
        category,
        search,
        sortBy,
        sortOrder,
      });

      const res = await axios.get(
        `${API_BASE}/api/testimonials/admin/all?${params}`,
        getAuthHeaders()
      );

      setTestimonials(res.data.testimonials);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      showMessage('Failed to load testimonials', true);
    }
    setLoading(false);
  }, [page, status, category, search, sortBy, sortOrder]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/testimonials/admin/stats`,
        getAuthHeaders()
      );
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchTestimonials();
    fetchStats();
  }, [fetchTestimonials]);

  // Handle single testimonial actions
  const handleAction = async (action, data = {}) => {
    if (!selectedTestimonial) return;
    setActionLoading(true);

    try {
      const id = selectedTestimonial._id;
      let endpoint = '';
      let method = 'put';

      switch (action) {
        case 'approve':
          endpoint = `/api/testimonials/admin/${id}/approve`;
          break;
        case 'reject':
          endpoint = `/api/testimonials/admin/${id}/reject`;
          break;
        case 'feature':
          endpoint = `/api/testimonials/admin/${id}/feature`;
          break;
        case 'unfeature':
          endpoint = `/api/testimonials/admin/${id}/unfeature`;
          break;
        case 'delete':
          endpoint = `/api/testimonials/admin/${id}`;
          method = 'delete';
          break;
        default:
          return;
      }

      if (method === 'delete') {
        await axios.delete(`${API_BASE}${endpoint}`, getAuthHeaders());
      } else {
        await axios.put(`${API_BASE}${endpoint}`, data, getAuthHeaders());
      }

      showMessage(`Testimonial ${action}d successfully`);
      setShowModal(false);
      setSelectedTestimonial(null);
      fetchTestimonials();
      fetchStats();
    } catch (err) {
      showMessage(err.response?.data?.message || `Failed to ${action} testimonial`, true);
    }

    setActionLoading(false);
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} testimonials?`)) return;

    setActionLoading(true);
    try {
      await axios.put(
        `${API_BASE}/api/testimonials/admin/bulk-update`,
        { testimonialIds: selectedIds, action },
        getAuthHeaders()
      );

      showMessage(`${selectedIds.length} testimonials ${action}d successfully`);
      setSelectedIds([]);
      setSelectAll(false);
      fetchTestimonials();
      fetchStats();
    } catch (err) {
      showMessage(`Failed to ${action} testimonials`, true);
    }
    setActionLoading(false);
  };

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(testimonials.map((t) => t._id));
    }
    setSelectAll(!selectAll);
  };

  // Open detail modal
  const openDetail = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowModal(true);
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'course_quality', label: 'Course Quality' },
    { value: 'skill_development', label: 'Skill Development' },
    { value: 'career_growth', label: 'Career Growth' },
    { value: 'platform_experience', label: 'Platform Experience' },
    { value: 'instructor_quality', label: 'Instructor Quality' },
    { value: 'certification', label: 'Certification' },
    { value: 'support', label: 'Support' },
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'featured', label: 'Featured' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Testimonials</h2>
            <p className="text-gray-500 text-sm">Manage and moderate user testimonials</p>
          </div>
        </div>
        <button
          onClick={() => {
            fetchTestimonials();
            fetchStats();
          }}
          className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Notifications */}
      {(success || error) && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${
          error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {error ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {error || success}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                <p className="text-xs text-gray-500">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
                <p className="text-xs text-gray-500">Featured</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                <p className="text-xs text-gray-500">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search testimonials..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort);
              setSortOrder(order);
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="rating-asc">Lowest Rated</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {selectedIds.length} selected
            </span>
            <button
              onClick={() => handleBulkAction('approve')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              Approve All
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Reject All
            </button>
            <button
              onClick={() => handleBulkAction('feature')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200 transition-colors"
            >
              Feature All
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Delete All
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Testimonials Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No testimonials found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {testimonials.map((testimonial) => (
                  <tr
                    key={testimonial._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedIds.includes(testimonial._id) ? 'bg-violet-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(testimonial._id)}
                        onChange={() => toggleSelect(testimonial._id)}
                        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {/* Use displayPhoto virtual if available, otherwise fallback to customPhoto or avatar */}
                          {(testimonial.displayPhoto || testimonial.authorInfo?.customPhoto || testimonial.authorInfo?.avatar) ? (
                            <img
                              src={testimonial.displayPhoto || 
                                   (testimonial.authorInfo?.photoType === 'custom' && testimonial.authorInfo?.customPhoto) || 
                                   testimonial.authorInfo?.avatar}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {testimonial.authorInfo?.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {testimonial.authorInfo?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {testimonial.authorInfo?.title || testimonial.category?.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm text-gray-600 truncate">
                        {testimonial.headline || testimonial.content?.substring(0, 60) + '...'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StarRating rating={testimonial.rating} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={testimonial.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(testimonial.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDetail(testimonial)}
                          className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {testimonial.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTestimonial(testimonial);
                                handleAction('approve');
                              }}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDetail(testimonial)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <TestimonialDetailModal
        testimonial={selectedTestimonial}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTestimonial(null);
        }}
        onAction={handleAction}
        loading={actionLoading}
      />
    </div>
  );
}
