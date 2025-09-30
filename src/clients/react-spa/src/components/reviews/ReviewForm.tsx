import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useCreateReviewMutation } from '../../store/apiSlice';
import type { RootState } from '../../store/store';
import { FaStar, FaPaperPlane, FaLock } from 'react-icons/fa';

const ReviewForm = ({ productId }: { productId: string }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
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
    } catch {
      toast.error('Failed to submit review. Please try again.');
    }
  };

  if (!token) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
        <div className="flex flex-col items-center space-y-3">
          <FaLock className="text-2xl text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Sign in to Review</h3>
          <p className="text-gray-600 dark:text-slate-400 text-sm">Share your experience by logging in or creating an account.</p>
          <div className="flex space-x-2">
            <a 
              href="/login" 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              Sign In
            </a>
            <a 
              href="/register" 
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
        <FaStar className="text-yellow-400 mr-2" />
        Write Your Review
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Your Rating</label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`text-2xl transition-all duration-200 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-slate-600 hover:text-yellow-200'
                }`}
              >
                <FaStar />
              </button>
            ))}
          </div>
        </div>

        {/* Comment Section */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Your Review
            <span className="text-gray-500 dark:text-slate-400 font-normal ml-1 text-xs">(min 10 characters)</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            rows={4}
            placeholder="Share your experience. What did you like or dislike?"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-1">
            <span>{comment.length}/500</span>
            <span className={comment.length < 10 ? 'text-red-500' : 'text-green-500'}>
              {comment.length < 10 ? `${10 - comment.length} more required` : 'Good length'}
            </span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => {
              setRating(0);
              setComment('');
              setHoverRating(0);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isLoading || rating === 0 || comment.trim().length < 10}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            <FaPaperPlane />
            <span>{isLoading ? 'Submitting...' : 'Submit Review'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;