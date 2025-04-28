// Turning off eslint for this file because it's a global variable
// Just doing 'const prisma = new PrismaClient()' works fine for local dev
// but some docs suggest checking for global.prisma when deploying
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
