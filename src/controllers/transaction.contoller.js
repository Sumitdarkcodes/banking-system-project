const transactionModel = require ("../models/transaction.model")

const ledgerModel = require ("../models/ledger.model")

const accountModel = require ("../models/account.model")

const emailService = require ("../services/email.service")

const mongoose = require("mongoose")



async function CreateTransaction (req,res)

// 1. validate transaction 

{
    const { fromAccount, toAccount, amount, idempotencyKey} = req.body

if (!fromAccount || !toAccount || !amount || !idempotencyKey)
    {
        return res.status (400).json ({
            message : "fromAccount,toAccount,amount,and idempotencyKey are required"
        })
    }

 
 // 1.1 validate the Accounts
 
 const fromUserAccount = await accountModel.findOne
     ({
    _id : fromAccount 
      })
 
 const toUserAccount = await accountModel.findOne
     ({
    _id : toAccount 
      }) 
      
 if ( !fromUserAccount || !toUserAccount)
     {
      return res.status (404).json ({
        
        message : "Invalid fromAccount or toAccount"

      }) 
      }     
  
// 2. Validate idempotency Key

const isTransactionAlreadyExists = await transactionModel.findOne 
({
    idempotencyKey : idempotencyKey
})

if (isTransactionAlreadyExists) 
{
    if (isTransactionAlreadyExists.status === "COMPLETED")
    {
        return res.status (200).json ({

            message : "Transaction already processed",
        transaction :  isTransactionAlreadyExists
        })
    }

     if (isTransactionAlreadyExists.status === "PENDING")
    {
        return res.status (200).json ({

            message : "Transaction still processing",
        
        })
    }
    
     if (isTransactionAlreadyExists.status === "FAILED")
    {
        return res.status (500).json ({

            message : "Transaction failed",
        
        })
    }
    
     if (isTransactionAlreadyExists.status === "REVERSED")
    {
        return res.status (500).json ({

            message : "Transaction was reversed ,Please retry",
        
        })
    }
}

// 3. check account Status 

if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE")
{
    return res.status (400).json ({

        message : "Both fromAccount and toAccount must be ACTIVE to process transaction"
    })
}

// 4. now checking the sender balance (fromAccount)


const balance = await fromUserAccount .getBalance()

if (balance <amount )
{
    return res.status (400).json ({
        message :"Insufficient Fund"
    })
}


// 5. create Transaction (PENDING)



const session = await mongoose.startSession ()

session.startTransaction()

const transaction = new transactionModel ({
    fromAccount, toAccount, amount, idempotencyKey, status : "PENDING"
})


// 6. create debit ledger entrty 




const debitLedgerEntry = await ledgerModel.create ([{
        account : fromAccount,
        amount : amount,
        transaction : transaction._id,
        type : "DEBIT"
}],{session})




// 7. create credit ledger entry 

const creditLedgerEntry = await ledgerModel.create ([{
        account : toAccount,
        amount : amount,
        transaction : transaction._id,
        type : "CREDIT"
}],{session})


// 8. mark transaction complete


transaction.status = "COMPLETED"

await transaction.save ({session})

// 9. commit mongodb session 


await session.commitTransaction ()

session.endSession ()


// 10. send email notification 


await emailService.sendTransactionEmail (req.user.email,req.user.name,amount,toAccount,fromAccount)
{

return res.status (201).json ({
    message : " Transaction complete successfully",
    transaction: transaction
})
}

}

async function CreateInitalFundsTransaction(req,res)
{

    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey)
    {
        return res.status (400).json ({

            message :"toAccount,amount and idempotencyKey are required"

        });
    }

    const toUserAccount = await accountModel.findOne 
    ({
        _id : toAccount
    })

    if(!toUserAccount)
    {
        return res.status(400).json
         ({
             message : "Invalid toAccount"
        })
    }

    // FIX: pull from a dedicated SYSTEM account, not the calling user's own account.
    // Adjust this filter to however your schema flags the system/treasury account
    // (e.g. a boolean flag, a fixed known _id, or a reserved "type" field).
    const fromUserAccount = await accountModel.findOne
    ({
        isSystemAccount: true
    })

    if (!fromUserAccount)
    {
        return res.status (400).json
        ({
            message : "System account not found"
        })
    }

    const session = await mongoose.startSession()
   
    session.startTransaction()
    
    const transaction = new transactionModel
    ({
        fromAccount : fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status :"PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create 
    ([{
        account : fromUserAccount._id,
        amount : amount,
        transaction : transaction._id,
        type :"DEBIT"
    }],{session} )

    const creditLedgerEntry = await ledgerModel.create 
    ([{
        account : toAccount,
        amount : amount,
        transaction  : transaction._id,
        type :"CREDIT"
    } ],{session})


    transaction.status = "COMPLETED"
    await transaction.save({session})

    await session.commitTransaction ()
    session.endSession()

    return res.status (201).json
     ({
         message : " Inital Funds transaction completed sucessfull ",
        transaction : transaction
    })
}

module.exports = { CreateTransaction, CreateInitalFundsTransaction}