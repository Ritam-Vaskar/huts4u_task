# College Resource Portal - Backend

REST API backend for the College Resource Portal built with Node.js, Express, and MySQL.

## Features

- User authentication (JWT-based)
- Role-based access control (Student/Admin)
- Resource upload and management
- File storage with Cloudinary
- Admin approval workflow
- Search and filter resources

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Cloudinary** - File storage
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

## Project Structure

```
backend/
├── config/
│   ├── database.js          # MySQL connection pool
│   ├── initDatabase.js      # Database initialization script
│   └── cloudinary.js        # Cloudinary configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── resourceController.js # Resource management logic
├── middleware/
│   ├── auth.js              # JWT authentication & authorization
│   ├── errorHandler.js      # Global error handler
│   └── upload.js            # File upload configuration
├── models/
│   ├── User.js              # User model
│   └── Resource.js          # Resource model
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   └── resourceRoutes.js    # Resource routes
├── .env.example             # Environment variables template
├── server.js                # Application entry point
└── package.json             # Dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

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

### 3. Set Up MySQL Database

Make sure MySQL is installed and running on your system.

Create the database and tables:

```bash
npm run init-db
```

This will:
- Create the database
- Create users and resources tables
- Set up indexes

### 4. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| GET | `/profile` | Get user profile | Protected |
| PUT | `/profile` | Update user profile | Protected |

### Resource Routes (`/api/resources`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/approved` | Get all approved resources | Authenticated |
| GET | `/search?q=...&fileType=...` | Search resources | Authenticated |
| POST | `/upload` | Upload new resource | Student |
| GET | `/my-resources` | Get user's resources | Student |
| GET | `/all` | Get all resources | Admin |
| GET | `/:id` | Get resource by ID | Authenticated |
| PUT | `/:id` | Update resource | Student (own) |
| PUT | `/:id/approve` | Approve resource | Admin |
| PUT | `/:id/reject` | Reject resource | Admin |
| DELETE | `/:id` | Delete resource | Admin/Owner |

## API Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@college.edu",
  "password": "password123",
  "fullName": "John Doe"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@college.edu",
  "password": "password123"
}
```

### Upload Resource
```bash
POST /api/resources/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Data Structures Notes",
  "description": "Complete notes for DS course",
  "file": <file>
}
```

### Approve Resource (Admin)
```bash
PUT /api/resources/:id/approve
Authorization: Bearer <admin_token>
```

## Database Schema

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

## Creating Admin User

After setting up the database, you need to manually create an admin user:

```sql
-- Connect to MySQL
mysql -u root -p

-- Use the database
USE college_resource_portal;

-- Insert admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role) 
VALUES (
  'admin@college.edu',
  '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',  -- You need to hash this
  'Admin User',
  'admin'
);
```

Or use bcrypt to hash the password:

```javascript
const bcrypt = require('bcryptjs');
const password = 'admin123';
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);
console.log(hash);
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- File type validation
- File size limits (10MB)
- CORS protection
- Environment variable protection

## Development

### Running Tests
```bash
npm test
```

### Code Style
Follow ES6+ standards and use ESLint for code quality.

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### Cloudinary Upload Issues
- Verify Cloudinary credentials
- Check file size and type
- Ensure proper API keys

### JWT Token Issues
- Check JWT_SECRET in `.env`
- Verify token expiration
- Check Authorization header format

## License

ISC
