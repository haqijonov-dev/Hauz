import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { updateAccount } from "#/functions/account";
import { viewerQueryOptions } from "#/functions/viewer";
import type { PersonalAccount } from "#/server/personal-account";

const roleLabels = {
  property_owner: "Property Owner",
  realtor: "Realtor",
} as const;

export const Route = createFileRoute("/profile")({
  beforeLoad: ({ context }) => {
    if (!context.viewer) {
      throw redirect({ to: "/sign-in", search: { redirect: "/profile" } });
    }
    if (!context.viewer.account) {
      throw redirect({ to: "/onboarding", search: { redirect: "/profile" } });
    }
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { data: viewer } = useSuspenseQuery(viewerQueryOptions);

  return <ProfileForm account={viewer!.account!} />;
}

function ProfileForm({ account }: { account: PersonalAccount }) {
  const queryClient = useQueryClient();
  const updateAccountFn = useServerFn(updateAccount);

  const [firstName, setFirstName] = useState(account.firstName);
  const [lastName, setLastName] = useState(account.lastName);
  const [contactEmail, setContactEmail] = useState(account.contactEmail ?? "");
  const [bio, setBio] = useState(account.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  // Bo'sh maydon "tozala" degani, Function buni null deb tushunadi.
  const emptyToNull = (value: string) =>
    value.trim() === "" ? null : value.trim();

  const changes: Record<string, string | null> = {};
  if (firstName.trim() !== account.firstName)
    changes.firstName = firstName.trim();
  if (lastName.trim() !== account.lastName) changes.lastName = lastName.trim();
  if (emptyToNull(contactEmail) !== account.contactEmail) {
    changes.contactEmail = emptyToNull(contactEmail);
  }
  if (emptyToNull(bio) !== account.bio) changes.bio = emptyToNull(bio);

  const hasChanges = Object.keys(changes).length > 0;

  const save = useMutation({
    mutationFn: (input: Record<string, string | null>) =>
      updateAccountFn({ data: input }),
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

      // Forma uchun haqiqat manbai Function qaytargan javob bo'ladi.
      setFirstName(result.account.firstName);
      setLastName(result.account.lastName);
      setContactEmail(result.account.contactEmail ?? "");
      setBio(result.account.bio ?? "");
      setSaved(true);

      await queryClient.fetchQuery({ ...viewerQueryOptions, staleTime: 0 });
    },
    onError: () => setError("Check the form and try again."),
  });

  return (
    <main>
      <h1>Your profile</h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          setFieldErrors({});
          setSaved(false);
          save.mutate(changes);
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

        <label>
          Contact email (optional)
          <input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            autoComplete="email"
          />
        </label>
        {fieldErrors.contactEmail && (
          <p role="alert">{fieldErrors.contactEmail}</p>
        )}

        <label>
          Bio (optional)
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            maxLength={2000}
          />
        </label>
        {fieldErrors.bio && <p role="alert">{fieldErrors.bio}</p>}

        <p>Role: {roleLabels[account.role]} (cannot be changed)</p>

        {error && <p role="alert">{error}</p>}
        {saved && !hasChanges && <p role="status">Saved.</p>}

        <button type="submit" disabled={!hasChanges || save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </button>
      </form>
    </main>
  );
}
