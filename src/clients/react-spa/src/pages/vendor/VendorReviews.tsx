import { FaCheck, FaTimes, FaCommentSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useGetVendorPendingReviewsQuery, useModerateReviewMutation } from '../../store/apiSlice';
import StarRating from '../../components/reviews/StarRating';

const VendorReviews = () => {
    const { data, error, isLoading } = useGetVendorPendingReviewsQuery();
    const [moderateReview, { isLoading: isModerating }] = useModerateReviewMutation();

    const handleModerate = (reviewId: string, approve: boolean) => {
        const promise = moderateReview({ reviewId, approve, role: 'vendor' }).unwrap();
        toast.promise(promise, {
            loading: 'Updating review status...',
            success: `Review has been ${approve ? 'approved' : 'rejected'}.`,
            error: 'Failed to update review.',
        });
    };

    if (isLoading) return <p>Loading pending reviews for your products...</p>;
    if (error) return <p className="text-red-500">Failed to load reviews.</p>;

    const reviews = data?.items || [];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Review Moderation</h1>
            {reviews.length === 0 ? (
                <div className="text-center py-10">
                    <FaCommentSlash className="mx-auto text-5xl text-slate-400 mb-4" />
                    <p className="text-slate-600">You have no pending reviews at the moment.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="p-4 border rounded-md shadow-sm bg-slate-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-slate-500">Product ID: {review.productId}</p>
                                    <div className="my-2"><StarRating rating={review.rating} /></div>
                                    <p className="text-slate-700 italic">"{review.comment}"</p>
                                </div>
                                <div className="flex space-x-2 flex-shrink-0 ml-4">
                                    <button
                                        onClick={() => handleModerate(review.id, true)}
                                        disabled={isModerating}
                                        className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition disabled:opacity-50"
                                        title="Approve"
                                    >
                                        <FaCheck />
                                    </button>
                                    <button
                                        onClick={() => handleModerate(review.id, false)}
                                        disabled={isModerating}
                                        className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition disabled:opacity-50"
                                        title="Reject"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VendorReviews;
