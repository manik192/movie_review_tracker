import prisma from "../prismaClient.js";

function validId(id) {
  const n = parseInt(id, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function createReview(req, res) {
  const { movie_id, rating, content } = req.body;

  const mid = parseInt(movie_id, 10);
  if (!movie_id || !Number.isInteger(mid) || mid <= 0) {
    return res.status(400).json({ error: "movie_id must be a positive integer." });
  }
  const rat = parseInt(rating, 10);
  if (rating === undefined || rating === null || !Number.isInteger(rat) || rat < 1 || rat > 5) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
  }
  if (!content || typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "Content is required." });
  }

  const movie = await prisma.movie.findUnique({ where: { id: mid } });
  if (!movie) return res.status(404).json({ error: "Movie not found." });

  const review = await prisma.review.create({
    data: {
      user_id: req.user.id,
      movie_id: mid,
      rating: rat,
      content: content.trim(),
    },
  });

  return res.status(201).json(review);
}

export async function getReviews(req, res) {
  const { movie_id } = req.query;
  const where = {};

  if (movie_id !== undefined) {
    const mid = parseInt(movie_id, 10);
    if (!Number.isInteger(mid) || mid <= 0) {
      return res.status(400).json({ error: "movie_id query param must be a positive integer." });
    }
    where.movie_id = mid;
  }

  const reviews = await prisma.review.findMany({ where, orderBy: { created_at: "desc" } });
  return res.status(200).json(reviews);
}

export async function getReviewById(req, res) {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID must be a positive integer." });

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return res.status(404).json({ error: "Review not found." });

  return res.status(200).json(review);
}

export async function updateReview(req, res) {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID must be a positive integer." });

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return res.status(404).json({ error: "Review not found." });

  if (req.user.role !== "admin" && review.user_id !== req.user.id) {
    return res.status(403).json({ error: "You do not have permission to update this review." });
  }

  const { rating, content } = req.body;
  const updates = {};

  if (rating !== undefined) {
    const rat = parseInt(rating, 10);
    if (!Number.isInteger(rat) || rat < 1 || rat > 5) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
    }
    updates.rating = rat;
  }
  if (content !== undefined) {
    if (typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ error: "Content must be a non-empty string." });
    }
    updates.content = content.trim();
  }

  const updated = await prisma.review.update({ where: { id }, data: updates });
  return res.status(200).json(updated);
}

export async function deleteReview(req, res) {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID must be a positive integer." });

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return res.status(404).json({ error: "Review not found." });

  if (req.user.role !== "admin" && review.user_id !== req.user.id) {
    return res.status(403).json({ error: "You do not have permission to delete this review." });
  }

  const deleted = await prisma.review.delete({ where: { id } });
  return res.status(200).json(deleted);
}
