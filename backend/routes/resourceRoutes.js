import express from 'express';
import {
  uploadResource,
  getApprovedResources,
  getMyResources,
  getAllResources,
  getResourceById,
  updateResource,
  approveResource,
  rejectResource,
  deleteResource,
  searchResources,
  viewResource,
  trackDownload,
  getAllTags,
  addTagsToResource,
  getResourceTags,
  rateResource,
  getResourceRatings,
  getUserRating,
  toggleFavorite,
  getUserFavorites,
  checkFavorite,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount
} from '../controllers/resourceController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/:id/view', viewResource); // View resource with inline display - public for approved resources

// Authenticated routes
router.get('/approved', authenticateToken, getApprovedResources);
router.get('/search', authenticateToken, searchResources);

// Download tracking
router.post('/:id/download', authenticateToken, trackDownload);

// Tags routes
router.get('/tags/all', authenticateToken, getAllTags);
router.get('/:id/tags', authenticateToken, getResourceTags);
router.post('/:id/tags', authenticateToken, addTagsToResource);

// Rating & Review routes
router.post('/:id/rate', authenticateToken, rateResource);
router.get('/:id/ratings', authenticateToken, getResourceRatings);
router.get('/:id/my-rating', authenticateToken, getUserRating);

// Favorites routes
router.post('/:id/favorite', authenticateToken, toggleFavorite);
router.get('/favorites/my-favorites', authenticateToken, getUserFavorites);
router.get('/:id/is-favorite', authenticateToken, checkFavorite);

// Notifications routes
router.get('/notifications/all', authenticateToken, getUserNotifications);
router.get('/notifications/unread-count', authenticateToken, getUnreadCount);
router.put('/notifications/:id/read', authenticateToken, markNotificationRead);
router.put('/notifications/mark-all-read', authenticateToken, markAllNotificationsRead);

// Student routes
router.post('/upload', authenticateToken, authorizeRole('student'), upload.single('file'), uploadResource);
router.get('/my-resources', authenticateToken, authorizeRole('student'), getMyResources);
router.put('/:id', authenticateToken, authorizeRole('student'), updateResource);

// Admin routes
router.get('/all', authenticateToken, authorizeRole('admin'), getAllResources);
router.put('/:id/approve', authenticateToken, authorizeRole('admin'), approveResource);
router.put('/:id/reject', authenticateToken, authorizeRole('admin'), rejectResource);

// Shared routes (with permission checks inside)
router.get('/:id', authenticateToken, getResourceById);
router.delete('/:id', authenticateToken, deleteResource);

export default router;
