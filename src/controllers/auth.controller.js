const userModel = require("../models/user.model")        //import model for user

const emailService = require ("../services/email.service")  // import the service

const jwt = require ("jsonwebtoken");                       // import the token 



async function userRegisterController (req,res) {              // register logic

    const { email,password,name} = req.body ;


const isExists = await userModel.findOne({
         email : email 
                })
if (isExists)
     {
         return res.status(422).json ({
            message : " user already exists with email.", 
            status : "failed"
         });
     }

     const user = await userModel.create ({                //create new user 
        email,password,name 
     })

   const token = jwt.sign (                     //now create token for new user 

      { userId:user._id  },

      process.env.JWT_SECRET, 
      
      {expiresIn : "3d"}

      )

   res.cookie ("token",token)                       //using token 


   res.status (201).json ({

    user : {
           _id : user._id,
           email : user.email,
           name : user.name
    },  token

})

await emailService.sendRegistrationEmail (user.email, user.name )    // email generate
}



async function userLoginController (req,res)                  // login logic
{
    const {email , password } = req.body

  const user = await userModel.findOne ({email}).select ("+password");

  if (!user)
  {
    return res.status(401).json ({

        message: "Email or password is Invaild"
    })
  }

  const isValidPassword = await user.comparePassword(password);        //check password
 
  
    if (!isValidPassword)
    {
        return res.status(401).json ({

            message : "Email or password is Invaild"
        })
    }

   const token = jwt.sign (
    
        { userId : user._id },
        
        process.env.JWT_SECRET,

        { expiresIn: "3d"}
   )
      
   res.cookie("token",token)

   res.status (200).json({

    user : {
        _id : user._id,
        email : user.email,
        name : user.name
    }, token
   })

}

module.exports =  {userRegisterController , userLoginController } 