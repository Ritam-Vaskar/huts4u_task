import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Upload, FileText, Shield, LogOut, Menu, X, User, Bell, Check, CheckCheck, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { resourceAPI } from '../api';

export function Navigation({ activeTab, onTabChange }) {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notificationsOpen) {
      fetchNotifications();
    }
  }, [notificationsOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  const fetchUnreadCount = async () => {
    try {
      const response = await resourceAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await resourceAPI.getNotifications(false);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await resourceAPI.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await resourceAPI.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approval':
        return '✅';
      case 'rejection':
        return '❌';
      case 'rating':
        return '⭐';
      case 'comment':
        return '💬';
      case 'announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

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

                <button
                  onClick={() => onTabChange('favorites')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'favorites'
                      ? 'bg-pink-100 text-pink-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Favorites</span>
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
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title="Notifications"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[32rem] flex flex-col z-50">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="w-4 h-4" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                              !notification.is_read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                          >
                            <div className="flex gap-3">
                              <span className="text-2xl flex-shrink-0">
                                {getNotificationIcon(notification.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm mb-1">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notification.created_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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

                  <button
                    onClick={() => handleTabChange('favorites')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'favorites'
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    <span>Favorites</span>
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
