import express, { Express } from "express";
import request from "supertest";
import { AppDataSource } from "../../src/server/database/config";
import knowledgeRouter from "../../src/server/routes/knowledge.routes";

let app: Express;

beforeAll(async () => {
  await AppDataSource.initialize();
  app = express();
  app.use(express.json());
  app.use("/api/knowledge", knowledgeRouter);
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

beforeEach(async () => {
  await AppDataSource.synchronize(true); // reset in-memory database
});

describe("Knowledge Base & FAQ Express API Integration Tests (Supertest)", () => {
  it("should fail POST /api/knowledge with missing question", async () => {
    const res = await request(app)
      .post("/api/knowledge")
      .send({ answer: "Standard Operating Procedure details." });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors[0].msg).toBe("Question must be a string");
  });

  it("should fail POST /api/knowledge with missing answer", async () => {
    const res = await request(app)
      .post("/api/knowledge")
      .send({ question: "How to request PTO?" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors[0].msg).toBe("Answer must be a string");
  });

  it("should fail POST /api/knowledge with question length > 500 characters", async () => {
    const longQuestion = "a".repeat(501);
    const res = await request(app)
      .post("/api/knowledge")
      .send({ question: longQuestion, answer: "Valid answer." });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors[0].msg).toBe("Question must be at most 500 characters");
  });

  it("should fail DELETE /api/knowledge/:id with invalid UUID format", async () => {
    const res = await request(app).delete("/api/knowledge/invalid-uuid-id");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors[0].msg).toBe("Invalid ID format");
  });

  it("should succeed POST /api/knowledge with valid payload and return 201", async () => {
    const res = await request(app).post("/api/knowledge").send({
      question: "What is the corporate remote work policy?",
      answer: "Employees may work remotely on Tuesdays and Thursdays upon manager approval.",
      is_active: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.question).toBe("What is the corporate remote work policy?");
  });

  it("should execute end-to-end integration lifecycle: create -> get active -> delete -> verify deletion", async () => {
    // 1. Create
    const createRes = await request(app).post("/api/knowledge").send({
      question: "How to report security incidents?",
      answer: "Notify the SOC team via Slack #incident-response immediately.",
    });
    expect(createRes.status).toBe(201);
    const entryId = createRes.body.data.id;

    // 2. Fetch active entries
    let fetchRes = await request(app).get("/api/knowledge/active");
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.data.length).toBe(1);
    expect(fetchRes.body.data[0].id).toBe(entryId);

    // 3. Fetch single entry by ID
    const singleRes = await request(app).get(`/api/knowledge/${entryId}`);
    expect(singleRes.status).toBe(200);
    expect(singleRes.body.data.question).toBe("How to report security incidents?");

    // 4. Delete entry
    const deleteRes = await request(app).delete(`/api/knowledge/${entryId}`);
    expect(deleteRes.status).toBe(200);

    // 5. Verify deletion
    fetchRes = await request(app).get("/api/knowledge/active");
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.data.length).toBe(0);
  });
});
