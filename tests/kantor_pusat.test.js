import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import request from "supertest";
import { app, db } from "./setup";

describe("Kantor Pusat API", () => {
    let testUserId;

    beforeEach(async () => {
        // 1. Buat User palsu untuk memenuhi syarat Foreign Key
        const user = await db.user.create({
            name: "Admin Kantor",
            email: "kantor@example.com",
            password: "password123",
            number: "0811111111",
            role: "admin_kantor_pusat",
            unit_usaha: "internet"
        });
        testUserId = user.id;
    });

    afterEach(async () => {
        await db.kantor_pusat.destroy({ where: {} });
        await db.user.destroy({ where: {} });
    });

    it("should create a new transaction successfully", async () => {
        const res = await request(app)
            .post("/api/v1/kantor")
            .send({
                user_id: testUserId,
                created_by: testUserId,
                updated_by: testUserId,
                tanggal: "2026-09-01",
                keterangan: "Pembelian ATK",
                bulan: 9,
                tahun: 2026,
                rekening_bank: "bank_jateng",
                kas_bank_jateng: 1000000,
                kredit_belanja: 500000,
                saldo: 500000
            });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.keterangan).toBe("Pembelian ATK");
    });

    it("should fetch dashboard summary correctly", async () => {
        // Insert transaction for this test since afterEach clears DB
        await request(app).post("/api/v1/kantor").send({
            user_id: testUserId, created_by: testUserId, updated_by: testUserId,
            tanggal: "2026-09-01", keterangan: "Pembelian ATK", bulan: 9, tahun: 2026,
            rekening_bank: "bank_jateng", kas_bank_jateng: 1000000, kredit_belanja: 500000, saldo: 500000
        });

        const res = await request(app)
            .post("/api/v1/kantor/dashboard")
            .send({
                bulan: 9,
                tahun: 2026
            });
            
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.pengeluaran_bulan_ini).toBe(500000);
    });

    it("should fetch breakdown pengeluaran correctly", async () => {
        await request(app).post("/api/v1/kantor").send({
            user_id: testUserId, created_by: testUserId, updated_by: testUserId,
            tanggal: "2026-09-01", keterangan: "Pembelian ATK", bulan: 9, tahun: 2026,
            rekening_bank: "bank_jateng", kas_bank_jateng: 1000000, kredit_belanja: 500000, saldo: 500000
        });

        const res = await request(app)
            .post("/api/v1/kantor/breakdown-pengeluaran")
            .send({
                bulan: 9,
                tahun: 2026
            });
            
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        // Memastikan Pie Chart mendapat persentase 100% untuk Pembelian ATK (karena cuma 1 pengeluaran)
        expect(res.body.data[0].keterangan).toBe("Pembelian ATK");
        expect(res.body.data[0].persentase).toBe(100);
    });

    it("should fail to create transaction if required fields are missing", async () => {
        const res = await request(app)
            .post("/api/v1/kantor")
            .send({
                // sengaja tidak mengirim 'tanggal', 'keterangan', 'bulan', 'tahun', 'rekening_bank'
                user_id: testUserId,
                kas_bank_jateng: 1000000,
            });
        
        // Validation middleware returns 400
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        // Memastikan error dari express-validator muncul
        expect(res.body.error).toBeDefined();
    });

    it("should fail to fetch transaction with invalid UUID format", async () => {
        const res = await request(app)
            .get("/api/v1/kantor/123-bukan-uuid-yang-valid");
            
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBeDefined();
    });

    it("should return 404 if transaction UUID is not found", async () => {
        // Menggunakan UUID acak yang benar formatnya tapi tidak ada di database
        const randomUuid = "123e4567-e89b-12d3-a456-426614174000";
        const res = await request(app)
            .get(`/api/v1/kantor/${randomUuid}`);
            
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(true); // Note: HttpError middleware returns true for errors in this project
        expect(res.body.message).toBe("Transaksi tidak ditemukan");
    });
});
