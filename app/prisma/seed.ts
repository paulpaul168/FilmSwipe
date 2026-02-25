import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { normalizeMovieKey } from "../src/lib/normalizeMovieKey";

async function main() {
  const demoEmail = "demo@example.com";

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Demo User",
      image: null,
    },
  });

  const group = await prisma.group.upsert({
    where: { inviteToken: "demo-token" },
    update: {},
    create: {
      name: "Demo Movie Night",
      ownerId: user.id,
      inviteToken: "demo-token",
    },
  });

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId: user.id } },
    update: {},
    create: {
      groupId: group.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  const moviesData = [
    { title: "Inception", year: 2010 },
    { title: "The Matrix", year: 1999 },
    { title: "Spider-Man: No Way Home", year: 2021 },
    { title: "Interstellar", year: 2014 },
    { title: "Dune", year: 2021 },
    { title: "Everything Everywhere All at Once", year: 2022 },
  ];

  for (const m of moviesData) {
    const normalizedKey = normalizeMovieKey(m.title, m.year ?? null);
    await prisma.movie.upsert({
      where: { groupId_normalizedKey: { groupId: group.id, normalizedKey } },
      update: {},
      create: {
        groupId: group.id,
        title: m.title,
        year: m.year,
        normalizedKey,
        createdById: user.id,
      },
    });
  }

  const movies = await prisma.movie.findMany({
    where: { groupId: group.id },
    take: 3,
  });

  for (const movie of movies) {
    await prisma.rating.upsert({
      where: {
        movieId_userId: { movieId: movie.id, userId: user.id },
      },
      update: {},
      create: {
        movieId: movie.id,
        userId: user.id,
        value: ["LIKE", "SUPERLIKE", "SUPERDISLIKE"][
          movies.indexOf(movie) % 3
        ] as "LIKE" | "SUPERLIKE" | "SUPERDISLIKE",
      },
    });
  }

  console.log("Seed completed: demo user, group, movies, and ratings created.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
