import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/server/database/config";
import { KnowledgeBaseItem } from "@/server/models/knowledge.model";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const { id } = await params;
  const repo = AppDataSource.getRepository(KnowledgeBaseItem);
  const item = await repo.findOne({ where: { id } });
  if (!item) {
    return NextResponse.json(
      { success: false, message: "Knowledge base entry not found" },
      { status: 404 }
    );
  }
  await repo.remove(item);
  return NextResponse.json({ success: true, data: null });
}
