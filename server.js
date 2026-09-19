require ("dotenv").config()                            //to use env (process.env in db.js)


const dns = require('dns');                             // dns setup 
dns.setServers(['8.8.8.8', '8.8.4.4']);                // Google's public DNS



const app = require("./src/app")                      //importing app.js 
const connectToDB = require ("./src/config/db")       //importing connectToDB 

connectToDB();                                        //calling connectToDB function
app.listen(3000,()=>{

    console.log("server is running on port 3000")

})                                                   //server staring                 
