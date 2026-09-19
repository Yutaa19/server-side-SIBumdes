const express = require('express')
const router = express.Router()
const useController = require('../users/user.controller')
const asyncErrorHandler = require('../../error/asyncErrorHandler')
const { idParamValidator, updateUserValidator, createUserValidator } = require('./user.validator')
const validateRequest = require('../../middleware/validation.middleware')


router.get('/', asyncErrorHandler(useController.getAll.bind(useController)))

router.get('/:id', 
    idParamValidator,
    validateRequest,
    asyncErrorHandler(useController.getAllById.bind(useController))
)

router.post("/", 
    createUserValidator,
    validateRequest,
    asyncErrorHandler(useController.create.bind(useController))
)

router.put('/:id', 
    idParamValidator,
    updateUserValidator,
    validateRequest,
    asyncErrorHandler(useController.update.bind(useController))
)

router.delete('/:id',
    idParamValidator,
    validateRequest,
    asyncErrorHandler(useController.delete.bind(useController))
)

module.exports = router