import { createServerFn } from "@tanstack/react-start";
import { AppwriteException, ID } from "node-appwrite";
import { z } from "zod";

import { createAdminClient } from "#/server/appwrite";
import { writeSessionCookie } from "#/server/session";

type AuthResult<T> = { ok: true; data: T } | { ok: false; message: string };

export const requestCode = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.email() }))
  .handler(async ({ data }): Promise<AuthResult<{ userId: string }>> => {
    const { account } = createAdminClient();

    try {
      const token = await account.createEmailToken({
        userId: ID.unique(),
        email: data.email,
      });
      return { ok: true, data: { userId: token.userId } };
    } catch (error) {
      console.error("createEmailToken failed", error);
      return { ok: false, message: "Could not send the code. Try again." };
    }
  });

export const verifyCode = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string().min(1),
      code: z.string().regex(/^\d{6}$/, "The code has 6 digits."),
    }),
  )
  .handler(async ({ data }): Promise<AuthResult<null>> => {
    const { account } = createAdminClient();

    try {
      const session = await account.createSession({
        userId: data.userId,
        secret: data.code,
      });

      if (!session.secret) {
        throw new Error("Appwrite returned a session without a secret.");
      }

      writeSessionCookie(session.secret, session.expire);
      return { ok: true, data: null };
    } catch (error) {
      if (error instanceof AppwriteException && error.code === 401) {
        return { ok: false, message: "That code is wrong or has expired." };
      }
      console.error("createSession failed", error);
      return { ok: false, message: "Could not sign you in. Try again." };
    }
  });
