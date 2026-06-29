import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { pathname } = request.nextUrl;

  if (session?.user) {
    if (pathname === "/login" || pathname === "/signup") {
      const { db } = await import("@/lib/db");
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { isOnboarded: true },
      });

      const redirectUrl = user?.isOnboarded ? "/editor" : "/editor";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  if (!session?.user) {
    if (pathname.startsWith("/editor")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/editor/:path*", "/login", "/signup"],
};

