// Import the configured Cloudinary object for handling image uploads
import cloudinary from "../lib/cloudinary.js";
// Import helper functions and the socket.io server instance for real-time communication
import { getReceiverSocketId, io } from "../lib/socket.js";
// Import the Message model to interact with the 'messages' collection
import Message from "../models/Message.js";
// Import the User model to interact with the 'users' collection
import User from "../models/User.js";

// --- GET ALL CONTACTS CONTROLLER FUNCTION ---
// Fetches a list of all users available for chat, excluding the currently logged-in user.
export const getAllContacts = async (req, res) => {
  try {
    // Get the ID of the user currently logged in (set by the auth middleware)
    const loggedInUserId = req.user._id;
    
    // Find all users in the database where the '_id' is NOT EQUAL ($ne) to the loggedInUserId.
    // .select("-password") excludes the password field from the returned user documents for security.
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    // Send the list of contacts with a 200 OK status
    res.status(200).json(filteredUsers);
  } catch (error) {
    // Log the error and send a generic 500 Server Error response
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- GET MESSAGES BY USER ID CONTROLLER FUNCTION ---
// Fetches the conversation history between the logged-in user and a specified chat partner.
export const getMessagesByUserId = async (req, res) => {
  try {
    // Get the logged-in user's ID
    const myId = req.user._id;
    // Get the ID of the user to chat with from the URL parameters
    const { id: userToChatId } = req.params;

    // Find all message documents that satisfy the logical OR ($or) condition:
    // 1. Where I am the sender and the other user is the receiver.
    // 2. Where the other user is the sender and I am the receiver.
    // This finds all the messages between me and the user -- includes messages sent to the user by me and messages sent to me by user.
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Send the array of messages with a 200 OK status
    res.status(200).json(messages);
  } catch (error) {
    // Log the error and send a generic 500 Server Error response
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- SEND MESSAGE CONTROLLER FUNCTION ---
// Handles the creation of a new message (text or image) and real-time delivery via sockets.
export const sendMessage = async (req, res) => {
  try {
    // Destructure the message content (text and/or image) from the request body
    const { text, image } = req.body;
    // Get the ID of the message recipient from the URL parameters
    const { id: receiverId } = req.params;
    // Get the ID of the message sender (logged-in user)
    const senderId = req.user._id;

    // --- Validation Checks ---
    // Ensure at least one of text or image content is provided
    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    // Prevent a user from sending a message to themselves
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    // Check if the intended receiver exists in the User collection
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    // --- Image Upload ---
    let imageUrl;
    // Check if an image (likely Base64) was provided
    if (image) {
      // Upload the base64 image string to the Cloudinary service
      const uploadResponse = await cloudinary.uploader.upload(image);
      // Store the secure URL returned by Cloudinary
      imageUrl = uploadResponse.secure_url;
    }

    // --- Create and Save Message ---
    // Create a new Message document instance
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      // Store the image URL (will be undefined if no image was sent)
      image: imageUrl,
    });

    // Persist the new message document to the database
    await newMessage.save();

    // --- Real-time Delivery (Socket.IO) ---
    // Look up the Socket.IO ID for the receiver's user ID
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    // If the receiver is currently connected (online)
    if (receiverSocketId) {
      // Use the 'io' instance to emit the 'newMessage' event to the receiver's specific socket ID
      // This immediately delivers the message to the client without needing a refresh
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Send a success response (Status 201: Created) with the saved message document
    res.status(201).json(newMessage); 
  } catch (error) {
    // Log the error and send a generic 500 Server Error response
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- GET CHAT PARTNERS CONTROLLER FUNCTION ---
// Fetches a list of all users with whom the logged-in user has had a conversation.
export const getChatPartners = async (req, res) => {
  try {
    // Get the logged-in user's ID
    const loggedInUserId = req.user._id;

    // --- 1. Find all messages involving the user ---
    // Find all message documents where the logged-in user is either the sender OR the receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    // --- 2. Extract Unique Partner IDs ---
    // Map through all the found messages to determine the ID of the *other* person (the chat partner)
    const chatPartnerIds = [
      ...new Set( // Use a Set to ensure only unique IDs are kept (no duplicates)
        messages.map((msg) =>
          // If the logged-in user is the sender, the partner is the receiverId
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            // If the logged-in user is the receiver, the partner is the senderId
            : msg.senderId.toString()
        )
      ),
    ];

    // --- 3. Fetch Partner User Data ---
    // Query the User collection for all users whose IDs are in the list of unique chatPartnerIds ($in)
    // .select("-password") excludes the password field for security
    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    // Send the array of unique chat partner user objects
    res.status(200).json(chatPartners);
  } catch (error) {
    // Log the error and send a generic 500 Server Error response
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};