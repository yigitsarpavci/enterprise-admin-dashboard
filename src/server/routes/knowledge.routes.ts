import { Router } from "express";
import { body, param } from "express-validator";
import { validate } from "../middlewares/validator.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  getActiveEntries,
  getEntryById,
  createEntry,
  deleteEntry,
} from "../controllers/knowledge.controller";

const router = Router();

router.get("/active", authenticate, getActiveEntries);

router.get(
  "/:id",
  authenticate,
  validate([param("id").isUUID().withMessage("Invalid ID format")]),
  getEntryById
);

router.post(
  "/",
  authenticate,
  authorize("super_admin", "system", "admin"),
  validate([
    body("question")
      .isString()
      .withMessage("Question must be a string")
      .trim()
      .notEmpty()
      .withMessage("Question is required")
      .isLength({ max: 500 })
      .withMessage("Question must be at most 500 characters"),
    body("answer")
      .isString()
      .withMessage("Answer must be a string")
      .trim()
      .notEmpty()
      .withMessage("Answer is required")
      .isLength({ max: 5000 })
      .withMessage("Answer must be at most 5000 characters"),
    body("is_active")
      .optional()
      .isBoolean()
      .withMessage("is_active must be a boolean"),
  ]),
  createEntry
);

router.delete(
  "/:id",
  authenticate,
  authorize("super_admin", "system", "admin"),
  validate([param("id").isUUID().withMessage("Invalid ID format")]),
  deleteEntry
);

export default router;
