// Import required packages
const express = require("express"); // Web server framework
const cors = require("cors"); // Handles cross-origin requests
require("dotenv").config(); // Loads our .env file

// Import our endpoint handlers
const generateHandler = require("./endpoints/ai/generate");
const modelsHandler = require("./endpoints/ai/models");

// Create Express app (our web server)
const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - this tells our server which websites can talk to it
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [
    "https://idreezus.com",
    "https://idreezusstaging.webflow.io",
  ],
  credentials: true, // Allow cookies if needed
  methods: ["GET", "POST", "OPTIONS"], // Which HTTP methods are allowed
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Apply CORS settings
app.use(cors(corsOptions));

// Parse JSON data from requests (so we can read the user's message)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory (for webflow scripts)
app.use(express.static("public"));

// Define our API routes - match serverless structure
app.post("/api/generate", generateHandler);
app.get("/api/models", modelsHandler);

// Health check endpoint - useful for testing if our server is running
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling - catches any errors and sends a proper response
app.use((error, req, res, next) => {
  console.error("API Error:", error);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// 404 handler - responds when someone tries to access a non-existent endpoint
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start the server (only if this file is run directly, not imported)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}

module.exports = app;
