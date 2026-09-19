const express = require('express')
const router = express.Router()
const { registerValidator, loginValidator} = require('./auth.validator')
const validateRequest = require('../../middleware/validation.middleware')
const asyncErrorHanlder = require('../../error/asyncErrorHandler')
const authController = require('./auth.controller')
const authJwt = require('../../middleware/auth.middleware')

router.post("/register",
    registerValidator,
    validateRequest,
    asyncErrorHanlder(authController.register.bind(authController))
)

router.post("/login",
    loginValidator,
    validateRequest,
    asyncErrorHanlder(authController.login.bind(authController))
)

router.get("/profile",
    authJwt,
    asyncErrorHanlder(authController.profile.bind(authController))
)

module.exports = router