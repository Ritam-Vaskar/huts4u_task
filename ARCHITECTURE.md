# 🏗️ System Architecture

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
│                   http://localhost:5173                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   FRONTEND     │
                    │  React + Vite  │
                    │  Tailwind CSS  │
                    └───────┬────────┘
                            │
                   HTTP/REST API
                            │
                    ┌───────▼────────┐
                    │    BACKEND     │
                    │ Node.js Express│
                    │   Port: 5000   │
                    └───────┬────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
         ┌──────▼──────┐        ┌──────▼──────┐
         │   MySQL     │        │  Cloudinary │
         │  Database   │        │ File Storage│
         │  Port: 3306 │        │   (Cloud)   │
         └─────────────┘        └─────────────┘
```

## 🔄 Request Flow

### Student Uploads Resource

```
┌──────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐     ┌──────────┐
│  Browser │────▶│ Frontend │────▶│   Backend  │────▶│Cloudinary│────▶│  MySQL   │
│          │     │  (React) │     │  (Express) │     │  Upload  │     │  Insert  │
└──────────┘     └──────────┘     └────────────┘     └──────────┘     └──────────┘
     │                │                  │                  │                │
     │                │                  │                  │                │
     │◀───────────────┴──────────────────┴──────────────────┴────────────────┘
     │           Success Response with Resource Data
     │
     └─▶ Show "Pending Approval" Status
```

### Admin Approves Resource

```
┌──────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│  Browser │────▶│ Frontend │────▶│   Backend  │────▶│  MySQL   │
│  (Admin) │     │  (React) │     │  (Express) │     │  Update  │
└──────────┘     └──────────┘     └────────────┘     └──────────┘
     │                │                  │                  │
     │                │                  │                  │
     │◀───────────────┴──────────────────┴──────────────────┘
     │              Approval Confirmed
     │
     └─▶ Resource now visible to all students
```

## 📦 Backend Architecture

```
server.js (Entry Point)
    │
    ├─▶ Middleware
    │   ├─ CORS
    │   ├─ JSON Parser
    │   └─ Error Handler
    │
    ├─▶ Routes
    │   ├─ /api/auth
    │   │   ├─ POST /register
    │   │   ├─ POST /login
    │   │   ├─ GET /profile
    │   │   └─ PUT /profile
    │   │
    │   └─ /api/resources
    │       ├─ GET /approved
    │       ├─ GET /my-resources
    │       ├─ GET /all (admin)
    │       ├─ POST /upload
    │       ├─ PUT /:id
    │       ├─ PUT /:id/approve (admin)
    │       ├─ PUT /:id/reject (admin)
    │       ├─ DELETE /:id
    │       └─ GET /search
    │
    ├─▶ Controllers
    │   ├─ authController.js
    │   │   ├─ register()
    │   │   ├─ login()
    │   │   ├─ getProfile()
    │   │   └─ updateProfile()
    │   │
    │   └─ resourceController.js
    │       ├─ uploadResource()
    │       ├─ getApprovedResources()
    │       ├─ getMyResources()
    │       ├─ getAllResources()
    │       ├─ approveResource()
    │       ├─ rejectResource()
    │       └─ deleteResource()
    │
    ├─▶ Models
    │   ├─ User.js
    │   │   ├─ create()
    │   │   ├─ findByEmail()
    │   │   ├─ findById()
    │   │   └─ updateProfile()
    │   │
    │   └─ Resource.js
    │       ├─ create()
    │       ├─ findAll()
    │       ├─ findByStatus()
    │       ├─ findByUser()
    │       ├─ updateStatus()
    │       └─ delete()
    │
    └─▶ Config
        ├─ database.js (MySQL Pool)
        └─ cloudinary.js (File Storage)
```

## 🎨 Frontend Architecture

```
main.jsx (Entry Point)
    │
    └─▶ App.jsx
        │
        ├─▶ AuthProvider (Context)
        │   ├─ user state
        │   ├─ signIn()
        │   ├─ signUp()
        │   └─ signOut()
        │
        └─▶ AppContent
            │
            ├─▶ Not Authenticated
            │   ├─ Login Component
            │   └─ Register Component
            │
            └─▶ Authenticated
                │
                ├─▶ Navigation
                │   ├─ Tab Controls
                │   ├─ User Info
                │   └─ Sign Out
                │
                └─▶ Content (based on active tab)
                    │
                    ├─▶ All Users
                    │   └─ PublicResources
                    │       ├─ Search Bar
                    │       ├─ Filter Dropdown
                    │       └─ Resource Cards
                    │
                    ├─▶ Students Only
                    │   ├─ UploadResource
                    │   │   ├─ Title Input
                    │   │   ├─ Description Input
                    │   │   └─ File Upload
                    │   │
                    │   └─ MyResources
                    │       └─ Resource List with Status
                    │
                    └─▶ Admins Only
                        └─ AdminDashboard
                            ├─ Pending Reviews
                            │   ├─ Approve Button
                            │   ├─ Reject Button
                            │   └─ Delete Button
                            │
                            └─ Reviewed Resources
                                └─ Delete Button
```

## 🗄️ Database Schema

```
┌─────────────────────────────┐
│          USERS              │
├─────────────────────────────┤
│ id (PK)         VARCHAR(36) │
│ email           VARCHAR(255)│ UNIQUE
│ password_hash   VARCHAR(255)│
│ full_name       VARCHAR(255)│
│ role            ENUM         │ 'student' | 'admin'
│ created_at      TIMESTAMP   │
└─────────────────────────────┘
                │
                │ 1:N
                │
┌─────────────────────────────┐
│        RESOURCES            │
├─────────────────────────────┤
│ id (PK)         VARCHAR(36) │
│ title           VARCHAR(255)│
│ description     TEXT        │
│ file_url        TEXT        │
│ public_id       VARCHAR(255)│
│ file_type       ENUM        │ 'pdf' | 'image' | 'doc' | 'ppt'
│ file_size       BIGINT      │
│ uploaded_by (FK)VARCHAR(36) │ ──▶ users.id
│ status          ENUM        │ 'pending' | 'approved' | 'rejected'
│ uploaded_at     TIMESTAMP   │
│ reviewed_at     TIMESTAMP   │
│ reviewed_by (FK)VARCHAR(36) │ ──▶ users.id
└─────────────────────────────┘
```

## 🔐 Authentication Flow

```
┌─────────────┐
│ User Enters │
│Credentials  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Frontend  │
│ Validates   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│     Backend     │
│ Checks Email    │
│ in Database     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Bcrypt Compares │
│ Password Hash   │
└──────┬──────────┘
       │
       ├─ Invalid ──▶ Error Response
       │
       ▼ Valid
┌─────────────────┐
│  Generate JWT   │
│     Token       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Return Token   │
│  + User Data    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Frontend      │
│ Store Token in  │
│  localStorage   │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ All Future API  │
│ Requests Include│
│ Authorization:  │
│ Bearer <token>  │
└─────────────────┘
```

## 📤 File Upload Flow

```
User Selects File
       │
       ▼
Frontend Validation
 ├─ File Type
 ├─ File Size (<10MB)
 └─ Required Fields
       │
       ▼
Create FormData
 ├─ file
 ├─ title
 └─ description
       │
       ▼
POST /api/resources/upload
 + Authorization Header
       │
       ▼
Backend Middleware
 ├─ Auth Check (JWT)
 ├─ Role Check (student)
 └─ Multer Processing
       │
       ▼
Upload to Cloudinary
 ├─ Get file_url
 └─ Get public_id
       │
       ▼
Save to MySQL
 ├─ Resource details
 ├─ Status: 'pending'
 └─ uploaded_by: user.id
       │
       ▼
Return Success Response
       │
       ▼
Frontend Updates UI
 └─ Show success message
```

## 🛡️ Authorization Matrix

```
┌──────────────────┬──────────┬────────┐
│    Endpoint      │ Student  │ Admin  │
├──────────────────┼──────────┼────────┤
│ Browse Resources │    ✅    │   ✅   │
│ Upload Resource  │    ✅    │   ❌   │
│ My Resources     │    ✅    │   ❌   │
│ Update Own       │    ✅    │   ❌   │
│ View All         │    ❌    │   ✅   │
│ Approve/Reject   │    ❌    │   ✅   │
│ Delete Any       │    ❌    │   ✅   │
└──────────────────┴──────────┴────────┘
```

## 🔄 State Management

```
AuthContext
    │
    ├─ user: {
    │      id: string
    │      email: string
    │      fullName: string
    │      role: 'student' | 'admin'
    │  }
    │
    ├─ loading: boolean
    │
    └─ Methods:
       ├─ signIn(email, password)
       ├─ signUp(email, password, fullName)
       └─ signOut()

Component State
    │
    ├─ PublicResources
    │  ├─ resources[]
    │  ├─ filteredResources[]
    │  ├─ searchQuery
    │  └─ filterType
    │
    ├─ UploadResource
    │  ├─ title
    │  ├─ description
    │  ├─ file
    │  ├─ uploading
    │  └─ error/success
    │
    ├─ MyResources
    │  ├─ resources[]
    │  └─ loading
    │
    └─ AdminDashboard
       ├─ resources[]
       ├─ loading
       └─ actionLoading
```

## 🌐 API Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "stack": "..." // Only in development
}
```

### Resource Object
```json
{
  "id": "uuid",
  "title": "Resource Title",
  "description": "Description text",
  "file_url": "https://cloudinary.com/...",
  "public_id": "folder/file_id",
  "file_type": "pdf",
  "file_size": 1024000,
  "uploaded_by": "user_uuid",
  "status": "pending",
  "uploaded_at": "2024-10-25T10:00:00Z",
  "reviewed_at": null,
  "reviewed_by": null
}
```

## 📊 Performance Considerations

1. **Database Indexes**
   - users.email
   - users.role
   - resources.status
   - resources.uploaded_by
   - resources.file_type

2. **Connection Pooling**
   - MySQL connection pool (max 10 connections)

3. **File Size Limits**
   - Frontend: File picker validation
   - Backend: Multer limit (10MB)
   - Cloudinary: Account limits

4. **Caching Opportunities**
   - Approved resources list
   - User profile data
   - Static assets (Vite handles)

---

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Scalable structure
- ✅ Security best practices
- ✅ Maintainable codebase
- ✅ Professional organization
