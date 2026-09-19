const mongoose = require ("mongoose");         // import mongoose

const ledgerModel = require ("./ledger.model");
const transactionModel = require("./transaction.model");

const accountSchema = new mongoose.Schema      // creating schema for account
({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : [true,"Account must be associated with user"],
        index : true,              // index for fast searching
    },

    status : {
         type  :String,
         enum : {
            values : [ "ACTIVE","FROZEN","CLOSED"],
            message : "status can be either ACTIVE, FROZEN OR CLOSED ",
            },
            default : "ACTIVE"
        },

    currency :{
        type : String,
        required : [true,"currency is required for creating account"],
        default : "INR",
    },
},
        {
        timestamps : true 
    },
);
 
accountSchema.index({user:1, status:1})     //schema for compound index

accountSchema.methods.getBalance = async function () {

    const balanceData = await ledgerModel.aggregate([
        {
            $match: {
                account: this._id
            }
        },
        {
            $group: {
                _id: null,

                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "DEBIT"] },
                            "$amount",
                            0
                        ]
                    }
                },

                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "CREDIT"] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: {
                    $subtract: ["$totalCredit", "$totalDebit"]
                }
            }
        }
    ]);

    if (balanceData.length === 0) {
        return 0;
    }

    return balanceData[0].balance;
};



const accountModel = mongoose.model ("account",accountSchema)

module.exports = accountModel 