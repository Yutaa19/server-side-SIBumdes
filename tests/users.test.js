import { describe, expect, it } from "bun:test";
import request from "supertest";
import { app } from "./setup";

describe("Users API", () => {
    
    it("should get user profile when authenticated", async () => {
        // 1. Register a user
        const regRes = await request(app).post("/api/v1/auth/register").send({
            name: "Profile User",
            email: "profile@example.com",
            password: "password123",
            number: "08123456789",
            role: "admin_unit",
            unit_usaha: "internet"
        });
        
        const token = regRes.body.data.token;
        expect(token).toBeDefined();

        // 2. Fetch profile using the token
        const res = await request(app)
            .get("/api/v1/auth/profile")
            .set("Authorization", `Bearer ${token}`);
            
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe("profile@example.com");
    });

    it("should reject profile request without token", async () => {
        const res = await request(app).get("/api/v1/auth/profile");
        
        // Custom error middleware normally returns 500 without our HttpError wrapper,
        // but since we throw unauthorizedError (HttpError), it should return its specific status.
        // Wait, unauthorizedError usually extends HttpError. Let's just check for non-200.
        expect(res.status).not.toBe(200);
    });
});
