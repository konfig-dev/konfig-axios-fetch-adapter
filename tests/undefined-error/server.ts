import express from "express";

// Create a new express application instance
const app: express.Application = express();

// Middleware to parse JSON body
app.use(express.json());

// Define the /completion endpoint
app.post("/completion", (req, res) => {
  // Send a 400 error
  res.status(400).json({
    error: "Bad request",
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
