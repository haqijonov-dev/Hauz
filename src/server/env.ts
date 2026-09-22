// .env fileni manshu joyda o'qiman
import "@tanstack/react-start/server-only";
import { z } from "zod";

const envSxema = z.object({
  APPWRITE_ENDPOINT: z.url(),
  APPWRITE_PROJECT_ID: z.string().min(1),
  APPWRITE_API_KEY: z.string().min(1),
  APPWRITE_FUNCTION_ID: z.string().min(1),
});

type Env = z.infer<typeof envSxema>;

let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;

  const parsed = envSxema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join("."));
    throw new Error(`Missing or invalid env vars: ${missing.join(", ")}`);
  }

  cached = parsed.data;
  return cached;
}
