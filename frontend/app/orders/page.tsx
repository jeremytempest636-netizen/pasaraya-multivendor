"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import AuthGuard, { PageSpinner } from "@/components/AuthGuard";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import ProductImage from "@/components/ProductImage";
import StatusBadge from "@/components/StatusBadge";
import { api, getErrorMessage } from "@/lib/api";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { toast } from "@/store/toast";
import type { Order, OrderStatus } from "@/types";

type Pending = { order: Order; target: OrderStatus } | null;

function OrdersContent() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Order[]>("/orders");
      setOrders(data);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "Gagal memuat pesanan."));
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    try {
      await api.patch(`/orders/${pending.order.id}/status`, { status: pending.target });
      toast.success(pending.target === "CANCELLED" ? "Pesanan dibatalkan." : "Pesanan ditandai selesai.");
      setPending(null);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (orders === null) return <PageSpinner />;

  return (
    <div className="page py-6">
      <h1 className="text-2xl font-bold">Pesanan saya</h1>

      {error && (
        <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="mt-6">
          <EmptyState
            icon={<ClipboardList size={26} />}
            title="Belum ada pesanan"
            description="Pesanan yang Anda buat akan muncul di sini."
            action={<Link href="/products" className="btn btn-primary">Mulai Belanja</Link>}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <article key={o.id} className="card overflow-hidden">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-semibold text-slate-900">Pesanan #{o.id}</span>
                  <span className="text-slate-500">{formatDateTime(o.createdAt)}</span>
                </div>
                <StatusBadge status={o.status} />
              </header>

              <ul className="divide-y divide-slate-100">
                {o.items.map((i) => (
                  <li key={i.productId} className="flex gap-4 px-5 py-4">
                    <Link href={`/products/${i.productId}`} className="shrink-0">
                      <ProductImage src={i.imageUrl} alt={i.productName} className="h-16 w-16 rounded-md" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${i.productId}`} className="line-clamp-2 text-sm font-medium text-slate-900 hover:text-brand-700">
                        {i.productName}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500">{i.storeName}</p>
                      <p className="mt-1 text-sm text-slate-600 tabular-nums">
                        {i.quantity} × {formatRupiah(i.price)}
                      </p>
                    </div>
                    <p className="text-sm font-bold tabular-nums">{formatRupiah(i.subtotal)}</p>
                  </li>
                ))}
              </ul>

              <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4">
                <p className="text-sm text-slate-600">
                  Total <strong className="text-base text-slate-900 tabular-nums">{formatRupiah(o.totalPrice)}</strong>
                </p>
                <div className="flex flex-wrap gap-2">
                  {o.status === "PENDING" && (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => setPending({ order: o, target: "CANCELLED" })}>
                        Batalkan
                      </button>
                      <Link href={`/payment/${o.id}`} className="btn btn-primary btn-sm">Bayar Sekarang</Link>
                    </>
                  )}
                  {o.status === "SHIPPED" && (
                    <button className="btn btn-primary btn-sm" onClick={() => setPending({ order: o, target: "COMPLETED" })}>
                      Pesanan Diterima
                    </button>
                  )}
                  {(o.status === "PAID" || o.status === "SHIPPED" || o.status === "COMPLETED") && (
                    <Link href={`/payment/${o.id}`} className="btn btn-secondary btn-sm">Detail Pembayaran</Link>
                  )}
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pending}
        loading={busy}
        danger={pending?.target === "CANCELLED"}
        title={pending?.target === "CANCELLED" ? "Batalkan pesanan?" : "Konfirmasi pesanan diterima?"}
        message={
          pending?.target === "CANCELLED"
            ? `Pesanan #${pending.order.id} akan dibatalkan dan stok produk dikembalikan. Tindakan ini tidak dapat diurungkan.`
            : `Pastikan semua barang pada pesanan #${pending?.order.id} sudah Anda terima dengan baik.`
        }
        confirmLabel={pending?.target === "CANCELLED" ? "Ya, Batalkan" : "Ya, Sudah Diterima"}
        onConfirm={confirm}
        onClose={() => setPending(null)}
      />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard role="ROLE_CUSTOMER">
      <OrdersContent />
    </AuthGuard>
  );
}
