// Import jsonwebtoken for verifying the JWT
import jwt from "jsonwebtoken";
// Import the User model to fetch user details from the database
import User from "../models/User.js";
// Import environment variables to access the JWT secret key
import { ENV } from "../lib/env.js";

// --- SOCKET.IO AUTHENTICATION MIDDLEWARE ---
// Middleware function that runs when a client attempts to establish a Socket.IO connection.
// It intercepts the handshake process to authenticate the user using the JWT cookie.
export const socketAuthMiddleware = async (socket, next) => {
  try {
    // 1. Extract Token from Cookies
    // Socket.IO puts HTTP headers (including cookies) in socket.handshake.headers.cookie.
    // This complex chain of methods is necessary to parse the 'jwt' value from the cookie string:
    const token = socket.handshake.headers.cookie
      // Splits the cookie string into an array of individual cookies (e.g., ["key=value", "jwt=token_value"])
      ?.split("; ")
      // Finds the specific cookie that starts with "jwt="
      .find((row) => row.startsWith("jwt="))
      // Splits the "jwt=token_value" string at the '=' to isolate the token value
      ?.split("=")[1];

    // Check if the token was successfully extracted
    if (!token) {
      // Log the rejection reason
      console.log("Socket connection rejected: No token provided");
      // Call next() with an Error object to reject the socket connection
      return next(new Error("Unauthorized - No Token Provided"));
    }

    // 2. Verify Token
    // verify the token (A comment explaining the next step)
    // Attempt to decode and verify the token using the secret key
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) {
      // If verification fails (e.g., invalid signature, expired token), reject connection
      console.log("Socket connection rejected: Invalid token");
      return next(new Error("Unauthorized - Invalid Token"));
    }

    // 3. Find User
    // find the user fromdb (A comment explaining the next step)
    // Find the user in the database using the userId from the decoded payload, excluding the password
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      // If the user ID is valid but the user doesn't exist (e.g., deleted), reject connection
      console.log("Socket connection rejected: User not found");
      return next(new Error("User not found"));
    }

    // 4. Attach User Info
    // attach user info to socket (A comment explaining the next step)
    // Attach the fetched user object to the socket for use in connection handlers
    socket.user = user;
    // Attach the user's ID as a simple string property for easy access
    socket.userId = user._id.toString();

    // Log successful authentication
    console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`);

    // 5. Proceed
    // Call next() without an error to allow the socket connection to be fully established
    next();
  } catch (error) {
    // --- Error Handling ---
    // Log any internal errors that occurred during the authentication process
    console.log("Error in socket authentication:", error.message);
    // Reject the connection with a generic authentication failure message
    next(new Error("Unauthorized - Authentication failed"));
  }
};