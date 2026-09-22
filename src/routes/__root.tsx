import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";

import { SiteHeader } from "#/components/site-header";
import { viewerQueryOptions } from "#/functions/viewer";
import appCss from "../styles.css?url";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HAUZ" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  beforeLoad: async ({ context }) => {
    const viewer =
      await context.queryClient.ensureQueryData(viewerQueryOptions);
    return { viewer };
  },
  shellComponent: RootDocument,
  component: RootLayout,
  errorComponent: RootError,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootLayout() {
  return (
    <>
      <SiteHeader />
      <Outlet />
    </>
  );
}

function RootError({ reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <main>
      <h1>Something went wrong</h1>
      <p>We couldn't load your session. Check your connection and try again.</p>
      <button
        type="button"
        onClick={() => {
          reset();
          router.invalidate();
        }}
      >
        Try again
      </button>
    </main>
  );
}
