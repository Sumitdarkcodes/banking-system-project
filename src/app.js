const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRouter = require("./routes/auth.routes");              // auth endpoints
const accountRouter = require("./routes/account.routes");        // account endpoints
const transactionRoutes = require("./routes/transaction.routes"); // transaction endpoints

const app = express();

// security headers
app.use(helmet());

// log requests
app.use(morgan("dev"));

// allow requests from frontend (local + deployed)
const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());                                         // parse JSON body
app.use(cookieParser());                                         // parse cookies

// routes
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRoutes);

// 404 handler - unknown routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;