import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useCreateReviewMutation } from '../../store/apiSlice';
import type { RootState } from '../../store/store';
import { FaStar, FaEdit, FaPaperPlane, FaLock } from 'react-icons/fa';

const ReviewForm = ({ productId }: { productId: string }) => {

  const { token } = useSelector((state: RootState) => state.auth);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    if (comment.trim().length < 10) {
      toast.error('Please write a review with at least 10 characters.');
      return;
    }
    try {
      await createReview({ productId, rating, comment: comment.trim() }).unwrap();
      toast.success('Thank you for your review! Your feedback helps other shoppers. 🎉');
      setRating(0);
      setComment('');
      setHoverRating(0);
      setIsExpanded(false);
    } catch {
      toast.error('Failed to submit review. Please try again.');
    }
  };

  if (!token) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-xl border border-gray-200 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-full shadow-sm">
            <FaLock className="text-2xl text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Join the Conversation</h3>
            <p className="text-gray-600 mb-4">Sign in to share your experience with this product</p>
          </div>
          <div className="flex space-x-3">
            <a 
              href="/login" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In
            </a>
            <a 
              href="/register" 
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div 
        className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 cursor-pointer"
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-full shadow-sm">
              <FaEdit className="text-xl text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Write a Review</h3>
              <p className="text-gray-600">Share your experience with this product</p>
            </div>
          </div>
          {!isExpanded && (
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Review
            </div>
          )}
        </div>
      </div>

      {/* Expanded Form */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="p-6">
          {/* Rating Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Overall Rating</label>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)} 
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`text-3xl transition-all duration-200 transform hover:scale-110 ${
                      star <= (hoverRating || rating) 
                        ? 'text-yellow-400 drop-shadow-sm' 
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-3">
              Your Review
              <span className="text-gray-500 font-normal ml-1">(Minimum 10 characters)</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={5}
              placeholder="Share details about your experience with this product. What did you like? What could be improved?"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{comment.length}/500 characters</span>
              <span className={comment.length < 10 ? 'text-red-500' : 'text-green-500'}>
                {comment.length < 10 ? `${10 - comment.length} more required` : 'Good length'}
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setRating(0);
                setComment('');
                setHoverRating(0);
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || rating === 0 || comment.trim().length < 10}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <FaPaperPlane />
              <span>{isLoading ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>

          {/* Review Guidelines */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Review Guidelines</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Focus on the product and your experience</li>
              <li>• Be honest and specific about what you liked or disliked</li>
              <li>• Avoid personal information or offensive language</li>
              <li>• Your review will be visible to other shoppers</li>
            </ul>
          </div>
        </form>
      )}

      {/* Collapsed Preview */}
      {!isExpanded && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-gray-500">
            <span>Ready to share your thoughts?</span>
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Start Writing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;