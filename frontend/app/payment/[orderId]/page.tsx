"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CircleCheck, Copy, Loader2 } from "lucide-react";
import AuthGuard, { PageSpinner } from "@/components/AuthGuard";
import CheckoutSteps from "@/components/CheckoutSteps";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { api, getErrorMessage, getStatus } from "@/lib/api";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { PAYMENT_METHODS, getPaymentMethod, paymentCode } from "@/lib/payment";
import { toast } from "@/store/toast";
import type { Order, Payment } from "@/types";

function PaymentContent() {
  const params = useParams<{ orderId: string }>();
  const orderId = Number(params.orderId);

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<{ notFound: boolean; message: string } | null>(null);
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Order>(`/orders/${orderId}`);
      setOrder(data);
    } catch (e) {
      const s = getStatus(e);
      setError({ notFound: s === 404 || s === 403, message: getErrorMessage(e) });
    }
  }, [orderId]);

  useEffect(() => {
    if (!Number.isFinite(orderId)) {
      setError({ notFound: true, message: "" });
      return;
    }
    load();
  }, [orderId, load]);

  async function onSimulate() {
    setPaying(true);
    try {
      const { data } = await api.post<Payment>("/payments/simulate", { orderId, paymentMethod: method });
      toast.success("Pembayaran berhasil dikonfirmasi.");
      setOrder((o) => (o ? { ...o, status: "PAID", payment: data } : o));
    } catch (e) {
      toast.error(getErrorMessage(e, "Pembayaran gagal diproses."));
      await load();
    } finally {
      setPaying(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.info("Nomor disalin.");
    } catch {
      toast.error("Tidak dapat menyalin otomatis. Salin secara manual.");
    }
  }

  if (error) {
    return (
      <div className="page py-10">
        <EmptyState
          icon={<CircleCheck size={26} />}
          title={error.notFound ? "Pesanan tidak ditemukan" : "Gagal memuat pesanan"}
          description={error.notFound ? "Pesanan ini tidak ada atau bukan milik akun Anda." : error.message}
          action={<Link href="/orders" className="btn btn-primary">Lihat Pesanan Saya</Link>}
        />
      </div>
    );
  }
  if (!order) return <PageSpinner />;

  const selected = getPaymentMethod(method)!;
  const code = paymentCode(method, order.id);
  const paid = order.status !== "PENDING" && order.status !== "CANCELLED";

  return (
    <div className="page py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pembayaran</h1>
        <CheckoutSteps current={paid ? 3 : 2} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {paid && order.payment ? (
            <section className="card p-8 text-center">
              <CircleCheck size={48} className="mx-auto text-emerald-600" />
              <h2 className="mt-4 text-xl font-bold">Pembayaran berhasil</h2>
              <p className="mt-2 text-sm text-slate-600">Penjual akan segera memproses pesanan Anda.</p>
              <dl className="mx-auto mt-6 grid max-w-sm grid-cols-[130px_1fr] gap-y-2.5 text-left text-sm">
                <dt className="text-slate-500">Metode</dt>
                <dd className="font-medium">{getPaymentMethod(order.payment.paymentMethod)?.label ?? order.payment.paymentMethod}</dd>
                <dt className="text-slate-500">ID transaksi</dt>
                <dd className="font-mono text-xs font-medium break-all">{order.payment.transactionId}</dd>
                {order.payment.virtualAccountNumber && (
                  <>
                    <dt className="text-slate-500">Nomor pembayaran</dt>
                    <dd className="font-mono font-medium">{order.payment.virtualAccountNumber}</dd>
                  </>
                )}
                {order.payment.paidAt && (
                  <>
                    <dt className="text-slate-500">Waktu</dt>
                    <dd className="font-medium">{formatDateTime(order.payment.paidAt)}</dd>
                  </>
                )}
              </dl>
              <div className="mt-8 flex justify-center gap-3">
                <Link href="/orders" className="btn btn-primary">Lihat Pesanan Saya</Link>
                <Link href="/products" className="btn btn-secondary">Lanjut Belanja</Link>
              </div>
            </section>
          ) : order.status === "CANCELLED" ? (
            <EmptyState
              icon={<CircleCheck size={26} />}
              title="Pesanan ini sudah dibatalkan"
              description="Pesanan yang dibatalkan tidak dapat dibayar."
              action={<Link href="/products" className="btn btn-primary">Belanja Lagi</Link>}
            />
          ) : (
            <>
              <section className="card p-6">
                <h2 className="text-base font-semibold">Pilih metode pembayaran</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-md border p-3.5 text-sm ${
                        method === m.id ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600" : "border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-brand-600" />
                      <span className="font-medium text-slate-900">{m.label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="card p-6">
                <h2 className="text-base font-semibold">Instruksi pembayaran</h2>
                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs text-slate-500">{selected.codeLabel}</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="font-mono text-2xl font-semibold tracking-wider text-slate-900">{code}</p>
                    <button onClick={() => copy(code)} className="btn btn-secondary btn-sm" aria-label="Salin nomor">
                      <Copy size={14} /> Salin
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    Total tagihan <strong className="text-slate-900 tabular-nums">{formatRupiah(order.totalPrice)}</strong>
                  </p>
                </div>
                <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                  {selected.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <div className="mt-6 rounded-md border border-dashed border-slate-300 p-4">
                  <p className="text-xs leading-relaxed text-slate-500">
                    Mode simulasi: tidak ada uang yang berpindah. Tombol di bawah menggantikan konfirmasi dari bank.
                  </p>
                  <button onClick={onSimulate} disabled={paying} className="btn btn-primary btn-lg mt-3 w-full sm:w-auto">
                    {paying && <Loader2 size={18} className="animate-spin" />} Simulasikan Pembayaran Berhasil
                  </button>
                </div>
              </section>
            </>
          )}
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-40">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Pesanan #{order.id}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
          <ul className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm">
            {order.items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="text-slate-700">
                  {i.productName} <span className="text-slate-400">× {i.quantity}</span>
                </span>
                <span className="font-medium whitespace-nowrap tabular-nums">{formatRupiah(i.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-between border-t border-slate-200 pt-4 text-base">
            <span className="font-semibold">Total</span>
            <span className="font-bold tabular-nums">{formatRupiah(order.totalPrice)}</span>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-5">
            <p className="text-xs font-semibold text-slate-500">Dikirim ke</p>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-slate-700">{order.shippingAddress}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <AuthGuard role="ROLE_CUSTOMER">
      <PaymentContent />
    </AuthGuard>
  );
}
