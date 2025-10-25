# 🔧 Database Sync & Troubleshooting Guide

## Issue: Foreign Key Constraint Error

**Error Message:**
```
Cannot add or update a child row: a foreign key constraint fails
(`railway`.`resources`, CONSTRAINT `resources_ibfk_1` 
FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE)
```

**Root Cause:** 
The user ID in your JWT token doesn't exist in the Railway database. This happens when:
1. You created users locally but now using Railway database
2. The JWT token contains a user ID from the old local database
3. Railway database doesn't have that user

## 🚀 Solution Steps

### Step 1: Check Your Database

```bash
cd backend
npm run check-db
```

This will show you:
- How many users are in the database
- Their email addresses and IDs
- Any orphaned resources
- Database connection status

### Step 2: Clean Orphaned Resources (if any)

```bash
npm run clean-orphaned
```

This removes resources that reference non-existent users.

### Step 3: Create Admin User in Railway Database

```bash
npm run create-admin
```

Enter your desired credentials when prompted.

### Step 4: Logout and Login Again

**Important:** You MUST logout and login again with the new admin account!

1. Open frontend: http://localhost:5173
2. Click "Sign Out"
3. Login with the admin credentials you just created
4. Now you can upload resources successfully

### Step 5: Register Student Accounts

If you need student accounts:
1. Click "Register" 
2. Create new student accounts
3. These will be created in the Railway database

## 🎯 Issue: Files Downloading Instead of Viewing

**Root Cause:** Cloudinary serves raw files (PDFs, docs) with `Content-Disposition: attachment` by default.

**Solution Applied:**
- Modified `resourceController.js` to add `fl_attachment:false` parameter
- This forces Cloudinary to serve files inline for viewing
- URLs now look like: `https://res.cloudinary.com/.../upload/fl_attachment:false/...`

## 📝 Updated Features

### 1. User Validation Before Upload

The backend now checks if the user exists before allowing uploads:

```javascript
// Verify user exists in database
const [userExists] = await db.query('SELECT id FROM users WHERE id = ?', [req.user.id]);
if (!userExists || userExists.length === 0) {
  return res.status(400).json({ 
    error: 'User not found in database. Please logout and login again.' 
  });
}
```

### 2. File URL Modification

For PDFs and documents:
```javascript
// Replace /upload/ with /upload/fl_attachment:false/
fileUrl = uploadResult.secure_url.replace('/upload/', '/upload/fl_attachment:false/');
```

### 3. New Database Management Scripts

**Check Database:**
```bash
npm run check-db
```
- Shows all users
- Counts resources
- Finds orphaned resources

**Clean Orphaned:**
```bash
npm run clean-orphaned
```
- Deletes resources with invalid user IDs
- Prevents foreign key errors

## 🔄 Migration Workflow

### From Local to Railway Database

1. **Backup Old Data (Optional)**
   ```bash
   mysqldump -u root -p college_resource_portal > backup.sql
   ```

2. **Update .env with Railway Credentials**
   ```env
   DB_HOST=your-railway-host
   DB_USER=root
   DB_PASSWORD=your-railway-password
   DB_NAME=railway
   DB_PORT=your-railway-port
   ```

3. **Initialize Railway Database**
   ```bash
   npm run init-db
   ```

4. **Create Admin User**
   ```bash
   npm run create-admin
   ```

5. **Clear Browser Data**
   - Open DevTools (F12)
   - Application > Storage > Clear Site Data
   - Or just logout and login

6. **Login with New Credentials**
   - Use the admin credentials from step 4
   - JWT token will now have correct user ID

## 🐛 Common Errors & Solutions

### Error: "User not found in database"

**Solution:** Logout and login again
```
1. Click "Sign Out"
2. Login with Railway database credentials
3. Token will update with correct user ID
```

### Error: Foreign Key Constraint

**Solution:** Clean orphaned resources
```bash
npm run clean-orphaned
```

### Error: Cannot connect to database

**Solution:** Check Railway connection
```bash
# Test connection
mysql -h your-host -u root -p --port=your-port
```

### Error: JWT token expired

**Solution:** Automatic redirect to login
- Frontend already handles this
- Just login again

## 🔐 Security Notes

### Railway Database

- Host: `shortline.proxy.rlwy.net`
- Port: `50439`
- Make sure to use these in your `.env`

### JWT Tokens

- Tokens contain user ID from database
- Valid for 7 days
- Automatically refresh on login
- Stored in localStorage

### File Access

- All approved files are publicly accessible
- Cloudinary URLs are public
- No authentication needed to view/download

## 📊 Database Schema Reference

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Resources Table
```sql
CREATE TABLE resources (
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
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);
```

## ✅ Checklist After Railway Migration

- [ ] Updated `.env` with Railway credentials
- [ ] Ran `npm run init-db`
- [ ] Created admin user with `npm run create-admin`
- [ ] Ran `npm run check-db` to verify
- [ ] Cleared browser cache/localStorage
- [ ] Logged out from frontend
- [ ] Logged in with new credentials
- [ ] Successfully uploaded a test file
- [ ] Verified file opens inline (not downloads)
- [ ] Deleted test file
- [ ] Backend server running without errors
- [ ] Frontend connected to backend

## 🎉 Success Indicators

You know everything is working when:

1. ✅ `npm run check-db` shows your users
2. ✅ You can login without errors
3. ✅ You can upload files successfully
4. ✅ Uploaded files appear in "My Uploads"
5. ✅ Admin can approve/reject resources
6. ✅ PDFs open inline in browser (not download)
7. ✅ No foreign key errors in console
8. ✅ No orphaned resources

## 📞 Quick Commands Reference

```bash
# Check database status
npm run check-db

# Clean orphaned resources
npm run clean-orphaned

# Create new admin
npm run create-admin

# Initialize/reset database
npm run init-db

# Start development server
npm run dev

# Start production server
npm start
```

## 💡 Pro Tips

1. **Always logout/login after database changes**
2. **Use `check-db` regularly** to monitor database health
3. **Clean orphaned resources** before deploying
4. **Create admin first**, then students
5. **Test file upload immediately** after login
6. **Check browser console** for any errors
7. **Verify Railway connection** in backend logs

---

**Last Updated:** October 25, 2025
**Status:** ✅ Issues Resolved
