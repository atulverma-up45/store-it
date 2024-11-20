import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSessionClient } from "@/lib/appwrite";

export async function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get("appwrite-session");
  const currentPath = req.nextUrl.pathname;

  if (!sessionCookie) {
    // Redirect unauthenticated users to the sign-in page
    if (!["/sign-in", "/sign-up"].includes(currentPath)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    return NextResponse.next();
  }

  try {
    const { account } = await createSessionClient();
    await account.get(); // Validate the session

    // Redirect authenticated users away from sign-in or sign-up pages
    if (["/sign-in", "/sign-up"].includes(currentPath)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Session validation failed:", error);
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

// Apply middleware to all routes
export const config = {
  matcher: ["/:path*"], // Protect all routes
};
