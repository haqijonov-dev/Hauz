import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { callPersonalAccount } from "#/server/personal-account";
import type { ApiError, PersonalAccount } from "#/server/personal-account";
import { readSessionSecret } from "#/server/session";

export type AccountResult =
  { ok: true; account: PersonalAccount } | { ok: false; error: ApiError };

const signedOut: ApiError = {
  error: "unauthorized",
  message: "You are signed out. Sign in again.",
};

export const createAccount = createServerFn({ method: "POST" })
  .validator(
    z.object({
      firstName: z.string().trim().min(1).max(100),
      lastName: z.string().trim().min(1).max(100),
      role: z.enum(["property_owner", "realtor"]),
    }),
  )
  .handler(async ({ data }): Promise<AccountResult> => {
    const secret = readSessionSecret();
    if (!secret) return { ok: false, error: signedOut };

    // Function idempotent: hisob yangi ochilsa 201, xuddi shu odamda xuddi
    // shu rol bilan hisob bor bo'lsa 200 qaytadi.
    const result = await callPersonalAccount<PersonalAccount>(
      secret,
      "POST",
      data,
    );

    if (result.ok) return { ok: true, account: result.data };
    return { ok: false, error: result.error };
  });

export const updateAccount = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        firstName: z.string().trim().min(1).max(100).optional(),
        lastName: z.string().trim().min(1).max(100).optional(),
        contactEmail: z.email().max(254).nullable().optional(),
        bio: z.string().trim().min(1).max(2000).nullable().optional(),
      })
      .refine((changes) => Object.keys(changes).length > 0, {
        message: "Nothing to update.",
      }),
  )
  .handler(async ({ data }): Promise<AccountResult> => {
    const secret = readSessionSecret();
    if (!secret) return { ok: false, error: signedOut };

    // Faqat o'zgargan maydonlar yuboriladi: yo'q maydon eskicha qoladi,
    // null esa tozalaydi. Foydalanuvchi id'si yuborilmaydi, uni Function
    // o'zi session'dan oladi.
    const result = await callPersonalAccount<PersonalAccount>(
      secret,
      "PATCH",
      data,
    );

    if (result.ok) return { ok: true, account: result.data };
    return { ok: false, error: result.error };
  });
