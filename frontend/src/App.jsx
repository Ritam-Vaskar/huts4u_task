import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Navigation } from './components/Navigation';
import { PublicResources } from './components/PublicResources';
import { UploadResource } from './components/UploadResource';
import { MyResources } from './components/MyResources';
import { AdminDashboard } from './components/AdminDashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('resources');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onToggleMode={() => setAuthMode('register')} />
    ) : (
      <Register onToggleMode={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'resources' && <PublicResources />}
        {activeTab === 'upload' && user.role === 'student' && <UploadResource />}
        {activeTab === 'my-resources' && user.role === 'student' && <MyResources />}
        {activeTab === 'admin' && user.role === 'admin' && <AdminDashboard />}
      </main>

      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        <p>© 2025 College Resource Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
