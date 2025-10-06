import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, LogOut, User, Menu, X, LogIn } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { RealtimeNotifications } from "./RealtimeNotifications";

const Navbar: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Safety check - should never happen with proper context setup
  if (!auth) {
    console.error('Navbar rendered outside AuthProvider');
    return null;
  }

  const { user, logout } = auth;

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              Mars' Hill
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/library"
              className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Browse Papers
            </Link>
            <Link
              to="/trending"
              className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Trending
            </Link>
            <Link
              to="/communities"
              className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Communities
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              About
            </Link>

            {user ? (
              <>
                <Link
                  to="/workspace"
                  className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium transition-colors ml-2"
                >
                  My Workspace
                </Link>
                <RealtimeNotifications />
                <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-200">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center space-x-2 px-4 py-2 ml-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <Link
              to="/library"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 min-h-[44px] flex items-center transition-colors"
            >
              Browse Papers
            </Link>
            <Link
              to="/trending"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 min-h-[44px] flex items-center transition-colors"
            >
              Trending
            </Link>
            <Link
              to="/communities"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 min-h-[44px] flex items-center transition-colors"
            >
              Communities
            </Link>
            <Link
              to="/about"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 min-h-[44px] flex items-center transition-colors"
            >
              About
            </Link>

            {user ? (
              <>
                <div className="border-t border-gray-200 my-2 pt-2">
                  <Link
                    to="/workspace"
                    onClick={closeMobileMenu}
                    className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 min-h-[44px] flex items-center transition-colors"
                  >
                    My Workspace
                  </Link>
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 min-h-[44px] transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 min-h-[44px] transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4">
                <Link
                  to="/auth"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors min-h-[44px] font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
export { Navbar };