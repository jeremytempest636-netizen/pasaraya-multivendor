"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import AuthGuard, { PageSpinner } from "@/components/AuthGuard";
import CheckoutSteps from "@/components/CheckoutSteps";
import EmptyState from "@/components/EmptyState";
import ProductImage from "@/components/ProductImage";
import { api, getErrorMessage } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { selectSubtotal, useCart } from "@/store/cart";
import type { Order } from "@/types";

const emptyForm = { recipient: "", phone: "", address: "", city: "", postal: "" };

function CheckoutForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(selectSubtotal);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  if (!hydrated || placed) return <PageSpinner />;

  if (items.length === 0) {
    return (
      <div className="page py-10">
        <EmptyState
          icon={<ShoppingCart size={26} />}
          title="Tidak ada produk untuk di-checkout"
          description="Tambahkan produk ke keranjang terlebih dahulu."
          action={
            <Link href="/products" className="btn btn-primary">
              Mulai Belanja
            </Link>
          }
        />
      </div>
    );
  }

  const set = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function validate() {
    const next: Record<string, string> = {};
    if (form.recipient.trim().length < 3) next.recipient = "Nama penerima wajib diisi.";
    if (!/^(\+62|62|0)8\d{7,12}$/.test(form.phone.replace(/[\s-]/g, ""))) next.phone = "Nomor ponsel tidak valid (contoh: 081234567890).";
    if (form.address.trim().length < 10) next.address = "Alamat lengkap minimal 10 karakter.";
    if (!form.city.trim()) next.city = "Kota / kabupaten wajib diisi.";
    if (!/^\d{5}$/.test(form.postal.trim())) next.postal = "Kode pos terdiri dari 5 digit.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const shippingAddress = `${form.recipient.trim()} (${form.phone.trim()})\n${form.address.trim()}\n${form.city.trim()}, ${form.postal.trim()}`;
      const { data } = await api.post<Order>("/orders", {
        shippingAddress,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      setPlaced(true);
      clear();
      router.replace(`/payment/${data.id}`);
    } catch (err) {
      setApiError(getErrorMessage(err, "Pesanan gagal dibuat. Silakan coba lagi."));
      setSubmitting(false);
    }
  }

  const fieldClass = (key: string) => `input ${errors[key] ? "border-red-500" : ""}`;

  return (
    <div className="page py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <CheckoutSteps current={1} />
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {apiError && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {apiError}
            </div>
          )}

          <section className="card p-6">
            <h2 className="text-base font-semibold">Alamat pengiriman</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="recipient" className="label">Nama penerima</label>
                <input id="recipient" autoComplete="name" value={form.recipient} onChange={set("recipient")} className={fieldClass("recipient")} />
                {errors.recipient && <p className="field-error">{errors.recipient}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="label">Nomor ponsel</label>
                <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} className={fieldClass("phone")} placeholder="081234567890" />
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="label">Alamat lengkap</label>
                <textarea id="address" rows={3} autoComplete="street-address" value={form.address} onChange={set("address")} className={fieldClass("address")} placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan" />
                {errors.address && <p className="field-error">{errors.address}</p>}
              </div>
              <div>
                <label htmlFor="city" className="label">Kota / kabupaten</label>
                <input id="city" autoComplete="address-level2" value={form.city} onChange={set("city")} className={fieldClass("city")} />
                {errors.city && <p className="field-error">{errors.city}</p>}
              </div>
              <div>
                <label htmlFor="postal" className="label">Kode pos</label>
                <input id="postal" inputMode="numeric" maxLength={5} autoComplete="postal-code" value={form.postal} onChange={set("postal")} className={fieldClass("postal")} />
                {errors.postal && <p className="field-error">{errors.postal}</p>}
              </div>
            </div>
          </section>

          <section className="card overflow-hidden">
            <h2 className="border-b border-slate-200 px-6 py-4 text-base font-semibold">Rincian pesanan</h2>
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 px-6 py-4">
                  <ProductImage src={item.imageUrl} alt={item.name} className="h-16 w-16 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.storeName}</p>
                    <p className="mt-1 text-sm text-slate-600 tabular-nums">
                      {item.quantity} × {formatRupiah(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-bold tabular-nums">{formatRupiah(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-40">
          <h2 className="text-base font-semibold">Ringkasan pembayaran</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Total harga ({items.reduce((n, i) => n + i.quantity, 0)} barang)</dt>
              <dd className="font-medium tabular-nums">{formatRupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-4 text-base">
              <dt className="font-semibold">Total tagihan</dt>
              <dd className="font-bold tabular-nums">{formatRupiah(subtotal)}</dd>
            </div>
          </dl>
          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg mt-6 w-full">
            {submitting && <Loader2 size={18} className="animate-spin" />} Proses Pembayaran
          </button>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Stok dan harga diperiksa ulang oleh sistem saat pesanan dibuat. Total akhir mengikuti harga terkini.
          </p>
        </aside>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard role="ROLE_CUSTOMER">
      <CheckoutForm />
    </AuthGuard>
  );
}
