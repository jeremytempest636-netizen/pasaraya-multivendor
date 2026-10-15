export interface PaymentMethod {
  id: string;
  label: string;
  prefix: string;
  codeLabel: string;
  steps: string[];
}

/**
 * Prefix nomor pembayaran harus sama dengan PaymentService.PREFIXES di backend:
 * nomor = prefix + orderId (10 digit, diisi nol di kiri).
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "BCA_VA",
    label: "BCA Virtual Account",
    prefix: "88801",
    codeLabel: "Nomor Virtual Account BCA",
    steps: [
      "Buka aplikasi mobile banking atau ATM, pilih menu Transfer lalu Virtual Account.",
      "Masukkan nomor Virtual Account di atas.",
      "Periksa nama merchant dan nominal, lalu konfirmasi pembayaran.",
      "Simpan bukti transaksi. Status pesanan akan diperbarui otomatis.",
    ],
  },
  {
    id: "MANDIRI_VA",
    label: "Mandiri Virtual Account",
    prefix: "88908",
    codeLabel: "Nomor Virtual Account Mandiri",
    steps: [
      "Buka aplikasi mobile banking atau ATM, pilih menu Bayar lalu Multipayment.",
      "Masukkan nomor Virtual Account di atas.",
      "Periksa nama merchant dan nominal, lalu konfirmasi pembayaran.",
      "Simpan bukti transaksi. Status pesanan akan diperbarui otomatis.",
    ],
  },
  {
    id: "BNI_VA",
    label: "BNI Virtual Account",
    prefix: "8810",
    codeLabel: "Nomor Virtual Account BNI",
    steps: [
      "Buka aplikasi mobile banking atau ATM, pilih menu Transfer lalu Virtual Account Billing.",
      "Masukkan nomor Virtual Account di atas.",
      "Periksa nama merchant dan nominal, lalu konfirmasi pembayaran.",
      "Simpan bukti transaksi. Status pesanan akan diperbarui otomatis.",
    ],
  },
  {
    id: "GOPAY",
    label: "GoPay",
    prefix: "39358",
    codeLabel: "Kode Pembayaran GoPay",
    steps: [
      "Buka aplikasi dompet digital Anda dan pilih menu Bayar.",
      "Masukkan kode pembayaran di atas.",
      "Periksa nominal dan konfirmasi dengan PIN.",
    ],
  },
  {
    id: "CREDIT_CARD",
    label: "Kartu Kredit / Debit",
    prefix: "40001",
    codeLabel: "Kode Referensi Pembayaran",
    steps: [
      "Anda akan diarahkan ke halaman pembayaran kartu yang aman.",
      "Masukkan data kartu dan verifikasi dengan kode OTP dari bank.",
      "Pembayaran dikonfirmasi setelah otorisasi bank berhasil.",
    ],
  },
];

export function getPaymentMethod(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

export function paymentCode(methodId: string, orderId: number): string {
  const method = getPaymentMethod(methodId);
  if (!method) return "";
  return method.prefix + String(orderId).padStart(10, "0");
}
