"use client";

import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShoppingBag, Store } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { api, getErrorMessage } from "@/lib/api";
import { safeNextPath } from "@/lib/format";
import { useAuth } from "@/store/auth";
import { toast } from "@/store/toast";
import type { AuthResponse } from "@/types";

type AccountType = "CUSTOMER" | "SELLER";

function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const setSession = useAuth((s) => s.setSession);

  const [role, setRole] = useState<AccountType>(sp.get("role") === "SELLER" ? "SELLER" : "CUSTOMER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Nama wajib diisi.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Format email tidak valid.";
    if (password.length < 8) next.password = "Password minimal 8 karakter.";
    if (confirm !== password) next.confirm = "Konfirmasi password tidak sama.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      setSession(data);
      toast.success("Akun berhasil dibuat.");
      router.replace(safeNextPath(sp.get("next")) ?? (data.role === "ROLE_SELLER" ? "/seller/dashboard" : "/"));
    } catch (err) {
      setApiError(getErrorMessage(err, "Pendaftaran gagal. Silakan coba lagi."));
      setLoading(false);
    }
  }

  const options: { value: AccountType; title: string; text: string; icon: typeof Store }[] = [
    { value: "CUSTOMER", title: "Pembeli", text: "Belanja dari berbagai toko.", icon: ShoppingBag },
    { value: "SELLER", title: "Penjual", text: "Buka toko dan jual produk.", icon: Store },
  ];

  return (
    <AuthShell
      title="Buat akun baru"
      subtitle="Daftar gratis sebagai pembeli atau penjual."
      panelTitle="Mulai berbelanja atau buka toko Anda hari ini."
      panelPoints={[
        "Pendaftaran cepat, tanpa biaya.",
        "Password disimpan terenkripsi.",
        "Penjual dapat langsung membuat toko dan menambah produk.",
      ]}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {apiError && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {apiError}
          </div>
        )}

        <fieldset>
          <legend className="label">Daftar sebagai</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((o) => (
              <label
                key={o.value}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 ${
                  role === o.value ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600" : "border-slate-300 bg-white hover:bg-slate-50"
                }`}
              >
                <input type="radio" name="role" value={o.value} checked={role === o.value} onChange={() => setRole(o.value)} className="sr-only" />
                <o.icon size={20} className={role === o.value ? "text-brand-700" : "text-slate-500"} />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{o.title}</span>
                  <span className="block text-xs text-slate-600">{o.text}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="name" className="label">Nama lengkap</label>
          <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="input" aria-invalid={!!errors.name} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="nama@email.com" aria-invalid={!!errors.email} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" aria-invalid={!!errors.password} />
            {errors.password ? <p className="field-error">{errors.password}</p> : <p className="mt-1 text-xs text-slate-500">Minimal 8 karakter.</p>}
          </div>
          <div>
            <label htmlFor="confirm" className="label">Konfirmasi password</label>
            <input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" aria-invalid={!!errors.confirm} />
            {errors.confirm && <p className="field-error">{errors.confirm}</p>}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading && <Loader2 size={18} className="animate-spin" />} Buat Akun
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">Masuk</Link>
      </p>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="page py-12" />}>
      <RegisterForm />
    </Suspense>
  );
}
