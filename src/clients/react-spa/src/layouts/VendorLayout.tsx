import { NavLink, Outlet } from 'react-router-dom';
import { FaBox, FaComments } from 'react-icons/fa';

const VendorLayout = () => {
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
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Vendor Menu</h2>
                    <nav className="flex flex-col space-y-2">
                        <NavLink
                            to="/vendor/products"
                            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                            className="flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <FaBox className="mr-3" />
                            <span>My Products</span>
                        </NavLink>
                        <NavLink
                            to="/vendor/reviews"
                            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                            className="flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <FaComments className="mr-3" />
                            <span>Review Moderation</span>
                        </NavLink>
                        {/* Add links to other vendor pages like Orders here */}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 px-8 bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
};

export default VendorLayout;
