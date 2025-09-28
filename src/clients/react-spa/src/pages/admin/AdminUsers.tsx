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
      case 2: return 'bg-yellow-100 text-yellow-800 ring-yellow-200';
      case 1: return 'bg-green-100 text-green-800 ring-blue-200';
      default: return 'bg-gray-100 text-gray-800 ring-gray-200';
    }
  };

  if (isLoading) return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="animate-pulse">
        <FaUsers className="mx-auto text-4xl text-gray-300 mb-4" />
        <p className="text-gray-600">Loading users...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p className="text-red-600 text-lg">Error loading users. Please try again.</p>
    </div>
  );

  const activeUsers = users?.filter(user => user.isActive).length || 0;
  const totalUsers = users?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <FaUsers className="text-3xl text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">Total Users: </span>
              <span className="font-semibold text-gray-800">{totalUsers}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">Active: </span>
              <span className="font-semibold text-green-600">{activeUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaUsers className="text-xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaUserCheck className="text-xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Banned Users</p>
              <p className="text-2xl font-bold text-red-600">{totalUsers - activeUsers}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FaUserSlash className="text-xl text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-yellow-600">{users?.filter(u => u.role === 'admin').length || 0}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FaCrown className="text-xl text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full sm:max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FaFilter className="text-gray-400" />
              <span className="text-gray-600">Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaUsers className="mr-2 text-gray-400" />
            All Users
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
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
                        ? 'bg-green-100 text-green-800 ring-green-200' 
                        : 'bg-red-100 text-red-800 ring-red-200'
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
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                          : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
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
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{users?.length || 0}</span> users
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
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