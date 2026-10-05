"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

export default function SignInPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier, email: identifier, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Unable to sign in. Please try again.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("gleaz-user", JSON.stringify(result.user));
        try {
          window.dispatchEvent(new Event("gleaz-user-changed"));
        } catch (e) {}
      }

      toast.success(result?.message || "Signed in successfully.");
      router.push(result?.user?.role === "admin" ? "/admin" : "/");
    } catch (error: any) {
      toast.error(error?.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.06)] lg:grid-cols-2">
        <div className="bg-[linear-gradient(135deg,#111827,#1f2937)] p-8 text-white sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">Welcome back</p>
          <h1 className="mt-4 text-4xl font-black">Sign in to GLEAZ</h1>
          <p className="mt-4 max-w-md text-slate-300">
            Access your saved items, track recent orders, and keep up with the latest seasonal releases.
          </p>

          <div className="mt-10 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-lg font-bold">Fast checkout</p>
              <p className="mt-2 text-sm text-slate-300">Return to your shopping bag and place your next order in seconds.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-lg font-bold">Exclusive updates</p>
              <p className="mt-2 text-sm text-slate-300">Get early access to limited drops and private sale events.</p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 lg:p-12">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Account</p>
            <h2 className="mt-2 text-[3rem] font-black leading-none text-slate-900">Sign in</h2>
          </div>

          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Default admin login: <span className="font-bold text-slate-900">admin</span> / <span className="font-bold text-slate-900">admin123</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Email or username
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-[1.05rem] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white"
                placeholder="Enter your email or username"
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-[1.05rem] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white"
                placeholder="Enter your password"
                required
              />
            </label>

            <div className="flex items-center justify-between gap-4 pt-2 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-slate-900" />
                <span>Remember me</span>
              </label>
              <Link href="#" className="font-semibold text-slate-900 underline underline-offset-4">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              aria-label="Sign in to GLEAZ"
              disabled={loading}
              className="mt-4 block w-full rounded-2xl border border-[#0f172a] bg-[#0f172a] px-6 py-4 text-base font-semibold uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "LOGIN"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
            Don’t have an account? <Link href="/signup" className="font-semibold text-slate-900 underline underline-offset-4">Create one</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
