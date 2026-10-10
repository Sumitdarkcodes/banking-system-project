require("dotenv").config();                              // loads .env into process.env

const dns = require("dns");                              // for Windows DNS fix
dns.setServers(["8.8.8.8", "8.8.4.4"]);                  // use Google DNS (fixes MongoDB SRV on Windows)

const app = require("./src/app");                        // express app
const connectToDB = require("./src/config/db");          // db connection function

const PORT = process.env.PORT || 5000;                   // Render assigns its own port

// connect to database first, then start server
connectToDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log("Server is running on port " + PORT);
        });
    })
    .catch((error) => {
        console.log("Failed to start server:", error.message);
        process.exit(1);                                 // stop if DB fails
    });