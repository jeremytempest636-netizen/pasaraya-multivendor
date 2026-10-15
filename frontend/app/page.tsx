"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  CookingPot,
  Cpu,
  Dumbbell,
  Package,
  ReceiptText,
  Shirt,
  ShoppingBasket,
  Sparkles,
  Store as StoreIcon,
  type LucideIcon,
} from "lucide-react";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import type { Category, PageResponse, Product, Store } from "@/types";

const categoryIcons: Record<string, LucideIcon> = {
  Elektronik: Cpu,
  Fashion: Shirt,
  "Rumah & Dapur": CookingPot,
  Olahraga: Dumbbell,
  Kecantikan: Sparkles,
  "Buku & Alat Tulis": BookOpen,
};

const valueProps = [
  { icon: ShoppingBasket, title: "Satu keranjang, banyak toko", text: "Produk dari penjual berbeda dibayar dalam satu kali checkout." },
  { icon: ReceiptText, title: "Harga transparan", text: "Total dihitung dari harga terkini dan stok dicek saat pesanan dibuat." },
  { icon: ClipboardCheck, title: "Status pesanan jelas", text: "Pantau dari menunggu pembayaran, dikirim, hingga selesai." },
  { icon: StoreIcon, title: "Buka toko sendiri", text: "Kelola produk, stok, dan pesanan masuk dari dashboard penjual." },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      api.get<PageResponse<Product>>("/products", { params: { size: 10, sort: "newest" } }),
      api.get<Category[]>("/categories"),
      api.get<Store[]>("/stores"),
    ]).then(([p, c, s]) => {
      if (cancelled) return;
      if (p.status === "fulfilled") {
        setProducts(p.value.data.content);
        setTotal(p.value.data.totalElements);
      } else {
        setProducts([]);
        setFailed(true);
      }
      if (c.status === "fulfilled") setCategories(c.value.data);
      if (s.status === "fulfilled") setStores(s.value.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page space-y-12 py-6">
      {/* Hero */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col justify-between rounded-lg bg-brand-900 p-8 text-white sm:p-10 lg:col-span-2">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-brand-200 uppercase">Marketplace multi-penjual</p>
            <h1 className="mt-4 max-w-xl text-3xl leading-tight font-bold sm:text-4xl">
              Satu keranjang untuk semua toko.
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-300">
              Bandingkan produk dari berbagai penjual, bayar sekali, dan pantau status setiap pesanan dari satu tempat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn btn-lg bg-white text-brand-900 hover:bg-slate-100">
                Mulai Belanja <ArrowRight size={18} />
              </Link>
              <Link
                href="/register?role=SELLER"
                className="btn btn-lg border border-white/40 text-white hover:bg-white/10"
              >
                Buka Toko Anda
              </Link>
            </div>
          </div>
          <dl className="mt-10 flex gap-10 border-t border-white/15 pt-6">
            <div>
              <dt className="text-xs text-slate-400">Produk tersedia</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{total ?? "–"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Toko aktif</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{stores.length || "–"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Kategori</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{categories.length || "–"}</dd>
            </div>
          </dl>
        </div>

        <div className="card flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold">Baru masuk</h2>
            <Link href="/products" className="text-xs font-semibold text-brand-700 hover:underline">
              Lihat semua
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {products === null
              ? Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex gap-3 px-5 py-3" aria-hidden>
                    <div className="h-14 w-14 animate-pulse rounded bg-slate-100" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                    </div>
                  </li>
                ))
              : products.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <Link href={`/products/${p.id}`} className="flex gap-3 px-5 py-3 hover:bg-slate-50">
                      <ProductImage src={p.imageUrl} alt={p.name} className="h-14 w-14 shrink-0 rounded" />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm leading-5 text-slate-800">{p.name}</p>
                        <p className="mt-0.5 text-sm font-bold tabular-nums">{formatRupiah(p.price)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
          </ul>
        </div>
      </section>

      {failed && (
        <div role="alert" className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Tidak dapat memuat data dari server. Pastikan backend berjalan di {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}.
        </div>
      )}

      {/* Kategori */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-xl font-bold">Belanja per kategori</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => {
              const Icon = categoryIcons[c.name] ?? Package;
              return (
                <Link
                  key={c.id}
                  href={`/products?categoryId=${c.id}`}
                  className="card flex items-center gap-3 p-4 transition-colors hover:border-brand-600"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <Icon size={20} />
                  </span>
                  <span className="text-sm font-medium text-slate-800">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Produk terbaru */}
      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">Produk terbaru</h2>
          <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
            Lihat semua <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products === null
            ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Toko */}
      {stores.length > 0 && (
        <section>
          <h2 className="text-xl font-bold">Toko di Pasaraya</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {stores.slice(0, 6).map((s) => (
              <Link
                key={s.id}
                href={`/products?storeId=${s.id}`}
                className="card flex gap-4 p-5 transition-colors hover:border-brand-600"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-slate-100 text-lg font-bold text-slate-600">
                  {s.storeName.charAt(0)}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-900">{s.storeName}</h3>
                  {s.address && <p className="mt-0.5 truncate text-xs text-slate-500">{s.address}</p>}
                  {s.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{s.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Keunggulan */}
      <section className="card grid divide-y divide-slate-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {valueProps.map((v) => (
          <div key={v.title} className="flex gap-4 p-6">
            <v.icon size={24} className="mt-0.5 shrink-0 text-brand-700" strokeWidth={1.75} />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{v.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{v.text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
