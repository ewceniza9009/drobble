// ---- File: src/components/reviews/ReviewForm.tsx ----
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
    return <p className="mt-4 text-center">Please log in to write a review.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      <div className="mb-4">
        <label className="block mb-2">Your Rating</label>
        {/* Basic star rating input */}
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star)} className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="comment" className="block mb-2">Your Review</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="What did you like or dislike?"
        />
      </div>
      <button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
        {isLoading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;