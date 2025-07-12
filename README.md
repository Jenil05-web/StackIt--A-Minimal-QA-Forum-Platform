# StackIt - A Minimal Q&A Forum Platform

StackIt is a minimal question-and-answer platform that supports collaborative learning and structured knowledge sharing. It's designed to be simple, user-friendly, and focused on the core experience of asking and answering questions within a community.

## 🚀 Features

### Core Features

- **Ask Questions** - Submit questions with titles, descriptions, and tags
- **Rich Text Editor** - Format content with bold, italic, lists, emojis, links, images, and text alignment
- **Answer Questions** - Help others by providing detailed answers
- **Vote & Accept** - Upvote helpful answers and accept the best solution
- **Smart Tagging** - Organize questions with relevant tags for easy discovery
- **Notifications** - Real-time notifications for answers, comments, and mentions

### User Management

- User registration and authentication with JWT
- Profile management with avatars and bios
- Reputation system with badges
- Role-based access control (User, Moderator, Admin)

### Advanced Features

- Search and filtering questions
- Trending questions
- Tag-based question discovery
- Edit history tracking
- Bounty system for questions
- Anonymous posting option

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **nodemon** - Development server

### Frontend

- **React** - UI library
- **CSS3** - Styling with modern features
- **Font Awesome** - Icons

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd StackIt--A-Minimal-QA-Forum-Platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and add the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/stackit

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Client Configuration
CLIENT_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 5. Run the Application

#### Development Mode

```bash
# Start the backend server with nodemon
npm run dev

# In a separate terminal, start the frontend (if you have React setup)
npm run client

# Or run both simultaneously
npm run dev:full
```

#### Production Mode

```bash
npm start
```

### 6. Access the Application

- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Frontend**: http://localhost:3000 (if React is set up)

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password/:token` - Reset password

### Users

- `GET /api/users` - Get all users (with pagination and search)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PUT /api/users/:id/role` - Update user role (Admin only)
- `PUT /api/users/:id/status` - Update user status (Admin only)

### Questions

- `GET /api/questions` - Get all questions (with filtering and pagination)
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create a new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question
- `GET /api/questions/trending` - Get trending questions

### Answers

- `POST /api/answers` - Create a new answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/answers/:id/accept` - Accept answer

### Tags

- `GET /api/tags` - Get all tags with usage statistics
- `GET /api/tags/popular` - Get popular tags
- `GET /api/tags/:name` - Get questions by tag
- `GET /api/tags/search/:query` - Search tags

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/clear-all` - Clear all notifications

## 🗄️ Database Schema

### User Model

- Basic info (username, email, password, firstName, lastName)
- Profile (avatar, bio, reputation, badges)
- Preferences (notifications, theme)
- Role-based access (user, moderator, admin)

### Question Model

- Content (title, content, tags)
- Metadata (author, views, status, bounty)
- Voting system (upvotes, downvotes)
- Relationships (answers, accepted answer)

### Answer Model

- Content and author
- Voting system
- Acceptance status
- Question relationship

### Notification Model

- Recipient and sender
- Type (answer, vote, accept, mention, system)
- Content references
- Read status

## 🔧 Development

### Project Structure

```
StackIt--A-Minimal-QA-Forum-Platform/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling middleware
├── models/
│   ├── User.js              # User model
│   ├── Question.js          # Question model
│   ├── Answer.js            # Answer model
│   └── Notification.js      # Notification model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── questions.js         # Question routes
│   ├── answers.js           # Answer routes
│   ├── tags.js              # Tag routes
│   └── notifications.js     # Notification routes
├── SRC/
│   └── Pages/
│       ├── landingPage.jsx  # Landing page component
│       └── landingPage.css  # Landing page styles
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
└── config.env              # Environment variables
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run client` - Start React development server
- `npm run dev:full` - Start both backend and frontend

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for password security
- **Input Validation** - express-validator for data validation
- **Rate Limiting** - Prevent abuse with request limiting
- **CORS Protection** - Cross-origin resource sharing security
- **Helmet** - Security headers middleware
- **Environment Variables** - Secure configuration management

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stackit
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://yourdomain.com
```

### Build for Production

```bash
# Install dependencies
npm install --production

# Start the server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

- [ ] Real-time notifications with WebSocket
- [ ] Rich text editor with image upload
- [ ] Email notifications
- [ ] Mobile app
- [ ] Advanced search with filters
- [ ] User badges and achievements
- [ ] Question moderation tools
- [ ] API documentation with Swagger

---

**StackIt** - Empowering communities through knowledge sharing! 🚀
