# Tooling Application Backend

A Node.js/Express backend API for the Tooling Application.

## Features

- ✅ Express.js server with middleware setup
- ✅ CORS enabled for frontend communication
- ✅ Morgan HTTP request logging
- ✅ Environment variable support with dotenv
- ✅ Structured folder organization (routes, controllers, models)
- ✅ Sample User CRUD operations
- ✅ Error handling middleware
- ✅ Health check endpoint
- ✅ Nodemon for development auto-restart

## Project Structure

```
├── app.js                 # Main application file
├── package.json           # Dependencies and scripts
├── .gitignore            # Git ignore file
├── config/
│   └── database.js       # Database configuration
├── controllers/
│   └── userController.js # User CRUD operations
├── models/
│   └── User.js          # User model
└── routes/
    ├── index.js         # Main routes
    └── users.js         # User routes
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
```

## Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Hello Route
- `GET /api/hello` - Sample hello endpoint

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Example API Usage

### Get all users
```bash
curl http://localhost:3000/api/users
```

### Create a new user
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Get user by ID
```bash
curl http://localhost:3000/api/users/1
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Next Steps

1. **Database Integration**: Connect to a real database (MongoDB, PostgreSQL, etc.)
2. **Authentication**: Add JWT or session-based authentication
3. **Validation**: Add input validation middleware
4. **Testing**: Add unit and integration tests
5. **Documentation**: Add API documentation with Swagger
6. **Rate Limiting**: Add rate limiting middleware
7. **Security**: Add helmet.js and other security middleware

## Development

The server will start on `http://localhost:3000` by default. The API base URL is `http://localhost:3000/api`.

For development, the server will automatically restart when you make changes to files (thanks to nodemon).