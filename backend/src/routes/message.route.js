// Import the Express framework
import express from "express";
// Import all the controller functions for message and contact handling
import {
    getAllContacts,
    getChatPartners,
    getMessagesByUserId,
    sendMessage,
} from "../controllers/message.controller.js";
// Import the middleware to ensure the user is authenticated (JWT check)
import { protectRoute } from "../middleware/auth.middleware.js";
// Import the Arcjet middleware for security (WAF, Bot detection) and rate limiting
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

// Initialize a new Express router instance
const router = express.Router();

// --- GLOBAL MIDDLEWARE FOR MESSAGE ROUTES ---

// Apply two middlewares to ALL subsequent routes in this router.
// the middlewares execute in order - so requests get rate-limited first, then authenticated. (A comment explaining the middleware order)
// this is actually more efficient since unauthenticated requests get blocked by rate limiting before hitting the auth middleware. (A comment explaining the efficiency gain)
// 1. arcjetProtection: Handles security checks (rate limiting, bots, etc.)
// 2. protectRoute: Verifies the user's JWT and authenticates them
router.use(arcjetProtection, protectRoute);

// --- PROTECTED MESSAGE ROUTES ---

// Route to fetch a list of all available users/contacts (excluding the current user)
// GET /api/messages/contacts
router.get("/contacts", getAllContacts);

// Route to fetch a list of users with whom the logged-in user has had a conversation
// GET /api/messages/chats
router.get("/chats", getChatPartners);

// Route to fetch all messages in a conversation with a specific user
// The ':id' parameter is the User ID of the chat partner.
// GET /api/messages/:id
router.get("/:id", getMessagesByUserId);

// Route to send a new message (text or image) to a specific user
// The ':id' parameter is the User ID of the message receiver.
// POST /api/messages/send/:id
router.post("/send/:id", sendMessage);

// Export the configured router so it can be mounted in the main application file
export default router;