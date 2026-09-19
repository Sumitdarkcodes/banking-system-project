const express = require ('express');                   //express package is imported

const authRouter = require ("./routes/auth.routes");  //import authRouter

const cookieParser = require ("cookie-parser");      //import cookie-parser

const accountRouter = require ("./routes/account.routes")      //import account router 

const transactionRoutes = require("./routes/transaction.routes");   // import transaction routes

const app = express();                              //server instance is created                      



app.use (express.json());                          // this middleware use for reading (req.body) data 

app.use (cookieParser());                          // using cookie parser






app.use ("/api/auth",authRouter);                //authrouter in use

app.use ("/api/accounts",accountRouter) ;         // account router in use




app.use ("/api/transactions",transactionRoutes)    // transaction routes in use 


module.exports = app;                            //exporting app 