// src/lib/cloudinary.js

import { v2 as cloudinary } from "cloudinary";

let configuredCloudinary = null;

// Export a function to configure Cloudinary
export const configureCloudinary = () => {
  if (configuredCloudinary) {
    return configuredCloudinary;
  }
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Add your log here
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    console.log("Cloudinary successfully configured.");
  } else {
    console.error(
      "Cloudinary configuration failed. Check environment variables."
    );
  }

  configuredCloudinary = cloudinary;
  return configuredCloudinary;
};

// Export a default object that can be used later
export default cloudinary;