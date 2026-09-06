const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Reuse existing connection
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    // Reuse connection while it is connecting
    if (mongoose.connection.readyState === 2) {
      console.log('MongoDB connection already in progress');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    // Do not process.exit() on Vercel
    throw error;
  }
};

module.exports = connectDB;