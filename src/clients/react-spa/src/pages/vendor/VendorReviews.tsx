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

    if (isLoading) return <div className="p-6 text-gray-600 dark:text-slate-400">Loading pending reviews for your products...</div>;
    if (error) return <div className="p-6 text-red-500">Failed to load reviews.</div>;

    const reviews = data?.items || [];

    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-6 border-b dark:border-slate-700 pb-4">Review Moderation</h1>
            {reviews.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
                    <FaCommentSlash className="mx-auto text-5xl text-slate-400 dark:text-slate-500 mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">You have no pending reviews at the moment.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="p-4 border dark:border-slate-700 rounded-md shadow-sm bg-slate-50 dark:bg-slate-800">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Product ID: {review.productId}</p>
                                    <div className="my-2"><StarRating rating={review.rating} /></div>
                                    <p className="text-slate-700 dark:text-slate-300 italic">"{review.comment}"</p>
                                </div>
                                <div className="flex space-x-2 flex-shrink-0 ml-4">
                                    <button
                                        onClick={() => handleModerate(review.id, true)}
                                        disabled={isModerating}
                                        className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 transition disabled:opacity-50"
                                        title="Approve"
                                    >
                                        <FaCheck />
                                    </button>
                                    <button
                                        onClick={() => handleModerate(review.id, false)}
                                        disabled={isModerating}
                                        className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition disabled:opacity-50"
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