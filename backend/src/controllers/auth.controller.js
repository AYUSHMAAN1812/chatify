// Import the User model to interact with the 'users' collection in the database
import User from "../models/User.js";
// Import bcryptjs for password hashing and comparison
import bcrypt from "bcryptjs";
// Import a utility function to generate and set a JSON Web Token (JWT) as a cookie
import { generateToken } from "../lib/utils.js";
// Import a function to send a welcome email to the newly signed-up user
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
// Import environment variables (like the client URL)
import { ENV } from "../lib/env.js";
// Import the configured Cloudinary object for handling image uploads
import cloudinary from "../lib/cloudinary.js";

// --- SIGNUP CONTROLLER FUNCTION ---
// Handles the logic for registering a new user
export const signup = async (req, res) => {
    // Destructure the required fields (fullName, email, password) from the request body
    const { fullName, email, password } = req.body;

    try {
        // --- 1. Validation Checks ---

        // Check if all required fields are present
        if (!fullName || !email || !password) {
            // If any field is missing, send a 400 Bad Request response with an error message
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the password meets the minimum length requirement
        if (password.length < 6) {
            // If too short, send a 400 Bad Request response
            return res.status(400).json({ message: "The password has to be atleast 6 characters" });
        }

        // Define a Regular Expression (Regex) pattern to validate the email format
        // This pattern checks for a valid structure: characters@characters.characters (e.g., user@domain.com)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Test the provided email against the regex pattern
        if (!emailRegex.test(email))
            // If the email is invalid, send a 400 Bad Request response
            return res.status(400).json({ message: "Invalid email format" });

        // Check if a user with the given email already exists in the database
        const user = await User.findOne({ email });
        if (user) {
            // If a user is found, send a 400 Bad Request response (email is already taken)
            return res.status(400).json({ message: "Email already exists" });
        }

        // --- 2. Password Hashing ---
        // The process involves generating a salt and then hashing the password with that salt
        // 123456 => $laksdfl_powu41@lsakdj -> password hashing (A comment describing the concept)
        
        // Generate a salt (a random string) with a cost factor of 10. This makes the hash unique and secure.
        const salt = await bcrypt.genSalt(10);
        // Hash the plaintext password using the generated salt
        const hashedPassword = await bcrypt.hash(password, salt); // hash this password with the salt you have

        // --- 3. Create and Save New User ---

        // Create a new User document object
        const newUser = new User({
            fullName,
            email,
            // Store the securely hashed password, not the plaintext one
            password: hashedPassword
        });

        // Check if the newUser object was created successfully (which it should be if no errors occurred)
        if (newUser) {
            // Persist the new user document to the MongoDB database
            const savedUser = await newUser.save();
            
            // Generate a JWT (JSON Web Token) containing the user's ID and set it as an HTTP-only cookie
            // This token will be used to keep the user logged in across subsequent requests
            generateToken(savedUser._id, res);

            // Send a success response (Status 201: Created) back to the client
            // This response confirms the successful sign-up and includes the new user's basic details
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            }); // status = 200 means success and 201 means something created successfully

            // --- 4. Send Welcome Email (Non-Blocking) ---
            // Use a separate try-catch block for the email to ensure a failure in sending the email 
            // does not prevent the user from completing the signup process.
            try {
                // Call the function to send a welcome email to the user
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
            } catch (error) {
                // If email sending fails, log the error to the console but continue with the main flow
                console.error("Failed to send welcome email: ", error);
            }
        }
        else {
            // This block handles a rare scenario where newUser was created but saving failed/was problematic
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        // --- Error Handling ---
        // Log the internal server error for debugging purposes
        console.log("Error in signup controller: ", error);
        // Send a generic 500 Internal Server Error response to the client
        res.status(500).json({ message: "Internal server error" });
    }
    // res.send("SignUp endpoint"); // This line is commented out, indicating it was likely used for initial testing
};

// --- LOGIN CONTROLLER FUNCTION ---
// Handles the logic for logging in an existing user
export const login = async (req, res) => {
    // Destructure email and password from the request body
    const { email, password } = req.body;
    
    // Initial check to ensure both fields are provided
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    
    try {
        // --- 1. Find User by Email ---
        // Attempt to find a user document in the database matching the provided email
        const user = await User.findOne({ email });
        
        // If no user is found with that email
        if (!user) return res.status(400).json({ message: "Invalid credentials" });
        // Good security practice: never tell the client which one is incorrect: password or email. 
        // Always use a generic "Invalid credentials" message.

        // --- 2. Compare Password ---
        // Compare the provided plaintext password with the hashed password stored in the database
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        // If the passwords do not match
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        // --- 3. Authentication Success ---
        // Generate and set the JWT cookie for the successfully logged-in user
        generateToken(user._id, res);

        // Send a success response (Status 200: OK) with the user's details
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        // --- Error Handling ---
        console.error("Error in login controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- LOGOUT CONTROLLER FUNCTION ---
// Handles the logic for logging out a user by clearing the JWT cookie
export const logout = (req, res) => {
    // Clear the JWT cookie by setting its value to an empty string and its expiration time (maxAge) to 0
    // "jwt" is the name of the cookie, which must match the name used in generateToken (in utils.js)
    res.cookie("jwt", "", { maxAge: 0 }); 
    // Send a success response (Status 200: OK)
    res.status(200).json({ message: "Logged out successfully" });
};

// --- UPDATE PROFILE CONTROLLER FUNCTION ---
// Handles the logic for updating a user's profile, specifically the profile picture
export const updateProfile = async (req, res) => {
    try {
        // Destructure the new profilePic data (likely a Base64 string) from the request body
        const { profilePic } = req.body;
        
        // Validation check for the profile picture data
        if (!profilePic) return res.status(400).json({ message: "Profile pic is required" });

        // Get the user ID from the request object. 
        // This is possible because a previous middleware (auth.middleware.js) verified the JWT 
        // and attached the decoded user object (req.user) to the request.
        const userId = req.user._id; 

        // Upload the profile picture (Base64 string) to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        // Find the user by their ID and update the 'profilePic' field in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            // Set the new profilePic URL to the secure URL provided by Cloudinary
            { profilePic: uploadResponse.secure_url },
            // { new: true } option tells Mongoose to return the *updated* document, not the original one
            { new: true }
        );

        // Send a success response (Status 200: OK) with the updated user document
        res.status(200).json(updatedUser);
    } catch (error) {
        // --- Error Handling ---
        console.log("Error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};