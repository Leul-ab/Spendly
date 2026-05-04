import 'dotenv/config'; // Loads .env globally
import app from './app.js';
import prisma from '../prisma/client.js'; // Import your client instance

const PORT = process.env.PORT || 8000;

// Optional: Verify connection before starting the server
async function startServer() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to the database.");
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit if DB connection fails
  }
}

startServer();