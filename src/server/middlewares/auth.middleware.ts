import { Request, Response, NextFunction } from "express";
import { decrypt } from "../../lib/session-token";

declare module "express-serve-static-core" {
  interface Request {
    user?: { userId: string; role: string };
  }
}

function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/** Requires a valid signed session cookie (the same one the Next.js app issues at login). */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const session = await decrypt(readCookie(req.headers.cookie, "session"));
  if (!session?.userId || !session.role) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }
  req.user = { userId: session.userId, role: session.role };
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
