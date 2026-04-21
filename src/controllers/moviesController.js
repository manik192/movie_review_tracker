import prisma from "../prismaClient.js";

function validId(id) {
  const n = parseInt(id, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function createMovie(req, res) {
  const { title, genre, release_year, description } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required." });
  }
  if (!genre || typeof genre !== "string" || genre.trim() === "") {
    return res.status(400).json({ error: "Genre is required." });
  }
  const year = parseInt(release_year, 10);
  if (!release_year || !Number.isInteger(year) || year < 1888 || year > 2100) {
    return res.status(400).json({ error: "A valid release_year (integer) is required." });
  }
  if (!description || typeof description !== "string" || description.trim() === "") {
    return res.status(400).json({ error: "Description is required." });
  }

  const movie = await prisma.movie.create({
    data: {
      user_id: req.user.id,
      title: title.trim(),
      genre: genre.trim(),
      release_year: year,
      description: description.trim(),
    },
  });

  return res.status(201).json(movie);
}

export async function getMovies(req, res) {
  const movies = await prisma.movie.findMany({ orderBy: { created_at: "desc" } });
  return res.status(200).json(movies);
}

export async function getMovieById(req, res) {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID must be a positive integer." });

  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) return res.status(404).json({ error: "Movie not found." });

  return res.status(200).json(movie);
}

export async function updateMovie(req, res) {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID must be a positive integer." });

  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) return res.status(404).json({ error: "Movie not found." });

  if (req.user.role !== "admin" && movie.user_id !== req.user.id) {
    return res.status(403).json({ error: "You do not have permission to update this movie." });
  }

  const { title, genre, release_year, description } = req.body;
  const updates = {};

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ error: "Title must be a non-empty string." });
    }
    updates.title = title.trim();
  }
  if (genre !== undefined) {
    if (typeof genre !== "string" || genre.trim() === "") {
      return res.status(400).json({ error: "Genre must be a non-empty string." });
    }
    updates.genre = genre.trim();
  }
  if (release_year !== undefined) {
    const year = parseInt(release_year, 10);
    if (!Number.isInteger(year) || year < 1888 || year > 2100) {
      return res.status(400).json({ error: "release_year must be a valid integer." });
    }
    updates.release_year = year;
  }
  if (description !== undefined) {
    if (typeof description !== "string" || description.trim() === "") {
      return res.status(400).json({ error: "Description must be a non-empty string." });
    }
    updates.description = description.trim();
  }

  const updated = await prisma.movie.update({ where: { id }, data: updates });
  return res.status(200).json(updated);
}

export async function deleteMovie(req, res) {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID must be a positive integer." });

  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) return res.status(404).json({ error: "Movie not found." });

  if (req.user.role !== "admin" && movie.user_id !== req.user.id) {
    return res.status(403).json({ error: "You do not have permission to delete this movie." });
  }

  // Cascade: delete watchlist + reviews first (Prisma schema handles via onDelete: Cascade)
  const deleted = await prisma.movie.delete({ where: { id } });
  return res.status(200).json(deleted);
}
