import next from "next";
import { AppDataSource } from "./src/server/database/config";
import { createExpressApp } from "./src/server/app";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(async () => {
    try {
      await AppDataSource.initialize();
      console.log("[Performo] TypeORM DataSource initialized successfully");
    } catch (err) {
      console.error("[Performo] Database initialization failed:", err);
    }

    const server = createExpressApp();

    // Delegate all remaining routes to Next.js
    server.use((req, res) => {
      return handle(req, res);
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`[Performo] Unified Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[Performo] Failed to start server:", err);
    process.exit(1);
  });
