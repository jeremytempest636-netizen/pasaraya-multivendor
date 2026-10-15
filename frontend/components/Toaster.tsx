"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { useToast, type ToastKind } from "@/store/toast";

const styles: Record<ToastKind, { bar: string; icon: string }> = {
  success: { bar: "border-l-emerald-600", icon: "text-emerald-600" },
  error: { bar: "border-l-red-600", icon: "text-red-600" },
  info: { bar: "border-l-brand-600", icon: "text-brand-600" },
};

const icons = { success: CircleCheck, error: CircleAlert, info: Info };

export default function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 left-4 z-[60] flex flex-col items-end gap-2 sm:left-auto"
    >
      {toasts.map((t) => {
        const Icon = icons[t.kind];
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border border-l-4 border-slate-200 bg-white px-4 py-3 shadow-lg ${styles[t.kind].bar}`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${styles[t.kind].icon}`} />
            <p className="flex-1 text-sm text-slate-800">{t.message}</p>
            <button onClick={() => dismiss(t.id)} aria-label="Tutup notifikasi" className="text-slate-400 hover:text-slate-700">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
