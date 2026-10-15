import { Check } from "lucide-react";

const STEPS = ["Keranjang", "Pengiriman", "Pembayaran"];

/** current: 0 = keranjang, 1 = pengiriman, 2 = pembayaran, 3 = selesai */
export default function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Tahapan pemesanan">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                done ? "bg-brand-600 text-white" : active ? "border-2 border-brand-600 text-brand-700" : "border border-slate-300 text-slate-400"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check size={14} /> : i + 1}
            </span>
            <span className={active ? "font-semibold text-slate-900" : done ? "text-slate-700" : "text-slate-400"}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-slate-300 sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}
