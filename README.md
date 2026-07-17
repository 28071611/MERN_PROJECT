# 🧭 Retrievo - Lost and Found Portal

A modern, full-stack lost and found portal built with the MERN stack. This platform facilitates rapid item identification, reporting, and matching for campuses, organizations, and neighborhoods.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### For Users
- **Report Lost Items**: Easily report lost belongings with detailed descriptions
- **Report Found Items**: Submit found items to help others recover their property
- **Smart Search**: Search through the database to find matching items
- **Real-time Matching**: Automatic matching algorithm to connect lost and found items
- **User Dashboard**: Manage your reports and track their status
- **Status Updates**: Mark items as recovered/resolved

### For Administrators
- **Admin Dashboard**: Comprehensive overview of system statistics
- **User Management**: View and manage user accounts
- **System Analytics**: Track lost, found, and recovered item statistics
- **Content Moderation**: Full control over reported items

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icon library
- **CSS3** - Modern styling with custom properties

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable management
- **nodemailer** - Email notifications
- **cors** - Cross-origin resource sharing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Git

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/28071611/MERN_PROJECT.git
cd MERN_PROJECT
```

### 2. Install Dependencies

Install both frontend and backend dependencies:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lostfound
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows (if using MongoDB as a service)
# MongoDB should start automatically

# Or start MongoDB manually
mongod
```

## 🎯 Usage

### Development Mode

Start both frontend and backend servers:

```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Build

Build the frontend for production:

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Items
- `POST /api/items` - Create a new item (protected)
- `GET /api/items` - Get all items
- `GET /api/items/my` - Get user's items (protected)
- `GET /api/items/:id` - Get item by ID
- `PUT /api/items/:id` - Update item (protected)
- `DELETE /api/items/:id` - Delete item (protected)
- `GET /api/items/:id/matches` - Find matching items (protected)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `GET /api/admin/stats` - Get system statistics (admin only)

### Status
- `GET /api/status` - Check API status

## 🎨 UI Features

- **Modern Dark Theme**: Eye-catching dark interface with vibrant accents
- **Gradient Effects**: Beautiful gradient backgrounds and buttons
- **Glow Effects**: Subtle glow effects on cards and interactive elements
- **Responsive Design**: Fully responsive layout for all devices
- **Smooth Animations**: Fluid transitions and hover effects
- **Glassmorphism**: Modern glass-like card designs with backdrop blur

## 📁 Project Structure

```
lost-and-found-portal/
├── backend/
│   ├── config/
│   │   └── db.js           # Database configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── itemController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Item.js
│   ├── .env                # Environment variables
│   ├── package.json
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ItemCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ReportItem.jsx
│   │   │   ├── SearchItems.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Users register with email and password
- Passwords are hashed using bcryptjs
- JWT tokens are generated upon successful login
- Protected routes require valid JWT tokens
- Admin users have special privileges

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Built with MERN stack
- Icons by Lucide React
- Fonts by Google Fonts (Inter & Merriweather)

## 📧 Support

For support, please open an issue in the GitHub repository.

---

**Note**: This is a demonstration project. For production use, ensure proper security measures, input validation, and error handling are implemented.
