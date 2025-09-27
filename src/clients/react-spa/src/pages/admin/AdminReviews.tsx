import { FaCheck, FaTimes, FaCommentSlash, FaComments, FaExclamationTriangle, FaUser, FaCalendar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useGetAdminPendingReviewsQuery, useModerateReviewMutation } from '../../store/apiSlice';
import StarRating from '../../components/reviews/StarRating';

const AdminReviews = () => {
  const { data, error, isLoading } = useGetAdminPendingReviewsQuery();
  const [moderateReview, { isLoading: isModerating }] = useModerateReviewMutation();

  const handleModerate = (reviewId: string, approve: boolean) => {
    const promise = moderateReview({ reviewId, approve, role: 'admin' }).unwrap();
    toast.promise(promise, {
      loading: 'Updating review status...',
      success: `Review has been ${approve ? 'approved' : 'rejected'}.`,
      error: 'Failed to update review.',
    });
  };

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-pulse">
          <FaComments className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-gray-600">Loading pending reviews...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <FaExclamationTriangle className="mx-auto text-3xl text-red-400 mb-3" />
        <p className="text-red-600 text-lg">Failed to load reviews. Please try again.</p>
      </div>
    </div>
  );

  const reviews = data?.items || [];
  const pendingCount = reviews.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <FaComments className="text-3xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Review Moderation</h1>
              <p className="text-gray-600 mt-1">Manage and approve user reviews</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">Pending Reviews: </span>
              <span className={`font-semibold ${pendingCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {pendingCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <FaComments className="text-xl text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-blue-600">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <StarRating rating={reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Action Required</p>
              <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FaExclamationTriangle className="text-xl text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaComments className="mr-2 text-gray-400" />
            Pending Reviews ({pendingCount})
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <FaCommentSlash className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Reviews</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              All reviews have been moderated. Check back later for new submissions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                        <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">
                          <FaUser className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center">
                            <FaCalendar className="mr-1" />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-gray-600">({review.rating}.0)</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 italic text-lg leading-relaxed">"{review.comment}"</p>
                    </div>
                  </div>

                  {/* Moderation Actions */}
                  <div className="lg:w-48 flex lg:flex-col justify-center space-x-4 lg:space-x-0 lg:space-y-3">
                    <button
                      onClick={() => handleModerate(review.id, true)}
                      disabled={isModerating}
                      className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      title="Approve Review"
                    >
                      <FaCheck />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleModerate(review.id, false)}
                      disabled={isModerating}
                      className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      title="Reject Review"
                    >
                      <FaTimes />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {reviews.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{reviews.length}</span> pending reviews
              </p>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {reviews.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Approve All 5-Star Reviews
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
              Mark All as Read
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Export to CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;