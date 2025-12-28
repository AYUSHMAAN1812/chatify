// Import the dotenv library
import dotenv from 'dotenv';
// Load environment variables from the .env file into process.env
dotenv.config();

// --- ENVIRONMENT VARIABLES EXPORT ---

// Export an object named ENV containing all configuration variables used by the application
export const ENV = {
  // Application port number (e.g., 5000)
  PORT: process.env.PORT,
  // MongoDB connection string URI
  MONGO_URI: process.env.MONGO_URI,
  // Secret key used to sign and verify JSON Web Tokens (JWT) for user authentication
  JWT_SECRET: process.env.JWT_SECRET,
  // The current running environment (e.g., 'development', 'production', 'test')
  NODE_ENV: process.env.NODE_ENV,
  // The URL of the client-side application (used for redirects or links in emails)
  CLIENT_URL: process.env.CLIENT_URL,
  // API key for the Resend service, used for sending emails
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  // The email address used as the sender in welcome emails
  EMAIL_FROM: process.env.EMAIL_FROM,
  // The display name associated with the sender email (e.g., "Chatify Team")
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
  // Cloudinary cloud name (account identifier)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  // Cloudinary API key for authentication
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  // Cloudinary API secret key for secure requests (must be kept secret)
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  // API key for the Arcjet security and rate-limiting service
  ARCJET_KEY: process.env.ARCJET_KEY,
  // Environment setting for Arcjet (usually 'production' or similar)
  ARCJET_ENV: process.env.ARCJET_ENV,
};