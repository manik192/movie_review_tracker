# Movie Review Tracker API

A REST API for tracking movies, writing reviews, and managing personal watchlists.
Built with Node.js, Express, PostgreSQL, and Prisma ORM.

## Local Setup

1. `npm install`
2. Edit `.env` with your DATABASE_URL and JWT_SECRET
3. `npx prisma migrate dev --name init`
4. `node --env-file=.env prisma/seed.js`
5. `npm run dev` — server at http://localhost:3000, Swagger at http://localhost:3000/api-docs


## Render Deployment

Build: `npm install && npx prisma generate && npx prisma migrate deploy && node prisma/seed.js`
Start: `node src/server.js`
