import Resource from '../models/Resource.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Helper function to determine file type
const getFileType = (mimetype) => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.includes('word') || mimetype.includes('document')) return 'doc';
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'ppt';
  return null;
};

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, resourceType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'college-resources'
      },
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
    const uploadResult = await uploadToCloudinary(file.buffer, resourceType);

    // Save to database (returns the created resource)
    const resource = await Resource.create({
      title,
      description: description || null,
      fileUrl: uploadResult.secure_url,
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

// Get all approved resources (public)
export const getApprovedResources = async (req, res, next) => {
  try {
    const resources = await Resource.findApproved();
    res.json({ resources });
  } catch (error) {
    next(error);
  }
};

// Get user's own resources
export const getMyResources = async (req, res, next) => {
  try {
    const resources = await Resource.findByUser(req.user.id);
    res.json({ resources });
  } catch (error) {
    next(error);
  }
};

// Get all resources (admin only)
export const getAllResources = async (req, res, next) => {
  try {
    const resources = await Resource.findAll();
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

    res.json({ resource });
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
