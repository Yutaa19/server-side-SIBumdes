const express = require('express')
const router = express.Router()
const KantorPusatController = require('../kantor_pusat/kantor_pusat.controller')
const { createTransaksiKantor, updateTransaksiKantor, getTransaksiByUuid } = require('../kantor_pusat/kantor_pusat.validator')
const asyncErrorHandler = require('../../error/asyncErrorHandler')
const validateRequest = require('../../middleware/validation.middleware')

router.get('/', 
    asyncErrorHandler(KantorPusatController.getAll.bind(KantorPusatController))
)

router.get('/:uuid', 
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(KantorPusatController.getByUuid.bind(KantorPusatController))
)

router.post('/',
    createTransaksiKantor,
    validateRequest,
    asyncErrorHandler(KantorPusatController.create.bind(KantorPusatController))
)

router.put('/:uuid',
    updateTransaksiKantor,
    validateRequest,
    asyncErrorHandler(KantorPusatController.update.bind(KantorPusatController))
)

router.delete('/:uuid',
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(KantorPusatController.delete.bind(KantorPusatController))
)

router.post('/dashboard',
    asyncErrorHandler(KantorPusatController.dashboard.bind(KantorPusatController))
)

router.post('/trend-saldo',
    asyncErrorHandler(KantorPusatController.trendSaldo.bind(KantorPusatController))
)

router.post('/breakdown-pengeluaran',
    asyncErrorHandler(KantorPusatController.breakdownPengeluaran.bind(KantorPusatController))
)

module.exports = router