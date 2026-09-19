const userModel = require ("../models/user.model")

const jwt = require ("jsonwebtoken")

async function authMiddleware (req, res, next)        // check token present in cookie or header
 {
    const token = req.cookies.token || req.headers.authorization?.split (" ") [1];

    if(!token)
    {
        return res.status (401).json ({
            message : "unauthorzied access , token is missing "       //if token is not found 
        })
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)    // token verify

        const user = await userModel.findById (decoded.userId)     // find by user_id in data base  

        req.user = user;                                        // set in req.user
        return next ()  
    }
    catch (err)                                              //token is not same 
    {
        return res.status (401).json
        ({

            message : "unauthrozied acess,token is invalid"    
        })
    }
}

async function authSystemUserMiddleware (req , res, next)      // another middleware for system User
{

      console.log("1 - Middleware started")

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

     console.log("2 - Token:", !!token)


    if (!token){

         console.log("3 - No token")


            return res.status (401).json({
                message :"unauthorized access,token is missing "
            }) ;
        }

       try {


        console.log("4 - Before JWT")


        const decoded = jwt.verify (token,process.env.JWT_SECRET)


        console.log("5 - JWT verified")

        const user = await userModel.findById (decoded.userId).select("+systemUser")

       
             console.log("6 - User found")

             console.log("USER ID:", user._id)
            console.log("USER EMAIL:", user.email)
            console.log("SYSTEM USER:", user.systemUser)


        if (!user.systemUser){

            console.log("7 - Not system user")


            return res.status (403).json
            ({
                messsage :"forbidden access ,not a sysytem user"
            })
        }

        req.user = user

          console.log("8 - Calling next")


        return next ();
       }

  catch (err)
  {

     console.log("AUTH ERROR:", err)

    return res.status (401).json
    ({
        message : "unauthorized acess, token is invalid"
    })
  }


    }



module.exports = {authMiddleware,authSystemUserMiddleware} 