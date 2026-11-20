import "reflect-metadata";
import { DataSource } from "typeorm";
import { entities } from "./entities";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  // Tests (NODE_ENV=test) run on an in-memory database; otherwise the knowledge base is persisted.
  database: process.env.NODE_ENV === "test" ? ":memory:" : process.env.KNOWLEDGE_DB_PATH ?? "knowledge.db",
  synchronize: true,
  entities: entities,
  logging: false,
});
