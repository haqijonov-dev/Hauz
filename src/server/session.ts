// coockie bilan manashu joyda ishlaymiz
import "@tanstack/react-start/server-only";
import {
  deleteCookie,
  getCookie,
  setCookie,
} from "@tanstack/react-start/server";

const SESSION_COOKIE = "hauz_session";

export function readSessionSecret(): string | undefined {
  return getCookie(SESSION_COOKIE);
}

export function writeSessionCookie(secret: string, expiresAt: string) {
  setCookie(SESSION_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}
