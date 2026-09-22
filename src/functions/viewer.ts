import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { AppwriteException } from "node-appwrite";

import { createSessionClient } from "#/server/appwrite";
import { callPersonalAccount } from "#/server/personal-account";
import type { PersonalAccount } from "#/server/personal-account";
import { clearSessionCookie, readSessionSecret } from "#/server/session";

export type Viewer = {
  user: { id: string; email: string };
  account: PersonalAccount | null;
};

export const getViewer = createServerFn({ method: "GET" }).handler(
  async (): Promise<Viewer | null> => {
    const secret = readSessionSecret();
    if (!secret) return null;

    const { account } = createSessionClient(secret);

    let user;
    try {
      user = await account.get();
    } catch (error) {
      if (error instanceof AppwriteException && error.code === 401) {
        // Appwrite says the session is gone or invalid: sign the person out.
        clearSessionCookie();
        return null;
      }
      // Anything else (network, Appwrite down) is not a reason to sign out.
      console.error("account.get failed", error);
      throw new Error("Could not load your session.");
    }

    const result = await callPersonalAccount<PersonalAccount>(secret, "GET");

    if (result.ok) {
      return {
        user: { id: user.$id, email: user.email },
        account: result.data,
      };
    }
    if (result.status === 404) {
      return { user: { id: user.$id, email: user.email }, account: null };
    }

    console.error("GET /personal-account failed", result.status, result.error);
    throw new Error("Could not load your account.");
  },
);

export const viewerQueryOptions = queryOptions({
  queryKey: ["viewer"],
  queryFn: () => getViewer(),
});
