import { useGetReviewsByProductQuery } from '../../store/apiSlice';
import StarRating from './StarRating';
import { FaUserCircle } from 'react-icons/fa';

const ReviewList = ({ productId }: { productId: string }) => {
  const { data, error, isLoading } = useGetReviewsByProductQuery({ productId });

  if (isLoading) return <p>Loading reviews...</p>;
  if (error || !data) return <p>Could not load reviews.</p>;
  if (data.items.length === 0) return <p className="text-slate-500 text-sm">No reviews yet. Be the first!</p>;

  return (
    <div className="space-y-6">
      {data.items.map((review) => (
        <div key={review.id} className="pb-6 border-b border-slate-200 last:border-b-0">
          <div className="flex items-center mb-2">
            <FaUserCircle className="text-slate-400 text-2xl mr-3" />
            <div>
                <p className="font-semibold text-slate-800">User {review.userId.substring(0, 8)}</p>
                <p className="text-xs text-slate-500">
                  Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                </p>
            </div>
          </div>
          <div className="flex items-center my-2">
            <StarRating rating={review.rating} />
          </div>
          <p className="text-slate-600 leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;