import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirects plain HTTP to HTTPS in production. Relies on the `x-forwarded-proto`
 * header set by the reverse proxy in front of the app (standard on VPS setups
 * with nginx/Caddy, as well as most PaaS providers) — skipped entirely in dev,
 * where there is no TLS-terminating proxy and the header isn't present anyway.
 */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  const proto = request.headers.get("x-forwarded-proto");
  if (proto && proto !== "https") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
