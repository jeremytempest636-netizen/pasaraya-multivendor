"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, MapPin, Minus, Plus, ShoppingCart, Store } from "lucide-react";
import { PageSpinner } from "@/components/AuthGuard";
import EmptyState from "@/components/EmptyState";
import ProductImage from "@/components/ProductImage";
import { api, getErrorMessage, getStatus } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { toast } from "@/store/toast";
import type { Product } from "@/types";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useAuth((s) => s.user);
  const addToCart = useCart((s) => s.add);

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<{ notFound: boolean; message: string } | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setProduct(null);
    setError(null);
    setQty(1);
    api
      .get<Product>(`/products/${params.id}`)
      .then((r) => !cancelled && setProduct(r.data))
      .catch((e) => !cancelled && setError({ notFound: getStatus(e) === 404, message: getErrorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (error) {
    return (
      <div className="page py-10">
        <EmptyState
          icon={<ShoppingCart size={26} />}
          title={error.notFound ? "Produk tidak ditemukan" : "Gagal memuat produk"}
          description={error.notFound ? "Produk ini mungkin sudah dihapus oleh penjual." : error.message}
          action={
            <Link href="/products" className="btn btn-primary">
              Lihat Produk Lain
            </Link>
          }
        />
      </div>
    );
  }
  if (!product) return <PageSpinner />;

  const soldOut = product.stock === 0;
  const isSeller = hydrated && user?.role === "ROLE_SELLER";

  function toCartItem(p: Product) {
    return {
      productId: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      storeId: p.storeId,
      storeName: p.storeName,
      stock: p.stock,
    };
  }

  function onAdd() {
    if (!product) return;
    addToCart(toCartItem(product), qty);
    toast.success("Produk ditambahkan ke keranjang");
  }

  function onBuyNow() {
    if (!product) return;
    addToCart(toCartItem(product), qty);
    router.push("/checkout");
  }

  return (
    <div className="page py-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Beranda</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:text-brand-700">Produk</Link>
        {product.categoryName && (
          <>
            <ChevronRight size={14} />
            <Link href={`/products?categoryId=${product.categoryId}`} className="hover:text-brand-700">
              {product.categoryName}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="card overflow-hidden p-0">
          <ProductImage src={product.imageUrl} alt={product.name} className="aspect-square w-full" />
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl leading-snug font-bold text-slate-900">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-slate-900 tabular-nums">{formatRupiah(product.price)}</p>

          <dl className="mt-6 grid grid-cols-[110px_1fr] gap-y-3 border-t border-slate-200 pt-6 text-sm">
            <dt className="text-slate-500">Ketersediaan</dt>
            <dd className={soldOut ? "font-semibold text-red-700" : product.stock <= 5 ? "font-semibold text-amber-700" : "text-slate-800"}>
              {soldOut ? "Stok habis" : product.stock <= 5 ? `Tersisa ${product.stock} unit` : `Stok ${product.stock} unit`}
            </dd>
            {product.categoryName && (
              <>
                <dt className="text-slate-500">Kategori</dt>
                <dd className="text-slate-800">{product.categoryName}</dd>
              </>
            )}
            <dt className="text-slate-500">Dijual oleh</dt>
            <dd>
              <Link href={`/products?storeId=${product.storeId}`} className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
                <Store size={15} /> {product.storeName}
              </Link>
            </dd>
          </dl>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <p className="label">Jumlah</p>
            <div className="flex items-center">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1 || soldOut}
                aria-label="Kurangi jumlah"
                className="flex h-10 w-10 items-center justify-center rounded-l-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <Minus size={16} />
              </button>
              <span className="flex h-10 w-14 items-center justify-center border-y border-slate-300 bg-white text-sm font-semibold tabular-nums" aria-live="polite">
                {soldOut ? 0 : qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock || soldOut}
                aria-label="Tambah jumlah"
                className="flex h-10 w-10 items-center justify-center rounded-r-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
              {!soldOut && (
                <span className="ml-4 text-sm text-slate-500">
                  Subtotal <strong className="text-slate-900 tabular-nums">{formatRupiah(product.price * qty)}</strong>
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={onAdd} disabled={soldOut || isSeller} className="btn btn-outline btn-lg flex-1">
                <ShoppingCart size={18} /> Tambah ke Keranjang
              </button>
              <button onClick={onBuyNow} disabled={soldOut || isSeller} className="btn btn-primary btn-lg flex-1">
                Beli Sekarang
              </button>
            </div>
            {isSeller && (
              <p className="mt-3 text-sm text-slate-500">Akun penjual tidak dapat berbelanja. Masuk dengan akun pembeli untuk memesan.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="card p-6 sm:p-8">
          <h2 className="text-lg font-bold">Deskripsi produk</h2>
          <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-line text-slate-700">
            {product.description || "Penjual belum menambahkan deskripsi untuk produk ini."}
          </p>
        </section>
        <aside className="card h-fit p-6">
          <h2 className="text-sm font-semibold text-slate-900">Informasi penjual</h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-base font-bold text-slate-600">
              {product.storeName.charAt(0)}
            </span>
            <p className="text-sm font-semibold text-slate-900">{product.storeName}</p>
          </div>
          {product.storeAddress && (
            <p className="mt-4 flex gap-2 text-sm text-slate-600">
              <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" /> {product.storeAddress}
            </p>
          )}
          {product.storeDescription && <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.storeDescription}</p>}
          <Link href={`/products?storeId=${product.storeId}`} className="btn btn-secondary mt-5 w-full">
            Lihat produk toko ini
          </Link>
        </aside>
      </div>
    </div>
  );
}
