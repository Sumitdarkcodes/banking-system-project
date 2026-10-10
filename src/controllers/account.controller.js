const accountModel = require("../models/account.model");               // account model

// create a new account for the logged-in user
async function createAccountController(req, res) {
    try {
        // check if user already has an account
        const existingAccount = await accountModel.findOne({
            user: req.user._id
        });

        if (existingAccount) {                                          // already has one
            return res.status(400).json({
                message: "User already has an account"
            });
        }

        // create new account for the user
        const account = await accountModel.create({
            user: req.user._id                                          // from auth middleware
        });

        return res.status(201).json({
            message: "Account created successfully",
            account
        });

    } catch (err) {
        console.log(err);                                              // log the error
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// get all accounts of the logged-in user
async function getUserAccountsController(req, res) {
    try {
        const accounts = await accountModel.find({
            user: req.user._id                                          // only this user's
        });

        return res.status(200).json({
            accounts
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// get balance of a specific account
async function getAccountBalanceController(req, res) {
    try {
        const { accountId } = req.params;                              // from URL

        // find account that belongs to this user
        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id                                          // prevent access to others
        });

        if (!account) {                                                 // no matching account
            return res.status(404).json({
                message: "Account not found"
            });
        }

        // compute balance using the model's aggregation method
        const balance = await account.getBalance();

        return res.status(200).json({
            accountId: account._id,                                     // use _id not id
            balance: balance
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController
};