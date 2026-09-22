// funksiyani chaqiuruvchi yordamchi
import "@tanstack/react-start/server-only";
import { ExecutionMethod } from "node-appwrite";

import { createSessionClient } from "./appwrite";
import { env } from "./env";

export type Role = "property_owner" | "realtor";

export type PersonalAccount = {
  personalAccountId: string;
  firstName: string;
  lastName: string;
  role: Role;
  contactEmail: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiError = {
  error: string;
  message: string;
  issues?: { field: string; message: string }[];
};

export type FunctionResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: ApiError };

export async function callPersonalAccount<T>(
  sessionSecret: string,
  method: "GET" | "POST" | "PATCH",
  body?: unknown,
): Promise<FunctionResult<T>> {
  const { functions } = createSessionClient(sessionSecret);

  const execution = await functions.createExecution({
    functionId: env().APPWRITE_FUNCTION_ID,
    xpath: "/personal-account",
    method: ExecutionMethod[method],
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { "content-type": "application/json" },
    async: false,
  });

  const status = execution.responseStatusCode;
  const parsed = parseJson(execution.responseBody);

  if (status >= 200 && status < 300) {
    return { ok: true, status, data: parsed as T };
  }

  return {
    ok: false,
    status,
    error: (parsed as ApiError | null) ?? {
      error: "bad_response",
      message: "The Function returned an unreadable response.",
    },
  };
}

function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
