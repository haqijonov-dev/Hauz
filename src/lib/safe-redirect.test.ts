import { describe, expect, it } from "vitest";

import { safeRedirect } from "./safe-redirect";

describe("safeRedirect", () => {
  it("keeps internal paths", () => {
    expect(safeRedirect("/profile")).toBe("/profile");
    expect(safeRedirect("/profile?tab=bio")).toBe("/profile?tab=bio");
    expect(safeRedirect("/onboarding#role")).toBe("/onboarding#role");
  });

  it("rejects absolute urls", () => {
    expect(safeRedirect("https://evil.example")).toBe("/");
    expect(safeRedirect("http://evil.example/profile")).toBe("/");
  });

  it("rejects protocol-relative and backslash tricks", () => {
    expect(safeRedirect("//evil.example")).toBe("/");
    expect(safeRedirect("/\\evil.example")).toBe("/");
    expect(safeRedirect("/\tevil")).toBe("/");
  });

  it("rejects other schemes", () => {
    expect(safeRedirect("javascript:alert(1)")).toBe("/");
    expect(safeRedirect("data:text/html,hi")).toBe("/");
  });

  it("rejects anything that is not a path", () => {
    expect(safeRedirect("profile")).toBe("/");
    expect(safeRedirect("")).toBe("/");
    expect(safeRedirect(undefined)).toBe("/");
    expect(safeRedirect(null)).toBe("/");
    expect(safeRedirect(42)).toBe("/");
  });

  it("uses the fallback it is given", () => {
    expect(safeRedirect("https://evil.example", "/profile")).toBe("/profile");
  });
});
