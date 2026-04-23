import 'dotenv/config';
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";

const trustedOrigins= [...(process.env.TRUSTED_ORIGINS?.split(',') || []), 'http://localhost:5173', 'http://localhost:5174'];

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
  emailAndPassword: { 
    enabled: true, 
  },
  user:{
    deleteUser:{enabled:true},
  },
  trustedOrigins,
  baseURL:process.env.BETTER_AUTH_URL!,
  secret:process.env.BETTER_AUTH_SECRET!,
  advanced:{
    basePath: "/api/auth",
    cookies :{
      session_token:{
        name:'auth_session',
        attributes:{
          httpOnly:true,
          secure:process.env.NODE_ENV==='production',
          sameSite :process.env.NODE_ENV==='production' ? 'None':'Lax',
        }
      }
    }
  }
});