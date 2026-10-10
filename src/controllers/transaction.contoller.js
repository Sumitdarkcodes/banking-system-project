const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

// transfer money from one account to another
async function CreateTransaction(req, res) {
    try {
        const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

        // check all required fields
        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "fromAccount, toAccount, amount and idempotencyKey are required"
            });
        }

        // amount must be greater than 0
        if (amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        // cannot transfer to same account
        if (fromAccount.toString() === toAccount.toString()) {
            return res.status(400).json({
                message: "Cannot transfer to the same account"
            });
        }

        // check if this idempotencyKey was already used
        const existingTx = await transactionModel.findOne({ idempotencyKey });

        if (existingTx) {
            if (existingTx.status === "COMPLETED") {
                return res.status(200).json({
                    message: "Transaction already processed",
                    transaction: existingTx
                });
            }

            if (existingTx.status === "PENDING") {
                return res.status(200).json({
                    message: "Transaction still processing"
                });
            }

            if (existingTx.status === "FAILED") {
                return res.status(500).json({
                    message: "Previous transaction failed"
                });
            }

            if (existingTx.status === "REVERSED") {
                return res.status(500).json({
                    message: "Previous transaction was reversed, use a new key"
                });
            }
        }

        // find both accounts in DB
        const fromUserAccount = await accountModel.findById(fromAccount);
        const toUserAccount = await accountModel.findById(toAccount);

        if (!fromUserAccount || !toUserAccount) {
            return res.status(404).json({
                message: "Invalid fromAccount or toAccount"
            });
        }

        // both accounts must be ACTIVE
        if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
            return res.status(400).json({
                message: "Both accounts must be ACTIVE"
            });
        }

        // check sender has enough balance
        const balance = await fromUserAccount.getBalance();

        if (balance < amount) {
            return res.status(400).json({
                message: "Insufficient funds"
            });
        }

        // start MongoDB session for atomic transaction
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            // create the transaction document
            const transaction = new transactionModel({
                fromAccount,
                toAccount,
                amount,
                idempotencyKey,
                status: "PENDING"
            });

            await transaction.save({ session });                     // save inside session

            // debit entry (money leaves sender)
            await ledgerModel.create([{
                account: fromAccount,
                amount: amount,
                transaction: transaction._id,
                type: "DEBIT"
            }], { session });

            // credit entry (money enters receiver)
            await ledgerModel.create([{
                account: toAccount,
                amount: amount,
                transaction: transaction._id,
                type: "CREDIT"
            }], { session });

            // mark transaction as completed
            transaction.status = "COMPLETED";
            await transaction.save({ session });

            // commit everything together
            await session.commitTransaction();

            // send email after successful commit
            emailService.sendTransactionEmail(
                req.user.email,
                req.user.name,
                amount,
                toAccount,
                fromAccount
            ).catch((err) => console.log("Email error:", err.message));   // don't fail if email fails

            return res.status(201).json({
                message: "Transaction completed successfully",
                transaction: transaction
            });

        } catch (err) {
            // undo everything if any step fails
            await session.abortTransaction();
            console.log("Transaction error:", err);

            // duplicate idempotency key (race condition caught by unique index)
            if (err.code === 11000) {
                return res.status(409).json({
                    message: "Duplicate transaction, please wait"
                });
            }

            return res.status(500).json({
                message: "Transaction failed, all changes rolled back"
            });

        } finally {
            // always close the session
            session.endSession();
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// add initial funds to an account (from a system account)
async function CreateInitalFundsTransaction(req, res) {
    try {
        const { toAccount, amount, idempotencyKey } = req.body;

        if (!toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "toAccount, amount and idempotencyKey are required"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        // check idempotency
        const existingTx = await transactionModel.findOne({ idempotencyKey });

        if (existingTx) {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: existingTx
            });
        }

        // check target account exists
        const toUserAccount = await accountModel.findById(toAccount);

        if (!toUserAccount) {
            return res.status(404).json({
                message: "Invalid toAccount"
            });
        }

        // find system account
        // note: isSystemAccount field must exist in account.model.js
        const fromUserAccount = await accountModel.findOne({ isSystemAccount: true });

        if (!fromUserAccount) {
            return res.status(500).json({
                message: "System account not found"
            });
        }

        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const transaction = new transactionModel({
                fromAccount: fromUserAccount._id,
                toAccount,
                amount,
                idempotencyKey,
                status: "PENDING"
            });

            await transaction.save({ session });

            // debit system account
            await ledgerModel.create([{
                account: fromUserAccount._id,
                amount: amount,
                transaction: transaction._id,
                type: "DEBIT"
            }], { session });

            // credit user account
            await ledgerModel.create([{
                account: toAccount,
                amount: amount,
                transaction: transaction._id,
                type: "CREDIT"
            }], { session });

            transaction.status = "COMPLETED";
            await transaction.save({ session });

            await session.commitTransaction();

            return res.status(201).json({
                message: "Initial funds added successfully",
                transaction: transaction
            });

        } catch (err) {
            await session.abortTransaction();
            console.log("Initial funds error:", err);

            if (err.code === 11000) {
                return res.status(409).json({
                    message: "Duplicate transaction"
                });
            }

            return res.status(500).json({
                message: "Failed to add initial funds"
            });

        } finally {
            session.endSession();
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = { CreateTransaction, CreateInitalFundsTransaction };