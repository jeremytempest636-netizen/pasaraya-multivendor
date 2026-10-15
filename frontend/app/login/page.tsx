"use client";

import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { api, getErrorMessage } from "@/lib/api";
import { safeNextPath } from "@/lib/format";
import { useAuth } from "@/store/auth";
import { toast } from "@/store/toast";
import type { AuthResponse } from "@/types";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const setSession = useAuth((s) => s.setSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", { email: email.trim(), password });
      setSession(data);
      toast.success(`Selamat datang, ${data.name.split(" ")[0]}.`);
      router.replace(safeNextPath(sp.get("next")) ?? (data.role === "ROLE_SELLER" ? "/seller/dashboard" : "/"));
    } catch (err) {
      setError(getErrorMessage(err, "Login gagal. Periksa email dan password Anda."));
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("Password123!");
    setError(null);
  }

  return (
    <AuthShell
      title="Masuk ke akun Anda"
      subtitle="Gunakan email dan password yang terdaftar."
      panelTitle="Belanja dan berjualan dalam satu platform."
      panelPoints={[
        "Satu keranjang untuk produk dari banyak toko.",
        "Pantau status pesanan secara langsung.",
        "Kelola produk, stok, dan pesanan masuk sebagai penjual.",
      ]}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {error && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="nama@email.com" />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading && <Loader2 size={18} className="animate-spin" />} Masuk
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">Daftar sekarang</Link>
      </p>

      <div className="mt-8 rounded-md border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-800">Akun demo (data contoh)</p>
        <p className="mt-1">Password untuk semua akun demo: Password123!</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => fillDemo("customer@demo.com")} className="btn btn-secondary btn-sm">Isi akun pembeli</button>
          <button type="button" onClick={() => fillDemo("seller1@demo.com")} className="btn btn-secondary btn-sm">Isi akun penjual</button>
        </div>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="page py-12" />}>
      <LoginForm />
    </Suspense>
  );
}
