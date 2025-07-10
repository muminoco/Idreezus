// 1. Import required packages
const path = require("path"); // Add this import at the top
const express = require("express"); // Web server framework
const cors = require("cors"); // Handles cross-origin requests
require("dotenv").config(); // Loads our .env file

// 2. Import our endpoint handlers (we'll create these next)
const generateHandler = require("./endpoints/ai/generate");
const modelsHandler = require("./endpoints/ai/models");

// 3. Create Express app (our web server)
const app = express();
const PORT = process.env.PORT || 3000;

// 4. CORS configuration - this tells our server which websites can talk to it
// Without this, Webflow couldn't send requests to our API
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [
    "https://idreezus.com",
    "https://idreezusstaging.webflow.io",
    "http://localhost:3000",
    "http://127.0.0.1:5500",
  ],
  credentials: true, // Allow cookies if needed
  methods: ["GET", "POST", "OPTIONS"], // Which HTTP methods are allowed
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Apply CORS settings
app.use(cors(corsOptions));

// 5. Parse JSON data from requests (so we can read the user's message)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 6. Serve static files from projects directory
app.use("/projects", express.static(path.join(__dirname, "../projects")));

// 7. Define our API routes - these are the "endpoints" Webflow will call
// POST /api/ai/generate - sends user message to Claude and returns response
app.post("/api/ai/generate", generateHandler);
// GET /api/ai/models - returns info about available AI models
app.get("/api/ai/models", modelsHandler);
// Health check endpoint - useful for testing if our server is running
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 8. Error handling - catches any errors and sends a proper response
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
