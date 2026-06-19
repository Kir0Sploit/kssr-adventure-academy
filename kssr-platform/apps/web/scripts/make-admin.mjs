// Promote an existing account to admin (owner-only, runs on the server).
//
// Usage (from apps/web):
//   node scripts/make-admin.mjs owner@example.com
//
// There is intentionally NO in-app way to become admin — this script is the
// only path, so only someone with server access (you) can grant it.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = (process.argv[2] || "").toLowerCase().trim();

if (!email) {
  console.error("Usage: node scripts/make-admin.mjs <email>");
  process.exit(1);
}

const account = await prisma.account.findUnique({ where: { email } });
if (!account) {
  console.error(`No account found for ${email}. Register that email first, then re-run.`);
  process.exit(1);
}

await prisma.account.update({ where: { id: account.id }, data: { role: "admin" } });
console.log(`✓ ${email} is now an admin. Log in at /admin/dashboard.`);
await prisma.$disconnect();
