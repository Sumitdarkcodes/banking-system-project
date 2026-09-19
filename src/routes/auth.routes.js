const express = require ("express") ;        //import express
const authController = require("../controllers/auth.controller");    //import authcontroller for logic

const router = express.Router();

router.post("/register",authController.userRegisterController )     //post :- api/auth/register

 router.post("/login",authController.userLoginController)        //post :- api/auth/login              

module.exports = router ; 