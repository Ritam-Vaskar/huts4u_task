import Resource from '../models/Resource.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import db from '../config/database.js';

// Helper function to determine file type
const getFileType = (mimetype) => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.includes('word') || mimetype.includes('document')) return 'doc';
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'ppt';
  return null;
};

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, resourceType, fileType) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: resourceType,
      folder: 'college-resources',
      access_mode: 'public'
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Create/Upload new resource
export const uploadResource = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!title || !file) {
      return res.status(400).json({ error: 'Title and file are required' });
    }

    // Determine file type
    const fileType = getFileType(file.mimetype);
    if (!fileType) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Upload to Cloudinary
    const resourceType = fileType === 'image' ? 'image' : 'raw';
    const uploadResult = await uploadToCloudinary(file.buffer, resourceType, fileType);

    // Construct proper viewing URL
    // For raw files (PDFs, docs), we need to use authenticated URLs or transformation parameters
    let fileUrl = uploadResult.secure_url;
    
    if (resourceType === 'raw' && fileType === 'pdf') {
      // For PDFs, we need to convert the raw URL to use 'image' resource type with page parameter
      // OR use the raw URL but modify it to open in a new tab with proper headers
      // The best approach is to use fl_attachment transformation
      // But since Cloudinary raw files don't support this well, we'll handle it on frontend
      fileUrl = uploadResult.secure_url;
    }

    // Verify user exists in database before creating resource
    const [userExists] = await db.query('SELECT id FROM users WHERE id = ?', [req.user.id]);
    if (!userExists || userExists.length === 0) {
      return res.status(400).json({ 
        error: 'User not found in database. Please logout and login again to sync your account.' 
      });
    }

    // Save to database (returns the created resource)
    const resource = await Resource.create({
      title,
      description: description || null,
      fileUrl: fileUrl,
      publicId: uploadResult.public_id,
      fileType,
      fileSize: file.size,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to ensure URLs have inline viewing for PDFs
const fixResourceUrl = (resource) => {
  // If it's a raw file (PDF, doc, ppt) and URL doesn't have fl_attachment flag
  if (resource.file_type !== 'image' && resource.file_url.includes('/upload/') && !resource.file_url.includes('fl_attachment')) {
    resource.file_url = resource.file_url.replace('/upload/', '/upload/fl_attachment/');
  }
  return resource;
};

// Helper function to attach tags to resources
const attachTagsToResources = async (resources) => {
  if (!resources || resources.length === 0) return resources;
  
  const resourceIds = resources.map(r => r.id);
  const placeholders = resourceIds.map(() => '?').join(',');
  
  const [tagData] = await db.query(`
    SELECT rt.resource_id, t.*
    FROM resource_tags rt
    JOIN tags t ON rt.tag_id = t.id
    WHERE rt.resource_id IN (${placeholders})
    ORDER BY t.name
  `, resourceIds);
  
  // Group tags by resource_id
  const tagsByResource = {};
  tagData.forEach(tag => {
    if (!tagsByResource[tag.resource_id]) {
      tagsByResource[tag.resource_id] = [];
    }
    tagsByResource[tag.resource_id].push({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color
    });
  });
  
  // Attach tags to each resource
  return resources.map(resource => ({
    ...resource,
    tags: tagsByResource[resource.id] || []
  }));
};

// Get all approved resources (public)
export const getApprovedResources = async (req, res, next) => {
  try {
    let resources = await Resource.findApproved();
    // Fix URLs for inline viewing
    resources = resources.map(fixResourceUrl);
    // Attach tags
    resources = await attachTagsToResources(resources);
    res.json({ resources });
  } catch (error) {
    next(error);
  }
};

// Get user's own resources
export const getMyResources = async (req, res, next) => {
  try {
    let resources = await Resource.findByUser(req.user.id);
    // Fix URLs for inline viewing
    resources = resources.map(fixResourceUrl);
    // Attach tags
    resources = await attachTagsToResources(resources);
    res.json({ resources });
  } catch (error) {
    next(error);
  }
};

// Get all resources (admin only)
export const getAllResources = async (req, res, next) => {
  try {
    let resources = await Resource.findAll();
    // Fix URLs for inline viewing
    resources = resources.map(fixResourceUrl);
    // Attach tags
    resources = await attachTagsToResources(resources);
    res.json({ resources });
  } catch (error) {
    next(error);
  }
};

// Get resource by ID
export const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Fix URL for inline viewing
    const fixedResource = fixResourceUrl(resource);
    res.json({ resource: fixedResource });
  } catch (error) {
    next(error);
  }
};

// Update resource (own resources only, pending status only)
export const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check ownership
    if (resource.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own resources' });
    }

    // Check if pending
    if (resource.status !== 'pending') {
      return res.status(400).json({ error: 'You can only update pending resources' });
    }

    const success = await Resource.update(id, { title, description });

    if (!success) {
      return res.status(500).json({ error: 'Failed to update resource' });
    }

    const updatedResource = await Resource.findById(id);

    res.json({
      message: 'Resource updated successfully',
      resource: updatedResource
    });
  } catch (error) {
    next(error);
  }
};

// Approve resource (admin only)
export const approveResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const success = await Resource.updateStatus(id, 'approved', req.user.id);

    if (!success) {
      return res.status(500).json({ error: 'Failed to approve resource' });
    }

    const updatedResource = await Resource.findById(id);

    // Create notification for uploader
    await db.query(`
      INSERT INTO notifications (id, user_id, type, title, message, resource_id)
      VALUES (UUID(), ?, 'approval', ?, ?, ?)
    `, [
      resource.uploaded_by,
      'Resource Approved',
      `Your resource "${resource.title}" has been approved and is now visible to everyone!`,
      id
    ]);

    res.json({
      message: 'Resource approved successfully',
      resource: updatedResource
    });
  } catch (error) {
    next(error);
  }
};

// Reject resource (admin only)
export const rejectResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const success = await Resource.updateStatus(id, 'rejected', req.user.id);

    if (!success) {
      return res.status(500).json({ error: 'Failed to reject resource' });
    }

    const updatedResource = await Resource.findById(id);

    // Create notification for uploader
    const message = reason 
      ? `Your resource "${resource.title}" was rejected. Reason: ${reason}`
      : `Your resource "${resource.title}" was rejected.`;

    await db.query(`
      INSERT INTO notifications (id, user_id, type, title, message, resource_id)
      VALUES (UUID(), ?, 'rejection', ?, ?, ?)
    `, [
      resource.uploaded_by,
      'Resource Rejected',
      message,
      id
    ]);

    res.json({
      message: 'Resource rejected successfully',
      resource: updatedResource
    });
  } catch (error) {
    next(error);
  }
};

// Delete resource
export const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check permissions (admin or owner)
    if (req.user.role !== 'admin' && resource.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete from Cloudinary
    try {
      const resourceType = resource.file_type === 'image' ? 'image' : 'raw';
      await cloudinary.uploader.destroy(resource.public_id, { resource_type: resourceType });
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    const success = await Resource.delete(id);

    if (!success) {
      return res.status(500).json({ error: 'Failed to delete resource' });
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Search resources
export const searchResources = async (req, res, next) => {
  try {
    const { q, fileType } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const resources = await Resource.searchResources(q, fileType);

    res.json({ resources });
  } catch (error) {
    next(error);
  }
};

// View resource with proper headers for inline display
export const viewResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Only approved resources can be viewed publicly
    if (resource.status !== 'approved') {
      return res.status(403).json({ error: 'This resource is not yet approved for viewing' });
    }

    // Increment view count
    await db.query('UPDATE resources SET view_count = view_count + 1 WHERE id = ?', [id]);

    // For PDFs and documents, redirect to Cloudinary but with inline viewing
    // We'll use Google Docs Viewer for better inline PDF viewing
    if (resource.file_type === 'pdf') {
      const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(resource.file_url)}&embedded=true`;
      return res.redirect(googleDocsViewerUrl);
    }

    // For other file types, just redirect to the file URL
    res.redirect(resource.file_url);
  } catch (error) {
    next(error);
  }
};

// ==================================
// DOWNLOAD STATISTICS ENDPOINTS
// ==================================

// Track download
export const trackDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Increment download count
    await db.query('UPDATE resources SET download_count = download_count + 1 WHERE id = ?', [id]);

    // Log download history
    await db.query(
      'INSERT INTO download_history (id, resource_id, user_id) VALUES (UUID(), ?, ?)',
      [id, userId]
    );

    res.json({ success: true, message: 'Download tracked' });
  } catch (error) {
    next(error);
  }
};

// ==================================
// TAGS ENDPOINTS
// ==================================

// Get all tags
export const getAllTags = async (req, res, next) => {
  try {
    const [tags] = await db.query('SELECT * FROM tags ORDER BY name');
    res.json({ tags });
  } catch (error) {
    next(error);
  }
};

// Add tags to resource
export const addTagsToResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tagIds } = req.body;

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return res.status(400).json({ error: 'Tag IDs array is required' });
    }

    // Verify resource exists and user owns it or is admin
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (resource.uploaded_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Remove existing tags
    await db.query('DELETE FROM resource_tags WHERE resource_id = ?', [id]);

    // Add new tags
    for (const tagId of tagIds) {
      await db.query(
        'INSERT INTO resource_tags (id, resource_id, tag_id) VALUES (UUID(), ?, ?)',
        [id, tagId]
      );
    }

    res.json({ message: 'Tags updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Get resource tags
export const getResourceTags = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [tags] = await db.query(`
      SELECT t.* 
      FROM tags t
      JOIN resource_tags rt ON t.id = rt.tag_id
      WHERE rt.resource_id = ?
    `, [id]);

    res.json({ tags });
  } catch (error) {
    next(error);
  }
};

// ==================================
// RATING & REVIEW ENDPOINTS
// ==================================

// Add or update rating
export const rateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if resource exists and is approved
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (resource.status !== 'approved') {
      return res.status(400).json({ error: 'Can only rate approved resources' });
    }

    // Cannot rate own resource
    if (resource.uploaded_by === userId) {
      return res.status(400).json({ error: 'Cannot rate your own resource' });
    }

    // Insert or update rating
    await db.query(`
      INSERT INTO ratings (id, resource_id, user_id, rating, review)
      VALUES (UUID(), ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review), updated_at = CURRENT_TIMESTAMP
    `, [id, userId, rating, review || null]);

    // Recalculate average rating
    const [ratingStats] = await db.query(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count
      FROM ratings
      WHERE resource_id = ?
    `, [id]);

    await db.query(`
      UPDATE resources 
      SET average_rating = ?, rating_count = ?
      WHERE id = ?
    `, [ratingStats[0].avg_rating || 0, ratingStats[0].rating_count || 0, id]);

    // Create notification for resource owner
    const notificationTitle = review ? 'New Review on Your Resource' : 'New Rating on Your Resource';
    const notificationMessage = review 
      ? `${req.user.fullName} rated your resource "${resource.title}" ${rating} stars and left a review`
      : `${req.user.fullName} rated your resource "${resource.title}" ${rating} stars`;

    await db.query(`
      INSERT INTO notifications (id, user_id, type, title, message, resource_id)
      VALUES (UUID(), ?, 'rating', ?, ?, ?)
    `, [resource.uploaded_by, notificationTitle, notificationMessage, id]);

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get resource ratings and reviews
export const getResourceRatings = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [ratings] = await db.query(`
      SELECT r.*, u.full_name as user_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.resource_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

    res.json({ ratings });
  } catch (error) {
    next(error);
  }
};

// Get user's rating for a resource
export const getUserRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rating] = await db.query(`
      SELECT * FROM ratings
      WHERE resource_id = ? AND user_id = ?
    `, [id, userId]);

    res.json({ rating: rating[0] || null });
  } catch (error) {
    next(error);
  }
};

// ==================================
// FAVORITES/BOOKMARKS ENDPOINTS
// ==================================

// Toggle favorite
export const toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already favorited
    const [existing] = await db.query(`
      SELECT id FROM favorites WHERE user_id = ? AND resource_id = ?
    `, [userId, id]);

    if (existing.length > 0) {
      // Remove favorite
      await db.query('DELETE FROM favorites WHERE user_id = ? AND resource_id = ?', [userId, id]);
      res.json({ message: 'Removed from favorites', isFavorite: false });
    } else {
      // Add favorite
      await db.query(
        'INSERT INTO favorites (id, user_id, resource_id) VALUES (UUID(), ?, ?)',
        [userId, id]
      );
      res.json({ message: 'Added to favorites', isFavorite: true });
    }
  } catch (error) {
    next(error);
  }
};

// Get user's favorites
export const getUserFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [favorites] = await db.query(`
      SELECT r.*, u.full_name as uploader_name,
             f.created_at as favorited_at
      FROM favorites f
      JOIN resources r ON f.resource_id = r.id
      JOIN users u ON r.uploaded_by = u.id
      WHERE f.user_id = ? AND r.status = 'approved'
      ORDER BY f.created_at DESC
    `, [userId]);

    res.json({ favorites });
  } catch (error) {
    next(error);
  }
};

// Check if resource is favorited
export const checkFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [favorite] = await db.query(`
      SELECT id FROM favorites WHERE user_id = ? AND resource_id = ?
    `, [userId, id]);

    res.json({ isFavorite: favorite.length > 0 });
  } catch (error) {
    next(error);
  }
};

// ==================================
// NOTIFICATIONS ENDPOINTS
// ==================================

// Get user notifications
export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { unreadOnly } = req.query;

    let query = `
      SELECT n.*, r.title as resource_title
      FROM notifications n
      LEFT JOIN resources r ON n.resource_id = r.id
      WHERE n.user_id = ?
    `;

    if (unreadOnly === 'true') {
      query += ' AND n.is_read = FALSE';
    }

    query += ' ORDER BY n.created_at DESC LIMIT 50';

    const [notifications] = await db.query(query, [userId]);

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(`
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE id = ? AND user_id = ?
    `, [id, userId]);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await db.query(`
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE user_id = ? AND is_read = FALSE
    `, [userId]);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [result] = await db.query(`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND is_read = FALSE
    `, [userId]);

    res.json({ count: result[0].count });
  } catch (error) {
    next(error);
  }
};

