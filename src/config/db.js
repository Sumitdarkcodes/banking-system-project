const mongoose = require("mongoose");                    // mongo connection library

// function to connect to MongoDB
function connectToDB() {
    // return the promise so server.js can wait for it
    return mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
            console.log("Connected to DB");
        })
        .catch((err) => {
            console.log("Error connecting to DB:", err.message);
            throw err;                                   // let server.js handle it
        });
}

module.exports = connectToDB;