// Import the Mongoose library
import mongoose from "mongoose";

// --- USER SCHEMA DEFINITION ---
// Define the schema (blueprint) for the User collection in MongoDB
const userSchema = new mongoose.Schema({
    // Define the 'email' field
    email: {
        type: String, // Data type is a string
        required: true, // This field is mandatory (must be provided)
        unique: true, // Ensures no two users can have the same email address
    },
    // Define the 'fullName' field
    fullName: {
        type: String, // Data type is a string
        required: true, // This field is mandatory
    },
    // Define the 'password' field
    password: {
        type: String, // Data type is a string
        required: true, // This field is mandatory
        minlength: 6, // Requires the password string to be at least 6 characters long
    },
    // Define the 'profilePic' field (for storing the URL of the profile image)
    profilePic: {
        type: String, // Data type is a string (a URL)
        default: "", // If no profile picture is provided during creation, it defaults to an empty string
    }
}, { 
    // Schema Options:
    timestamps: true // user created at and updated at (like last login) (A comment explaining timestamps)
    // When 'timestamps: true' is set, Mongoose automatically adds two fields:
    // 1. createdAt: Date of document creation
    // 2. updatedAt: Date of last document update
});

// --- USER MODEL CREATION ---
// Create the Mongoose Model, which is the constructor function used to interact with the 'users' collection.
const User = mongoose.model("User", userSchema); // this says create a user model based on this userSchema
// Mongoose pluralizes "User" to create the collection name "users" in MongoDB.

// Export the User Model so it can be imported and used in controllers to perform CRUD operations
export default User;