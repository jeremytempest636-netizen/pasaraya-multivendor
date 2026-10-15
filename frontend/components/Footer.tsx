import Link from "next/link";
import { SITE_NAME } from "@/lib/config";

const columns = [
  {
    title: "Belanja",
    links: [
      { href: "/products", label: "Semua Produk" },
      { href: "/cart", label: "Keranjang" },
      { href: "/orders", label: "Pesanan Saya" },
    ],
  },
  {
    title: "Penjual",
    links: [
      { href: "/register?role=SELLER", label: "Daftar sebagai Penjual" },
      { href: "/seller/dashboard", label: "Dashboard Penjual" },
    ],
  },
  {
    title: "Akun",
    links: [
      { href: "/login", label: "Masuk" },
      { href: "/register", label: "Daftar" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="page grid gap-10 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-base font-bold text-white">
              P
            </span>
            <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
            Marketplace yang mempertemukan pembeli dengan banyak toko dalam satu keranjang dan satu pembayaran.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-slate-900">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-600 hover:text-brand-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200">
        <div className="page flex flex-col gap-1 py-5 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE_NAME}. Seluruh hak cipta dilindungi.</p>
          <p>Aplikasi demonstrasi. Transaksi pembayaran bersifat simulasi.</p>
        </div>
      </div>
    </footer>
  );
}
