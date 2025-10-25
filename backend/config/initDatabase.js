import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  try {
    // Connect without database selection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to MySQL server');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Users table created');

    // Create resources table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_url TEXT NOT NULL,
        public_id VARCHAR(255) NOT NULL,
        file_type ENUM('pdf', 'image', 'doc', 'ppt') NOT NULL,
        file_size BIGINT,
        uploaded_by VARCHAR(36) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL,
        reviewed_by VARCHAR(36),
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_uploaded_by (uploaded_by),
        INDEX idx_file_type (file_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Resources table created');

    console.log('✅ Database initialization completed successfully');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
