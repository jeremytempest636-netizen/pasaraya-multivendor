import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { SITE_NAME } from "@/lib/config";

interface Props {
  title: string;
  subtitle: string;
  panelTitle: string;
  panelPoints: string[];
  children: ReactNode;
}

export default function AuthShell({ title, subtitle, panelTitle, panelPoints, children }: Props) {
  return (
    <div className="page py-8 sm:py-12">
      <div className="card mx-auto grid max-w-5xl overflow-hidden lg:grid-cols-[2fr_3fr]">
        <aside className="hidden flex-col justify-between bg-brand-900 p-10 text-white lg:flex">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-brand-200 uppercase">{SITE_NAME}</p>
            <h2 className="mt-4 text-2xl leading-snug font-bold">{panelTitle}</h2>
            <ul className="mt-8 space-y-4">
              {panelPoints.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-slate-200">
                  <Check size={18} className="mt-0.5 shrink-0 text-brand-200" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-12 text-xs text-slate-400">Pembayaran pada aplikasi ini berjalan dalam mode simulasi.</p>
        </aside>
        <div className="p-6 sm:p-10">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
