-- Migration: Add Download Statistics, Tags, Ratings, and Notifications
-- Date: 2025-10-26

-- ============================================
-- 1. Add Download and View Statistics to Resources
-- ============================================

-- Add columns if they don't exist
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS download_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rating_count INT DEFAULT 0;

-- ============================================
-- 2. Create Tags System
-- ============================================

CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS resource_tags (
    id VARCHAR(36) PRIMARY KEY,
    resource_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_resource_tag (resource_id, tag_id),
    INDEX idx_resource_id (resource_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default tags
INSERT INTO tags (id, name, slug, color) VALUES
(UUID(), 'Computer Science', 'computer-science', '#3B82F6'),
(UUID(), 'Mathematics', 'mathematics', '#10B981'),
(UUID(), 'Physics', 'physics', '#F59E0B'),
(UUID(), 'Chemistry', 'chemistry', '#EF4444'),
(UUID(), 'Semester 1', 'semester-1', '#8B5CF6'),
(UUID(), 'Semester 2', 'semester-2', '#8B5CF6'),
(UUID(), 'Semester 3', 'semester-3', '#8B5CF6'),
(UUID(), 'Semester 4', 'semester-4', '#8B5CF6'),
(UUID(), 'Semester 5', 'semester-5', '#8B5CF6'),
(UUID(), 'Semester 6', 'semester-6', '#8B5CF6'),
(UUID(), 'Semester 7', 'semester-7', '#8B5CF6'),
(UUID(), 'Semester 8', 'semester-8', '#8B5CF6'),
(UUID(), 'Notes', 'notes', '#06B6D4'),
(UUID(), 'Assignment', 'assignment', '#EC4899'),
(UUID(), 'Previous Paper', 'previous-paper', '#F97316'),
(UUID(), 'Project', 'project', '#84CC16'),
(UUID(), 'Tutorial', 'tutorial', '#6366F1'),
(UUID(), 'Reference', 'reference', '#14B8A6')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- 3. Create Rating & Review System
-- ============================================

CREATE TABLE IF NOT EXISTS ratings (
    id VARCHAR(36) PRIMARY KEY,
    resource_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_resource_rating (user_id, resource_id),
    INDEX idx_resource_id (resource_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add average rating and rating count to resources table
-- Already added above with download_count

-- Create indexes after columns are added
CREATE INDEX IF NOT EXISTS idx_download_count ON resources(download_count);
CREATE INDEX IF NOT EXISTS idx_view_count ON resources(view_count);
CREATE INDEX IF NOT EXISTS idx_average_rating ON resources(average_rating);

-- ============================================
-- 4. Create Favorites/Bookmarks System
-- ============================================

CREATE TABLE IF NOT EXISTS favorites (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    resource_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_favorite (user_id, resource_id),
    INDEX idx_user_id (user_id),
    INDEX idx_resource_id (resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Create Notifications System
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('approval', 'rejection', 'comment', 'rating', 'announcement', 'new_resource') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    resource_id VARCHAR(36),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. Create Download History (Optional - for analytics)
-- ============================================

CREATE TABLE IF NOT EXISTS download_history (
    id VARCHAR(36) PRIMARY KEY,
    resource_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_resource_id (resource_id),
    INDEX idx_user_id (user_id),
    INDEX idx_downloaded_at (downloaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Success Message
-- ============================================

SELECT 'Migration completed successfully!' AS status;
