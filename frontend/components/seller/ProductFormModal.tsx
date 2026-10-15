"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "@/store/toast";
import type { Category, Product } from "@/types";

interface Props {
  open: boolean;
  product: Product | null; // null = produk baru
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

const empty = { name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" };

export default function ProductFormModal({ open, product, categories, onClose, onSaved }: Props) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setApiError(null);
    setSaving(false);
    setForm(
      product
        ? {
            name: product.name,
            description: product.description ?? "",
            price: String(product.price),
            stock: String(product.stock),
            imageUrl: product.imageUrl ?? "",
            categoryId: product.categoryId ? String(product.categoryId) : "",
          }
        : empty,
    );
  }, [open, product]);

  const set = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);

    const next: Record<string, string> = {};
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!form.name.trim()) next.name = "Nama produk wajib diisi.";
    if (!form.price || !Number.isFinite(price) || price <= 0) next.price = "Harga harus lebih dari 0.";
    if (form.stock === "" || !Number.isInteger(stock) || stock < 0) next.stock = "Stok harus bilangan bulat 0 atau lebih.";
    if (form.imageUrl.trim() && !/^https?:\/\//i.test(form.imageUrl.trim())) next.imageUrl = "URL gambar harus diawali http:// atau https://.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stock,
      imageUrl: form.imageUrl.trim(),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    };
    try {
      if (product) await api.put(`/products/${product.id}`, payload);
      else await api.post("/products", payload);
      toast.success(product ? "Produk diperbarui." : "Produk ditambahkan.");
      onSaved();
    } catch (err) {
      setApiError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={product ? "Ubah produk" : "Tambah produk baru"}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Batal</button>
          <button type="submit" form="product-form" className="btn btn-primary" disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />} {product ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={onSubmit} noValidate className="space-y-5">
        {apiError && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{apiError}</div>
        )}
        <div>
          <label htmlFor="p-name" className="label">Nama produk</label>
          <input id="p-name" value={form.name} onChange={set("name")} className="input" maxLength={200} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="p-price" className="label">Harga (Rp)</label>
            <input id="p-price" type="number" min="0" step="1" inputMode="numeric" value={form.price} onChange={set("price")} className="input" />
            {errors.price && <p className="field-error">{errors.price}</p>}
          </div>
          <div>
            <label htmlFor="p-stock" className="label">Stok</label>
            <input id="p-stock" type="number" min="0" step="1" inputMode="numeric" value={form.stock} onChange={set("stock")} className="input" />
            {errors.stock && <p className="field-error">{errors.stock}</p>}
          </div>
          <div>
            <label htmlFor="p-cat" className="label">Kategori</label>
            <select id="p-cat" value={form.categoryId} onChange={set("categoryId")} className="input">
              <option value="">Tanpa kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="p-img" className="label">URL gambar</label>
          <input id="p-img" value={form.imageUrl} onChange={set("imageUrl")} className="input" placeholder="https://..." />
          {errors.imageUrl && <p className="field-error">{errors.imageUrl}</p>}
        </div>
        <div>
          <label htmlFor="p-desc" className="label">Deskripsi</label>
          <textarea id="p-desc" rows={4} value={form.description} onChange={set("description")} className="input" maxLength={4000} />
        </div>
      </form>
    </Modal>
  );
}
