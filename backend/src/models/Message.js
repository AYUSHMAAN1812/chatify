// Import the Mongoose library
import mongoose from "mongoose";

// --- MESSAGE SCHEMA DEFINITION ---
// Define the schema (blueprint) for the Message collection in MongoDB
const messageSchema = new mongoose.Schema(
  {
    // Define the 'senderId' field
    senderId: {
      // The data type is a special Mongoose type for referencing other documents
      type: mongoose.Schema.Types.ObjectId,
      // 'ref: "User"' establishes a relationship, indicating this ID refers to a document in the "User" collection
      ref: "User",
      // This field is mandatory
      required: true,
    },
    // Define the 'receiverId' field
    receiverId: {
      // Data type referencing another document ID
      type: mongoose.Schema.Types.ObjectId,
      // Refers to a document in the "User" collection
      ref: "User",
      // This field is mandatory
      required: true,
    },
    // Define the 'text' field for the message content
    text: {
      type: String, // Data type is a string
      trim: true, // Automatically removes whitespace from both ends of the string
      maxlength: 2000, // Limits the maximum length of the message text to 2000 characters
    },
    // Define the 'image' field for storing the URL of a shared image
    image: {
      type: String, // Data type is a string (will store the Cloudinary URL)
      // Note: This is optional, allowing messages to be text-only
    },
  },
  { 
    // Schema Options:
    // 'timestamps: true' automatically adds 'createdAt' and 'updatedAt' fields 
    // to record when the message was created and last modified.
    timestamps: true 
  }
);

// --- MESSAGE MODEL CREATION ---
// Create the Mongoose Model, which is the constructor function used to interact with the 'messages' collection.
const Message = mongoose.model("Message", messageSchema);
// Mongoose pluralizes "Message" to create the collection name "messages" in MongoDB.

// Export the Message Model so it can be imported and used in controllers to perform CRUD operations
export default Message;