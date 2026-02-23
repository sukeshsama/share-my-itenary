"use client";

import { useState }  from "react";
import { useRouter } from "next/navigation";
import Link          from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      router.push("/login?registered=1");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl">✈️</span>
          <h1 className="text-2xl font-bold text-slate-800 mt-2">Create an account</h1>
          <p className="text-sm text-slate-500 mt-1">Start tracking your travel expenses</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                className="input"
                placeholder="Your name"
                required
                value={form.name}
                onChange={set("name")}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={set("email")}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Min. 6 characters"
                required
                minLength={6}
                value={form.password}
                onChange={set("password")}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center w-full disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
