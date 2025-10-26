import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🚀 Starting migration...\n');
    
    // Step 1: Add columns to resources table
    console.log('📊 Step 1: Adding columns to resources table...');
    try {
      await connection.query(`
        ALTER TABLE resources 
        ADD COLUMN download_count INT DEFAULT 0,
        ADD COLUMN view_count INT DEFAULT 0,
        ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00,
        ADD COLUMN rating_count INT DEFAULT 0
      `);
      console.log('✅ Added columns successfully\n');
    } catch (error) {
      if (error.errno === 1060) {
        console.log('⚠️  Columns already exist, skipping...\n');
      } else {
        throw error;
      }
    }
    
    // Step 2: Create tags table
    console.log('📊 Step 2: Creating tags table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#3B82F6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tags table created\n');
    
    // Step 3: Create resource_tags junction table
    console.log('📊 Step 3: Creating resource_tags table...');
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Resource_tags table created\n');
    
    // Step 4: Insert default tags
    console.log('📊 Step 4: Inserting default tags...');
    const defaultTags = [
      ['Computer Science', 'computer-science', '#3B82F6'],
      ['Mathematics', 'mathematics', '#10B981'],
      ['Physics', 'physics', '#F59E0B'],
      ['Chemistry', 'chemistry', '#EF4444'],
      ['Semester 1', 'semester-1', '#8B5CF6'],
      ['Semester 2', 'semester-2', '#8B5CF6'],
      ['Semester 3', 'semester-3', '#8B5CF6'],
      ['Semester 4', 'semester-4', '#8B5CF6'],
      ['Notes', 'notes', '#06B6D4'],
      ['Assignment', 'assignment', '#EC4899'],
      ['Previous Paper', 'previous-paper', '#F97316'],
      ['Project', 'project', '#84CC16'],
      ['Tutorial', 'tutorial', '#6366F1'],
      ['Reference', 'reference', '#14B8A6']
    ];
    
    for (const [name, slug, color] of defaultTags) {
      try {
        await connection.query(
          'INSERT INTO tags (id, name, slug, color) VALUES (UUID(), ?, ?, ?)',
          [name, slug, color]
        );
      } catch (error) {
        if (error.errno !== 1062) { // Ignore duplicate key errors
          throw error;
        }
      }
    }
    console.log(`✅ Inserted ${defaultTags.length} default tags\n`);
    
    // Step 5: Create ratings table
    console.log('📊 Step 5: Creating ratings table...');
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Ratings table created\n');
    
    // Step 6: Create favorites table
    console.log('📊 Step 6: Creating favorites table...');
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Favorites table created\n');
    
    // Step 7: Create notifications table
    console.log('📊 Step 7: Creating notifications table...');
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Notifications table created\n');
    
    // Step 8: Create download_history table
    console.log('📊 Step 8: Creating download_history table...');
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Download_history table created\n');
    
    console.log('\n✨ Migration completed successfully!\n');
    
    // Show summary
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('tags', 'resource_tags', 'ratings', 'favorites', 'notifications', 'download_history')
    `);
    
    console.log('📊 New tables created:');
    tables.forEach(table => {
      console.log(`   ✓ ${table.table_name}`);
    });
    
    const [tags] = await connection.query('SELECT COUNT(*) as count FROM tags');
    console.log(`\n🏷️  Total tags in database: ${tags[0].count}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

runMigration();
