import "dotenv/config";
controllers-or-stripe-add
import pg from "pg";
const { Pool } = pg;
import { PrismaPg } from "@prisma/adapter-pg";

main
import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: adapter as any, // Cast as any to resolve subtle type version mismatches between pg versions
  });

 controllers-or-stripe-add
const pool = new Pool({ 
    connectionString,
    max: 20, // Adjust based on your Neon tier
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
 main

export default prisma;