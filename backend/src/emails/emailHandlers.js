// Import the pre-configured Resend client and the sender information (email, name)
import { resendClient, sender } from "../lib/resend.js";
// Import the function that generates the HTML content for the welcome email
import { createWelcomeEmailTemplate } from "../emails/emailTemplates.js";

// --- SEND WELCOME EMAIL FUNCTION ---
// Asynchronous function to send a welcome email upon user signup
export const sendWelcomeEmail = async (email, name, clientURL) => {
  // --- 1. Validate Sender Email ---

  // Helper function to check if a string is a valid email format using a simple regex
  const isValidEmail = (value) =>
    typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Determine the 'from' email address: use the configured sender.email if valid, 
  // otherwise fall back to a safe default provided by Resend ("onboarding@resend.dev")
  const fromEmail = isValidEmail(sender.email)
    ? sender.email
    : "onboarding@resend.dev"; // fallback for safety

  // Determine the 'from' name: use the configured sender.name, otherwise default to "Chatify"
  const fromName = sender.name || "Chatify";

  // Combine the name and email into the standard RFC 5322 format for the 'From' field: "Name <email@address.com>"
  const fromField = `${fromName} <${fromEmail}>`;

  // --- 2. Send Email via Resend Client ---

  // Call the Resend client's send method to dispatch the email
  const { data, error } = await resendClient.emails.send({
    // Set the sender field using the validated and formatted string
    from: fromField,
    // Set the recipient email address
    to: email,
    // Set the subject line of the email
    subject: "Welcome to Chatify!",
    // Generate the HTML body of the email using the template function and provided user data
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  // --- 3. Error Handling ---

  // Check if the Resend API returned an error
  if (error) {
    // Log the detailed Resend error for debugging
    console.error("Error sending welcome email:", error);
    // Log the 'from' field used, as misconfiguration here is a common failure point
    console.error("Invalid fromField:", fromField);
    // Throw an error to be caught by the calling function (the signup controller)
    throw new Error("Failed to send welcome email");
  }

  // --- 4. Success Logging ---
  
  // If successful, log a confirmation message and the data returned by Resend
  console.log("Welcome Email sent successfully", data);
};