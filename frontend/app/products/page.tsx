"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import { api, getErrorMessage } from "@/lib/api";
import type { Category, PageResponse, Product, Store } from "@/types";

const SORTS = [
  { value: "newest", label: "Terbaru" },
  { value: "price_asc", label: "Harga terendah" },
  { value: "price_desc", label: "Harga tertinggi" },
  { value: "name", label: "Nama A–Z" },
];

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`block w-full rounded px-2.5 py-1.5 text-left text-sm ${
        active ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function ProductsContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const search = sp.get("search") ?? "";
  const categoryId = sp.get("categoryId");
  const storeId = sp.get("storeId");
  const sort = sp.get("sort") ?? "newest";
  const page = Math.max(0, Number(sp.get("page") ?? 0) || 0);

  const [data, setData] = useState<PageResponse<Product> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    api.get<Category[]>("/categories").then((r) => setCategories(r.data)).catch(() => {});
    api.get<Store[]>("/stores").then((r) => setStores(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    api
      .get<PageResponse<Product>>("/products", {
        params: { search: search || undefined, categoryId: categoryId ?? undefined, storeId: storeId ?? undefined, sort, page, size: 12 },
      })
      .then((r) => !cancelled && setData(r.data))
      .catch((e) => !cancelled && setError(getErrorMessage(e, "Gagal memuat produk.")));
    return () => {
      cancelled = true;
    };
  }, [search, categoryId, storeId, sort, page]);

  function update(next: Record<string, string | null>, keepPage = false) {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    }
    if (!keepPage) p.delete("page");
    const qs = p.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  }

  const activeCategory = categories.find((c) => String(c.id) === categoryId);
  const activeStore = stores.find((s) => String(s.id) === storeId);
  const hasFilters = !!(search || categoryId || storeId);

  const title = search ? `Hasil pencarian “${search}”` : activeCategory ? activeCategory.name : activeStore ? activeStore.storeName : "Semua Produk";

  return (
    <div className="page py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-slate-600" aria-live="polite">
            {data ? `${data.totalElements} produk ditemukan` : "Memuat produk…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFiltersOpen((o) => !o)} className="btn btn-secondary lg:hidden" aria-expanded={filtersOpen}>
            <SlidersHorizontal size={16} /> Filter
          </button>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">Urutkan</span>
            <select value={sort} onChange={(e) => update({ sort: e.target.value === "newest" ? null : e.target.value })} className="input h-10 w-auto pr-8">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {search && (
            <button onClick={() => update({ search: null })} className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white py-1 pr-2 pl-3 text-xs text-slate-700 hover:bg-slate-50">
              Kata kunci: {search} <X size={13} />
            </button>
          )}
          {activeCategory && (
            <button onClick={() => update({ categoryId: null })} className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white py-1 pr-2 pl-3 text-xs text-slate-700 hover:bg-slate-50">
              {activeCategory.name} <X size={13} />
            </button>
          )}
          {activeStore && (
            <button onClick={() => update({ storeId: null })} className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white py-1 pr-2 pl-3 text-xs text-slate-700 hover:bg-slate-50">
              {activeStore.storeName} <X size={13} />
            </button>
          )}
          <button onClick={() => update({ search: null, categoryId: null, storeId: null })} className="text-xs font-semibold text-brand-700 hover:underline">
            Hapus semua filter
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
          <div className="card divide-y divide-slate-200">
            <div className="p-4">
              <h2 className="mb-2 text-sm font-semibold">Kategori</h2>
              <FilterButton active={!categoryId} onClick={() => update({ categoryId: null })}>
                Semua kategori
              </FilterButton>
              {categories.map((c) => (
                <FilterButton key={c.id} active={String(c.id) === categoryId} onClick={() => update({ categoryId: String(c.id) })}>
                  {c.name}
                </FilterButton>
              ))}
            </div>
            <div className="p-4">
              <h2 className="mb-2 text-sm font-semibold">Toko</h2>
              <FilterButton active={!storeId} onClick={() => update({ storeId: null })}>
                Semua toko
              </FilterButton>
              {stores.map((s) => (
                <FilterButton key={s.id} active={String(s.id) === storeId} onClick={() => update({ storeId: String(s.id) })}>
                  {s.storeName}
                </FilterButton>
              ))}
            </div>
          </div>
        </aside>

        <section aria-label="Daftar produk">
          {error ? (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          ) : data === null ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : data.content.length === 0 ? (
            <EmptyState
              icon={<PackageSearch size={26} />}
              title="Produk tidak ditemukan"
              description="Coba kata kunci lain atau hapus beberapa filter untuk melihat lebih banyak produk."
              action={
                hasFilters ? (
                  <button className="btn btn-primary" onClick={() => update({ search: null, categoryId: null, storeId: null })}>
                    Hapus semua filter
                  </button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {data.content.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={(n) => {
                  update({ page: n === 0 ? null : String(n) }, true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="page py-6" />}>
      <ProductsContent />
    </Suspense>
  );
}
