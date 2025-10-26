import React, { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';
import { resourceAPI } from '../api';

// Star Rating Input Component
export function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const [hover, setHover] = useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const ratingValue = Number(value) || 0;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hover || ratingValue);
        return (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange && onChange(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            disabled={readonly}
            className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            <Star
              className={`${sizes[size]} transition-colors ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

// Rating Summary Display
export function RatingSummary({ averageRating, ratingCount }) {
  if (!ratingCount || ratingCount === 0) {
    return (
      <div className="text-sm text-gray-500">
        No ratings yet
      </div>
    );
  }

  const avgRating = Number(averageRating) || 0;

  return (
    <div className="flex items-center gap-2">
      <StarRating value={Math.round(avgRating)} readonly size="sm" />
      <span className="text-lg font-bold text-gray-900">
        {avgRating.toFixed(1)}
      </span>
      <span className="text-sm text-gray-500">
        ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
      </span>
    </div>
  );
}

// Rating Form Component
export function RatingForm({ resourceId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await resourceAPI.rateResource(resourceId, rating, review);
      setSuccess('Thank you for your rating!');
      setRating(0);
      setReview('');
      
      if (onSuccess) onSuccess();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Rate this resource</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Rating
          </label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        <div>
          <label htmlFor="review" className="block text-sm font-semibold text-gray-700 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Share your thoughts about this resource..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {review.length}/500 characters
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
}

// Reviews List Component
export function ReviewsList({ resourceId }) {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, [resourceId]);

  const fetchRatings = async () => {
    try {
      const response = await resourceAPI.getResourceRatings(resourceId);
      setRatings(response.data.ratings || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">
        Reviews ({ratings.length})
      </h3>
      
      <div className="space-y-4">
        {ratings.map((rating) => (
          <div
            key={rating.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full p-2">
                <User className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{rating.user_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating value={rating.rating} readonly size="sm" />
                      <span className="text-sm text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                {rating.review && (
                  <p className="text-gray-700 text-sm mt-2 leading-relaxed">
                    {rating.review}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Full Rating & Review Section
export function RatingSection({ resource, onRatingUpdate }) {
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resource && resource.id) {
      fetchUserRating();
    }
  }, [resource?.id]);

  const fetchUserRating = async () => {
    if (!resource || !resource.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await resourceAPI.getUserRating(resource.id);
      setUserRating(response.data.rating);
    } catch (error) {
      console.error('Error fetching user rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSuccess = () => {
    fetchUserRating();
    if (onRatingUpdate) onRatingUpdate();
  };

  if (!resource) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Resource not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Average Rating Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ratings & Reviews</h2>
        <RatingSummary
          averageRating={resource.average_rating || 0}
          ratingCount={resource.rating_count || 0}
        />
      </div>

      {/* User's Rating Form or Display */}
      {!loading && (
        <>
          {userRating ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-yellow-800 mb-2">Your Rating</p>
              <div className="flex items-center gap-3">
                <StarRating value={userRating.rating} readonly size="md" />
                <span className="text-lg font-bold text-yellow-900">{userRating.rating}/5</span>
              </div>
              {userRating.review && (
                <p className="text-sm text-yellow-800 mt-3 italic">
                  &ldquo;{userRating.review}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <RatingForm resourceId={resource.id} onSuccess={handleRatingSuccess} />
          )}
        </>
      )}

      {/* All Reviews */}
      <ReviewsList resourceId={resource.id} />
    </div>
  );
}
