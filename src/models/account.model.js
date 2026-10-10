const mongoose = require("mongoose");                    // mongo library
const ledgerModel = require("./ledger.model");           // used in getBalance()

const accountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",                                 // links to user collection
            required: [true, "Account must be associated with user"],
            index: true                                  // fast lookup by user
        },

        status: {
            type: String,
            enum: {
                values: ["ACTIVE", "FROZEN", "CLOSED"],  // allowed values
                message: "Status must be ACTIVE, FROZEN or CLOSED"
            },
            default: "ACTIVE"
        },

        currency: {
            type: String,
            required: [true, "Currency is required"],
            default: "INR"
        },

        isSystemAccount: {
            type: Boolean,
            default: false,                              // regular users: false
            immutable: true                              // can't change after creation
        }
    },
    {
        timestamps: true                                 // adds createdAt + updatedAt
    }
);

// compound index for faster queries (user + status together)
accountSchema.index({ user: 1, status: 1 });

// compute current balance from ledger entries using aggregation
accountSchema.methods.getBalance = async function () {
    const balanceData = await ledgerModel.aggregate([
        {
            $match: {
                account: this._id                        // only this account's entries
            }
        },
        {
            $group: {
                _id: null,                               // group all into one doc

                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "DEBIT"] },     // if type is DEBIT
                            "$amount",                       // add amount
                            0                                // else add 0
                        ]
                    }
                },

                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "CREDIT"] },    // if type is CREDIT
                            "$amount",                       // add amount
                            0                                // else add 0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: {
                    $subtract: ["$totalCredit", "$totalDebit"]   // credit - debit
                }
            }
        }
    ]);

    // no ledger entries yet = zero balance
    if (balanceData.length === 0) {
        return 0;
    }

    return balanceData[0].balance;
};

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;