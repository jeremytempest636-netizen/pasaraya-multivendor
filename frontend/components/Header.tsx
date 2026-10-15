"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronDown, ClipboardList, LayoutDashboard, LogOut, Search, ShoppingCart } from "lucide-react";
import { api } from "@/lib/api";
import { SITE_NAME } from "@/lib/config";
import { useHydrated } from "@/lib/hooks";
import { useAuth } from "@/store/auth";
import { selectCount, useCart } from "@/store/cart";
import type { Category } from "@/types";

export default function Header() {
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const cartCount = useCart(selectCount);

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get<Category[]>("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  }

  function onLogout() {
    setMenuOpen(false);
    logout();
    router.push("/");
  }

  const isSeller = user?.role === "ROLE_SELLER";
  const showCart = !isSeller;

  const searchForm = (
    <form onSubmit={onSearch} role="search" className="flex w-full">
      <label htmlFor="site-search" className="sr-only">
        Cari produk
      </label>
      <input
        id="site-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari produk, misalnya headphone atau sepatu lari"
        className="h-11 min-w-0 flex-1 rounded-l-md border border-r-0 border-slate-300 bg-white px-4 text-sm placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Cari"
        className="flex h-11 w-12 items-center justify-center rounded-r-md bg-brand-600 text-white transition-colors hover:bg-brand-700"
      >
        <Search size={18} />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="hidden bg-brand-950 text-xs text-slate-300 md:block">
        <div className="page flex h-8 items-center justify-between">
          <span>Marketplace multi-penjual. Pembayaran berjalan dalam mode simulasi.</span>
          <div className="flex items-center gap-5">
            <Link href="/register?role=SELLER" className="hover:text-white">
              Jual di {SITE_NAME}
            </Link>
            <Link href="/orders" className="hover:text-white">
              Pesanan Saya
            </Link>
          </div>
        </div>
      </div>

      <div className="page flex items-center gap-4 py-3 md:gap-8">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`${SITE_NAME} beranda`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-lg font-bold text-white">
            P
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">{SITE_NAME}</span>
        </Link>

        <div className="hidden max-w-3xl flex-1 md:block">{searchForm}</div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {showCart && (
            <Link
              href="/cart"
              aria-label="Keranjang"
              className="relative flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
            >
              <ShoppingCart size={22} />
              {hydrated && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] leading-none font-semibold text-white tabular-nums">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {hydrated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-800 md:block">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown size={16} className="text-slate-500" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                    <p className="mt-1 text-xs font-medium text-brand-700">
                      {isSeller ? "Akun Penjual" : "Akun Pembeli"}
                    </p>
                  </div>
                  {isSeller ? (
                    <Link
                      role="menuitem"
                      href="/seller/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard size={16} /> Dashboard Penjual
                    </Link>
                  ) : (
                    <Link
                      role="menuitem"
                      href="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <ClipboardList size={16} /> Pesanan Saya
                    </Link>
                  )}
                  <button
                    role="menuitem"
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            hydrated && (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn btn-secondary btn-sm sm:h-10 sm:px-4 sm:text-sm">
                  Masuk
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm sm:h-10 sm:px-4 sm:text-sm">
                  Daftar
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      <div className="page pb-3 md:hidden">{searchForm}</div>

      <nav aria-label="Kategori" className="border-t border-slate-200">
        <div className="page flex gap-1 overflow-x-auto">
          <Link
            href="/products"
            className="shrink-0 px-3 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 hover:text-brand-700"
          >
            Semua Produk
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?categoryId=${c.id}`}
              className="shrink-0 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-700"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
