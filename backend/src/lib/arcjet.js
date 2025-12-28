// Import the core arcjet module and specific rule functions (shield, detectBot, slidingWindow)
import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

// Import environment variables to access the Arcjet API key
import { ENV } from "./env.js";

// --- ARCJET INITIALIZATION AND CONFIGURATION ---

// Initialize the Arcjet client
const aj = arcjet({
  // Provide the API key for authentication with the Arcjet service
  key: ENV.ARCJET_KEY,
  // Define an array of security and rate-limiting rules to apply to incoming requests
  rules: [
    // --- 1. Shield Rule (WAF/Security) ---
    // Shield protects your app from common attacks e.g. SQL injection (A comment explaining the purpose)
    shield({ 
      mode: "LIVE" // Set mode to "LIVE" to actively block malicious requests.
    }),
    
    // --- 2. Bot Detection Rule ---
    // Create a bot detection rule (A comment explaining the purpose)
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Define which bot categories are allowed to access the API
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc. These are usually benign bots.
        // Uncomment to allow these other common bot categories (Instructions for user)
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services (often good)
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord (often good)
      ],
    }),
    
    // --- 3. Rate Limiting Rule (Sliding Window) ---
    // Create a token bucket rate limit. Other algorithms are supported. (A comment explaining the purpose)
    slidingWindow({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Maximum number of requests allowed within the interval
      max: 100,
      // Time interval in seconds (60 seconds = 1 minute)
      // This means a single client (identified by IP or other mechanism) can make up to 100 requests every 60 seconds.
      interval: 60,
    }),
  ],
});

// Export the initialized Arcjet instance for use in middleware or route handlers
export default aj;