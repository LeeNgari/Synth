import mongoose from "mongoose";
import { configDotenv } from "dotenv";

// Load environment variables from the root .env file
configDotenv({ path: "../../.env" });

// --- User Schema ---
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    clerkId: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    dislikedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    listeningHistory: [
      {
        song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
        listenedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

// --- Migration Function ---
const migrate = async () => {
  // Add your database name here after .net/
  const dbUrl =
    "mongodb+srv://leengari76:4nGrnkJAznFGGBfN@cluster0.mwhdd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  try {
    console.log("⏳ Connecting to database...");
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 30000, // wait up to 30 seconds
    });
    console.log("✅ Database connected.");

    console.log("🔍 Finding users without a role and updating them...");
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: "user" } },
    );

    console.log("🎯 Migration complete.");
    console.log(`- Documents scanned: ${result.matchedCount}`);
    console.log(`- Documents updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error("❌ An error occurred during migration:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Database connection closed.");
  }
};

migrate();
