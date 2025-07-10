const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use local MongoDB for development
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jerry';
    
    const conn = await mongoose.connect(mongoURI, {
      // Remove deprecated options
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    
    // For development, don't exit the process, just log the error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('Running in development mode without database connection');
      return false;
    }
  }
};

module.exports = connectDB; 