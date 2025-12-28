// Import the Express framework
import express from "express";
// Import the 'path' module for handling file paths
import path from "path";
// Import the authentication router (routes for signup, login, logout)
import authRoutes from "./routes/auth.route.js";
// Import the message router (routes for sending messages, getting contacts)
import messageRoutes from "./routes/message.route.js";
// Import the function to connect to MongoDB
import { connectDB } from "./lib/db.js";
// Import environment variables (PORT, CLIENT_URL, NODE_ENV, etc.)
import { ENV } from "./lib/env.js";
// Import cookie-parser middleware to easily access cookies in requests
import cookieParser from 'cookie-parser';
// Import the CORS middleware for handling cross-origin requests
import cors from "cors";
// Import the Express app and the HTTP server instance from the socket configuration file
import { app, server } from "./lib/socket.js";

// --- GLOBAL VARIABLES ---

// Define __dirname manually for ES module environments. 
// It resolves to the root directory of the project where this script is run.
const __dirname = path.resolve();

// Define the port, prioritizing the environment variable PORT, otherwise defaulting to 3000
const PORT = ENV.PORT || 3000;

// --- MIDDLEWARE CONFIGURATION ---

// we are adding a middleware so that we can get the details of the user sends (A general comment on middleware)
// Middleware to parse incoming JSON requests (req.body).
// {limit: "5mb"} sets the payload limit, necessary for handling large base64 strings (like image uploads).
app.use(express.json({limit: "5mb"})); // req.body
// Middleware to enable CORS (Cross-Origin Resource Sharing).
app.use(cors({
    // Sets the allowed origin to the client URL from environment variables
    origin: ENV.CLIENT_URL, 
    // This allows the frontend to send and receive cookies (JWT) from the backend
    credentials: true
})); // this allows our frontend to send cookies to our backend
// Middleware to parse incoming cookies and populate req.cookies
app.use(cookieParser());

// --- ROUTES ---

// Log the port (mostly for debugging startup)
console.log(ENV.PORT)
// Mount the authentication routes under the /api/auth path
app.use("/api/auth", authRoutes)
// Mount the message routes under the /api/message path
app.use("/api/message", messageRoutes)

// --- PRODUCTION DEPLOYMENT SETUP ---

// Check if the application is running in production mode
if(ENV.NODE_ENV === "production")
{
    // Serve static files from the frontend's built assets folder (dist)
    app.use(express.static(path.join(__dirname, "..frontend/dist"))); // here we made the dist folder as static assets

    // Handle all other GET requests not matching any API route
    // everything other than api endpoints will be served as html files (A comment explaining the catch-all)
    app.get("*", (req,res) => {
        // Send the main index.html file (the entry point for the single-page application)
        res.sendFile(path.join(__dirname, "..frontend/dist/index.html"));
    });
}

// --- SERVER STARTUP ---

// Start the HTTP server (which also runs the Socket.IO server) and listen on the defined port
server.listen(PORT, () => {
    // Log success message and port number
    console.log('Server is running on port: ' + PORT);
    // Connect to the MongoDB database after the server has started listening
    connectDB();
});