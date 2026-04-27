"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPost } from "../lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dashboardForRole = (role: string | undefined) => {
    if (role === "admin") return "/admin";
    if (role === "doctor") return "/doctor";
    return "/user";
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);
    try {
      const user = await apiPost<{ profile?: { role?: string } }>(
        "/auth/login/",
        { username, password },
        { skipCsrf: true }
      );
      const dest = dashboardForRole(user?.profile?.role);
      // Hard navigation so middleware runs with cookies the browser just stored
      window.location.replace(dest);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 pt-24 pb-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl card-pro">
          <h1 className="text-3xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Sign in to your CuraWise workspace.</p>
            <p className="mt-1 text-xs text-slate-500 italic">Test: admin / admin123</p>

          <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink">Username</span>
              <input
                className="rounded-xl border border-slate-200 p-3 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="Username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink">Password</span>
              <input
                className="rounded-xl border border-slate-200 p-3 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="Password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {message && <p className="text-sm text-red-600">{message}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className={`rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg hover:bg-accentDeep focus:outline-none focus:ring-4 focus:ring-accent/10 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            <Link className="font-semibold text-accentDeep transition-colors hover:text-accent hover:underline" href="/signup">
              New here? Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
