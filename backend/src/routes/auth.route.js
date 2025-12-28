// Import the Express framework
import express from "express";
// Import the controller functions (signup, login, logout, updateProfile)
import { signup, login, logout, updateProfile } from "../controllers/auth.controller.js";
// Import the middleware to check if a user is authenticated (protectRoute)
import { protectRoute } from "../middleware/auth.middleware.js";
// Import the Arcjet middleware for security and rate limiting
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

// Initialize a new Express router instance
const router = express.Router();

// --- GLOBAL MIDDLEWARE FOR AUTH ROUTES ---

// Apply the arcjetProtection middleware to ALL routes defined in this router.
// This ensures security and rate limiting are enforced globally for authentication endpoints.
router.use(arcjetProtection);

// router.get("/test", arcjetProtection, (req,res) => { // This block is commented out, likely used for testing the Arcjet middleware
//     res.status(200).json({message:"Test route"});
// });

// --- PUBLIC ROUTES ---

// Route for user registration (sign up)
router.post("/signup", signup);
// Route for user login
router.post("/login", login);
// Route for user logout
// it is best practice to use post request in logout, because in get request it might get chached and does not make any sense. (A comment explaining the POST method choice)
router.post("/logout", logout); 

// --- PROTECTED ROUTES ---

// Route for updating the user's profile (e.g., profile picture update)
// The protectRoute middleware runs first to ensure the user is logged in (authenticated)
// before the updateProfile controller function is executed.
router.put("/update-profile", protectRoute, updateProfile); // if a user wants to update his/her profile, then he/she should be authenticated for that protectRoute function is written, basically if a user is authenticated only then he/she can call updateProfile function. If not authenticated, it will throw some errors. // put for updating

// Route to check the authentication status of the user
// protectRoute verifies the JWT, and if successful, the inline function returns the user object (req.user)
router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user)); // get for checking
// the authentication check is going to be our middleware. (A comment noting the use of middleware)

// Export the configured router so it can be mounted in the main application file
export default router;