"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "@/store/toast";
import type { Store } from "@/types";

export default function StoreSetup({ onCreated }: { onCreated: (store: Store) => void }) {
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    const next: Record<string, string> = {};
    if (!storeName.trim()) next.storeName = "Nama toko wajib diisi.";
    if (!address.trim()) next.address = "Alamat toko wajib diisi.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const { data } = await api.post<Store>("/stores", {
        storeName: storeName.trim(),
        description: description.trim(),
        address: address.trim(),
      });
      toast.success("Toko berhasil dibuat.");
      onCreated(data);
    } catch (err) {
      setApiError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="page py-10">
      <div className="card mx-auto max-w-xl p-8">
        <h1 className="text-xl font-bold">Buat toko Anda</h1>
        <p className="mt-1.5 text-sm text-slate-600">Lengkapi informasi toko sebelum mulai menambahkan produk.</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
          {apiError && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {apiError}
            </div>
          )}
          <div>
            <label htmlFor="storeName" className="label">Nama toko</label>
            <input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="input" maxLength={120} />
            {errors.storeName && <p className="field-error">{errors.storeName}</p>}
          </div>
          <div>
            <label htmlFor="storeAddress" className="label">Alamat toko</label>
            <textarea id="storeAddress" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} className="input" />
            {errors.address && <p className="field-error">{errors.address}</p>}
          </div>
          <div>
            <label htmlFor="storeDesc" className="label">Deskripsi (opsional)</label>
            <textarea id="storeDesc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="input" maxLength={2000} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
            {loading && <Loader2 size={18} className="animate-spin" />} Buat Toko
          </button>
        </form>
      </div>
    </div>
  );
}
