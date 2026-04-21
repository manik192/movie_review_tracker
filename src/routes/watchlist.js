import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createWatchlistEntry,
  getWatchlist,
  getWatchlistEntryById,
  updateWatchlistEntry,
  deleteWatchlistEntry,
} from "../controllers/watchlistController.js";

const router = Router();

router.post("/", authenticate, createWatchlistEntry);
router.get("/", authenticate, getWatchlist);
router.get("/:id", authenticate, getWatchlistEntryById);
router.put("/:id", authenticate, updateWatchlistEntry);
router.delete("/:id", authenticate, deleteWatchlistEntry);

export default router;
