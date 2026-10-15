"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, ClipboardList, Package, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import AuthGuard, { PageSpinner } from "@/components/AuthGuard";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import ProductImage from "@/components/ProductImage";
import ProductFormModal from "@/components/seller/ProductFormModal";
import StoreSetup from "@/components/seller/StoreSetup";
import StatusBadge from "@/components/StatusBadge";
import { api, getErrorMessage, getStatus } from "@/lib/api";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { toast } from "@/store/toast";
import type { Category, Order, Product, Store } from "@/types";

type Tab = "products" | "orders";

function StatCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const [store, setStore] = useState<Store | null | undefined>(undefined); // undefined = memuat, null = belum ada
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("products");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [shipping, setShipping] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [p, o] = await Promise.all([api.get<Product[]>("/stores/my-products"), api.get<Order[]>("/orders")]);
      setProducts(p.data);
      setOrders(o.data);
      setLoadError(null);
    } catch (e) {
      setLoadError(getErrorMessage(e, "Gagal memuat data toko."));
    }
  }, []);

  useEffect(() => {
    api.get<Category[]>("/categories").then((r) => setCategories(r.data)).catch(() => {});
    api
      .get<Store>("/stores/me")
      .then((r) => {
        setStore(r.data);
        return loadData();
      })
      .catch((e) => {
        if (getStatus(e) === 404) setStore(null);
        else {
          setStore(null);
          setLoadError(getErrorMessage(e));
        }
      });
  }, [loadData]);

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => ["PAID", "SHIPPED", "COMPLETED"].includes(o.status))
      .reduce((n, o) => n + o.totalPrice, 0);
    return {
      revenue,
      toShip: orders.filter((o) => o.status === "PAID").length,
      lowStock: products.filter((p) => p.stock <= 5).length,
    };
  }, [orders, products]);

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.delete(`/products/${deleting.id}`);
      toast.success("Produk dihapus.");
      setDeleting(null);
      await loadData();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function confirmShip() {
    if (!shipping) return;
    setBusy(true);
    try {
      await api.patch(`/orders/${shipping.id}/status`, { status: "SHIPPED" });
      toast.success(`Pesanan #${shipping.id} ditandai dikirim.`);
      setShipping(null);
      await loadData();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (store === undefined) return <PageSpinner />;
  if (store === null && !loadError) {
    return (
      <StoreSetup
        onCreated={(s) => {
          setStore(s);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="page py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Dashboard penjual</p>
          <h1 className="text-2xl font-bold">{store?.storeName}</h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      {loadError && (
        <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Total produk" value={String(products.length)} />
        <StatCard icon={ClipboardList} label="Perlu dikirim" value={String(stats.toShip)} />
        <StatCard icon={Boxes} label="Stok menipis (≤ 5)" value={String(stats.lowStock)} />
        <StatCard icon={Wallet} label="Pendapatan (sudah dibayar)" value={formatRupiah(stats.revenue)} />
      </div>

      <div className="mt-8 border-b border-slate-200" role="tablist">
        {(
          [
            ["products", `Produk (${products.length})`],
            ["orders", `Pesanan masuk (${orders.length})`],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold ${
              tab === key ? "border-brand-600 text-brand-700" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "products" ? (
          products.length === 0 ? (
            <EmptyState
              icon={<Package size={26} />}
              title="Belum ada produk"
              description="Tambahkan produk pertama Anda agar tampil di katalog."
              action={
                <button className="btn btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
                  <Plus size={18} /> Tambah Produk
                </button>
              }
            />
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="th">Produk</th>
                    <th className="th">Kategori</th>
                    <th className="th text-right">Harga</th>
                    <th className="th text-right">Stok</th>
                    <th className="th text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <ProductImage src={p.imageUrl} alt={p.name} className="h-12 w-12 shrink-0 rounded" />
                          <Link href={`/products/${p.id}`} className="line-clamp-2 max-w-xs font-medium text-slate-900 hover:text-brand-700">
                            {p.name}
                          </Link>
                        </div>
                      </td>
                      <td className="td">{p.categoryName ?? <span className="text-slate-400">-</span>}</td>
                      <td className="td text-right tabular-nums">{formatRupiah(p.price)}</td>
                      <td className="td text-right tabular-nums">
                        {p.stock === 0 ? (
                          <span className="font-semibold text-red-700">Habis</span>
                        ) : p.stock <= 5 ? (
                          <span className="font-semibold text-amber-700">{p.stock}</span>
                        ) : (
                          p.stock
                        )}
                      </td>
                      <td className="td">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { setEditing(p); setFormOpen(true); }}
                            aria-label={`Ubah ${p.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleting(p)}
                            aria-label={`Hapus ${p.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} />}
            title="Belum ada pesanan masuk"
            description="Pesanan yang berisi produk toko Anda akan tampil di sini."
          />
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <article key={o.id} className="card overflow-hidden">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="font-semibold">Pesanan #{o.id}</span>
                    <span className="text-slate-600">{o.customerName}</span>
                    <span className="text-slate-500">{formatDateTime(o.createdAt)}</span>
                  </div>
                  <StatusBadge status={o.status} />
                </header>
                <div className="grid gap-5 p-5 md:grid-cols-[1fr_260px]">
                  <ul className="space-y-3">
                    {o.items.map((i) => (
                      <li key={i.productId} className="flex items-center gap-3">
                        <ProductImage src={i.imageUrl} alt={i.productName} className="h-12 w-12 shrink-0 rounded" />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium">{i.productName}</p>
                          <p className="text-xs text-slate-500 tabular-nums">{i.quantity} × {formatRupiah(i.price)}</p>
                        </div>
                        <p className="text-sm font-semibold tabular-nums">{formatRupiah(i.subtotal)}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="border-slate-200 text-sm md:border-l md:pl-5">
                    <p className="text-xs font-semibold text-slate-500">Alamat pengiriman</p>
                    <p className="mt-1 leading-relaxed whitespace-pre-line text-slate-700">{o.shippingAddress}</p>
                  </div>
                </div>
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
                  <p className="text-sm text-slate-600">
                    Nilai untuk toko Anda <strong className="text-slate-900 tabular-nums">{formatRupiah(o.totalPrice)}</strong>
                  </p>
                  {o.status === "PAID" ? (
                    <button className="btn btn-primary btn-sm" onClick={() => setShipping(o)}>Tandai Dikirim</button>
                  ) : o.status === "PENDING" ? (
                    <span className="text-xs text-slate-500">Menunggu pembayaran pembeli</span>
                  ) : null}
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>

      <ProductFormModal
        open={formOpen}
        product={editing}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          loadData();
        }}
      />
      <ConfirmDialog
        open={!!deleting}
        loading={busy}
        danger
        title="Hapus produk?"
        message={`“${deleting?.name}” akan dihapus dari katalog. Produk yang sudah pernah dipesan tidak dapat dihapus; ubah stok menjadi 0 untuk menonaktifkannya.`}
        confirmLabel="Ya, Hapus"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
      <ConfirmDialog
        open={!!shipping}
        loading={busy}
        title="Tandai pesanan dikirim?"
        message={`Pesanan #${shipping?.id} akan berstatus Dikirim dan pembeli dapat melihat pembaruannya.`}
        confirmLabel="Tandai Dikirim"
        onConfirm={confirmShip}
        onClose={() => setShipping(null)}
      />
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <AuthGuard role="ROLE_SELLER">
      <Dashboard />
    </AuthGuard>
  );
}
