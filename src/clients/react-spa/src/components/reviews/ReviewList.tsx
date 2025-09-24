// ---- File: src/components/reviews/ReviewList.tsx ----
import { useGetReviewsByProductQuery } from '../../store/apiSlice';
import StarRating from './StarRating';

const ReviewList = ({ productId }: { productId: string }) => {
  const { data, error, isLoading } = useGetReviewsByProductQuery({ productId });

  if (isLoading) return <p>Loading reviews...</p>;
  if (error || !data) return <p>Could not load reviews.</p>;
  if (data.items.length === 0) return <p>No reviews yet. Be the first!</p>;

  return (
    <div className="space-y-6">
      {data.items.map((review) => (
        <div key={review.id} className="p-4 border-b">
          <div className="flex items-center mb-2">
            <StarRating rating={review.rating} />
            <p className="ml-4 font-semibold">User {review.userId.substring(0, 8)}</p>
          </div>
          <p className="text-gray-600">{review.comment}</p>
          <p className="text-xs text-gray-400 mt-2">
            Reviewed on {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;