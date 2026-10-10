const express = require("express");                                      // express package

const authMiddleware = require("../middleware/auth.middleware");         // checks login
const transactionController = require("../controllers/transaction.contoller");  // controller

const router = express.Router();

// POST /api/transactions - transfer money between two accounts
router.post("/", authMiddleware.authMiddleware, transactionController.CreateTransaction);

// POST /api/transactions/system/initial-funds - add initial funds (admin only)
router.post(
    "/system/initial-funds",
    authMiddleware.authSystemUserMiddleware,
    transactionController.CreateInitalFundsTransaction
);

module.exports = router;