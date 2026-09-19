const {Router} = require ("express")

const authMiddleware = require ("../middleware/auth.middleware")

const transactioncontroller = require ("../controllers/transaction.contoller")



const transactionRoutes = Router();


// api/transactions
// this api create new transaction

 transactionRoutes.post ("/",authMiddleware.authMiddleware, transactioncontroller.CreateTransaction)



 transactionRoutes.post ("/system/initial-funds",authMiddleware.authSystemUserMiddleware, transactioncontroller.CreateInitalFundsTransaction)


module.exports = transactionRoutes;
