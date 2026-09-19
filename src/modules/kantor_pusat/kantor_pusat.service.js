const db = require('../../store/sequelize')
const NotFoundError = require('../../error/NotfoundError')

const KantorPusat = db.kantor_pusat

class KantorPusatService {

    // Ambil semua transaksi
    async getAll() {
        return await KantorPusat.findAll({
            order: [['tanggal', 'DESC']]
        })
    }

    // Ambil transaksi berdasarkan UUID
    async getByUuid(uuid) {
        const transaksi = await KantorPusat.findOne({
            where: { uuid }
        })

        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        return transaksi
    }

    // Buat transaksi baru
    async create(data) {
        const newTransaksi = await KantorPusat.create({ ...data })
        return newTransaksi
    }

    // Update transaksi berdasarkan UUID
    async update(uuid, data) {
        const transaksi = await KantorPusat.findOne({
            where: { uuid }
        })

        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        await transaksi.update({ ...data })

        return transaksi
    }

    // Hapus transaksi berdasarkan UUID
    async delete(uuid) {
        const transaksi = await KantorPusat.findOne({
            where: { uuid }
        })

        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        await transaksi.destroy()
        return true
    }

    // METHOD UNTUK KEBUTUHAN DASHBOARD

    // 1. Ambil Summary (Kartu Atas) berdasarkan Bulan & Tahun
    async getDashboardSummary(bulan, tahun) {
        const { fn, col, Op } = require('sequelize')
        
        // Cari total pemasukan (debet) dan pengeluaran (kredit) di bulan tersebut
        const totals = await KantorPusat.findOne({
            where: { bulan, tahun },
            attributes: [
                [fn('SUM', col('debet_bank')), 'total_debet_bank'],
                [fn('SUM', col('debet_cash')), 'total_debet_cash'],
                [fn('SUM', col('kredit_insentif')), 'total_kredit_insentif'],
                [fn('SUM', col('kredit_belanja')), 'total_kredit_belanja'],
                [fn('SUM', col('kredit_transaksi_bank')), 'total_kredit_transaksi_bank']
            ],
            raw: true
        })

        // Cari saldo terakhir di bulan tersebut (ambil transaksi paling akhir)
        const lastTransaction = await KantorPusat.findOne({
            where: { bulan, tahun },
            order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
            attributes: ['kas_cash', 'kas_bank_jateng', 'saldo'],
            raw: true
        })

        const totalPemasukan = (parseFloat(totals?.total_debet_bank || 0) + parseFloat(totals?.total_debet_cash || 0))
        const totalPengeluaran = (parseFloat(totals?.total_kredit_insentif || 0) + parseFloat(totals?.total_kredit_belanja || 0) + parseFloat(totals?.total_kredit_transaksi_bank || 0))

        return {
            saldo_cash: parseFloat(lastTransaction?.kas_cash || 0),
            saldo_bank: parseFloat(lastTransaction?.kas_bank_jateng || 0),
            pemasukan_bulan_ini: totalPemasukan,
            pengeluaran_bulan_ini: totalPengeluaran,
            total_saldo: parseFloat(lastTransaction?.saldo || 0)
        }
    }

    // 2. Ambil Data Tren Saldo Bulanan (Line Chart) untuk 1 Tahun
    async getTrendSaldo(tahun) {
        // Karena kita butuh saldo akhir setiap bulan, kita bisa ambil transaksi terakhir per bulan
        // Cara sederhana: ambil semua data di tahun tersebut, lalu kelompokkan di JavaScript
        const semuaTransaksi = await KantorPusat.findAll({
            where: { tahun },
            order: [['bulan', 'ASC'], ['tanggal', 'ASC'], ['created_at', 'ASC']],
            attributes: ['bulan', 'saldo'],
            raw: true
        })

        const trendMap = {}
        // Loop akan menimpa data bulan yang sama, sehingga menyisakan data terakhir (karena sudah di-order ASC)
        semuaTransaksi.forEach(t => {
            trendMap[t.bulan] = parseFloat(t.saldo)
        })

        // Format array 1-12
        const trendArray = []
        for (let i = 1; i <= 12; i++) {
            trendArray.push({
                bulan: i,
                saldo: trendMap[i] || 0
            })
        }

        return trendArray
    }

    // 3. Ambil Data Breakdown Pengeluaran (Pie Chart)
    async getBreakdownPengeluaran(bulan, tahun) {
        // Ambil semua transaksi di bulan dan tahun tersebut
        const transaksi = await KantorPusat.findAll({
            where: { bulan, tahun },
            attributes: ['keterangan', 'kredit_insentif', 'kredit_belanja', 'kredit_transaksi_bank'],
            raw: true
        })

        let totalPengeluaran = 0
        const breakdownMap = {}

        transaksi.forEach(t => {
            const pengeluaran = parseFloat(t.kredit_insentif || 0) + parseFloat(t.kredit_belanja || 0) + parseFloat(t.kredit_transaksi_bank || 0)
            
            if (pengeluaran > 0) {
                totalPengeluaran += pengeluaran
                
                if (breakdownMap[t.keterangan]) {
                    breakdownMap[t.keterangan] += pengeluaran
                } else {
                    breakdownMap[t.keterangan] = pengeluaran
                }
            }
        })

        // Ubah ke format array dengan persentase
        const result = []
        for (const [keterangan, nominal] of Object.entries(breakdownMap)) {
            const persen = totalPengeluaran > 0 ? ((nominal / totalPengeluaran) * 100).toFixed(2) : 0
            result.push({
                keterangan: keterangan,
                nominal: nominal,
                persentase: parseFloat(persen)
            })
        }
        
        // Urutkan berdasarkan persentase terbesar
        result.sort((a, b) => b.persentase - a.persentase)

        return result
    }
}

module.exports = new KantorPusatService()