import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("authentication validation", () => {
  it("rejects invalid registration data", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "", email: "not-an-email", password: "short" });

    expect(response.status).toBe(400);
  });

  it("rejects invalid login data", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: "short" });

    expect(response.status).toBe(400);
  });
});

describe("protected routes", () => {
  it("rejects file listing without authentication", async () => {
    const response = await request(app).get("/api/files");
    expect(response.status).toBe(401);
  });

  it("rejects statistics without authentication", async () => {
    const response = await request(app).get("/api/stats");
    expect(response.status).toBe(401);
  });

  it("rejects current-user lookup without authentication", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
  });
});

describe("file upload validation", () => {
  it("rejects an unsupported MIME type after authentication", async () => {
    // This token is syntactically valid and only used to reach the upload validator.
    // The route does not query the database before Multer performs file filtering.
    const jwt = await import("jsonwebtoken");
    const token = jwt.default.sign({ userId: "test-user" }, "dev-secret-change-in-production");

    const response = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("fake executable"), {
        filename: "malware.exe",
        contentType: "application/x-msdownload",
      });

    expect(response.status).toBe(415);
  });
});
