import { NextRequest, NextResponse } from "next/server";

const DJANGO = process.env.DJANGO_BACKEND_URL ?? "http://127.0.0.1:8000";

function forwardSetCookies(from: Headers, to: NextResponse) {
  const list = typeof from.getSetCookie === "function" ? from.getSetCookie() : [];
  if (list.length) {
    for (const c of list) {
      to.headers.append("Set-Cookie", c);
    }
    return;
  }
  const legacy = from.get("set-cookie");
  if (legacy) {
    to.headers.append("Set-Cookie", legacy);
  }
}

export async function POST(request: NextRequest) {
  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }

  const host = request.headers.get("host") ?? "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "") ?? "http";

  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 25_000);
  let upstream: Response;
  try {
    upstream = await fetch(`${DJANGO}/api/auth/signup/`, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
        "X-Forwarded-Host": host,
        "X-Forwarded-Proto": proto
      },
      body,
      signal: ac.signal
    });
  } catch {
    return NextResponse.json(
      { detail: "Cannot reach the API server. Start Django: python manage.py runserver 127.0.0.1:8000" },
      { status: 503 }
    );
  } finally {
    clearTimeout(timeout);
  }

  const text = await upstream.text();
  const res = new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json"
    }
  });

  forwardSetCookies(upstream.headers, res);
  return res;
}
