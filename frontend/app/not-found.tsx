import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page py-24 text-center">
      <p className="text-sm font-semibold text-brand-700">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-slate-600">Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
