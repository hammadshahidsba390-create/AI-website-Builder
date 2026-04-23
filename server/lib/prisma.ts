import "dotenv/config";
import pg from "pg";
const { Pool } = pg;
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ 
    connectionString,
    max: 20, // Adjust based on your Neon tier
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

export default prisma;