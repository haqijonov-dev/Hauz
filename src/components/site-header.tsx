import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { viewerQueryOptions } from "#/functions/viewer";

export function SiteHeader() {
  const { data: viewer } = useSuspenseQuery(viewerQueryOptions);

  return (
    <header className="site-header">
      <Link to="/">HAUZ</Link>

      {viewer ? (
        <div className="site-header__user">
          <span>{viewer.account?.firstName ?? viewer.user.email}</span>
          {/* Wired up in step 7. */}
          <button type="button">Log out</button>
        </div>
      ) : (
        <Link to="/sign-in">Sign in</Link>
      )}
    </header>
  );
}
