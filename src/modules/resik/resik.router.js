const express = require('express')
const router = express.Router()
const ResikController = require('./resik.controller')
const { createTransaksiResik, updateTransaksiResik, getTransaksiByUuid } = require('./resik.validator')
const asyncErrorHandler = require('../../error/asyncErrorHandler')
const validateRequest = require('../../middleware/validation.middleware')

router.get('/', 
    asyncErrorHandler(ResikController.getAll.bind(ResikController))
)

router.get('/:uuid', 
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(ResikController.getByUuid.bind(ResikController))
)

router.post('/',
    createTransaksiResik,
    validateRequest,
    asyncErrorHandler(ResikController.create.bind(ResikController))
)

router.put('/:uuid',
    updateTransaksiResik,
    validateRequest,
    asyncErrorHandler(ResikController.update.bind(ResikController))
)

router.delete('/:uuid',
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(ResikController.delete.bind(ResikController))
)

// Dashboard routes
router.post('/dashboard',
    asyncErrorHandler(ResikController.dashboard.bind(ResikController))
)

router.post('/trend-saldo',
    asyncErrorHandler(ResikController.trendSaldo.bind(ResikController))
)

router.post('/breakdown-pengeluaran',
    asyncErrorHandler(ResikController.breakdownPengeluaran.bind(ResikController))
)

module.exports = router
