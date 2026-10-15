"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { useHydrated } from "@/lib/hooks";
import { useAuth } from "@/store/auth";
import type { Role } from "@/types";

export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-slate-400" role="status" aria-label="Memuat">
      <Loader2 className="animate-spin" size={28} />
    </div>
  );
}

export default function AuthGuard({ role, children }: { role?: Role; children: ReactNode }) {
  const hydrated = useHydrated();
  const user = useAuth((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, user, router, pathname]);

  if (!hydrated || !user) return <PageSpinner />;

  if (role && user.role !== role) {
    return (
      <div className="page py-16">
        <div className="card mx-auto max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto text-amber-600" size={36} />
          <h1 className="mt-4 text-lg font-semibold">Halaman tidak tersedia untuk akun ini</h1>
          <p className="mt-2 text-sm text-slate-600">
            {role === "ROLE_SELLER"
              ? "Halaman ini khusus untuk akun Penjual."
              : "Halaman ini khusus untuk akun Pembeli."}
          </p>
          <Link href="/" className="btn btn-primary mt-6">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
