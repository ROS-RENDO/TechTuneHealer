"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProviderLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      if (data.user?.role?.toUpperCase() !== "PROVIDER") {
        setError("This portal is restricted to registered service workshop partners.");
        return;
      }

      localStorage.setItem("provider_token", data.token);
      localStorage.setItem("provider_user", JSON.stringify(data.user));
      router.push("/provider/dashboard");
    } catch {
      setError("Unable to connect to server. Please verify backend service is running.");
    } finally {
      setLoading(false);
    }
  };

  const autofillProvider = () => {
    setEmail("sokha@test.com");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-6 sm:p-10 antialiased selection:bg-slate-200">
      {/* Top Navbar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 hover:text-slate-700">
          <img src="/logo.png" alt="TechTune Healer" className="h-6 w-auto object-contain" />
          <span>TechTune <span className="text-slate-400 font-normal">/ Partner</span></span>
        </Link>
        <Link href="/" className="text-xs font-medium text-slate-500 hover:text-slate-900">
          ← Back
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-950 tracking-tight">Workshop Sign In</h1>
            <p className="text-xs text-slate-500 mt-1">Enter your credentials to access dispatch management</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@workshop.com"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700">Password</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition text-xs mt-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          {/* Autofill Demo */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Demo account:</span>
            <button
              type="button"
              onClick={autofillProvider}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Autofill credentials
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Need an account?{" "}
          <Link href="/provider/register" className="font-semibold text-slate-900 hover:underline">
            Register your workshop
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-slate-400">
        TechTune Healer Platform · Provider Access
      </div>
    </div>
  );
}
