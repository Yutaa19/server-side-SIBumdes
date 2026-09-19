const ResikService = require('./resik.service')
const NotFoundError = require('../../error/NotfoundError')

class ResikController {
    
    async getAll(req, res, next) {
        try{
            const transaction = await ResikService.getAll()
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
            
            res.json({
                "success": true,
                "message": "berhasil mengambil transaksi resik",
                "data": transaction
            })
        } catch(e) {
            next(e)
        }
    }
    
    async getByUuid(req, res, next) {
        try{
            const transaction = await ResikService.getByUuid(req.params.uuid)
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
                
            res.json({
                "success":true,
                "message": "berhasil mengambil transaksi resik by uuid",
                "data": transaction
            })
        } catch(e) {
            next(e)
        }
    }
    
    async create(req, res, next) {
        try{
            const transaction = await ResikService.create(req.body)
            if(!transaction) throw new NotFoundError("Gagal membuat transaksi")
                
            res.json({
                "success": true,
                "message": "berhasil membuat transaksi resik",
                "data": transaction
            })
        } catch(e) {
            next(e)
        }
    }
    
    async update(req, res, next) {
        try{
            const transaction = await ResikService.update(req.params.uuid, req.body)
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
                
            res.json({
                "success": true,
                "message": "berhasil memperbarui transaksi resik",
                "data": transaction
            })
        } catch(e) {
            next(e)
        }
    }
    
    async delete(req, res, next) {
        try{
            const transaction = await ResikService.delete(req.params.uuid)
            if(!transaction) throw new NotFoundError("transaksi tidak di temukan")
                
            res.json({
                "success": true,
                "message": "Transaksi resik berhasil di hapus",
            })
        } catch(e){
            next(e)
        }
    }
    
    async dashboard(req, res, next) {
        try{
            const {bulan, tahun} = req.body
            const data = await ResikService.getDashboardSummary(bulan, tahun)
            if(!data) throw new NotFoundError("data tidak di temukan")
            
            res.json({
                "success": true,
                "message": "data dashboard resik berhasil di ambil",
                "data": data
            })
        } catch(e) {
            next(e)
        }
    }
    
    async trendSaldo(req, res, next) {
        try {
            const { tahun } = req.body
            const trend = await ResikService.getTrendSaldo(tahun)
            if(!trend) throw new NotFoundError("Data tidak di temukan")
            
            res.json({
                "success": true,
                "message": "data trend resik berhasil di ambil",
                "data": trend
            })
        } catch(e) {
            next(e)
        }
    }
    
    async breakdownPengeluaran(req, res, next) {
        try {
            const {bulan, tahun} = req.body
            const expenses = await ResikService.getBreakdownPengeluaran(bulan, tahun)
            if(!expenses) throw new NotFoundError("Tidak ada pengeluaran")
            
            res.json({
                "success": true,
                "message": "pengeluaran resik berhasil di dapatkan",
                "data": expenses
            })
        } catch(e) {
            next(e)
        }
    }
    
}

module.exports = new ResikController()
