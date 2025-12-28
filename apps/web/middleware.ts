import { type NextRequest, NextResponse } from "next/server";
import { getSessionForMiddleware } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const { session, user } = await getSessionForMiddleware(req);

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard"],
};
