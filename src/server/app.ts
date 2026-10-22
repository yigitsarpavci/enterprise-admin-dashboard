import express, { Express } from "express";
import knowledgeRouter from "./routes/knowledge.routes";

export function createExpressApp(): Express {
  const app = express();
  app.use(express.json());

  // Mount API modules
  app.use("/api/knowledge", knowledgeRouter);
  app.use("/api/faq", knowledgeRouter); // backward compatibility alias

  // Global Error Handler
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    }
  );

  return app;
}
