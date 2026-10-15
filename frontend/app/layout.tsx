import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toaster from "@/components/Toaster";

export const metadata: Metadata = {
  title: {
    default: "Pasaraya | Marketplace Multi-Penjual",
    template: "%s | Pasaraya",
  },
  description: "Belanja dari berbagai toko dalam satu keranjang dan satu pembayaran.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
