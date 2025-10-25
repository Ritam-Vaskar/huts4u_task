import db from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAndFixDatabase = async () => {
  try {
    console.log('\n🔍 Checking database connection...\n');
    
    // Test connection
    await db.query('SELECT 1');
    console.log('✅ Database connected successfully!\n');

    // Check users table
    const [users] = await db.query('SELECT id, email, full_name, role FROM users');
    console.log(`📊 Found ${users.length} users in database:\n`);
    
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - ID: ${user.id}`);
      });
    } else {
      console.log('   ⚠️  No users found! Please create an admin user first.');
      console.log('   Run: npm run create-admin\n');
    }

    // Check resources table
    const [resources] = await db.query('SELECT COUNT(*) as count FROM resources');
    console.log(`\n📁 Found ${resources[0].count} resources in database\n`);

    // Check for orphaned resources (resources with non-existent user IDs)
    const [orphaned] = await db.query(`
      SELECT r.id, r.title, r.uploaded_by 
      FROM resources r 
      LEFT JOIN users u ON r.uploaded_by = u.id 
      WHERE u.id IS NULL
    `);

    if (orphaned.length > 0) {
      console.log(`⚠️  Found ${orphaned.length} orphaned resources (user doesn't exist):\n`);
      orphaned.forEach(r => {
        console.log(`   - ${r.title} (user ID: ${r.uploaded_by})`);
      });
      
      console.log('\n❓ Do you want to delete these orphaned resources? (They will cause errors)');
      console.log('   To delete them, run: npm run clean-orphaned\n');
    } else {
      console.log('✅ No orphaned resources found!\n');
    }

    console.log('🎉 Database check complete!\n');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    process.exit(0);
  }
};

checkAndFixDatabase();
