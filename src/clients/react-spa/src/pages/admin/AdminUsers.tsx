import { useGetAdminUsersQuery, useUpdateUserStatusMutation } from '../../store/apiSlice';
import { toast } from 'react-hot-toast';
import { FaUserSlash, FaUserCheck } from 'react-icons/fa';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
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
      success: `User ${user.isActive ? 'banned' : 'unbanned'} successfully!`,
      error: 'Failed to update status.'
    });
  };

  if (isLoading) return <div className="text-center">Loading users...</div>;
  if (error) return <div className="text-center text-red-500">Error loading users.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Banned'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleToggleActive(user)}
                    disabled={isUpdating}
                    className="text-gray-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={user.isActive ? 'Ban User' : 'Activate User'}
                  >
                    {user.isActive ? <FaUserSlash /> : <FaUserCheck />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;