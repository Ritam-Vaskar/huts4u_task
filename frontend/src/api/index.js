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
  
  rejectResource: (id) => 
    api.put(`/resources/${id}/reject`),
  
  deleteResource: (id) => 
    api.delete(`/resources/${id}`),
  
  searchResources: (query, fileType) => 
    api.get('/resources/search', { params: { q: query, fileType } })
};
