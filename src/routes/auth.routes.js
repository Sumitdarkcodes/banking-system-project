const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");  // for profile route

const router = express.Router();

// POST /api/auth/register - create new user
router.post("/register", authController.userRegisterController);

// POST /api/auth/login - login existing user
router.post("/login", authController.userLoginController);

// GET /api/auth/profile - get logged-in user
router.get("/profile", authMiddleware.authMiddleware, authController.getProfileController);

// POST /api/auth/logout - clear cookie
router.post("/logout", authController.logoutController);

module.exports = router;