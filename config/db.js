import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGODB_URL ||
      'mongodb://localhost:27017/fav_book_db';

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      tlsAllowInvalidCertificates: true,
    });

    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
  }
};

export default connectDB;
