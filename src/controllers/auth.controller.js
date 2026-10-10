const userModel = require("../models/user.model");                     // user model
const emailService = require("../services/email.service");             // sends emails
const jwt = require("jsonwebtoken");                                   // for tokens

// register a new user
async function userRegisterController(req, res) {
    try {
        const { email, password, name } = req.body;                    // get from body

        // check all fields are provided
        if (!email || !password || !name) {
            return res.status(400).json({
                message: "Email, password and name are required"
            });
        }

        // check password length before saving
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // check if email already registered
        const isExists = await userModel.findOne({ email });

        if (isExists) {
            return res.status(422).json({
                message: "User already exists with this email"
            });
        }

        // create new user (password hashed by model hook)
        const user = await userModel.create({ email, password, name });

        // create token for the user
        const token = jwt.sign(
            { userId: user._id },                                      // payload
            process.env.JWT_SECRET,                                    // secret key
            { expiresIn: "3d" }                                        // valid 3 days
        );

        // send token in cookie
        res.cookie("token", token, {
            httpOnly: true,                                            // JS can't read it
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",             // https only in prod
            maxAge: 3 * 24 * 60 * 60 * 1000                            // 3 days
        });

        // send welcome email (fire and forget - don't wait)
        emailService.sendRegistrationEmail(user.email, user.name)
            .catch((err) => console.log("Email failed:", err.message));

        // send response
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            }
        });

    } catch (err) {
        console.log(err);                                              // log error
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// login an existing user
async function userLoginController(req, res) {
    try {
        const { email, password } = req.body;                          // get from body

        // check both fields are provided
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // find user and include password (it is hidden by default)
        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // compare given password with stored hash
        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        // send token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 3 * 24 * 60 * 60 * 1000
        });

        // send response
        return res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            }
        });

    } catch (err) {
        console.log(err);                                              // log error
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// get logged-in user profile
async function getProfileController(req, res) {
    try {
        const user = req.user;                                         // from authMiddleware

        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (err) {
        console.log(err);                                              // log error
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// logout - clear the cookie
function logoutController(req, res) {
    res.clearCookie("token");                                          // remove cookie

    return res.status(200).json({
        message: "Logout successful"
    });
}

module.exports = {
    userRegisterController,
    userLoginController,
    getProfileController,
    logoutController
};