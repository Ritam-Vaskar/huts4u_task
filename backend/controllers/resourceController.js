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

// Get all approved resources (public)
export const getApprovedResources = async (req, res, next) => {
  try {
    const resources = await Resource.findApproved();
    // Fix URLs for inline viewing
    const fixedResources = resources.map(fixResourceUrl);
    res.json({ resources: fixedResources });
  } catch (error) {
    next(error);
  }
};

// Get user's own resources
export const getMyResources = async (req, res, next) => {
  try {
    const resources = await Resource.findByUser(req.user.id);
    // Fix URLs for inline viewing
    const fixedResources = resources.map(fixResourceUrl);
    res.json({ resources: fixedResources });
  } catch (error) {
    next(error);
  }
};

// Get all resources (admin only)
export const getAllResources = async (req, res, next) => {
  try {
    const resources = await Resource.findAll();
    // Fix URLs for inline viewing
    const fixedResources = resources.map(fixResourceUrl);
    res.json({ resources: fixedResources });
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

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const success = await Resource.updateStatus(id, 'rejected', req.user.id);

    if (!success) {
      return res.status(500).json({ error: 'Failed to reject resource' });
    }

    const updatedResource = await Resource.findById(id);

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
