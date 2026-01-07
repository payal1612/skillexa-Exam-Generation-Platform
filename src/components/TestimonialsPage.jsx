import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { 
  Star, Quote, ThumbsUp, Heart, MessageSquare, Share2, 
  ChevronLeft, ChevronRight, Filter, Search, X, Plus,
  Award, Users, TrendingUp, Sparkles, RefreshCw, ExternalLink,
  CheckCircle, Clock, Send, Edit, Trash2, AlertCircle, Camera, Image
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Star Rating Component
const StarRating = ({ rating, size = 'md', interactive = false, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        >
          <Star
            className={`${sizes[size]} ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ testimonial, onLike, onHelpful, currentUserId, featured = false }) => {
  const [isLiked, setIsLiked] = useState(
    testimonial.likedBy?.includes(currentUserId)
  );
  const [likes, setLikes] = useState(testimonial.engagement?.likes || 0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) return;
    setIsAnimating(true);
    try {
      const result = await onLike(testimonial._id);
      setIsLiked(result.isLiked);
      setLikes(result.likes);
    } catch (error) {
      console.error('Like failed:', error);
    }
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div 
      className={`relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group ${
        featured ? 'ring-2 ring-violet-500 ring-offset-2' : ''
      }`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
          <Sparkles className="w-3 h-3" />
          Featured
        </div>
      )}

      {/* Quote Icon */}
      <div className="absolute -top-4 left-6 bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-xl shadow-lg">
        <Quote className="w-5 h-5 text-white" />
      </div>

      {/* Content */}
      <div className="mt-4">
        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <StarRating rating={testimonial.rating} size="sm" />
          <span className="text-xs text-gray-500">
            {new Date(testimonial.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        {/* Headline */}
        {testimonial.headline && (
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
            {testimonial.headline}
          </h4>
        )}

        {/* Testimonial Content */}
        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-4">
          "{testimonial.content}"
        </p>

        {/* Category Tag */}
        {testimonial.category && testimonial.category !== 'general' && (
          <span className="inline-block px-2 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full mb-4">
            {testimonial.category.replace(/_/g, ' ')}
          </span>
        )}

        {/* Author Info */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <div className="relative">
            {/* Use displayPhoto virtual if available, otherwise fallback to customPhoto or avatar */}
            {(testimonial.displayPhoto || testimonial.authorInfo?.customPhoto || testimonial.authorInfo?.avatar) ? (
              <img
                src={testimonial.displayPhoto || 
                     (testimonial.authorInfo?.photoType === 'custom' && testimonial.authorInfo?.customPhoto) || 
                     testimonial.authorInfo?.avatar}
                alt={testimonial.authorInfo?.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-violet-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center ring-2 ring-violet-100">
                <span className="text-white font-semibold text-lg">
                  {testimonial.authorInfo?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            {testimonial.verified?.isVerified && (
              <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-gray-900 truncate">
              {testimonial.authorInfo?.name}
            </h5>
            {(testimonial.authorInfo?.title || testimonial.authorInfo?.company) && (
              <p className="text-sm text-gray-500 truncate">
                {testimonial.authorInfo.title}
                {testimonial.authorInfo.title && testimonial.authorInfo.company && ' at '}
                {testimonial.authorInfo.company}
              </p>
            )}
          </div>
        </div>

        {/* Engagement Actions */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            disabled={!currentUserId}
            className={`flex items-center gap-1.5 text-sm transition-all ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            } ${isAnimating ? 'scale-125' : ''} ${!currentUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>
          <button
            onClick={() => onHelpful?.(testimonial._id)}
            disabled={!currentUserId}
            className={`flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors ${
              !currentUserId ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{testimonial.engagement?.helpful || 0}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-500 transition-colors ml-auto">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Create/Edit Testimonial Modal
const TestimonialModal = ({ isOpen, onClose, onSubmit, editData = null, loading }) => {
  const [formData, setFormData] = useState({
    content: '',
    headline: '',
    rating: 5,
    category: 'general',
    title: '',
    company: '',
    location: '',
    customPhoto: '',
    photoType: 'profile',
  });
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        content: editData.content || '',
        headline: editData.headline || '',
        rating: editData.rating || 5,
        category: editData.category || 'general',
        title: editData.authorInfo?.title || '',
        company: editData.authorInfo?.company || '',
        location: editData.authorInfo?.location || '',
        customPhoto: editData.authorInfo?.customPhoto || '',
        photoType: editData.authorInfo?.photoType || 'profile',
      });
      setPhotoPreview(editData.authorInfo?.customPhoto || null);
    } else {
      setFormData({
        content: '',
        headline: '',
        rating: 5,
        category: 'general',
        title: '',
        company: '',
        location: '',
        customPhoto: '',
        photoType: 'profile',
      });
      setPhotoPreview(null);
    }
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.content || formData.content.length < 20) {
      newErrors.content = 'Testimonial must be at least 20 characters';
    }
    if (formData.content.length > 1000) {
      newErrors.content = 'Testimonial cannot exceed 1000 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle photo upload - converts to base64 for storage
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, photo: 'Please select an image file' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ ...errors, photo: 'Image must be less than 2MB' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setPhotoPreview(base64String);
      setFormData({
        ...formData,
        customPhoto: base64String,
        photoType: 'custom'
      });
      setErrors({ ...errors, photo: null });
    };
    reader.readAsDataURL(file);
  };

  // Clear custom photo
  const clearCustomPhoto = () => {
    setPhotoPreview(null);
    setFormData({
      ...formData,
      customPhoto: '',
      photoType: 'profile'
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'course_quality', label: 'Course Quality' },
    { value: 'skill_development', label: 'Skill Development' },
    { value: 'career_growth', label: 'Career Growth' },
    { value: 'platform_experience', label: 'Platform Experience' },
    { value: 'instructor_quality', label: 'Instructor Quality' },
    { value: 'certification', label: 'Certification' },
    { value: 'support', label: 'Support' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {editData ? 'Edit Testimonial' : 'Share Your Experience'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating *
            </label>
            <StarRating
              rating={formData.rating}
              size="lg"
              interactive
              onChange={(rating) => setFormData({ ...formData, rating })}
            />
          </div>

          {/* Headline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headline (Optional)
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="Sum up your experience in a few words"
              maxLength={150}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Testimonial *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your experience with SkillExa..."
              rows={5}
              maxLength={1000}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none ${
                errors.content ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.content && (
                <span className="text-sm text-red-500">{errors.content}</span>
              )}
              <span className="text-sm text-gray-400 ml-auto">
                {formData.content.length}/1000
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Professional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title (Optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Software Engineer"
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g., Google"
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Custom Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Add a custom photo for your testimonial, or your profile picture will be used
            </p>
            
            <div className="flex items-center gap-4">
              {/* Photo Preview */}
              <div className="relative">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-violet-200"
                    />
                    <button
                      type="button"
                      onClick={clearCustomPhoto}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center border-2 border-dashed border-violet-300">
                    <Camera className="w-8 h-8 text-violet-400" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-violet-300 text-violet-600 rounded-xl font-medium hover:bg-violet-50 transition-colors cursor-pointer"
                >
                  <Image className="w-4 h-4" />
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </label>
                {errors.photo && (
                  <p className="text-sm text-red-500 mt-1">{errors.photo}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Max 2MB, JPG/PNG/GIF</p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {editData ? 'Update' : 'Submit'}
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your testimonial will be reviewed before being published.
          </p>
        </form>
      </div>
    </div>
  );
};

// Main Testimonials Page Component
export default function TestimonialsPage({ onBack }) {
  const [testimonials, setTestimonials] = useState([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
  const [stats, setStats] = useState(null);
  const [myTestimonials, setMyTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Featured carousel
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const carouselRef = useRef(null);

  // User auth
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication
  useEffect(() => {
    const savedUser = localStorage.getItem('skillforge_user');
    const savedAuth = localStorage.getItem('skillforge_auth');
    if (savedUser && savedAuth === 'true') {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Fetch testimonials
  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/testimonials?page=${page}&limit=9&category=${category}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      setTestimonials(res.data.testimonials);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
      setError('Failed to load testimonials');
    }
  }, [page, category, sortBy, sortOrder]);

  // Fetch featured testimonials
  const fetchFeatured = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/testimonials/featured?limit=6`);
      setFeaturedTestimonials(res.data.testimonials);
    } catch (err) {
      console.error('Failed to fetch featured:', err);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/testimonials/stats`);
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch user's testimonials
  const fetchMyTestimonials = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await axios.get(`${API_BASE}/api/testimonials/user/my`, getAuthHeaders());
      setMyTestimonials(res.data.testimonials);
    } catch (err) {
      console.error('Failed to fetch my testimonials:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTestimonials(), fetchFeatured(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [fetchTestimonials]);

  // Fetch user testimonials when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyTestimonials();
    }
  }, [isAuthenticated]);

  // Auto-rotate featured carousel
  useEffect(() => {
    if (featuredTestimonials.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredTestimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredTestimonials.length]);

  // Handlers
  const handleLike = async (testimonialId) => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/testimonials/${testimonialId}/like`,
        {},
        getAuthHeaders()
      );
      return res.data;
    } catch (err) {
      console.error('Like failed:', err);
      throw err;
    }
  };

  const handleHelpful = async (testimonialId) => {
    try {
      await axios.post(
        `${API_BASE}/api/testimonials/${testimonialId}/helpful`,
        {},
        getAuthHeaders()
      );
      // Refresh testimonials to update helpful count
      fetchTestimonials();
    } catch (err) {
      console.error('Mark helpful failed:', err);
    }
  };

  const handleSubmitTestimonial = async (formData) => {
    setSubmitting(true);
    try {
      if (editingTestimonial) {
        await axios.put(
          `${API_BASE}/api/testimonials/${editingTestimonial._id}`,
          formData,
          getAuthHeaders()
        );
        setSuccess('Testimonial updated successfully!');
      } else {
        await axios.post(`${API_BASE}/api/testimonials`, formData, getAuthHeaders());
        setSuccess('Testimonial submitted! It will be visible after approval.');
      }
      setShowModal(false);
      setEditingTestimonial(null);
      fetchMyTestimonials();
      fetchTestimonials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit testimonial');
    }
    setSubmitting(false);
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await axios.delete(`${API_BASE}/api/testimonials/${testimonialId}`, getAuthHeaders());
      setSuccess('Testimonial deleted successfully');
      fetchMyTestimonials();
      fetchTestimonials();
    } catch (err) {
      setError('Failed to delete testimonial');
    }
  };

  const openEditModal = (testimonial) => {
    setEditingTestimonial(testimonial);
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

  // Clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Notification Messages */}
      {(success || error) && (
        <div className="fixed top-4 right-4 z-50">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Testimonials
            </h1>
            {isAuthenticated && (
              <button
                onClick={() => {
                  setEditingTestimonial(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
              >
                <Plus className="w-4 h-4" />
                Share Your Story
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" />
            Real Stories from Real Learners
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Community{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Says About Us
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how SkillExa has transformed careers and empowered learners worldwide
          </p>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-violet-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalApproved || 0}+</p>
                <p className="text-sm text-gray-500">Happy Learners</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.averageRating || 0}</p>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLikes || 0}</p>
                <p className="text-sm text-gray-500">Total Likes</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">95%</p>
                <p className="text-sm text-gray-500">Satisfaction Rate</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Testimonials Carousel */}
      {featuredTestimonials.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-violet-600 to-purple-600">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white">Featured Stories</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFeaturedIndex((prev) => (prev - 1 + featuredTestimonials.length) % featuredTestimonials.length)}
                  className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setFeaturedIndex((prev) => (prev + 1) % featuredTestimonials.length)}
                  className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden" ref={carouselRef}>
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${featuredIndex * 100}%)` }}
              >
                {featuredTestimonials.map((testimonial) => (
                  <div key={testimonial._id} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-3xl mx-auto">
                      <Quote className="w-12 h-12 text-white/60 mb-4" />
                      <p className="text-xl text-white leading-relaxed mb-6">
                        "{testimonial.content}"
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                          {testimonial.authorInfo?.avatar ? (
                            <img
                              src={testimonial.authorInfo.avatar}
                              alt={testimonial.authorInfo.name}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-xl font-semibold">
                              {testimonial.authorInfo?.name?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{testimonial.authorInfo?.name}</p>
                          <p className="text-white/70 text-sm">
                            {testimonial.authorInfo?.title}
                            {testimonial.authorInfo?.company && ` at ${testimonial.authorInfo.company}`}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <StarRating rating={testimonial.rating} size="md" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {featuredTestimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFeaturedIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === featuredIndex ? 'bg-white w-6' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* My Testimonials Section */}
      {isAuthenticated && myTestimonials.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-violet-50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">My Testimonials</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTestimonials.map((testimonial) => (
                <div
                  key={testimonial._id}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <StarRating rating={testimonial.rating} size="sm" />
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        testimonial.status === 'approved' || testimonial.status === 'featured'
                          ? 'bg-green-100 text-green-700'
                          : testimonial.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {testimonial.status === 'featured' ? 'Featured' : testimonial.status}
                    </span>
                  </div>
                  {testimonial.headline && (
                    <h4 className="font-semibold text-gray-900 mb-2">{testimonial.headline}</h4>
                  )}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {testimonial.content}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(testimonial)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(testimonial._id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Testimonials Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">Filter:</span>
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                setSortBy(sort);
                setSortOrder(order);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
            </select>
            <button
              onClick={() => fetchTestimonials()}
              className="p-2 text-gray-500 hover:text-violet-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Testimonials Grid */}
          {testimonials.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial._id}
                    testimonial={testimonial}
                    onLike={handleLike}
                    onHelpful={handleHelpful}
                    currentUserId={currentUser?.id}
                    featured={testimonial.status === 'featured'}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No testimonials found</h3>
              <p className="text-gray-500 mb-6">
                Be the first to share your experience with SkillExa!
              </p>
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setEditingTestimonial(null);
                    setShowModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Share Your Story
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-violet-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-4">
              Have a Story to Share?
            </h3>
            <p className="text-white/80 text-lg mb-8">
              Join our community and let the world know how SkillExa helped you grow.
            </p>
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
              <ExternalLink className="w-5 h-5" />
              Sign Up to Share
            </button>
          </div>
        </section>
      )}

      {/* Testimonial Modal */}
      <TestimonialModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTestimonial(null);
        }}
        onSubmit={handleSubmitTestimonial}
        editData={editingTestimonial}
        loading={submitting}
      />
    </div>
  );
}
