import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { signOut } from "#/functions/auth";
import { viewerQueryOptions } from "#/functions/viewer";

export function SiteHeader() {
  const { data: viewer } = useSuspenseQuery(viewerQueryOptions);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const signOutFn = useServerFn(signOut);

  const logOut = useMutation({
    mutationFn: () => signOutFn({}),
    onSettled: async () => {
      // Cookie o'chdi, demak bu odam haqida saqlangan hech narsa yaroqli emas.
      queryClient.setQueryData(viewerQueryOptions.queryKey, null);
      await navigate({ to: "/" });
    },
  });

  return (
    <header className="site-header">
      <Link to="/">HAUZ</Link>

      {viewer ? (
        <div className="site-header__user">
          {viewer.account && <Link to="/profile">Profile</Link>}
          <span>{viewer.account?.firstName ?? viewer.user.email}</span>
          <button
            type="button"
            onClick={() => logOut.mutate()}
            disabled={logOut.isPending}
          >
            {logOut.isPending ? "Logging out…" : "Log out"}
          </button>
        </div>
      ) : (
        <Link to="/sign-in" search={{ redirect: location.href }}>
          Sign in
        </Link>
      )}
    </header>
  );
}
