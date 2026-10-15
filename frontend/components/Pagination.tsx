import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number; // berbasis 0
  totalPages: number;
  onChange: (page: number) => void;
}

function pagesToShow(current: number, total: number): (number | "gap")[] {
  const set = new Set<number>([0, total - 1, current - 1, current, current + 1]);
  const sorted = [...set].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let prev = -1;
  for (const p of sorted) {
    if (prev !== -1 && p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const base = "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm tabular-nums";

  return (
    <nav aria-label="Halaman" className="mt-8 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        aria-label="Halaman sebelumnya"
        className={`${base} border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronLeft size={16} />
      </button>
      {pagesToShow(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${
              p === page
                ? "border-brand-600 bg-brand-600 font-semibold text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {p + 1}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Halaman berikutnya"
        className={`${base} border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
