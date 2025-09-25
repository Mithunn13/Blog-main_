import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("MONGODB_URI:", process.env.MONGODB_URI);

    mongoose.connection.on('connected', () => console.log("✅ Database Connected"));

    await mongoose.connect(process.env.MONGODB_URI);

  } catch (error) {
    console.log("❌ MongoDB connection error:", error.message);
  }
};

export default connectDB;
