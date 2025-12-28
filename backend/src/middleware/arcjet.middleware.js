// Import the initialized Arcjet instance
import aj from "../lib/arcjet.js";
// Import the isSpoofedBot helper function from Arcjet's inspector utility
import { isSpoofedBot } from "@arcjet/inspect";

// --- ARCJET PROTECTION MIDDLEWARE ---
// Middleware function to apply security checks before proceeding to the route handler
export const arcjetProtection = async (req, res, next) => {
    try {
        // Use the initialized Arcjet instance (aj) to protect the incoming request.
        // It takes the request object and a unique identifier for the client (using the IP address as a temporary user ID here).
        const decision = await aj.protect(req, { userId: req.ip });
        // Log the decision made by Arcjet (e.g., ALLOW or DENY) for debugging purposes
        console.log("ARCJET DECISION:", decision);

        // --- 1. Handle DENIED Requests ---
        // Check if Arcjet decided to deny the request based on any configured rule
        if (decision.isDenied()) {
            // Check if the denial reason is due to rate limiting (too many requests in a given interval)
            if (decision.reason.isRateLimit()) {
                // Send a 429 Too Many Requests response
                return res.status(429).json({ message: "Rate limit exceeded. Please try again later." });
            // Check if the denial reason is due to bot detection
            } else if (decision.reason.isBot()) {
                // Send a 403 Forbidden response for bot access
                return res.status(403).json({ message: "Bot access denied." });
            // Handle any other denial reason (e.g., WAF/Shield violation)
            } else {
                // Send a generic 403 Forbidden response
                return res.status(403).json({
                    message: "Access denied by security policy.",
                });
            }
        }

        // --- 2. Check for Spoofed Bots (Bot acting like a human) ---
        // check for spoofed bots -- bot that act like humans (A comment explaining the check)
        // Iterate through all rule results to see if any detected a spoofed bot
        if (decision.results.some(isSpoofedBot)) {
            // Send a 403 Forbidden response specific to bot spoofing detection
            return res.status(403).json({
                error: "Spoofed bot detected",
                message: "Malicious bot activity detected.",
            });
        }

        // --- 3. Proceed to Next Middleware/Route ---
        // If the request is ALLOWED and passes all checks, call next() to proceed
        next();
    } catch (error) {
        // --- Error Handling ---
        // Log any internal errors that occurred during the Arcjet processing itself
        console.log("Arcjet Protection Error:", error);
        // Important: Call next() even on internal error to avoid blocking the application flow 
        // if the security service itself encounters an issue.
        next();
    }
};