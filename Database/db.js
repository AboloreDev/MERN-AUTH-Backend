import mongoose from "mongoose";

const connectDb = async () => {
  // Connect to MongoDB Atlas
  console.log("Connecting to Database");
  mongoose.connection.on("connected", () => console.log("Database connected"));
  await mongoose.connect(process.env.MONGO_URI);
};

export default connectDb;
