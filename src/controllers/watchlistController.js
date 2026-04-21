import prisma from "../prismaClient.js";

const VALID_STATUSES = ["want_to_watch", "watching", "watched"];

function validId(id) {
  const n = parseInt(id, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function createWatchlistEntry(req, res) {
  const { movie_id, status, note } = req.body;

  const mid = parseInt(movie_id, 10);
  if (!movie_id || !Number.isInteger(mid) || mid <= 0) {
    return res.status(400).json({ error: "movie_id must be a positive integer." });
  }

  const entryStatus = status ?? "want_to_watch";
  if (!VALID_STATUSES.includes(entryStatus)) {
    return res
      .status(400)
      .json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}.` });
  }

  const movie = await prisma.movie.findUnique({ where: { id: mid } });
  if (!movie) return res.status(404).json({ error: "Movie not found." });

  const existing = await prisma.watchlist.findUnique({
    where: { user_id_movie_id: { user_id: req.user.id, movie_id: mid } },
  });
  if (existing) {
    return res.status(409).json({ error: "This movie is already on your watchlist." });
  }

  const entry = await prisma.watchlist.create({
    data: {
      user_id: req.user.id,
      movie_id: mid,
      status: entryStatus,
      note: note ?? null,
    },
  });

  return res.status(201).json(entry);
}

export async function getWatchlist(req, res) {
  const where = req.user.role === "admin" ? {} : { user_id: req.user.id };
  const entries = await prisma.watchlist.findMany({ where, orderBy: { created_at: "desc" } });
  return res.status(200).json(entries);
}

export async function getWatchlistEntryById(req, res) {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID must be a positive integer." });

  const entry = await prisma.watchlist.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ error: "Watchlist entry not found." });

  if (req.user.role !== "admin" && entry.user_id !== req.user.id) {
    return res.status(403).json({ error: "You do not have permission to view this entry." });
  }

  return res.status(200).json(entry);
}

export async function updateWatchlistEntry(req, res) {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID must be a positive integer." });

  const entry = await prisma.watchlist.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ error: "Watchlist entry not found." });

  if (req.user.role !== "admin" && entry.user_id !== req.user.id) {
    return res.status(403).json({ error: "You do not have permission to update this entry." });
  }

  const { status, note } = req.body;
  const updates = {};

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}.` });
    }
    updates.status = status;
  }
  if (note !== undefined) {
    updates.note = note;
  }

  const updated = await prisma.watchlist.update({ where: { id }, data: updates });
  return res.status(200).json(updated);
}

export async function deleteWatchlistEntry(req, res) {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID must be a positive integer." });

  const entry = await prisma.watchlist.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ error: "Watchlist entry not found." });

  if (req.user.role !== "admin" && entry.user_id !== req.user.id) {
    return res.status(403).json({ error: "You do not have permission to delete this entry." });
  }

  const deleted = await prisma.watchlist.delete({ where: { id } });
  return res.status(200).json(deleted);
}
