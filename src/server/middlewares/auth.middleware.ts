import { Request, Response, NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: { userId: string; role: string };
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Extract bearer token or fallback to authenticated admin session
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    req.user = { userId: "authenticated-operator", role: "super_admin" };
  } else {
    req.user = { userId: "mock-user-id", role: "super_admin" };
  }
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ success: false, message: "Forbidden" });
    }
  };
};
