import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Upload, FileText, Shield, LogOut } from 'lucide-react';

export function Navigation({ activeTab, onTabChange }) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-2">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">College Portal</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onTabChange('resources')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'resources'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="hidden sm:inline">Resources</span>
            </button>

            {user?.role === 'student' && (
              <>
                <button
                  onClick={() => onTabChange('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'upload'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <span className="hidden sm:inline">Upload</span>
                </button>

                <button
                  onClick={() => onTabChange('my-resources')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'my-resources'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="hidden sm:inline">My Uploads</span>
                </button>
              </>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => onTabChange('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-900">{user?.fullName}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
