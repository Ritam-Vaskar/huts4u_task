# Quick Setup Guide

This guide will help you get the College Resource Portal up and running quickly.

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your settings:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=college_resource_portal
JWT_SECRET=your_random_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
```

Content is already set correctly:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 3: Setup Database

Make sure MySQL is running, then:

```bash
cd backend
npm run init-db
```

### Step 4: Create Admin User

```bash
cd backend
npm run create-admin
```

Follow the prompts to create your admin account.

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 6: Access the Application

Open your browser and go to: `http://localhost:5173`

- Login with your admin credentials to access admin panel
- Or register a new student account to test student features

## 🎯 Testing the Application

### Test Student Flow:
1. Click "Register" and create a student account
2. Upload a test resource (PDF, image, etc.)
3. Check "My Uploads" to see pending status

### Test Admin Flow:
1. Logout and login as admin
2. Go to "Admin" tab
3. Approve or reject the pending resource
4. Verify it appears in the main resources page

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- ✅ Node.js (v18+) installed
- ✅ MySQL (v8+) installed and running
- ✅ Cloudinary account created (free tier works)
- ✅ Git (optional, for version control)

## 🔧 Configuration Details

### MySQL Database

If you haven't created the database yet:

```sql
CREATE DATABASE college_resource_portal;
```

The `init-db` script will create the tables automatically.

### Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret
4. Add them to `backend/.env`

### JWT Secret

Generate a secure random string for JWT_SECRET:

**Option 1 - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2 - Online:**
Use any password generator to create a 32+ character random string.

## 🚨 Common Issues & Solutions

### Issue: Database Connection Failed

**Solution:**
- Verify MySQL is running: `mysql -u root -p`
- Check DB credentials in `.env`
- Ensure database exists

### Issue: Port Already in Use

**Solution:**
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

### Issue: Cloudinary Upload Fails

**Solution:**
- Verify Cloudinary credentials
- Check internet connection
- Ensure file size is under 10MB

### Issue: Cannot Create Admin

**Solution:**
- Ensure database is initialized
- Check for existing user with same email
- Verify database connection

## 📱 Default Ports

- **Backend API:** http://localhost:5000
- **Frontend App:** http://localhost:5173
- **MySQL:** localhost:3306

## 🎨 UI Overview

### Login/Register
- Clean authentication pages
- Form validation
- Error messages

### Student Dashboard
- **Resources Tab:** Browse approved resources
- **Upload Tab:** Submit new resources
- **My Uploads Tab:** Track your submissions

### Admin Dashboard
- **Pending Reviews:** Resources awaiting approval
- **Reviewed Resources:** All approved/rejected items
- Quick approve/reject/delete actions

## 🔐 Security Notes

For **development**:
- Default passwords are acceptable
- HTTP is fine
- CORS is open

For **production**:
- Use strong passwords
- Enable HTTPS
- Restrict CORS origins
- Add rate limiting
- Use environment-specific secrets

## 📚 Next Steps

After successful setup:

1. **Customize Branding**
   - Update "College Portal" name in Navigation
   - Add your college logo
   - Customize color scheme

2. **Add More Admins**
   - Run `npm run create-admin` again
   - Create multiple admin accounts

3. **Configure File Types**
   - Edit allowed types in `backend/middleware/upload.js`
   - Update frontend validation

4. **Adjust File Size Limit**
   - Change limit in `backend/middleware/upload.js`
   - Update frontend message

## 💡 Pro Tips

1. **Use MySQL Workbench** for easier database management
2. **Install React DevTools** for frontend debugging
3. **Use Postman** to test API endpoints
4. **Enable MySQL logging** to debug queries
5. **Check browser console** for frontend errors

## 📞 Need Help?

If you encounter issues:

1. Check the main README.md for detailed documentation
2. Review the error messages in terminal
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
5. Ensure all prerequisites are installed

## ✅ Setup Complete!

Once everything is running, you should see:

- ✅ Backend: "Server is running on port 5000"
- ✅ Backend: "Database connected successfully"
- ✅ Frontend: Opens in browser at localhost:5173
- ✅ Can login/register users
- ✅ Can upload and manage resources

**Happy coding! 🚀**
