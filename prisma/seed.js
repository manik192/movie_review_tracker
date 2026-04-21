import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.watchlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash("Admin123!", 10);
  const userHash = await bcrypt.hash("User123!", 10);
  const user2Hash = await bcrypt.hash("User456!", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password_hash: adminHash,
      role: "admin",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: "Alice Viewer",
      email: "alice@example.com",
      password_hash: userHash,
      role: "user",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Bob Critic",
      email: "bob@example.com",
      password_hash: user2Hash,
      role: "user",
    },
  });

  const movie1 = await prisma.movie.create({
    data: {
      user_id: user1.id,
      title: "Interstellar",
      genre: "Sci-Fi",
      release_year: 2014,
      description:
        "A team of astronauts travel through a wormhole in search of a new home for humanity.",
    },
  });

  const movie2 = await prisma.movie.create({
    data: {
      user_id: user2.id,
      title: "Parasite",
      genre: "Thriller",
      release_year: 2019,
      description: "A poor family schemes to become employed by a wealthy family.",
    },
  });

  const movie3 = await prisma.movie.create({
    data: {
      user_id: admin.id,
      title: "The Dark Knight",
      genre: "Action",
      release_year: 2008,
      description:
        "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham City into anarchy.",
    },
  });

  await prisma.review.create({
    data: {
      user_id: user1.id,
      movie_id: movie1.id,
      rating: 5,
      content: "An absolute masterpiece. The visuals and score are unlike anything I've seen.",
    },
  });

  await prisma.review.create({
    data: {
      user_id: user2.id,
      movie_id: movie1.id,
      rating: 4,
      content: "Brilliant film, though the ending left me with more questions than answers.",
    },
  });

  await prisma.review.create({
    data: {
      user_id: user1.id,
      movie_id: movie2.id,
      rating: 5,
      content: "A perfectly crafted social thriller. Bong Joon-ho at his finest.",
    },
  });

  await prisma.review.create({
    data: {
      user_id: admin.id,
      movie_id: movie3.id,
      rating: 5,
      content: "Heath Ledger's Joker is one of the greatest performances in cinema history.",
    },
  });

  await prisma.watchlist.create({
    data: {
      user_id: user1.id,
      movie_id: movie2.id,
      status: "watched",
      note: "Loved it.",
    },
  });

  await prisma.watchlist.create({
    data: {
      user_id: user1.id,
      movie_id: movie3.id,
      status: "want_to_watch",
      note: "Recommended by a friend.",
    },
  });

  await prisma.watchlist.create({
    data: {
      user_id: user2.id,
      movie_id: movie1.id,
      status: "watching",
      note: "About halfway through.",
    },
  });

  console.log("Seed complete.");
  console.log(`Admin:  admin@example.com / Admin123!`);
  console.log(`Alice:  alice@example.com / User123!`);
  console.log(`Bob:    bob@example.com / User456!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
