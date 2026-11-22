import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn("MONGODB_URI environment variable is not defined");
      return;
    }

    mongoose.connection.on("connected", () => {
      isConnected = true;
      console.log("Database Connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    // Connect using dbName option to prevent breaking URIs with query params
    await mongoose.connect(mongoUri, {
      dbName: "hotel-booking",
    });
    isConnected = true;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

export default connectDB;
