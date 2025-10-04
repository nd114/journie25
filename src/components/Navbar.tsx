import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, LogOut, User, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { RealtimeNotifications } from "./RealtimeNotifications";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              Research Platform
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/browse"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Browse Papers
            </Link>
            <Link
              to="/trending"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Trending
            </Link>
            <Link
              to="/communities"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Communities
            </Link>
            <Link
              to="/learning-paths"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Learning Paths
            </Link>
            <Link
              to="/tools"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Tools
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              About
            </Link>

            <Link
              to="/how-it-works"
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              How It Works
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/faq"
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              FAQ
            </Link>

            {user ? (
              <>
                <Link
                  to="/workspace"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  My Workspace
                </Link>
                <RealtimeNotifications />
                <div className="flex items-center space-x-3">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
              to="/browse"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 min-h-[44px] flex items-center"
            >
              Browse Papers
            </Link>
            <Link
              to="/trending"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 min-h-[44px] flex items-center"
            >
              Trending
            </Link>
            <Link
              to="/communities"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 min-h-[44px] flex items-center"
            >
              Communities
            </Link>
            <Link
              to="/learning-paths"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 min-h-[44px] flex items-center"
            >
              Learning Paths
            </Link>
            <Link
              to="/tools"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 min-h-[44px] flex items-center"
            >
              Tools
            </Link>
            <Link
              to="/about"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 min-h-[44px] flex items-center"
            >
              About
            </Link>
            <Link
              to="/how-it-works"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 min-h-[44px] flex items-center"
            >
              How It Works
            </Link>
            <Link
              to="/contact"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 min-h-[44px] flex items-center"
            >
              Contact
            </Link>
            <Link
              to="/faq"
              onClick={closeMobileMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 min-h-[44px] flex items-center"
            >
              FAQ
            </Link>

            {user ? (
              <>
                <Link
                  to="/workspace"
                  onClick={closeMobileMenu}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 min-h-[44px] flex items-center"
                >
                  My Workspace
                </Link>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 min-h-[44px]"
                >
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 min-h-[44px]"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={closeMobileMenu}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors min-h-[44px] mx-3 my-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
export { Navbar };