const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jerry';
    
    const conn = await mongoose.connect(mongoURI, {
      // MongoDB Atlas connection options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('Database connection is healthy');
    
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Fatal: Cannot connect to database in production');
      process.exit(1);
    } else {
      console.log('Running in development mode without database connection');
      console.log('To enable database features, set MONGODB_URI in your .env file');
      return false;
    }
  }
};

module.exports = connectDB; 