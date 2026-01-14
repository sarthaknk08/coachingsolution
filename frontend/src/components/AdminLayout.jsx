import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const linkClasses = (path) =>
    `block px-4 py-2 rounded transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "hover:bg-blue-600 text-white"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Header */}
      <header className="bg-white shadow-md h-16 flex items-center justify-between px-4 md:px-6 lg:px-8 fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-800 hidden md:block">
            Admin Dashboard
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 text-sm hidden sm:inline">
            <i className="fas fa-user-circle text-blue-600 mr-2"></i>
            {user?.name}
          </span>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition text-sm font-medium flex items-center"
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span className="hidden sm:inline ml-2">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed lg:relative top-16 lg:top-0 left-0 h-screen w-64 bg-blue-700 text-white flex flex-col p-4 transform transition-transform duration-300 z-30 lg:z-auto overflow-y-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <h2 className="text-2xl font-bold mb-8 mt-0">
            Coaching Admin
          </h2>

          <nav className="flex flex-col space-y-3">
            <Link
              to="/admin"
              className={linkClasses("/admin")}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-chart-line mr-2"></i>
              Dashboard
            </Link>

            <Link
              to="/admin/batches"
              className={linkClasses("/admin/batches")}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-layer-group mr-2"></i>
              Batches
            </Link>

            <Link
              to="/admin/students"
              className={linkClasses("/admin/students")}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-user-graduate mr-2"></i>
              Students
            </Link>

            <Link
              to="/admin/parents"
              className={linkClasses("/admin/parents")}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-user-tie mr-2"></i>
              Parents
            </Link>

            <Link
              to="/admin/tests"
              className={linkClasses("/admin/tests")}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-file-alt mr-2"></i>
              Tests & Scores
            </Link>

            <Link
              to="/admin/fees"
              className={linkClasses("/admin/fees")}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-rupee-sign mr-2"></i>
              Fees
            </Link>

            <Link
              to="/admin/settings"
              className={linkClasses("/admin/settings")}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-cog mr-2"></i>
              Settings
            </Link>

            {/* Divider */}
            <div className="border-t border-blue-600 my-2"></div>

            {/* Communication & Credentials Section */}
            <h3 className="text-xs uppercase font-semibold text-blue-200 px-4 py-2 mt-2">
              Communication & Credentials
            </h3>

            <Link
              to="/admin/announcements"
              className={linkClasses("/admin/announcements")}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-bullhorn mr-2"></i>
              Announcements
            </Link>

            <Link
              to="/admin/credentials"
              className={linkClasses("/admin/credentials")}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-key mr-2"></i>
              Credentials
            </Link>

            {/* Divider */}
            <div className="border-t border-blue-600 my-2"></div>

            {/* Customization Section */}
            <h3 className="text-xs uppercase font-semibold text-blue-200 px-4 py-2 mt-2">
              Customization
            </h3>

            <Link
              to="/admin/coaching-details"
              className={linkClasses("/admin/coaching-details")}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-paint-brush mr-2"></i>
              Coaching Details
            </Link>
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 w-full overflow-x-hidden">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
