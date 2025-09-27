import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  // Style for the active link
  const activeLinkStyle = {
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
  };

  return (
    <div className="flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white shadow-md">
        <nav className="p-4">
          <h2 className="text-lg font-bold mb-4">Admin Menu</h2>
          <ul>
            <li>
              <NavLink
                to="/admin/users"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                className="block px-4 py-2 rounded-md hover:bg-gray-100"
              >
                User Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/products"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                className="block px-4 py-2 rounded-md hover:bg-gray-100"
              >
                Product Management
              </NavLink>
            </li>
            {/* Add links to other admin pages here */}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6">
        <Outlet /> {/* This is where the specific admin pages will be rendered */}
      </main>
    </div>
  );
};

export default AdminLayout;