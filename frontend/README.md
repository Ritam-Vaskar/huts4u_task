# College Resource Portal - Frontend

React + Vite frontend for the College Resource Portal.

## Features

- User authentication (Login/Register)
- Browse approved resources
- Student resource upload
- Student resource management
- Admin approval dashboard
- Search and filter resources
- Responsive design with Tailwind CSS

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.js           # Axios configuration
│   │   └── index.js           # API endpoints
│   ├── components/
│   │   ├── AdminDashboard.jsx # Admin panel
│   │   ├── Login.jsx          # Login form
│   │   ├── Register.jsx       # Registration form
│   │   ├── Navigation.jsx     # Navigation bar
│   │   ├── PublicResources.jsx # Browse resources
│   │   ├── UploadResource.jsx # Upload form
│   │   └── MyResources.jsx    # User's uploads
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Update the `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features by User Role

### Students
- **Browse Resources** - View all approved resources
- **Upload Resources** - Submit new resources for approval
- **My Uploads** - View status of uploaded resources (pending/approved/rejected)
- **Search & Filter** - Find resources by title, description, or file type

### Admins
- **Review Resources** - Approve or reject pending resources
- **Manage Resources** - Delete any resource
- **View All** - See all resources regardless of status

## Component Overview

### Login.jsx
- Email and password authentication
- Error handling
- Toggle to registration

### Register.jsx
- New user registration
- Full name, email, password
- Automatic login after registration

### Navigation.jsx
- Role-based menu items
- User profile display
- Sign out functionality

### PublicResources.jsx
- Display all approved resources
- Search functionality
- File type filtering
- Download links

### UploadResource.jsx
- File upload with drag-and-drop
- Title and description
- File type validation (PDF, DOC, PPT, images)
- Size limit (10MB)

### MyResources.jsx
- Display user's uploaded resources
- Status badges (pending/approved/rejected)
- Upload date and file info

### AdminDashboard.jsx
- Two sections: Pending and Reviewed
- Approve/Reject actions
- Delete functionality
- Resource preview links

## API Integration

The frontend communicates with the backend via REST API:

- **Auth APIs** - Login, Register, Profile
- **Resource APIs** - Upload, List, Update, Delete, Approve, Reject

All API calls are handled through Axios with automatic token management.

## Authentication Flow

1. User logs in/registers
2. JWT token received from backend
3. Token stored in localStorage
4. Token automatically added to API requests
5. On 401 error, user logged out automatically

## Styling

- **Tailwind CSS** for utility-first styling
- **Responsive Design** - Mobile, tablet, and desktop
- **Color Scheme**:
  - Blue: Primary actions
  - Green: Success/Approval
  - Red: Danger/Rejection
  - Yellow: Pending/Warning

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

1. Hot module replacement is enabled
2. Use React DevTools for debugging
3. Check browser console for errors
4. API proxy configured in vite.config.js

## Troubleshooting

### API Connection Issues
- Verify backend is running on port 5000
- Check VITE_API_BASE_URL in .env
- Check CORS settings in backend

### Authentication Issues
- Clear localStorage
- Check token expiration
- Verify JWT_SECRET matches backend

### File Upload Issues
- Check file size (<10MB)
- Verify file type is allowed
- Check Cloudinary configuration in backend

## License

ISC
