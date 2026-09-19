const db = require('../../store/sequelize')
const NotFoundError = require('../../error/NotfoundError')

const Internet = db.internet

class InternetService {

    // Ambil semua transaksi
    async getAll() {
        return await Internet.findAll({
            order: [['tanggal', 'DESC']]
        })
    }

    // Ambil transaksi berdasarkan UUID
    async getByUuid(uuid) {
        const transaksi = await Internet.findOne({
            where: { uuid }
        })

        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        return transaksi
    }

    // Buat transaksi baru
    async create(data) {
        const newTransaksi = await Internet.create({ ...data })
        return newTransaksi
    }

    // Update transaksi berdasarkan UUID
    async update(uuid, data) {
        const transaksi = await Internet.findOne({
            where: { uuid }
        })

        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        await transaksi.update({ ...data })

        return transaksi
    }

    // Hapus transaksi berdasarkan UUID
    async delete(uuid) {
        const transaksi = await Internet.findOne({
            where: { uuid }
        })

        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        await transaksi.destroy()
        return true
    }

    // METHOD UNTUK KEBUTUHAN DASHBOARD

    // 1. Ambil Summary (Kartu Atas) berdasarkan Bulan & Tahun
    async getDashboardSummary(bulan, tahun) {
        const { fn, col } = require('sequelize')
        
        // Cari total pemasukan dan pengeluaran di bulan tersebut
        const totals = await Internet.findOne({
            where: { bulan, tahun },
            attributes: [
                [fn('SUM', col('kas_cash')), 'total_kas_cash'],
                [fn('SUM', col('kas_bank')), 'total_kas_bank'],
                [fn('SUM', col('iuran_cash')), 'total_iuran_cash'],
                [fn('SUM', col('iuran_bank')), 'total_iuran_bank'],
                [fn('SUM', col('aktifasi_rek_internet')), 'total_aktifasi_rek_internet'],
                [fn('SUM', col('aktifasi_edc_brilink')), 'total_aktifasi_edc_brilink'],
                [fn('SUM', col('pengeluaran_insentif')), 'total_pengeluaran_insentif'],
                [fn('SUM', col('pengeluaran_admin_transaksi_bank')), 'total_pengeluaran_admin_transaksi_bank'],
                [fn('SUM', col('pengeluaran_belanja_lainnya')), 'total_pengeluaran_belanja_lainnya']
            ],
            raw: true
        })

        // Cari saldo terakhir di bulan tersebut (ambil transaksi paling akhir)
        const lastTransaction = await Internet.findOne({
            where: { bulan, tahun },
            order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
            attributes: ['saldo_cash', 'saldo_bank'],
            raw: true
        })

        const totalPemasukan = (
            parseFloat(totals?.total_kas_cash || 0) + 
            parseFloat(totals?.total_kas_bank || 0) + 
            parseFloat(totals?.total_iuran_cash || 0) + 
            parseFloat(totals?.total_iuran_bank || 0)
        )

        const totalPengeluaran = (
            parseFloat(totals?.total_aktifasi_rek_internet || 0) + 
            parseFloat(totals?.total_aktifasi_edc_brilink || 0) + 
            parseFloat(totals?.total_pengeluaran_insentif || 0) + 
            parseFloat(totals?.total_pengeluaran_admin_transaksi_bank || 0) + 
            parseFloat(totals?.total_pengeluaran_belanja_lainnya || 0)
        )
        
        const saldo_cash = parseFloat(lastTransaction?.saldo_cash || 0)
        const saldo_bank = parseFloat(lastTransaction?.saldo_bank || 0)

        return {
            saldo_cash: saldo_cash,
            saldo_bank: saldo_bank,
            pemasukan_bulan_ini: totalPemasukan,
            pengeluaran_bulan_ini: totalPengeluaran,
            total_saldo: saldo_cash + saldo_bank
        }
    }

    // 2. Ambil Data Tren Saldo Bulanan (Line Chart) untuk 1 Tahun
    async getTrendSaldo(tahun) {
        const semuaTransaksi = await Internet.findAll({
            where: { tahun },
            order: [['bulan', 'ASC'], ['tanggal', 'ASC'], ['created_at', 'ASC']],
            attributes: ['bulan', 'saldo_cash', 'saldo_bank'],
            raw: true
        })

        const trendMap = {}
        semuaTransaksi.forEach(t => {
            const totalSaldo = parseFloat(t.saldo_cash || 0) + parseFloat(t.saldo_bank || 0)
            trendMap[t.bulan] = totalSaldo
        })

        const trendArray = []
        for (let i = 1; i <= 12; i++) {
            trendArray.push({
                bulan: i,
                saldo: trendMap[i] || 0
            })
        }

        return trendArray
    }

    // 3. Ambil Data Breakdown Pengeluaran (Pie Chart) dikelompokkan berdasarkan Keterangan
    async getBreakdownPengeluaran(bulan, tahun) {
        // Ambil semua transaksi di bulan dan tahun tersebut
        const transaksi = await Internet.findAll({
            where: { bulan, tahun },
            attributes: [
                'keterangan', 'aktifasi_rek_internet', 'aktifasi_edc_brilink', 
                'pengeluaran_insentif', 'pengeluaran_admin_transaksi_bank', 'pengeluaran_belanja_lainnya'
            ],
            raw: true
        })

        let totalPengeluaran = 0
        const breakdownMap = {}

        transaksi.forEach(t => {
            const pengeluaran = (
                parseFloat(t.aktifasi_rek_internet || 0) + 
                parseFloat(t.aktifasi_edc_brilink || 0) + 
                parseFloat(t.pengeluaran_insentif || 0) + 
                parseFloat(t.pengeluaran_admin_transaksi_bank || 0) + 
                parseFloat(t.pengeluaran_belanja_lainnya || 0)
            )
            
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

module.exports = new InternetService()
