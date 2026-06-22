import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`[MongoDB] Connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Disconnected");
    });
  } catch (error) {
    console.error(`[MongoDB] Failed to connect: ${error.message}`);

    if (error.message.includes("querySrv")) {
      console.error(
        "[MongoDB] This is a Node.js DNS resolver issue, not your credentials or " +
          "Atlas setup (mongodb+srv:// SRV record lookup is failing inside Node " +
          "specifically). If you've already added dns.setServers([...]) at the top " +
          "of server.js, double check it's the very first import in the file, before " +
          "any other module — anything imported earlier may trigger DNS lookups first " +
          "and bypass the fix."
      );
    } else {
      console.error(
        "[MongoDB] Common causes:\n" +
          "  1. Your IP isn't in Atlas Network Access (Atlas > Network Access > Add IP Address)\n" +
          "  2. The cluster is paused (Atlas > Database > Resume)\n" +
          "  3. MONGODB_URI in .env has a typo, wrong password, or unencoded special characters"
      );
    }
    process.exit(1);
  }
};

