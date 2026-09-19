import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import request from "supertest";
import { app, db } from "./setup";

describe("Internet API", () => {
    let testUserId;

    beforeEach(async () => {
        const user = await db.user.create({
            name: "Admin Internet",
            email: "internet@example.com",
            password: "password123",
            number: "0833333333",
            role: "admin_unit",
            unit_usaha: "internet"
        });
        testUserId = user.id;
    });

    afterEach(async () => {
        await db.internet.destroy({ where: {} });
        await db.user.destroy({ where: {} });
    });

    it("should create a new Internet transaction successfully", async () => {
        const res = await request(app)
            .post("/api/v1/internet")
            .send({
                user_id: testUserId,
                created_by: testUserId,
                updated_by: testUserId,
                tanggal: "2026-09-03",
                keterangan: "Beli Router MikroTik",
                bulan: 9,
                tahun: 2026,
                rekening_bank: "bank_bri",
                kas_bank: 3000000,
                pengeluaran_belanja_lainnya: 1500000,
                saldo_bank: 1500000
            });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.keterangan).toBe("Beli Router MikroTik");
    });

    it("should fetch Internet dashboard correctly", async () => {
        await request(app).post("/api/v1/internet").send({
            user_id: testUserId, created_by: testUserId, updated_by: testUserId,
            tanggal: "2026-09-03", keterangan: "Beli Router MikroTik", bulan: 9, tahun: 2026,
            rekening_bank: "bank_bri", kas_bank: 3000000, pengeluaran_belanja_lainnya: 1500000, saldo_bank: 1500000
        });

        const res = await request(app)
            .post("/api/v1/internet/dashboard")
            .send({
                bulan: 9,
                tahun: 2026
            });
            
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.pengeluaran_bulan_ini).toBe(1500000);
    });

    it("should fail to create transaction if required fields are missing", async () => {
        const res = await request(app)
            .post("/api/v1/internet")
            .send({
                user_id: testUserId,
                kas_bank: 3000000,
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBeDefined();
    });

    it("should fail to fetch transaction with invalid UUID format", async () => {
        const res = await request(app)
            .get("/api/v1/internet/invalid-uuid-format");
            
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("should return 404 if transaction UUID is not found", async () => {
        const randomUuid = "123e4567-e89b-12d3-a456-426614174000";
        const res = await request(app)
            .get(`/api/v1/internet/${randomUuid}`);
            
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(true); // Note: HttpError middleware returns true for errors in this project
        expect(res.body.message).toBe("Transaksi tidak ditemukan");
    });
});
