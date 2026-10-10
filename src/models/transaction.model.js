const mongoose = require("mongoose");                                  // mongo library

const transactionSchema = new mongoose.Schema(
    {
        fromAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "account",                                            // money leaves this account
            required: [true, "Transaction must have a from account"],
            index: true                                                // fast lookup by sender
        },

        toAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "account",                                            // money goes to this account
            required: [true, "Transaction must have a to account"],
            index: true                                                // fast lookup by receiver
        },

        status: {
            type: String,
            enum: {
                values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],  // allowed values
                message: "Status must be PENDING, COMPLETED, FAILED or REVERSED"
            },
            default: "PENDING"                                         // starts as pending
        },

        amount: {
            type: Number,
            required: [true, "Amount is required for a transaction"],
            min: [0, "Transaction amount cannot be negative"]          // must be >= 0
        },

        idempotencyKey: {
            type: String,
            required: [true, "Idempotency key is required"],
            unique: true,                                              // stops duplicate retries
            index: true                                                // fast lookup by key
        }
    },
    {
        timestamps: true                                               // adds createdAt + updatedAt
    }
);

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = transactionModel;