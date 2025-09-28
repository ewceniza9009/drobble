import { NavLink, Outlet } from 'react-router-dom';
import { FaUsers, FaBox, FaBars, FaTimes } from 'react-icons/fa';
import { FaComments } from 'react-icons/fa6';
import { useState } from 'react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const activeLinkStyle = {
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    fontWeight: '600',
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)]">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed lg:sticky lg:top-24 lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto 
          inset-y-0 left-0 z-50 lg:z-30 /* <-- FINAL FIX APPLIED HERE */
          w-64 flex-shrink-0 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Sidebar Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Admin Menu</h2>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-4"> 
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2 hidden lg:block">
            Admin Menu
          </h2>
          <nav className="flex flex-col space-y-2">
            <NavLink
              to="/admin/users"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              className="flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={closeSidebar}
            >
              <FaUsers className="mr-3" />
              <span>User Management</span>
            </NavLink>
            <NavLink
              to="/admin/products"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              className="flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={closeSidebar}
            >
              <FaBox className="mr-3" />
              <span>Product Management</span>
            </NavLink>
            <NavLink
              to="/admin/reviews"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              className="flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={closeSidebar}
            >
              <FaComments className="mr-3" />
              <span>Review Moderation</span>
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 px-4 lg:px-8 bg-gray-50 min-h-screen lg:min-h-[calc(100vh-140px)]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;