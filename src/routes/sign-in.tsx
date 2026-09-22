import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { requestCode, verifyCode } from "#/functions/auth";
import { viewerQueryOptions } from "#/functions/viewer";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestCodeFn = useServerFn(requestCode);
  const verifyCodeFn = useServerFn(verifyCode);

  const sendCode = useMutation({
    mutationFn: (email: string) => requestCodeFn({ data: { email } }),
    onSuccess: (result) => {
      if (result.ok) {
        setUserId(result.data.userId);
        setError(null);
      } else {
        setError(result.message);
      }
    },
    onError: () => setError("Enter a valid email address."),
  });

  const confirmCode = useMutation({
    mutationFn: (input: { userId: string; code: string }) =>
      verifyCodeFn({ data: input }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setError(result.message);
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: viewerQueryOptions.queryKey,
      });
      await navigate({ to: "/" });
    },
    onError: () => setError("The code has 6 digits."),
  });

  //   birinchi ekran email formasi
  if (userId === null) {
    return (
      <main>
        <h1>Sign in</h1>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendCode.mutate(email.trim());
          }}
        >
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={sendCode.isPending}>
            {sendCode.isPending ? "Sending…" : "Send code"}
          </button>
        </form>
      </main>
    );
  }

  //   ikkinchi ekran code formasi
  return (
    <main>
      <h1>Check your email</h1>
      <p>We sent a 6-digit code to {email}.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          confirmCode.mutate({ userId, code: code.trim() });
        }}
      >
        <label>
          Code
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={confirmCode.isPending}>
          {confirmCode.isPending ? "Checking…" : "Continue"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => {
          setUserId(null);
          setCode("");
          setError(null);
        }}
      >
        Use a different email
      </button>
    </main>
  );
}
