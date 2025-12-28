// Import the Resend class from the 'resend' SDK
import {Resend} from "resend";
// Import the environment variables object to access API keys and sender details
import {ENV} from './env.js'

// --- RESEND CLIENT INITIALIZATION ---

// Create and export a new instance of the Resend client.
// It is initialized with the API key loaded from the environment variables (ENV.RESEND_API_KEY).
export const resendClient = new Resend(ENV.RESEND_API_KEY);

// --- SENDER CONFIGURATION ---

// Define and export an object containing the default sender details (email and name).
// These values are used to populate the 'From' field in outgoing emails.
export const sender = {
    // The default email address to send from (e.g., 'no-reply@yourdomain.com')
    email: ENV.RESEND_FROM,
    // The default name to display as the sender (e.g., 'Chatify Support')
    name: ENV.RESEND_FROM_NAME,
};