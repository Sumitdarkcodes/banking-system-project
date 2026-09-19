const mongoose = require ("mongoose");              //import mongoose

const bcrypt = require("bcryptjs")                 // import bcryptjs

const userSchema = new mongoose.Schema ({             //Schema is created + their properties(condition)

    email : {
        type : String,
        required : ["true","Email is required for creating new user"],
        unique  : ["true","Email is already Exists"],
        trime   : true,
        lowercase : true,
        match : [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ ,"Invalid email address"]  //regex  
           },

     name : {
        type : String,
        required : [true,"Name is required"]    
            },
       
     password : {
        type : String,
        required : [true,"password is required"],
        minlength : [6,"min 6 character is required"],
        select : false                                    //password is not fetch in general user query 
           },
     systemUser : {
        type : Boolean,
        default : false,
        immutable : true ,
        select : false ,

     },      
                  
}, {
         timestamps :true      // we get account creation & account data updation timestamps 
           }) 


                               //before saving data this async function run
userSchema.pre("save", async function (next)      // in this function if passowrd is updated then 
                                                       
 {
     if (!this.isModified ("password"))            
     {
        return ;
     }
     const hash = await bcrypt.hash (this.password,10)    // converted into hash otherwise return

     this.password =hash;
     return ;             
          
});

userSchema.methods.comparePassword = async function (password) 
{
    return await bcrypt.compare (password , this.password)
}

const userModel = mongoose.model("user",userSchema)

module.exports = userModel;