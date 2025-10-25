import db from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanOrphanedResources = async () => {
  try {
    console.log('\n🧹 Cleaning orphaned resources...\n');
    
    // Find orphaned resources
    const [orphaned] = await db.query(`
      SELECT r.id, r.title, r.uploaded_by, r.public_id
      FROM resources r 
      LEFT JOIN users u ON r.uploaded_by = u.id 
      WHERE u.id IS NULL
    `);

    if (orphaned.length === 0) {
      console.log('✅ No orphaned resources found!\n');
      process.exit(0);
      return;
    }

    console.log(`Found ${orphaned.length} orphaned resources:\n`);
    orphaned.forEach(r => {
      console.log(`   - ${r.title} (user ID: ${r.uploaded_by})`);
    });

    // Delete orphaned resources
    const [result] = await db.query(`
      DELETE r FROM resources r 
      LEFT JOIN users u ON r.uploaded_by = u.id 
      WHERE u.id IS NULL
    `);

    console.log(`\n✅ Deleted ${result.affectedRows} orphaned resources!\n`);
    console.log('💡 Tip: Make sure to login with a valid account before uploading resources.\n');
    
  } catch (error) {
    console.error('❌ Error cleaning orphaned resources:', error.message);
  } finally {
    process.exit(0);
  }
};

cleanOrphanedResources();
