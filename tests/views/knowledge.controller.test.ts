import { Request, Response } from "express";
import { AppDataSource } from "../../src/server/database/config";
import { KnowledgeBaseItem } from "../../src/server/models/knowledge.model";
import {
  getActiveEntries,
  getEntryById,
  createEntry,
  deleteEntry,
} from "../../src/server/controllers/knowledge.controller";
import { AppError } from "../../src/server/middlewares/error.middleware";

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockRequest = (
  body: any = {},
  params: any = {},
  user: any = { userId: "admin-operator" }
) => {
  return {
    body,
    params,
    user,
  } as Request;
};

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

beforeEach(async () => {
  await AppDataSource.synchronize(true);
});

describe("Knowledge Controller Unit Tests", () => {
  it("should create a new knowledge item through controller", async () => {
    const req = mockRequest({
      question: "Onboarding Checklist",
      answer: "Complete 2FA setup and sign NDA.",
    });
    const res = mockResponse();

    await createEntry(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          question: "Onboarding Checklist",
          answer: "Complete 2FA setup and sign NDA.",
        }),
      })
    );
  });

  it("should fetch only active knowledge items", async () => {
    const repo = AppDataSource.getRepository(KnowledgeBaseItem);
    await repo.save(
      repo.create({ question: "Active Q", answer: "A1", isActive: true })
    );
    await repo.save(
      repo.create({ question: "Inactive Q", answer: "A2", isActive: false })
    );

    const req = mockRequest();
    const res = mockResponse();

    await getActiveEntries(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonMock = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonMock.success).toBe(true);
    expect(jsonMock.data.length).toBe(1);
    expect(jsonMock.data[0].question).toBe("Active Q");
  });

  it("should fetch item by ID", async () => {
    const repo = AppDataSource.getRepository(KnowledgeBaseItem);
    const saved = await repo.save(
      repo.create({ question: "Target Q", answer: "Target A" })
    );

    const req = mockRequest({}, { id: saved.id });
    const res = mockResponse();

    await getEntryById(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonMock = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonMock.data.id).toBe(saved.id);
  });

  it("should pass AppError 404 to next on missing ID", async () => {
    const req = mockRequest({}, { id: "00000000-0000-0000-0000-000000000000" });
    const res = mockResponse();
    const next = jest.fn();

    await getEntryById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it("should delete item by ID and verify removal", async () => {
    const repo = AppDataSource.getRepository(KnowledgeBaseItem);
    const saved = await repo.save(
      repo.create({ question: "Temporary Item", answer: "Temp Answer" })
    );

    const req = mockRequest({}, { id: saved.id });
    const res = mockResponse();

    await deleteEntry(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    const found = await repo.findOne({ where: { id: saved.id } });
    expect(found).toBeNull();
  });
});
