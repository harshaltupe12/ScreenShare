# MongoDB Atlas Setup Guide for Jerry AI Assistant

This guide will help you set up MongoDB Atlas to complete the data persistence implementation for the Jerry AI Assistant.

## Prerequisites

- A MongoDB Atlas account (free tier available)
- Node.js and npm installed
- Access to your project's backend directory

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Create an account or sign in with Google/GitHub

## Step 2: Create a New Cluster

1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to your location
5. Click "Create"

## Step 3: Set Up Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these securely!)
5. Select "Read and write to any database"
6. Click "Add User"

## Step 4: Set Up Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add your specific IP addresses
5. Click "Confirm"

## Step 5: Get Your Connection String

1. In the left sidebar, click "Database"
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `jerry`

Your connection string should look like:
```
mongodb+srv://your_username:your_password@your_cluster.mongodb.net/jerry?retryWrites=true&w=majority
```

## Step 6: Configure Environment Variables

1. Create a `.env` file in your backend directory
2. Add the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/jerry?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
HUGGING_FACE_API_KEY=your_hugging_face_api_key_here

# Security
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=1200000
```

## Step 7: Test Database Connection

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Check the console output for:
   ```
   MongoDB Connected: your_cluster.mongodb.net
   Database connection is healthy
   ```

## Step 8: Verify Data Models

The following models are now implemented:

### User Model (`src/models/User.js`)
- User authentication and profile data
- Password hashing with bcrypt
- JWT refresh token management
- User preferences and settings

### AI Session Model (`src/models/AISession.js`)
- Tracks AI assistant sessions
- Session statistics and metadata
- User activity tracking

### Message Model (`src/models/Message.js`)
- Stores conversation history
- Screen snapshot data
- AI response metadata

## Step 9: API Endpoints Available

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### AI Sessions
- `POST /api/ai-sessions/sessions` - Create new AI session
- `GET /api/ai-sessions/sessions/active` - Get active session
- `GET /api/ai-sessions/sessions` - Get user sessions
- `PUT /api/ai-sessions/sessions/:sessionId` - End session
- `POST /api/ai-sessions/messages` - Save message
- `GET /api/ai-sessions/sessions/:sessionId/messages` - Get session history
- `GET /api/ai-sessions/stats` - Get user statistics

## Step 10: Frontend Integration

The frontend is already configured to work with the new database system. The authentication service will automatically:

1. Store user data in MongoDB
2. Persist AI session data
3. Save conversation history
4. Track user statistics

## Troubleshooting

### Connection Issues
- Verify your connection string is correct
- Check that your IP address is whitelisted
- Ensure your database user has the correct permissions

### Authentication Issues
- Verify JWT secrets are set in environment variables
- Check that user data is being saved correctly
- Ensure password hashing is working

### Data Persistence Issues
- Check that MongoDB is connected
- Verify models are properly defined
- Check for any validation errors

## Security Considerations

1. **Environment Variables**: Never commit your `.env` file to version control
2. **JWT Secrets**: Use strong, unique secrets for production
3. **Database Access**: Limit network access to specific IPs in production
4. **Password Security**: Passwords are automatically hashed with bcrypt
5. **Session Management**: Sessions are automatically cleaned up

## Production Deployment

For production deployment:

1. Use a production MongoDB Atlas cluster (M10 or higher)
2. Set `NODE_ENV=production`
3. Use strong JWT secrets
4. Limit network access to your server IPs
5. Enable MongoDB Atlas monitoring and alerts
6. Set up automated backups

## Data Migration

If you have existing data, you can migrate it using MongoDB's import/export tools:

```bash
# Export existing data
mongoexport --uri="your_connection_string" --collection=users --out=users.json

# Import to new database
mongoimport --uri="your_connection_string" --collection=users --file=users.json
```

## Monitoring and Maintenance

1. **Database Monitoring**: Use MongoDB Atlas monitoring dashboard
2. **Session Cleanup**: Old sessions are automatically cleaned up after 30 days
3. **Performance**: Monitor query performance and add indexes as needed
4. **Backups**: MongoDB Atlas provides automated backups

## Next Steps

With MongoDB Atlas set up, your Jerry AI Assistant now has:

✅ **Complete Data Persistence**
- User authentication and profiles
- AI session tracking
- Conversation history
- User statistics

✅ **Scalable Architecture**
- Cloud-hosted database
- Automatic backups
- Monitoring and alerts

✅ **Production Ready**
- Secure authentication
- Data validation
- Error handling
- Performance optimization

Your application is now ready for production use with full data persistence capabilities! 