import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition"
            onClick={() => navigate(user?.role === 'student' ? '/student' : user?.role === 'parent' ? '/parent' : '/admin')}
          >
            <i className="fas fa-graduation-cap text-blue-600 text-2xl"></i>
            <span className="hidden sm:inline text-lg font-bold text-gray-800">
              Coaching CMS
            </span>
          </div>

          {/* User Info and Logout - Always visible on right */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="text-gray-700 text-sm flex items-center">
              <i className="fas fa-user-circle text-blue-600 text-xl mr-2"></i>
              <span className="hidden sm:inline">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded transition text-xs md:text-sm font-medium flex items-center gap-2"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}