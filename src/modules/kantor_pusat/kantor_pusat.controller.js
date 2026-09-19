const KantorPusatService = require('../kantor_pusat/kantor_pusat.service')
const NotFoundError = require('../../error/NotfoundError')

class KantorPusatController {
    
    async getAll(req, res, next) {
        try{
            const transaction = await KantorPusatService.getAll()
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
            
            res.json({
                "success": true,
                "message": "berhasil mengambil transaksi",
                "data": transaction
            })
        } catch(e) {
            next(e)
        }
    }
    
    async getByUuid(req, res, next) {
        try{
            const transaction = await KantorPusatService.getByUuid(req.params.uuid)
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
                
            res.json({
                "success":true,
                "message": "berhasil mengambil transaksi by uuid",
                "data": transaction
            })
        } catch(e) {
            next(e)
        }
    }
    
    async create(req, res, next) {
        try{
            const transaction = await KantorPusatService.create(req.body)
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
                
            res.json({
                "success": true,
                "message": "berhasil membuat transaksi",
                "data": transaction
            })
        } catch(e) {
            next(e)
        }
    }
    
    async update(req, res, next) {
        try{
            const transaction = await KantorPusatService.update(req.params.uuid, req.body)
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
                
            res.json({
                "success": true,
                "message": "berhasil memperbarui transaksi",
                "data": transaction
            })
        } catch(e) {
            next(e)
        }
    }
    
    async delete(req, res, next) {
        try{
            const transaction = await KantorPusatService.delete(req.params.uuid)
            if(!transaction) throw new NotFoundError("transaksi tidak di temukan")
                
            res.json({
                "success": true,
                "message": "Transaksi berhasil di hapus",
            })
        } catch(e){
            next(e)
        }
    }
    
    async dashboard(req, res, next) {
        try{
            const {bulan, tahun} = req.body
            const data = await KantorPusatService.getDashboardSummary(bulan, tahun)
            if(!data) throw new NotFoundError("data tidak di temukan")
            
            res.json({
                "success": true,
                "message": "data dashboard berhasil di ambil",
                "data": data
            })
        } catch(e) {
            next(e)
        }
    }
    
    async trendSaldo(req, res, next) {
        try {
            const { tahun } = req.body
            const trend = await KantorPusatService.getTrendSaldo(tahun)
            if(!trend) throw new NotFoundError("Data tidak di temukan")
            
            res.json({
                "success": true,
                "message": "data trend berhasil di ambil",
                "data": trend
            })
        } catch(e) {
            next(e)
        }
    }
    
    async breakdownPengeluaran(req, res, next) {
        try {
            const {bulan, tahun} = req.body
            const expenses = await KantorPusatService.getBreakdownPengeluaran(bulan, tahun)
            if(!expenses) throw new NotFoundError("Tidak ada pengeluaran")
            
            res.json({
                "success": true,
                "message": "pengeluaran berhasil di dapatkan",
                "data": expenses
            })
        } catch(e) {
            next(e)
        }
    }
    
}

module.exports = new KantorPusatController