import Link from "next/link";
import { Store } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/types";

export default function ProductCard({ product: p }: { product: Product }) {
  const soldOut = p.stock === 0;

  return (
    <Link
      href={`/products/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:border-slate-300 hover:shadow-md"
    >
      <div className="relative aspect-square">
        <ProductImage src={p.imageUrl} alt={p.name} className="h-full w-full" />
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-slate-700">
            Stok Habis
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-800 group-hover:text-brand-700">{p.name}</h3>
        <p className="text-base font-bold text-slate-900 tabular-nums">{formatRupiah(p.price)}</p>
        <div className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-slate-500">
          <Store size={13} className="shrink-0" />
          <span className="truncate">{p.storeName}</span>
        </div>
        {!soldOut && p.stock <= 5 && <p className="text-xs font-medium text-amber-700">Sisa {p.stock} unit</p>}
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white" aria-hidden>
      <div className="aspect-square animate-pulse bg-slate-100" />
      <div className="space-y-2.5 p-3">
        <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
