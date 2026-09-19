const db = require('../../store/sequelize')
const NotFoundError = require('../../error/NotfoundError')

const Resik = db.resik

class ResikService {

    // Ambil semua transaksi
    async getAll() {
        return await Resik.findAll({
            order: [['tanggal', 'DESC']]
        })
    }

    // Ambil transaksi berdasarkan UUID
    async getByUuid(uuid) {
        const transaksi = await Resik.findOne({
            where: { uuid }
        })

        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        return transaksi
    }

    // Buat transaksi baru
    async create(data) {
        const newTransaksi = await Resik.create({ ...data })
        return newTransaksi
    }

    // Update transaksi berdasarkan UUID
    async update(uuid, data) {
        const transaksi = await Resik.findOne({
            where: { uuid }
        })

        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        await transaksi.update({ ...data })

        return transaksi
    }

    // Hapus transaksi berdasarkan UUID
    async delete(uuid) {
        const transaksi = await Resik.findOne({
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
        
        // Cari total pemasukan (debet) dan pengeluaran (kredit) di bulan tersebut
        const totals = await Resik.findOne({
            where: { bulan, tahun },
            attributes: [
                [fn('SUM', col('kas_cash')), 'total_kas_cash'],
                [fn('SUM', col('kas_bank')), 'total_kas_bank'],
                [fn('SUM', col('iuran_cash')), 'total_iuran_cash'],
                [fn('SUM', col('iuran_bank')), 'total_iuran_bank'],
                [fn('SUM', col('biaya_insentif')), 'total_biaya_insentif'],
                [fn('SUM', col('biaya_bbm')), 'total_biaya_bbm'],
                [fn('SUM', col('biaya_cuci_bongkar')), 'total_biaya_cuci_bongkar'],
                [fn('SUM', col('biaya_beban_setor')), 'total_biaya_beban_setor'],
                [fn('SUM', col('kredit_belanja_lainnya')), 'total_kredit_belanja_lainnya'],
                [fn('SUM', col('kredit_admin_fee')), 'total_kredit_admin_fee']
            ],
            raw: true
        })

        // Cari saldo terakhir di bulan tersebut (ambil transaksi paling akhir)
        const lastTransaction = await Resik.findOne({
            where: { bulan, tahun },
            order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
            attributes: ['kas_cash', 'kas_bank', 'saldo'],
            raw: true
        })

        const totalPemasukan = (
            parseFloat(totals?.total_kas_cash || 0) + 
            parseFloat(totals?.total_kas_bank || 0) + 
            parseFloat(totals?.total_iuran_cash || 0) + 
            parseFloat(totals?.total_iuran_bank || 0)
        )

        const totalPengeluaran = (
            parseFloat(totals?.total_biaya_insentif || 0) + 
            parseFloat(totals?.total_biaya_bbm || 0) + 
            parseFloat(totals?.total_biaya_cuci_bongkar || 0) + 
            parseFloat(totals?.total_biaya_beban_setor || 0) + 
            parseFloat(totals?.total_kredit_belanja_lainnya || 0) + 
            parseFloat(totals?.total_kredit_admin_fee || 0)
        )

        return {
            saldo_cash: parseFloat(lastTransaction?.kas_cash || 0),
            saldo_bank: parseFloat(lastTransaction?.kas_bank || 0),
            pemasukan_bulan_ini: totalPemasukan,
            pengeluaran_bulan_ini: totalPengeluaran,
            total_saldo: parseFloat(lastTransaction?.saldo || 0)
        }
    }

    // 2. Ambil Data Tren Saldo Bulanan (Line Chart) untuk 1 Tahun
    async getTrendSaldo(tahun) {
        const semuaTransaksi = await Resik.findAll({
            where: { tahun },
            order: [['bulan', 'ASC'], ['tanggal', 'ASC'], ['created_at', 'ASC']],
            attributes: ['bulan', 'saldo'],
            raw: true
        })

        const trendMap = {}
        semuaTransaksi.forEach(t => {
            trendMap[t.bulan] = parseFloat(t.saldo)
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
        const transaksi = await Resik.findAll({
            where: { bulan, tahun },
            attributes: [
                'keterangan', 'biaya_insentif', 'biaya_bbm', 'biaya_cuci_bongkar', 
                'biaya_beban_setor', 'kredit_belanja_lainnya', 'kredit_admin_fee'
            ],
            raw: true
        })

        let totalPengeluaran = 0
        const breakdownMap = {}

        transaksi.forEach(t => {
            const pengeluaran = (
                parseFloat(t.biaya_insentif || 0) + 
                parseFloat(t.biaya_bbm || 0) + 
                parseFloat(t.biaya_cuci_bongkar || 0) + 
                parseFloat(t.biaya_beban_setor || 0) + 
                parseFloat(t.kredit_belanja_lainnya || 0) + 
                parseFloat(t.kredit_admin_fee || 0)
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

module.exports = new ResikService()