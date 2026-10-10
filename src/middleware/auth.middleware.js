const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

// check if user is logged in
async function authMiddleware(req, res, next) {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];   // cookie or header

    if (!token) {                                                                  // no token = not logged in
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);                 // check token is valid

        const user = await userModel.findById(decoded.userId);                     // find user in DB

        if (!user) {                                                               // user might be deleted
            return res.status(401).json({
                message: "User no longer exists"
            });
        }

        req.user = user;                                                           // save for next routes

        return next();                                                             // go to next middleware

    } catch (err) {                                                                // token is bad or expired
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// check if user is a system user (admin)
async function authSystemUserMiddleware(req, res, next) {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];   // cookie or header

    if (!token) {                                                                  // no token = not logged in
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);              // check token is valid

        // systemUser is hidden by default so we ask for it explicitly
        const user = await userModel.findById(decoded.userId).select("+systemUser");

        if (!user) {                                                             // user might be deleted
            return res.status(401).json({
                message: "User no longer exists"
            });
        }

        if (!user.systemUser) {                                                   // not an admin
            return res.status(403).json({
                message: "Access denied - system users only"
            });
        }

        req.user = user;                                                          // save for next routes

        return next();                                                           // go to next middleware

    } catch (err) {                                                            // token is bad or expired
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

module.exports = { authMiddleware, authSystemUserMiddleware };