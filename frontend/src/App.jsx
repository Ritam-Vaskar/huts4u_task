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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'resources' && <PublicResources />}
        {activeTab === 'upload' && user.role === 'student' && <UploadResource />}
        {activeTab === 'my-resources' && user.role === 'student' && <MyResources />}
        {activeTab === 'admin' && user.role === 'admin' && <AdminDashboard />}
      </main>
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
