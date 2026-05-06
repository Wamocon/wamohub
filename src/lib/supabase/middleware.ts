import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the auth session on every request and provides a Supabase client
 * bound to the request's cookies. Imported by the root `middleware.ts`.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: (process.env.SUPABASE_DB_SCHEMA as "public") || "public" },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touching auth.getUser() refreshes the session if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = new URL(request.url);
  const isAuthRoute = url.pathname.startsWith("/login") || url.pathname.startsWith("/auth");
  const isPublicAsset =
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/favicon") ||
    url.pathname.startsWith("/api/health");

  if (!user && !isAuthRoute && !isPublicAsset) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", url.pathname + url.search);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute && url.pathname !== "/auth/reset-password") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
