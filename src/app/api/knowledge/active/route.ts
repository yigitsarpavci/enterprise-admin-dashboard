import { NextResponse } from "next/server";
import { AppDataSource } from "@/server/database/config";
import { KnowledgeBaseItem } from "@/server/models/knowledge.model";

export async function GET() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const repo = AppDataSource.getRepository(KnowledgeBaseItem);
  const items = await repo.find({
    where: { isActive: true },
    order: { createdAt: "DESC" },
    take: 100,
  });
  return NextResponse.json({ success: true, data: items });
}
