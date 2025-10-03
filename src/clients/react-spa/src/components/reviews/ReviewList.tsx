import { useGetReviewsByProductQuery } from '../../store/apiSlice';
import StarRating from './StarRating';
import { FaUserCircle } from 'react-icons/fa';

const ReviewList = ({ productId }: { productId: string }) => {
  const { data, error, isLoading } = useGetReviewsByProductQuery({ productId });

  if (isLoading) return <p className="text-gray-600 dark:text-slate-400">Loading reviews...</p>;
  if (error || !data) return <p className="text-red-500">Could not load reviews.</p>;
    if (data.items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8">
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
          No reviews yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.items.map((review) => (
        <div key={review.id} className="pb-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
          <div className="flex items-center mb-2">
            <FaUserCircle className="text-slate-400 dark:text-slate-500 text-2xl mr-3" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{review.userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reviewed on {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center my-2">
            <StarRating rating={review.rating} />
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;