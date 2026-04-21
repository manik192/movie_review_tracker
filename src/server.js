import express from "express";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { parse } from "yaml";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import reviewRoutes from "./routes/reviews.js";
import watchlistRoutes from "./routes/watchlist.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

// Swagger UI
const openapiSpec = parse(readFileSync(join(__dirname, "openapi.yaml"), "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/watchlist", watchlistRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Movie Review Tracker API is running." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
