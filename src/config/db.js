const mongoose = require("mongoose");                            //imported the mongoosedb




function connectToDB(){                                          //function to connect db

    mongoose.connect (process.env.MONGO_URI)

    .then (()=> {

          console.log("server is now connected to DB");
    })
    .catch (err =>{                                               //if error occur
          console.log ("error in connected to DB",err.message)         
          process.exit(1);                                       // if server is not connected to
                                                                // DB then server stop here 
    })
}

module.exports = connectToDB;



