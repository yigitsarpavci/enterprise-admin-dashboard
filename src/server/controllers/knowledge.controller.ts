import { Request, Response } from "express";
import { AppDataSource } from "../database/config";
import { asyncHandler, AppError } from "../middlewares/error.middleware";
import { successResponse } from "../utils/response";
import { KnowledgeBaseItem } from "../models/knowledge.model";

export const getActiveEntries = asyncHandler(async (req: Request, res: Response) => {
  const repository = AppDataSource.getRepository(KnowledgeBaseItem);
  const entries = await repository.find({
    where: { isActive: true },
    order: { createdAt: "DESC" },
    take: 100,
  });
  return successResponse(res, entries);
});

export const getEntryById = asyncHandler(async (req: Request, res: Response) => {
  const repository = AppDataSource.getRepository(KnowledgeBaseItem);
  const entry = await repository.findOne({ where: { id: req.params.id as string } });
  if (!entry) {
    throw new AppError("Knowledge base entry not found", 404);
  }
  return successResponse(res, entry);
});

export const createEntry = asyncHandler(async (req: Request, res: Response) => {
  const repository = AppDataSource.getRepository(KnowledgeBaseItem);
  const { question, answer, is_active } = req.body;

  const newEntry = repository.create({
    question,
    answer,
    isActive: is_active !== undefined ? is_active : true,
    createdBy: req.user?.userId || "system",
  });

  const savedEntry = await repository.save(newEntry);
  return successResponse(res, savedEntry, 201);
});

export const deleteEntry = asyncHandler(async (req: Request, res: Response) => {
  const repository = AppDataSource.getRepository(KnowledgeBaseItem);
  const entry = await repository.findOne({ where: { id: req.params.id as string } });
  if (!entry) {
    throw new AppError("Knowledge base entry not found", 404);
  }

  await repository.remove(entry);
  return successResponse(res, null);
});
