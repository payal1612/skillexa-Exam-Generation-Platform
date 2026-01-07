import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Star Rating Component
const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))}
  </div>
);

// Single Testimonial Card
const TestimonialCard = ({ testimonial, isActive = false }) => (
  <div
    className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-500 ${
      isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50'
    }`}
  >
    {/* Quote Icon */}
    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
      <Quote className="w-5 h-5 text-white" />
    </div>

    {/* Rating */}
    <div className="mb-3">
      <StarRating rating={testimonial.rating} />
    </div>

    {/* Headline */}
    {testimonial.headline && (
      <h4 className="font-semibold text-gray-900 mb-2">{testimonial.headline}</h4>
    )}

    {/* Content */}
    <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
      "{testimonial.content}"
    </p>

    {/* Author */}
    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
      {/* Use displayPhoto virtual if available, otherwise fallback to customPhoto or avatar */}
      {(testimonial.displayPhoto || testimonial.authorInfo?.customPhoto || testimonial.authorInfo?.avatar) ? (
        <img
          src={testimonial.displayPhoto || 
               (testimonial.authorInfo?.photoType === 'custom' && testimonial.authorInfo?.customPhoto) || 
               testimonial.authorInfo?.avatar}
          alt={testimonial.authorInfo?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-semibold">
            {testimonial.authorInfo?.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
      )}
      <div>
        <p className="font-medium text-gray-900 text-sm">
          {testimonial.authorInfo?.name}
        </p>
        {testimonial.authorInfo?.title && (
          <p className="text-xs text-gray-500">
            {testimonial.authorInfo.title}
            {testimonial.authorInfo.company && ` at ${testimonial.authorInfo.company}`}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Main Testimonials Widget Component
export default function TestimonialsWidget({ 
  maxItems = 6, 
  autoPlay = true, 
  autoPlayInterval = 5000,
  showTitle = true,
  className = ''
}) {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Fetch featured testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/testimonials/featured?limit=${maxItems}`);
        setTestimonials(res.data.testimonials || []);
      } catch (err) {
        console.error('Failed to fetch testimonials:', err);
        // Fallback to approved testimonials
        try {
          const fallbackRes = await axios.get(`${API_BASE}/api/testimonials?limit=${maxItems}`);
          setTestimonials(fallbackRes.data.testimonials || []);
        } catch (fallbackErr) {
          setError('Failed to load testimonials');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [maxItems]);

  // Auto-play carousel
  useEffect(() => {
    if (autoPlay && testimonials.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, testimonials.length]);

  // Navigation handlers
  const goToPrev = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToIndex = (index) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className={`py-20 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || testimonials.length === 0) {
    return null; // Don't show anything if no testimonials
  }

  return (
    <section className={`py-20 bg-gradient-to-br from-gray-50 to-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {showTitle && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Student Success Stories
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Learners{' '}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Say About Us
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of successful learners who transformed their careers with SkillExa
            </p>
          </div>
        )}

        {/* Carousel Container */}
        <div className="relative">
          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <TestimonialCard key={testimonial._id} testimonial={testimonial} isActive={true} />
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial._id} className="w-full flex-shrink-0 px-2">
                  <TestimonialCard testimonial={testimonial} isActive={true} />
                </div>
              ))}
            </div>

            {/* Mobile Navigation Arrows */}
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            {/* Mobile Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-violet-600 w-6' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <a
            href="#testimonials"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
          >
            View All Testimonials
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// Mini Widget Version (for sidebar or smaller spaces)
export function TestimonialsMiniWidget({ limit = 3 }) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/testimonials/featured?limit=${limit}`);
        setTestimonials(res.data.testimonials || []);
      } catch (err) {
        console.error('Failed to fetch testimonials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [limit]);

  if (loading || testimonials.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Quote className="w-5 h-5 text-violet-600" />
        <h3 className="font-semibold text-gray-900">What Students Say</h3>
      </div>
      
      <div className="space-y-4">
        {testimonials.slice(0, limit).map((testimonial) => (
          <div key={testimonial._id} className="border-l-2 border-violet-200 pl-4">
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              "{testimonial.content}"
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {testimonial.authorInfo?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-500">{testimonial.authorInfo?.name}</span>
              <StarRating rating={testimonial.rating} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
