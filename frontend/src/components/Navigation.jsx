import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Upload, FileText, Shield, LogOut, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

export function Navigation({ activeTab, onTabChange }) {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleTabChange = (tab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-2 shadow-md">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              College Portal
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onTabChange('resources')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'resources'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Resources</span>
            </button>

            {user?.role === 'student' && (
              <>
                <button
                  onClick={() => onTabChange('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'upload'
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload</span>
                </button>

                <button
                  onClick={() => onTabChange('my-resources')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'my-resources'
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>My Uploads</span>
                </button>
              </>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => onTabChange('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'admin'
                    ? 'bg-red-100 text-red-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Admin</span>
              </button>
            )}
          </div>

          {/* User Info & Sign Out */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-full">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{user?.fullName}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 animate-slideIn">
            <div className="space-y-2">
              <button
                onClick={() => handleTabChange('resources')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'resources'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Resources</span>
              </button>

              {user?.role === 'student' && (
                <>
                  <button
                    onClick={() => handleTabChange('upload')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'upload'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('my-resources')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'my-resources'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span>My Uploads</span>
                  </button>
                </>
              )}

              {user?.role === 'admin' && (
                <button
                  onClick={() => handleTabChange('admin')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === 'admin'
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin</span>
                </button>
              )}

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-full">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{user?.fullName}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-md"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
