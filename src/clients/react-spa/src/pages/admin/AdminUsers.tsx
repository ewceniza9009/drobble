import { useGetAdminUsersQuery, useUpdateUserStatusMutation } from '../../store/apiSlice';
import { toast } from 'react-hot-toast';

// Define the User type to match the DTO
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
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Banned'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <button onClick={() => handleToggleActive(user)} disabled={isUpdating} className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50">
                      {user.isActive ? 'Ban User' : 'Activate User'}
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