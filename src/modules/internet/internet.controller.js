const InternetService = require('./internet.service')
const NotFoundError = require('../../error/NotfoundError')

class InternetController {
    
    async getAll(req, res, next) {
        try{
            const transaction = await InternetService.getAll()
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
            
            res.json({
                "success": true,
                "message": "berhasil mengambil transaksi internet",
                "data": transaction
            })
        } catch(e) {
            next(e)
        }
    }
    
    async getByUuid(req, res, next) {
        try{
            const transaction = await InternetService.getByUuid(req.params.uuid)
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
                
            res.json({
                "success":true,
                "message": "berhasil mengambil transaksi internet by uuid",
                "data": transaction
            })
        } catch(e) {
            next(e)
        }
    }
    
    async create(req, res, next) {
        try{
            const transaction = await InternetService.create(req.body)
            if(!transaction) throw new NotFoundError("Gagal membuat transaksi")
                
            res.json({
                "success": true,
                "message": "berhasil membuat transaksi internet",
                "data": transaction
            })
        } catch(e) {
            next(e)
        }
    }
    
    async update(req, res, next) {
        try{
            const transaction = await InternetService.update(req.params.uuid, req.body)
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
                
            res.json({
                "success": true,
                "message": "berhasil memperbarui transaksi internet",
                "data": transaction
            })
        } catch(e) {
            next(e)
        }
    }
    
    async delete(req, res, next) {
        try{
            const transaction = await InternetService.delete(req.params.uuid)
            if(!transaction) throw new NotFoundError("transaksi tidak di temukan")
                
            res.json({
                "success": true,
                "message": "Transaksi internet berhasil di hapus",
            })
        } catch(e){
            next(e)
        }
    }
    
    async dashboard(req, res, next) {
        try{
            const {bulan, tahun} = req.body
            const data = await InternetService.getDashboardSummary(bulan, tahun)
            if(!data) throw new NotFoundError("data tidak di temukan")
            
            res.json({
                "success": true,
                "message": "data dashboard internet berhasil di ambil",
                "data": data
            })
        } catch(e) {
            next(e)
        }
    }
    
    async trendSaldo(req, res, next) {
        try {
            const { tahun } = req.body
            const trend = await InternetService.getTrendSaldo(tahun)
            if(!trend) throw new NotFoundError("Data tidak di temukan")
            
            res.json({
                "success": true,
                "message": "data trend internet berhasil di ambil",
                "data": trend
            })
        } catch(e) {
            next(e)
        }
    }
    
    async breakdownPengeluaran(req, res, next) {
        try {
            const {bulan, tahun} = req.body
            const expenses = await InternetService.getBreakdownPengeluaran(bulan, tahun)
            if(!expenses) throw new NotFoundError("Tidak ada pengeluaran")
            
            res.json({
                "success": true,
                "message": "pengeluaran internet berhasil di dapatkan",
                "data": expenses
            })
        } catch(e) {
            next(e)
        }
    }
    
}

module.exports = new InternetController()
