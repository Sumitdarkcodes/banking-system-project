const mongoose = require("mongoose");                                  // mongo library

const ledgerSchema = new mongoose.Schema(
    {
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "account",                                            // links to account model
            required: [true, "Ledger must be associated with an account"],
            index: true,                                               // fast lookup by account
            immutable: true                                            // cannot be changed after create
        },

        amount: {
            type: Number,
            required: [true, "Amount is required for a ledger entry"],
            immutable: true                                            // amounts never change
        },

        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "transaction",                                        // links to transaction model
            required: [true, "Ledger must be associated with a transaction"],
            index: true,                                               // fast lookup by transaction
            immutable: true
        },

        type: {
            type: String,
            enum: {
                values: ["CREDIT", "DEBIT"],                           // only these two
                message: "Type must be either CREDIT or DEBIT"
            },
            required: [true, "Ledger type is required"],
            immutable: true
        }
    },
    {
        timestamps: true                                               // adds createdAt + updatedAt
    }
);

// block any attempt to update or delete a ledger entry
function preventLedgerModification() {
    throw new Error("Ledger entries are immutable and cannot be modified or deleted");
}

// attach the blocker to all mutation operations
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);       // block findOneAndUpdate
ledgerSchema.pre("updateOne", preventLedgerModification);              // block updateOne
ledgerSchema.pre("updateMany", preventLedgerModification);             // block updateMany
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);       // block findOneAndDelete
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);      // block findOneAndReplace
ledgerSchema.pre("deleteOne", preventLedgerModification);              // block deleteOne
ledgerSchema.pre("deleteMany", preventLedgerModification);             // block deleteMany

const ledgerModel = mongoose.model("ledger", ledgerSchema);            // fixed typo: "legder" → "ledger"

module.exports = ledgerModel;