// ikki xil appwrite client
import "@tanstack/react-start/server-only";
import { Account, Client, Functions } from "node-appwrite";

import { env } from "./env";

function baseClient() {
  const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } = env();
  return new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);
}

// admin
export function createAdminClient() {
  const client = baseClient().setKey(env().APPWRITE_API_KEY);

  return {
    account: new Account(client),
  };
}

// user
export function createSessionClient(sessionSecret: string) {
  const client = baseClient().setSession(sessionSecret);

  return {
    account: new Account(client),
    functions: new Functions(client),
  };
}
