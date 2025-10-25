# 🚀 Quick Reference Card

## 📁 Project Location
```
c:\Users\KIIT0001\Downloads\huts4u Task\college-resource-portal\
```

## ⚡ Quick Start Commands

### First Time Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run init-db
npm run create-admin

# Frontend  
cd frontend
npm install
cp .env.example .env
```

### Daily Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api

## 🔑 Environment Files

### backend/.env
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=college_resource_portal
JWT_SECRET=YOUR_SECRET_KEY
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

### frontend/.env
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📊 Database Commands

```bash
# Initialize database
npm run init-db

# Create admin user
npm run create-admin

# Connect to MySQL
mysql -u root -p
USE college_resource_portal;
SHOW TABLES;
```

## 🛠️ Useful Commands

### Backend
```bash
npm run dev          # Development with auto-reload
npm start            # Production mode
npm run init-db      # Setup database
npm run create-admin # Create admin user
```

### Frontend
```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview build
npm run lint      # Check code quality
```

## 📝 Project Structure

```
college-resource-portal/
├── backend/              # Node.js + Express + MySQL
│   ├── config/          # Database & Cloudinary
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, upload, errors
│   ├── models/         # Database models
│   ├── routes/         # API endpoints
│   └── server.js       # Entry point
│
└── frontend/            # React + Vite
    ├── src/
    │   ├── api/        # API integration
    │   ├── components/ # React components
    │   └── contexts/   # State management
    └── index.html
```

## 🎯 User Roles

### Student
- Browse resources
- Upload resources
- Track upload status
- Search & filter

### Admin
- Review pending resources
- Approve/reject resources
- Delete any resource
- Manage all content

## 🔐 Default Admin Credentials
Created by you during setup with:
```bash
npm run create-admin
```

## 📡 Key API Endpoints

### Authentication
- POST `/api/auth/register` - Register
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get profile

### Resources
- GET `/api/resources/approved` - Browse
- POST `/api/resources/upload` - Upload
- GET `/api/resources/my-resources` - My uploads
- PUT `/api/resources/:id/approve` - Approve (admin)
- DELETE `/api/resources/:id` - Delete

## 🐛 Quick Troubleshooting

### Backend won't start
```bash
# Check MySQL is running
mysql -u root -p

# Check .env file exists
ls backend/.env

# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
```

### Frontend won't start
```bash
# Check backend is running
curl http://localhost:5000

# Check .env file
ls frontend/.env

# Clear cache and reinstall
cd frontend && rm -rf node_modules && npm install
```

### Database errors
```bash
# Reinitialize database
cd backend
npm run init-db

# Check connection
mysql -u root -p -e "USE college_resource_portal; SHOW TABLES;"
```

## 📦 Dependencies

### Backend (Node.js)
- express, mysql2, bcryptjs, jsonwebtoken
- cors, multer, cloudinary, dotenv

### Frontend (React)
- react, react-dom, axios
- tailwindcss, lucide-react

## 🎨 Technology Stack

**Frontend**: React 18 + Vite + Tailwind CSS
**Backend**: Node.js + Express + MySQL
**Auth**: JWT + Bcrypt
**Storage**: Cloudinary
**Database**: MySQL 8

## 📚 Documentation Files

- `README.md` - Main documentation
- `SETUP.md` - Setup guide
- `PROJECT_SUMMARY.md` - Complete overview
- `backend/README.md` - Backend docs
- `frontend/README.md` - Frontend docs

## 💡 Pro Tips

1. Always start backend before frontend
2. Check both terminal outputs for errors
3. Use MySQL Workbench for DB management
4. Install React DevTools extension
5. Keep .env files secret (don't commit)
6. Use Postman to test API endpoints

## 🔄 Git Commands

```bash
# Initialize repo
git init
git add .
git commit -m "Initial commit: Restructured project"

# Push to GitHub
git remote add origin YOUR_REPO_URL
git push -u origin main
```

## 🎯 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:5173
- [ ] Can register new user
- [ ] Can login
- [ ] Can upload resource
- [ ] Admin can approve resources
- [ ] Resources appear in browse page

## 📞 Need Help?

1. Check console/terminal for errors
2. Review documentation files
3. Verify .env files are configured
4. Ensure MySQL is running
5. Check internet connection (for Cloudinary)

---

**Quick Access URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Project: c:\Users\KIIT0001\Downloads\huts4u Task\college-resource-portal\

**Next Steps:**
1. Install dependencies (backend & frontend)
2. Configure .env files
3. Initialize database
4. Create admin user
5. Start both servers
6. Open browser and test!
