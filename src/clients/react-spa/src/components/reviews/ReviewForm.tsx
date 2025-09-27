import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useCreateReviewMutation } from '../../store/apiSlice';
import type { RootState } from '../../store/store';

const ReviewForm = ({ productId }: { productId: string }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    try {
      await createReview({ productId, rating, comment }).unwrap();
      toast.success('Thank you for your review!');
      setRating(0);
      setComment('');
    } catch {
      toast.error('Failed to submit review.');
    }
  };

  if (!token) {
    return (
        <div className="mt-8 p-6 bg-slate-100 rounded-lg text-center">
            <p className="text-sm text-slate-600">Please <a href="/login" className="text-blue-600 font-semibold hover:underline">log in</a> to write a review.</p>
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-slate-50 rounded-lg border border-slate-200">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Write a Review</h3>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-slate-600">Your Rating</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
                key={star} 
                type="button" 
                onClick={() => setRating(star)} 
                className={`text-3xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-300'}`}
            >
                ★
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="comment" className="block mb-2 text-sm font-medium text-slate-600">Your Review</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-3 bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          rows={4}
          placeholder="What did you like or dislike?"
        />
      </div>
      <button type="submit" disabled={isLoading} className="w-full p-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-slate-400 transition-colors">
        {isLoading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;