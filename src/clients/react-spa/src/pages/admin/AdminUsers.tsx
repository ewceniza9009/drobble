import { useGetAdminUsersQuery, useUpdateUserStatusMutation } from '../../store/apiSlice';
import { toast } from 'react-hot-toast';
import { FaUserSlash, FaUserCheck, FaUsers, FaSearch, FaFilter, FaCrown, FaUser, FaBuysellads} from 'react-icons/fa';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
}

const AdminUsers = () => {
  const { data: users, error, isLoading } = useGetAdminUsersQuery();
  const [updateUserStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation();

  const handleToggleActive = async (user: AdminUser) => {
    const promise = updateUserStatus({
      userId: user.id,
      isActive: !user.isActive,
      role: user.role
    }).unwrap();

    toast.promise(promise, {
      loading: 'Updating status...',
      success: `User ${user.isActive ? 'banned' : 'activated'} successfully!`,
      error: 'Failed to update status.'
    });
  };

  const getRoleIcon = (role: number) => {
    switch (role) {
      case 2: return <FaCrown className="text-yellow-500" />;
      case 1: return <FaBuysellads className="text-green-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 2: return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 ring-yellow-200 dark:ring-yellow-500/30';
      case 1: return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 ring-blue-200 dark:ring-green-500/30';
      default: return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300 ring-gray-200 dark:ring-slate-600';
    }
  };

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
        <div className="animate-pulse">
          <FaUsers className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Loading users...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 text-lg">Error loading users. Please try again.</p>
      </div>
    </div>
  );

  const activeUsers = users?.filter(user => user.isActive).length || 0;
  const totalUsers = users?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm">
              <FaUsers className="text-3xl text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">User Management</h1>
              <p className="text-gray-600 dark:text-slate-400 mt-1">Manage user accounts and permissions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="bg-white dark:bg-slate-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600">
              <span className="text-sm text-gray-600 dark:text-slate-300">Total Users: </span>
              <span className="font-semibold text-gray-800 dark:text-slate-100">{totalUsers}</span>
            </div>
            <div className="bg-white dark:bg-slate-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600">
              <span className="text-sm text-gray-600 dark:text-slate-300">Active: </span>
              <span className="font-semibold text-green-600 dark:text-green-400">{activeUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">{totalUsers}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <FaUsers className="text-xl text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Active Users</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeUsers}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <FaUserCheck className="text-xl text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Banned Users</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalUsers - activeUsers}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
              <FaUserSlash className="text-xl text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Admins</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{users?.filter(u => u.role === 'admin').length || 0}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
              <FaCrown className="text-xl text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full sm:max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
              <FaFilter className="text-gray-400" />
              <span className="text-gray-600 dark:text-slate-300">Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 flex items-center">
            <FaUsers className="mr-2 text-gray-400" />
            All Users
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 dark:bg-slate-700 w-10 h-10 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-slate-100">{user.username}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(parseInt(user.role))}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ring-1 ring-inset ${getRoleColor(parseInt(user.role))}`}>
                        {parseInt(user.role) === 1 ? 'Vendor' : parseInt(user.role) === 2 ? 'Admin' : 'User'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ring-1 ring-inset ${
                      user.isActive 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 ring-green-200 dark:ring-green-500/30' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 ring-red-200 dark:ring-red-500/30'
                    }`}>
                      {user.isActive ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleToggleActive(user)}
                      disabled={isUpdating}
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        user.isActive
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-500/30'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-500/30'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={user.isActive ? 'Ban User' : 'Activate User'}
                    >
                      {user.isActive ? (
                        <>
                          <FaUserSlash />
                          <span>Ban</span>
                        </>
                      ) : (
                        <>
                          <FaUserCheck />
                          <span>Activate</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Showing <span className="font-medium">{users?.length || 0}</span> users
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;