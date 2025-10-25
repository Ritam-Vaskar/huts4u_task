# College Resource Portal

A full-stack web application for managing and sharing educational resources in a college environment. Students can upload study materials (PDFs, documents, presentations, images) which are reviewed and approved by admins before being made publicly available.

## 🚀 Features

### For Students
- 📚 Browse and download approved resources
- 📤 Upload study materials (PDF, DOC, PPT, images)
- 📊 Track upload status (pending/approved/rejected)
- 🔍 Search and filter resources by type
- 👤 Personal dashboard

### For Admins
- ✅ Review and approve/reject resources
- 🗑️ Delete inappropriate content
- 📈 View all resources and their status
- 🛡️ Moderate content quality

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - File storage
- **Multer** - File upload handling

## 📁 Project Structure

```
college-resource-portal/
├── backend/                # Node.js + Express backend
│   ├── config/            # Database & Cloudinary config
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Auth, upload, error handling
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── server.js         # Entry point
│   └── package.json
│
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── api/          # API integration
│   │   ├── components/   # React components
│   │   ├── contexts/     # Context providers
│   │   ├── App.jsx       # Main component
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md             # This file
```

## 🚦 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **MySQL** (v8 or higher)
- **npm** or **yarn**
- **Cloudinary Account** (for file storage)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd college-resource-portal
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=college_resource_portal
DB_PORT=3306

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this

# Server Configuration
PORT=5000
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

Initialize database:

```bash
npm run init-db
```

Start backend server:

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start frontend dev server:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 👨‍💼 Creating Admin User

After setting up the database, create an admin user manually:

### Option 1: Using Node.js REPL

```bash
cd backend
node
```

```javascript
const bcrypt = require('bcryptjs');
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash('admin123', salt);
console.log(hash);
```

Then insert into MySQL:

```sql
USE college_resource_portal;

INSERT INTO users (email, password_hash, full_name, role) 
VALUES (
  'admin@college.edu',
  '<paste_hash_here>',
  'Admin User',
  'admin'
);
```

### Option 2: Quick Script

Create `backend/createAdmin.js`:

```javascript
import bcrypt from 'bcryptjs';
import db from './config/database.js';

const createAdmin = async () => {
  const email = 'admin@college.edu';
  const password = 'admin123';
  const fullName = 'Admin User';
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  await db.query(
    'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
    [email, passwordHash, fullName, 'admin']
  );
  
  console.log('Admin user created!');
  process.exit(0);
};

createAdmin();
```

Run: `node createAdmin.js`

## 🔑 Default Credentials

After creating admin user:
- **Email**: admin@college.edu
- **Password**: admin123

⚠️ **Change these credentials immediately after first login!**

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Resources
- `GET /api/resources/approved` - Get all approved resources
- `GET /api/resources/my-resources` - Get user's resources
- `GET /api/resources/all` - Get all resources (admin)
- `POST /api/resources/upload` - Upload resource
- `PUT /api/resources/:id` - Update resource
- `PUT /api/resources/:id/approve` - Approve resource (admin)
- `PUT /api/resources/:id/reject` - Reject resource (admin)
- `DELETE /api/resources/:id` - Delete resource
- `GET /api/resources/search` - Search resources

## 🗄️ Database Schema

### Users Table
```sql
- id (VARCHAR, PRIMARY KEY)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- full_name (VARCHAR)
- role (ENUM: 'student', 'admin')
- created_at (TIMESTAMP)
```

### Resources Table
```sql
- id (VARCHAR, PRIMARY KEY)
- title (VARCHAR)
- description (TEXT)
- file_url (TEXT)
- public_id (VARCHAR)
- file_type (ENUM: 'pdf', 'image', 'doc', 'ppt')
- file_size (BIGINT)
- uploaded_by (VARCHAR, FOREIGN KEY)
- status (ENUM: 'pending', 'approved', 'rejected')
- uploaded_at (TIMESTAMP)
- reviewed_at (TIMESTAMP)
- reviewed_by (VARCHAR, FOREIGN KEY)
```

## 🎨 Screenshots

### Login Page
Clean and modern login interface with email/password authentication.

### Resource Library
Browse all approved resources with search and filter capabilities.

### Upload Resource
Easy file upload with drag-and-drop support for students.

### Admin Dashboard
Review pending resources with approve/reject actions.

## 🧪 Testing

### Test User Registration
1. Go to `http://localhost:5173`
2. Click "Register"
3. Fill in details and create account
4. Verify you're logged in as student

### Test Resource Upload
1. Login as student
2. Click "Upload" tab
3. Upload a PDF or image
4. Check "My Uploads" tab to see pending status

### Test Admin Approval
1. Logout and login as admin
2. Go to "Admin" tab
3. Approve or reject pending resources
4. Logout and login as student to verify

## 🐛 Troubleshooting

### Backend won't start
- Check if MySQL is running
- Verify database credentials in .env
- Run `npm run init-db` to create tables

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check VITE_API_BASE_URL in frontend/.env
- Check CORS settings in backend

### File upload fails
- Verify Cloudinary credentials
- Check file size (<10MB)
- Check file type is allowed

### Authentication errors
- Clear browser localStorage
- Check JWT_SECRET is set
- Verify token hasn't expired

## 📦 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use production MySQL database
3. Set strong JWT_SECRET
4. Configure proper CORS origins
5. Use process manager (PM2)

### Frontend
1. Build: `npm run build`
2. Serve `dist` folder with nginx/apache
3. Update API_BASE_URL to production backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

ISC

## 👥 Authors

College Resource Portal Team

## 🙏 Acknowledgments

- React and Vite teams
- Tailwind CSS
- Express.js community
- Cloudinary for file storage

---

**Note**: This is an educational project. Make sure to implement additional security measures (rate limiting, input sanitization, HTTPS) before deploying to production.
