import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/server/database/config";
import { KnowledgeBaseItem } from "@/server/models/knowledge.model";

export async function POST(req: NextRequest) {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const body = await req.json().catch(() => ({}));
  const { question, answer, is_active } = body;

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return NextResponse.json(
      { success: false, errors: [{ msg: "Question is required" }] },
      { status: 400 }
    );
  }
  if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
    return NextResponse.json(
      { success: false, errors: [{ msg: "Answer is required" }] },
      { status: 400 }
    );
  }

  const repo = AppDataSource.getRepository(KnowledgeBaseItem);
  const item = repo.create({
    question: question.trim(),
    answer: answer.trim(),
    isActive: is_active !== undefined ? is_active : true,
    createdBy: "admin",
  });
  const saved = await repo.save(item);
  return NextResponse.json({ success: true, data: saved }, { status: 201 });
}
