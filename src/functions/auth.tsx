import { createServerFn } from "@tanstack/react-start";
import { AppwriteException, ID } from "node-appwrite";
import { z } from "zod";

import { createAdminClient, createSessionClient } from "#/server/appwrite";
import {
  clearSessionCookie,
  readSessionSecret,
  writeSessionCookie,
} from "#/server/session";
type AuthResult<T> = { ok: true; data: T } | { ok: false; message: string };

// emailga kodni yuborish joyim
export const requestCode = createServerFn({ method: "POST" }) //darchani ochish
  .validator(z.object({ email: z.email() })) // darchadagi tekshiruvim, haqiqatdan emailmi yoki yo'q

  //   handler ichki xonadagi ish
  .handler(async ({ data }): Promise<AuthResult<{ userId: string }>> => {
    const { account } = createAdminClient();
    // bank emailga 6 xonali kod yuboradi.
    try {
      const token = await account.createEmailToken({
        userId: ID.unique(), // mijoz yangi bo'lsa unga yangi id ber | agar bo'lsa yangini etiborsiz qoldir
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

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const secret = readSessionSecret();

  if (secret) {
    try {
      const { account } = createSessionClient(secret);
      await account.deleteSession({ sessionId: "current" });
    } catch (error) {
      // Appwrite tomonida session allaqachon yo'q bo'lishi mumkin. Baribir
      // quyidagi cookie o'chadi, shuning uchun bu xato to'xtatishga arzimaydi.
      console.error("deleteSession failed", error);
    }
  }

  clearSessionCookie();
  return null;
});
