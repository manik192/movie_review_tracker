import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/reviewsController.js";

const router = Router();

router.post("/", authenticate, createReview);
router.get("/", authenticate, getReviews);
router.get("/:id", authenticate, getReviewById);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

export default router;
