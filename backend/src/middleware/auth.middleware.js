// Import jsonwebtoken for verifying the JWT (JSON Web Token)
import jwt from "jsonwebtoken";
// Import the User model to fetch user details from the database
import User from "../models/User.js";
// Import environment variables to access the JWT secret key
import { ENV } from "../lib/env.js";

// --- PROTECT ROUTE MIDDLEWARE ---
// Middleware function used to protect routes, requiring a valid JWT for access.
export const protectRoute = async (req, res, next) => { // next argument is written so that the next function (example: updateProfile) can run. 
  try {
    // 1. Get Token
    // Try to retrieve the JWT from the cookies sent with the request
    const token = req.cookies.jwt;
    // If no token is found in the cookies, deny access (401 Unauthorized)
    if (!token) return res.status(401).json({ message: "Unauthorized - No token provided" });

    // 2. Verify Token
    // Use jwt.verify() to decode the token using the secret key
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    // If the token verification fails (e.g., expired, corrupted, wrong secret), deny access (401 Unauthorized)
    if (!decoded) return res.status(401).json({ message: "Unauthorized - Invalid token" });

    // 3. Find User
    // Use the userId from the decoded payload to find the corresponding user in the database
    // .select("-password") ensures the sensitive password hash is excluded from the result
    const user = await User.findById(decoded.userId).select("-password"); // check if the user is in the database, select everything without the password.
    // If no user is found with that ID (e.g., user was deleted), deny access (404 Not Found)
    if (!user) return res.status(404).json({ message: "User not found" });

    // 4. Attach User to Request
    // Attach the fetched user object (without password) to the request object.
    // This makes the user's information available to the subsequent route handler (e.g., req.user._id).
    req.user = user;
    
    // 5. Proceed
    // Call next() to pass control to the next middleware or the final route handler function.
    next(); // call the next function
  } catch (error) {
    // --- Error Handling ---
    // Log the error for server-side debugging
    console.log("Error in protectRoute middleware:", error);
    // Send a generic 500 Internal Server Error response to the client
    res.status(500).json({ message: "Internal server error" });
  }
};