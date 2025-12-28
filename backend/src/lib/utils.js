// Import the jsonwebtoken library, which allows us to create and verify tokens.
import jwt from "jsonwebtoken"; // allows us to implement authentication
// Import environment variables to access the JWT secret and environment mode.
import { ENV } from "./env.js";

// Authentication workflow (A descriptive comment block explaining the high-level process):
// user is going to click a button which is going to send a request to our endpoint which is like /api/auth/signup or api/auth/login
// if its the signup case, then we would create and save a user in the database and then generate a token (its says the user, "Hey you are authenticated, just save this token with you")
// We have created the token in the server and send it back to the client, that's why we passed the response as the argument
// we will create the token and send it back in cookies to the client and show success message on successful signup or login.

// --- GENERATE TOKEN FUNCTION ---
// Function to generate a JWT for a user and attach it as a cookie to the response object.
export const generateToken = (userId, res) => {
    // Destructure the JWT_SECRET from environment variables
    const {JWT_SECRET} = ENV;
    // Basic validation to ensure the secret is configured
    if(!JWT_SECRET) throw new Error("JWT_SECRET is not configured");
    
    // Create the JWT (JSON Web Token)
    const token = jwt.sign(
        // Payload: The data embedded in the token (here, only the user ID)
        {userId},
        // Secret key: Used to sign the token securely
        JWT_SECRET,
        // Options: Token configuration
        {
            // The token will automatically expire after 7 days
            expiresIn:"7d",
        }
    ); // it says which token is used by which user (A comment clarifying the payload's purpose)
    
    // --- Set Token as HTTP-Only Cookie ---
    
    // Set the cookie named "jwt" with the generated token value on the response object
    res.cookie("jwt", token, {
        // Expiration time of the cookie in milliseconds (7 days * 24 hours * 60 minutes * 60 seconds * 1000 ms)
        maxAge: 7*24*60*60*1000, 
        // httpOnly: true prevents client-side JavaScript (like document.cookie) from accessing the token.
        // This is a crucial defense against XSS (Cross-Site Scripting) attacks.
        httpOnly: true, // this will prevent XSS attacks -> this means this token will be available via http only -- cross site scripting
        // sameSite: "strict" prevents the browser from sending the cookie with cross-site requests.
        // This is a defense against CSRF (Cross-Site Request Forgery) attacks.
        sameSite: "strict", // this will prevent CSRF attacks
        // The secure flag ensures the cookie is only sent over HTTPS.
        // It is set to true only in the production environment.
        secure: ENV.NODE_ENV === "production" ? true : false,
    });

    // Return the token string itself (often useful for immediate response handling)
    return token;
};

// if we are in development then we use http://localhost (Contextual note)
// but if we are in production then we use https://somedomain.com -> the 's' in https refers secure (Contextual note)