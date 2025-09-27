import { NavLink, Outlet } from 'react-router-dom';
import { FaUsers, FaBox } from 'react-icons/fa';

const AdminLayout = () => {
  const activeLinkStyle = {
    backgroundColor: '#eef2ff', // A light indigo
    color: '#4f46e5', // A strong indigo
    fontWeight: '600',
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)]">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
        <div className="p-4 sticky top-24">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Admin Menu</h2>
          <nav className="flex flex-col space-y-2">
            <NavLink
              to="/admin/users"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              className="flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FaUsers className="mr-3" />
              <span>User Management</span>
            </NavLink>
            <NavLink
              to="/admin/products"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              className="flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FaBox className="mr-3" />
              <span>Product Management</span>
            </NavLink>
            {/* Add links to other admin pages here */}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 bg-gray-50">
        <Outlet /> {/* This is where the specific admin pages will be rendered */}
      </main>
    </div>
  );
};

export default AdminLayout;