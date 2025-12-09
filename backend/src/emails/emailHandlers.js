import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  // Validate email from environment variables
  const isValidEmail = (value) =>
    typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const fromEmail = isValidEmail(sender.email)
    ? sender.email
    : "onboarding@resend.dev"; // fallback for safety

  const fromName = sender.name || "Chatify";

  const fromField = `${fromName} <${fromEmail}>`;

  const { data, error } = await resendClient.emails.send({
    from: fromField,
    to: email,
    subject: "Welcome to Chatify!",
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if (error) {
    console.error("Error sending welcome email:", error);
    console.error("Invalid fromField:", fromField);
    throw new Error("Failed to send welcome email");
  }

  console.log("Welcome Email sent successfully", data);
};
