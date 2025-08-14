// test-cloudinary.js
import dotenv from "dotenv";
import cloudinary from "cloudinary";

// Load env vars
dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection by fetching account details
async function testConnection() {
  try {
    console.log("trying to ping cloudinary");
    const result = await cloudinary.v2.api.ping();
    console.log("✅ Connected to Cloudinary!");
    console.log(result);
  } catch (err) {
    console.error("❌ Failed to connect to Cloudinary:", err.message);
  }
}

testConnection();
