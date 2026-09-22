// coockie bilan manashu joyda ishlaymiz
import "@tanstack/react-start/server-only";
import {
  deleteCookie,
  getCookie,
  setCookie,
} from "@tanstack/react-start/server";

const SESSION_COOKIE = "hauz_session";

//cookieni tekshiradi agar cookieda mijoz kartasi bo'lmasa tizimga kirmagan hisoblanadi
export function readSessionSecret(): string | undefined {
  return getCookie(SESSION_COOKIE);
}
// keyingi qadamda mijoz muvofaqiyatli tizimga kirsa uni qo'liga konverta karta solib beramiz
export function writeSessionCookie(secret: string, expiresAt: string) {
  setCookie(SESSION_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

// mijozga berilingan konvertni va uni ichidagi kartani o'chirib tashlash
export function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}
