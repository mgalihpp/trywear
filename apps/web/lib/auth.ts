import { db } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { sendEmail } from "@/actions/send-email";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Cari segmen default (min spend 0)
          const defaultSegment = await db.customerSegment.findFirst({
            where: {
              min_spend_cents: 0,
              is_active: true,
            },
            orderBy: {
              priority: "desc",
            },
          });

          return {
            data: {
              ...user,
              segment_id: defaultSegment?.id ?? null,
              lifetime_spent: 0,
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url, token }, _request) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: url,
        type: "reset-password",
      });
    },
    onPasswordReset: async ({ user }, _request) => {
      // You can perform actions after a password reset here
      console.log(`Password reset for user: ${user.email}`);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, _request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: url,
        type: "verify-email",
      });
    },
  },
  plugins: [admin()],
  user: {
    additionalFields: {
      segment_id: { type: "number" },
      lifetime_spent: { type: "number" },
    },
  },
});

export type Session = typeof auth.$Infer.Session;