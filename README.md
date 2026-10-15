# Pasaraya: E-Commerce Multi-Vendor

Spring Boot 3 (Java 17+) + PostgreSQL di `backend/`, Next.js 16 (App Router, TypeScript, Tailwind 4, Zustand, Axios) di `frontend/`.

## Menjalankan

### 1. Backend (port 8080)

Pilihan A, tanpa instalasi database (H2 in-memory, data hilang saat restart):

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Pilihan B, PostgreSQL:

```bash
createdb multivendor
cd backend
DB_USERNAME=postgres DB_PASSWORD=postgres mvn spring-boot:run
```

Variabel opsional: `DB_URL`, `JWT_SECRET` (wajib diganti di production, min. 32 karakter), `CORS_ORIGINS`, `SEED_DEMO_DATA=false`.

Saat database kosong, data contoh dimuat otomatis (6 kategori, 3 toko, 18 produk).

### 2. Frontend (port 3000)

```bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8080
npm install
npm run dev
```

### Akun demo (password `Password123!`)

| Peran | Email |
|---|---|
| Pembeli | customer@demo.com |
| Penjual | seller1@demo.com, seller2@demo.com, seller3@demo.com |

## Endpoint

| Method | Path | Akses |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Publik |
| GET | `/api/products` (`search, page, size, categoryId, storeId, sort`), `/api/products/{id}` | Publik |
| GET | `/api/categories`, `/api/stores` | Publik |
| POST/PUT/DELETE | `/api/products[/{id}]` | Seller pemilik |
| POST | `/api/stores` | Seller |
| GET | `/api/stores/me`, `/api/stores/my-products` | Seller |
| POST | `/api/orders` | Customer |
| GET | `/api/orders`, `/api/orders/{id}` | Customer (pesanan sendiri) / Seller (yang memuat produk tokonya) |
| PATCH | `/api/orders/{id}/status` | Customer: batalkan (PENDING), selesai (SHIPPED). Seller: kirim (PAID) |
| POST | `/api/payments/simulate` | Customer |

## Keputusan desain yang perlu diketahui

- Total pesanan dihitung server dari harga di database, bukan dari klien. Stok dikunci per baris (pessimistic lock) saat dikurangi, dan dikembalikan bila pesanan dibatalkan.
- Pembayaran simulasi memakai lock pada order sehingga klik ganda tidak menghasilkan dua pembayaran.
- Produk yang sudah pernah dipesan tidak bisa dihapus (menjaga riwayat pesanan); penjual bisa mengosongkan stok.
- Seller hanya melihat item dan nilai pesanan miliknya pada pesanan multi-toko.
- Kategori (`categoryId`) dan filter toko ditambahkan di luar blueprint karena dibutuhkan oleh filter katalog.
- Keranjang disimpan di localStorage (Redis dari blueprint bersifat opsional dan tidak dipakai). JWT juga di localStorage; untuk production, pertimbangkan cookie httpOnly.
- Gambar contoh memakai URL Unsplash. Bila tidak termuat, UI menampilkan placeholder netral.
