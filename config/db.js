import mongoose from 'mongoose';

let cachedConnection = null;

const connectDB = async () => {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedConnection && mongoose.connection.readyState !== 0) {
    return cachedConnection;
  }

  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGODB_URL ||
      'mongodb+srv://book-admin:ViwhhsBSIAx2WgtW@cluster0.evzoqt4.mongodb.net/booknook?retryWrites=true&w=majority';

    cachedConnection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      tlsAllowInvalidCertificates: true,
    });

    console.log(`[MongoDB Connected]: ${cachedConnection.connection.host}/${cachedConnection.connection.name}`);
    return cachedConnection;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    cachedConnection = null;
    throw error;
  }
};

export default connectDB;
