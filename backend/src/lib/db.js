// Import the Mongoose library, which is an ODM (Object Data Modeling) library for MongoDB and Node.js
import mongoose from "mongoose";
// Import environment variables to access the database connection string
import { ENV } from "./env.js";

// --- CONNECT DATABASE FUNCTION ---
// Asynchronous function to establish the connection to MongoDB
export const connectDB = async () => {
    try {
        // Destructure the MONGO_URI from the environment variables (ENV object)
        const {MONGO_URI} = ENV;
        // Check if the MONGO_URI is set. If not, throw an error to halt execution.
        if(!MONGO_URI) throw new Error("MONGO_URI is not set");
        
        // Use mongoose.connect() to connect to the MongoDB database using the URI
        // The result 'conn' contains connection information
        const conn = await mongoose.connect(ENV.MONGO_URI);
        // Log a success message including the host of the successful connection
        console.log("MONGODB CONNECTED: ", conn.connection.host);
    } catch (error) {
        // --- Error Handling ---
        // Log the error message if the connection fails
        console.error("Error while connecting MongoDB: ", error);
        // Exit the process with a failure code (1)
        process.exit(1) // 1 status code means fail, 0 status means success (A comment explaining exit codes)
    }
}