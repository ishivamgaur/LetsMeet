import mongoose from "mongoose";
import dns from "dns";

// Force Node.js to use Google DNS to bypass local ISP/Wi-Fi DNS blocking MongoDB SRV queries
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const ConnectDb = async () => {
  try {
    const connectionDb = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`\nMONGODB connected DB host: ${connectionDb.connection.host}`);
  } catch (error) {
    throw new Error(error.message);
  }
};

export default ConnectDb;
