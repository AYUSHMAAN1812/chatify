// Import the Server class from the socket.io library
import { Server } from "socket.io";
// Import the built-in Node.js 'http' module
import http from "http";
// Import the Express framework
import express from "express";
// Import environment variables (specifically for the client URL)
import { ENV } from "./env.js";
// Import the custom authentication middleware designed for Socket.IO connections
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

// Initialize the Express application
const app = express();
// Create an HTTP server instance using the Express app as the request handler
const server = http.createServer(app);

// --- SOCKET.IO SERVER INITIALIZATION ---

// Initialize the Socket.IO server by attaching it to the HTTP server
const io = new Server(server, {
  // Configuration for Cross-Origin Resource Sharing (CORS)
  cors: {
    // Allows connections only from the specified client URL loaded from environment variables
    origin: [ENV.CLIENT_URL],
    // Allows cookies and authorization headers to be sent with the socket connection
    credentials: true,
  },
});

// --- SOCKET.IO MIDDLEWARE ---

// Apply the custom authentication middleware to ALL incoming Socket.IO connections.
// This middleware verifies the user's JWT/cookie before establishing the connection,
// ensuring only authenticated users can connect.
io.use(socketAuthMiddleware);

// --- HELPER FUNCTION ---

// Helper function to retrieve the Socket ID of a user, given their User ID.
// This is used by controllers (e.g., sendMessage) to target a specific online user for real-time delivery.
export function getReceiverSocketId(userId) {
  // Returns the socket ID corresponding to the userId from the map
  return userSocketMap[userId];
}

// --- ONLINE USER TRACKING ---

// Object used to map User IDs to their active Socket IDs.
// This is for storig online users (A comment explaining the map's purpose)
const userSocketMap = {}; // {userId:socketId}

// --- CONNECTION HANDLER ---

// The 'io.on("connection", ...)' block handles a new client connection to the socket server.
io.on("connection", (socket) => {
  // Log the connection event, accessing the user's full name from the 'socket.user' object 
  // which was attached by the socketAuthMiddleware.
  console.log("A user connected", socket.user.fullName);

  // Extract the authenticated User ID from the socket object (set by the middleware)
  const userId = socket.userId;
  // Map the User ID to the client's unique Socket ID, marking the user as online
  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all connected clients (A comment explaining io.emit)
  // Send the updated list of online users (keys of the map) to ALL connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- DISCONNECT HANDLER ---

  // socket.on("disconnect", ...) listens for the client-side 'disconnect' event (when the user closes the tab/app).
  // with socket.on we listen for events from clients (A comment explaining socket.on)
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    // Remove the user from the map when they disconnect
    delete userSocketMap[userId];
    // Broadcast the updated list of online users to all remaining clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Export the initialized Socket.IO instance, Express app, and HTTP server for use in the main application file
export { io, app, server };