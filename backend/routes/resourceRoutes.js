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
  searchResources
} from '../controllers/resourceController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public/Authenticated routes
router.get('/approved', authenticateToken, getApprovedResources);
router.get('/search', authenticateToken, searchResources);

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
