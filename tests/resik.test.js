import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import request from "supertest";
import { app, db } from "./setup";

describe("Resik API", () => {
    let testUserId;

    beforeEach(async () => {
        const user = await db.user.create({
            name: "Admin Resik",
            email: "resik@example.com",
            password: "password123",
            number: "0822222222",
            role: "admin_unit",
            unit_usaha: "Resik"
        });
        testUserId = user.id;
    });

    afterEach(async () => {
        await db.resik.destroy({ where: {} });
        await db.user.destroy({ where: {} });
    });

    it("should create a new Resik transaction successfully", async () => {
        const res = await request(app)
            .post("/api/v1/resik")
            .send({
                user_id: testUserId,
                created_by: testUserId,
                updated_by: testUserId,
                tanggal: "2026-09-02",
                keterangan: "Beli Alat Bersih",
                bulan: 9,
                tahun: 2026,
                rekening_bank: "bank_bri",
                kas_bank: 2000000,
                kredit_belanja_lainnya: 1000000,
                saldo: 1000000
            });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.keterangan).toBe("Beli Alat Bersih");
    });

    it("should fetch Resik dashboard correctly", async () => {
        await request(app).post("/api/v1/resik").send({
            user_id: testUserId, created_by: testUserId, updated_by: testUserId,
            tanggal: "2026-09-02", keterangan: "Beli Alat Bersih", bulan: 9, tahun: 2026,
            kas_bank: 2000000, kredit_belanja_lainnya: 1000000, saldo: 1000000
        });

        const res = await request(app)
            .post("/api/v1/resik/dashboard")
            .send({
                bulan: 9,
                tahun: 2026
            });
            
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.pengeluaran_bulan_ini).toBe(1000000);
    });

    it("should fail to create transaction if required fields are missing", async () => {
        const res = await request(app)
            .post("/api/v1/resik")
            .send({
                user_id: testUserId,
                kas_bank: 2000000,
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBeDefined();
    });

    it("should fail to fetch transaction with invalid UUID format", async () => {
        const res = await request(app)
            .get("/api/v1/resik/invalid-uuid-format");
            
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("should return 404 if transaction UUID is not found", async () => {
        const randomUuid = "123e4567-e89b-12d3-a456-426614174000";
        const res = await request(app)
            .get(`/api/v1/resik/${randomUuid}`);
            
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(true); // Note: HttpError middleware returns true for errors in this project
        expect(res.body.message).toBe("Transaksi tidak ditemukan");
    });
});
