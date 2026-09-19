import { describe, expect, it } from "bun:test";
import request from "supertest";
import { app } from "./setup";

describe("Auth API", () => {
    
    it("should register a new user successfully", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                number: "08123456789",
                role: "admin_unit",
                unit_usaha: "internet"
            });
        
        if (res.status !== 200) {
            console.log("REGISTER ERROR:", res.body);
        }
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.name).toBe("Test User");
        expect(res.body.data.token).toBeDefined();
    });

    it("should fail to register if email already exists", async () => {
        // Register first user
        await request(app).post("/api/v1/auth/register").send({
            name: "Test User",
            email: "test2@example.com",
            password: "password123",
            number: "08123456789",
            role: "admin_unit",
            unit_usaha: "internet"
        });

        // Register second user with same email
        const res = await request(app).post("/api/v1/auth/register").send({
            name: "Test User 2",
            email: "test2@example.com",
            password: "password123",
            number: "08123456789",
            role: "admin_unit",
            unit_usaha: "internet"
        });

        expect(res.status).toBe(400); // Because of BadRequestError
        expect(res.body.message).toBe("email sudah terdaftar");
    });

    it("should login successfully and return a token", async () => {
        // Create user
        await request(app).post("/api/v1/auth/register").send({
            name: "Login User",
            email: "login@example.com",
            password: "password123",
            number: "08123456789",
            role: "admin_unit",
            unit_usaha: "internet"
        });

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "login@example.com",
                password: "password123"
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
    });

    it("should fail to login with wrong password", async () => {
        // Create user
        await request(app).post("/api/v1/auth/register").send({
            name: "Wrong Pass",
            email: "wrongpass@example.com",
            password: "password123",
            number: "08123456789",
            role: "admin_unit",
            unit_usaha: "internet"
        });

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "wrongpass@example.com",
                password: "wrongpassword"
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("password yang di masukan salah");
    });
});
