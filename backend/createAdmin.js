import bcrypt from 'bcryptjs';
import db from './config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdmin = async () => {
  try {
    console.log('\n=== Create Admin User ===\n');
    
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const fullName = await question('Enter admin full name: ');
    
    if (!email || !password || !fullName) {
      console.error('❌ All fields are required!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters!');
      process.exit(1);
    }

    // Check if user already exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.error('❌ User with this email already exists!');
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Insert admin user
    await db.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, fullName, 'admin']
    );
    
    console.log('\n✅ Admin user created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Role: admin\n`);
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    rl.close();
    process.exit(1);
  }
};

createAdmin();
