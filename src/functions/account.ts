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

    // The Function is idempotent: 201 when it creates the account,
    // 200 when the same person already has one with the same role.
    const result = await callPersonalAccount<PersonalAccount>(
      secret,
      "POST",
      data,
    );

    if (result.ok) return { ok: true, account: result.data };
    return { ok: false, error: result.error };
  });
