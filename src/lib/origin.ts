import "server-only";
import { headers } from "next/headers";

/** Best-effort request origin, for building absolute links (e.g. in emails). */
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}
