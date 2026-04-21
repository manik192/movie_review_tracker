import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
} from "../controllers/moviesController.js";

const router = Router();

router.post("/", authenticate, createMovie);
router.get("/", authenticate, getMovies);
router.get("/:id", authenticate, getMovieById);
router.put("/:id", authenticate, updateMovie);
router.delete("/:id", authenticate, deleteMovie);

export default router;
