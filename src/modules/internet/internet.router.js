const express = require('express')
const router = express.Router()
const InternetController = require('./internet.controller')
const { createTransaksiInternet, updateTransaksiInternet, getTransaksiByUuid } = require('./internet.validator')
const asyncErrorHandler = require('../../error/asyncErrorHandler')
const validateRequest = require('../../middleware/validation.middleware')

router.get('/', 
    asyncErrorHandler(InternetController.getAll.bind(InternetController))
)

router.get('/:uuid', 
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(InternetController.getByUuid.bind(InternetController))
)

router.post('/',
    createTransaksiInternet,
    validateRequest,
    asyncErrorHandler(InternetController.create.bind(InternetController))
)

router.put('/:uuid',
    updateTransaksiInternet,
    validateRequest,
    asyncErrorHandler(InternetController.update.bind(InternetController))
)

router.delete('/:uuid',
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(InternetController.delete.bind(InternetController))
)

// Dashboard routes
router.post('/dashboard',
    asyncErrorHandler(InternetController.dashboard.bind(InternetController))
)

router.post('/trend-saldo',
    asyncErrorHandler(InternetController.trendSaldo.bind(InternetController))
)

router.post('/breakdown-pengeluaran',
    asyncErrorHandler(InternetController.breakdownPengeluaran.bind(InternetController))
)

module.exports = router
