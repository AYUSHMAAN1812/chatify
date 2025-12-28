// Import the Cloudinary SDK, specifically using the 'v2' namespace as 'cloudinary'
import { v2 as cloudinary } from "cloudinary";
// Import environment variables to access the necessary Cloudinary credentials
import { ENV } from "./env.js";

// --- CLOUDINARY CONFIGURATION ---

// Configure the Cloudinary library using credentials loaded from environment variables (ENV object)
cloudinary.config({
  // Your unique cloud name, identifying your Cloudinary account
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  // Your API Key, used for authenticating requests
  api_key: ENV.CLOUDINARY_API_KEY,
  // Your API Secret, which must be kept confidential, used for signing requests
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

// Export the configured Cloudinary client instance for use in other parts of the application (e.g., controllers)
export default cloudinary;