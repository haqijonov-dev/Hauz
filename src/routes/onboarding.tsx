import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { createAccount } from "#/functions/account";
import { viewerQueryOptions } from "#/functions/viewer";
import type { Role } from "#/server/personal-account";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: ({ context }) => {
    if (!context.viewer) {
      throw redirect({ to: "/sign-in" });
    }
    if (context.viewer.account) {
      throw redirect({ to: "/" });
    }
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const createAccountFn = useServerFn(createAccount);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = useMutation({
    mutationFn: (input: { firstName: string; lastName: string; role: Role }) =>
      createAccountFn({ data: input }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setError(result.error.message);
        setFieldErrors(
          Object.fromEntries(
            (result.error.issues ?? []).map((issue) => [
              issue.field,
              issue.message,
            ]),
          ),
        );
        return;
      }

      await queryClient.fetchQuery({ ...viewerQueryOptions, staleTime: 0 });
      await navigate({ to: "/" });
    },
    onError: () => setError("Check the form and try again."),
  });

  return (
    <main>
      <h1>Tell us who you are</h1>
      <p>You only do this once.</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          setFieldErrors({});

          if (role === "") {
            setError("Choose a role.");
            return;
          }

          submit.mutate({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            role,
          });
        }}
      >
        <label>
          First name
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            required
          />
        </label>
        {fieldErrors.firstName && <p role="alert">{fieldErrors.firstName}</p>}

        <label>
          Last name
          <input
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            required
          />
        </label>
        {fieldErrors.lastName && <p role="alert">{fieldErrors.lastName}</p>}

        <fieldset>
          <legend>I am a</legend>
          <label>
            <input
              type="radio"
              name="role"
              value="property_owner"
              checked={role === "property_owner"}
              onChange={() => setRole("property_owner")}
            />
            Property Owner
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="realtor"
              checked={role === "realtor"}
              onChange={() => setRole("realtor")}
            />
            Realtor
          </label>
        </fieldset>
        {fieldErrors.role && <p role="alert">{fieldErrors.role}</p>}

        <p>You cannot change your role later.</p>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={submit.isPending}>
          {submit.isPending ? "Creating…" : "Continue"}
        </button>
      </form>
    </main>
  );
}
