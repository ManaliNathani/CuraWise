import { NextRequest, NextResponse } from "next/server";

const API_BASE = "http://localhost:8000/api";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("sessionid")?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const res = await fetch(`${API_BASE}/auth/me/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Cookie": `sessionid=${session}`,
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const data = await res.json();
    const role = data?.profile?.role;

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const doctorApproved = data?.doctor_approved;

    if (pathname.startsWith("/doctor") && role !== "doctor" && role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/doctor") && role === "doctor" && doctorApproved !== true) {
      return NextResponse.redirect(new URL("/onboarding?pending=doctor-approval", request.url));
    }
    if (pathname.startsWith("/user") && role !== "user") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth check failed:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Include exact paths (/user, /doctor, /admin) — :path* alone can miss the bare route in some Next versions.
export const config = {
  matcher: [
    "/user",
    "/user/:path*",
    "/doctor",
    "/doctor/:path*",
    "/admin",
    "/admin/:path*",
    "/onboarding"
  ]
};
