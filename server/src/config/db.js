import mongoose from "mongoose";

const ConnectDb = async () => {
  try {
    const connectionDb = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`\nMONGODB connected DB host: ${connectionDb.connection.host}`);
  } catch (error) {
    throw new Error(error.message);
  }
};

export default ConnectDb;
