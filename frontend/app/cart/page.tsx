"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Store, Trash2 } from "lucide-react";
import { PageSpinner } from "@/components/AuthGuard";
import CheckoutSteps from "@/components/CheckoutSteps";
import EmptyState from "@/components/EmptyState";
import ProductImage from "@/components/ProductImage";
import { formatRupiah } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { useAuth } from "@/store/auth";
import { selectCount, selectSubtotal, useCart } from "@/store/cart";
import type { CartItem } from "@/types";

export default function CartPage() {
  const hydrated = useHydrated();
  const user = useAuth((s) => s.user);
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);

  if (!hydrated) return <PageSpinner />;

  if (items.length === 0) {
    return (
      <div className="page py-10">
        <EmptyState
          icon={<ShoppingCart size={26} />}
          title="Keranjang Anda masih kosong"
          description="Temukan produk dari berbagai toko dan tambahkan ke keranjang."
          action={
            <Link href="/products" className="btn btn-primary">
              Mulai Belanja
            </Link>
          }
        />
      </div>
    );
  }

  const groups = new Map<number, { storeName: string; items: CartItem[] }>();
  for (const item of items) {
    const g = groups.get(item.storeId) ?? { storeName: item.storeName, items: [] };
    g.items.push(item);
    groups.set(item.storeId, g);
  }

  const isSeller = user?.role === "ROLE_SELLER";

  return (
    <div className="page py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Keranjang belanja</h1>
        <CheckoutSteps current={0} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {[...groups.entries()].map(([storeId, group]) => (
            <section key={storeId} className="card overflow-hidden">
              <h2 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-800">
                <Store size={16} className="text-slate-500" /> {group.storeName}
              </h2>
              <ul className="divide-y divide-slate-100">
                {group.items.map((item) => (
                  <li key={item.productId} className="flex gap-4 p-5">
                    <Link href={`/products/${item.productId}`} className="shrink-0">
                      <ProductImage src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-md" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 sm:max-w-xs">
                        <Link href={`/products/${item.productId}`} className="line-clamp-2 text-sm font-medium text-slate-900 hover:text-brand-700">
                          {item.name}
                        </Link>
                        <p className="mt-1 text-sm text-slate-600 tabular-nums">{formatRupiah(item.price)}</p>
                        {item.quantity >= item.stock && <p className="mt-1 text-xs text-amber-700">Jumlah maksimum sesuai stok</p>}
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex items-center">
                          <button
                            onClick={() => setQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label={`Kurangi jumlah ${item.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-l-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="flex h-9 w-11 items-center justify-center border-y border-slate-300 bg-white text-sm font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            aria-label={`Tambah jumlah ${item.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-r-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="w-28 text-right text-sm font-bold text-slate-900 tabular-nums">
                          {formatRupiah(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => remove(item.productId)}
                          aria-label={`Hapus ${item.name} dari keranjang`}
                          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-40">
          <h2 className="text-base font-semibold">Ringkasan belanja</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Total harga ({count} barang)</dt>
              <dd className="font-medium tabular-nums">{formatRupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-4 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold tabular-nums">{formatRupiah(subtotal)}</dd>
            </div>
          </dl>
          {isSeller ? (
            <p className="mt-5 rounded-md bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
              Akun penjual tidak dapat melakukan checkout. Masuk dengan akun pembeli.
            </p>
          ) : (
            <Link href="/checkout" className="btn btn-primary btn-lg mt-6 w-full">
              Lanjut ke Checkout
            </Link>
          )}
          <Link href="/products" className="mt-3 block text-center text-sm font-semibold text-brand-700 hover:underline">
            Lanjut belanja
          </Link>
        </aside>
      </div>
    </div>
  );
}
