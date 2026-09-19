const express = require ("express");              //import express

const authMiddleware = require ("../middleware/auth.middleware")     //import auth middle ware

const accountController = require ("../controllers/account.controller")

const router = express.Router() ;


router.post ("/",authMiddleware.authMiddleware,accountController.createAccountController)



//this api fetch all user accounts 
router.get("/",authMiddleware.authMiddleware,accountController.getUserAccountsController)


router.get("/balance/:accountId", authMiddleware.authMiddleware,accountController.getAccountBalanceController)


module.exports = router ;
