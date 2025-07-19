
# Full-Stack MongoDB Application

A modern full-stack application built with React, Node.js, Express, and MongoDB.

## Features

- **Authentication**: User registration and login with JWT tokens
- **Task Management**: Create, read, update, and delete tasks
- **Dashboard**: Overview of tasks and productivity metrics
- **Profile Management**: Update user information
- **Responsive Design**: Works on all device sizes
- **Real-time Updates**: Instant UI updates

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API calls
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation
- Helmet for security

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   npm run install-server
   ```

2. **Environment Configuration:**
   
   Copy the example environment files:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```

   Update the environment variables:
   - Set your MongoDB connection string in `server/.env`
   - Generate a secure JWT secret
   - Configure other settings as needed

3. **Start MongoDB:**
   
   If using local MongoDB:
   ```bash
   mongod
   ```

   Or use MongoDB Atlas for cloud hosting.

4. **Start the application:**
   ```bash
   npm run dev
   ```

   This will start both the frontend (port 5173) and backend (port 5000).

## MongoDB Setup

**Note: This demo uses a pre-configured MongoDB Atlas connection for immediate functionality.**

### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service: `mongod`
3. Database will be created automatically when the app connects

### MongoDB Atlas (Cloud)
1. **Currently using demo Atlas cluster** - Create your own account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `server/.env`

Example connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/database
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Deployment

### Frontend (Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Backend (Various Options)
- **Heroku**: Use Git deployment
- **Railway**: Connect GitHub repository
- **DigitalOcean**: Use App Platform
- **AWS**: Use Elastic Beanstalk or EC2

### Environment Variables for Production
Make sure to set these in your hosting platform:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string
- `NODE_ENV`: Set to "production"
- `CLIENT_URL`: Your frontend URL

## Project Structure

```
├── src/                    # Frontend React app
│   ├── components/         # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── ...
├── server/                # Backend Express app
│   ├── config/           # Database configuration
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── server.js         # Entry point
├── package.json          # Frontend dependencies
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.