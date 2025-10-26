import api from './axios';

// Authentication APIs
export const authAPI = {
  register: (email, password, fullName) => 
    api.post('/auth/register', { email, password, fullName }),
  
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (fullName) => 
    api.put('/auth/profile', { fullName })
};

// Resource APIs
export const resourceAPI = {
  getApprovedResources: () => 
    api.get('/resources/approved'),
  
  getMyResources: () => 
    api.get('/resources/my-resources'),
  
  getAllResources: () => 
    api.get('/resources/all'),
  
  getResourceById: (id) => 
    api.get(`/resources/${id}`),
  
  uploadResource: (formData) => 
    api.post('/resources/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateResource: (id, title, description) => 
    api.put(`/resources/${id}`, { title, description }),
  
  approveResource: (id) => 
    api.put(`/resources/${id}/approve`),
  
  rejectResource: (id, reason) => 
    api.put(`/resources/${id}/reject`, { reason }),
  
  deleteResource: (id) => 
    api.delete(`/resources/${id}`),
  
  searchResources: (query, fileType) => 
    api.get('/resources/search', { params: { q: query, fileType } }),

  // Tags
  getAllTags: () =>
    api.get('/resources/tags/all'),
  
  getResourceTags: (id) =>
    api.get(`/resources/${id}/tags`),
  
  addTagsToResource: (id, tagIds) =>
    api.post(`/resources/${id}/tags`, { tagIds }),

  // Ratings
  rateResource: (id, rating, review) =>
    api.post(`/resources/${id}/rate`, { rating, review }),
  
  getResourceRatings: (id) =>
    api.get(`/resources/${id}/ratings`),
  
  getUserRating: (id) =>
    api.get(`/resources/${id}/my-rating`),

  // Favorites
  toggleFavorite: (id) =>
    api.post(`/resources/${id}/favorite`),
  
  getUserFavorites: () =>
    api.get('/resources/favorites/my-favorites'),
  
  checkFavorite: (id) =>
    api.get(`/resources/${id}/is-favorite`),

  // Notifications
  getNotifications: (unreadOnly = false) =>
    api.get('/resources/notifications/all', { params: { unreadOnly } }),
  
  getUnreadCount: () =>
    api.get('/resources/notifications/unread-count'),
  
  markNotificationRead: (id) =>
    api.put(`/resources/notifications/${id}/read`),
  
  markAllNotificationsRead: () =>
    api.put('/resources/notifications/mark-all-read')
};
