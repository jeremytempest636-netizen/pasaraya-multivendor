package com.ecommerce.multivendor.config;

import com.ecommerce.multivendor.model.*;
import com.ecommerce.multivendor.repository.CategoryRepository;
import com.ecommerce.multivendor.repository.ProductRepository;
import com.ecommerce.multivendor.repository.StoreRepository;
import com.ecommerce.multivendor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Mengisi data contoh saat database masih kosong (app.seed=true).
 * Akun demo: seller1@demo.com, seller2@demo.com, seller3@demo.com, customer@demo.com
 * Password semuanya: Password123!
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private static final String DEMO_PASSWORD = "Password123!";

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        Map<String, Category> cat = new LinkedHashMap<>();
        for (String name : new String[]{"Elektronik", "Fashion", "Rumah & Dapur", "Olahraga", "Kecantikan", "Buku & Alat Tulis"}) {
            cat.put(name, categoryRepository.save(Category.builder().name(name).build()));
        }

        User s1 = user("Dimas Prasetyo", "seller1@demo.com", Role.ROLE_SELLER);
        User s2 = user("Rina Kusuma", "seller2@demo.com", Role.ROLE_SELLER);
        User s3 = user("Agus Santoso", "seller3@demo.com", Role.ROLE_SELLER);
        user("Budi Hartono", "customer@demo.com", Role.ROLE_CUSTOMER);

        Store nusa = store(s1, "Nusa Digital Official",
                "Distributor resmi perangkat elektronik dan aksesori. Garansi toko 12 bulan.",
                "Jl. Gatot Subroto No. 45, Medan, Sumatera Utara");
        Store kriya = store(s2, "Kriya Rumah",
                "Perlengkapan rumah, dapur, dan alat tulis pilihan untuk keseharian.",
                "Jl. Braga No. 12, Bandung, Jawa Barat");
        Store arena = store(s3, "Arena Sport & Style",
                "Perlengkapan olahraga, fashion, dan perawatan diri dari merek pilihan.",
                "Jl. Sudirman Kav. 21, Jakarta Selatan, DKI Jakarta");

        // ---- Nusa Digital Official ----
        product(nusa, cat.get("Elektronik"), "Headphone Nirkabel Noise Cancelling WH-700",
                "Headphone over-ear dengan peredam bising aktif, baterai hingga 30 jam, dan koneksi Bluetooth 5.2 multipoint. Dilengkapi kabel audio 3,5 mm dan hard case.",
                "1899000", 24, "photo-1505740420928-5e560c06d30e");
        product(nusa, cat.get("Elektronik"), "Smartwatch Fit Pro 2 GPS 44mm",
                "Layar AMOLED 1,4 inci, GPS terintegrasi, sensor detak jantung dan SpO2, tahan air 5 ATM. Baterai hingga 7 hari pemakaian normal.",
                "2349000", 15, "photo-1546868871-7041f2a55e12");
        product(nusa, cat.get("Elektronik"), "Laptop Ultrabook 14\" Core i5 16GB/512GB",
                "Prosesor Core i5 generasi terbaru, RAM 16 GB, SSD NVMe 512 GB, layar IPS 14 inci Full HD, bobot 1,3 kg. Windows 11 Home original.",
                "11499000", 8, "photo-1496181133206-80ce9b88a853");
        product(nusa, cat.get("Elektronik"), "Kamera Mirrorless 24MP + Lensa Kit 16-50mm",
                "Sensor APS-C 24,2 MP, perekaman video 4K, layar sentuh lipat, dan Wi-Fi/Bluetooth untuk transfer foto ke ponsel.",
                "8750000", 5, "photo-1526170375885-4d8ecf77b99f");
        product(nusa, cat.get("Elektronik"), "Speaker Bluetooth Portabel 20W Tahan Air IPX7",
                "Suara stereo 20 watt dengan bass pasif, tahan air dan debu IPX7, baterai 12 jam, dapat dipasangkan dengan dua unit untuk mode stereo.",
                "649000", 40, "photo-1608043152269-423dbba4e7e1");
        product(nusa, cat.get("Elektronik"), "Keyboard Mekanikal 75% Hot-Swap Wireless",
                "Layout 75% ringkas, switch linear hot-swap, koneksi 2,4 GHz / Bluetooth / USB-C, backlight putih, baterai 4000 mAh.",
                "899000", 30, "photo-1587829741301-dc798b83add3");
        product(nusa, cat.get("Elektronik"), "Mouse Nirkabel Ergonomis 4000 DPI",
                "Desain ergonomis untuk tangan kanan, sensor optik 4000 DPI, 6 tombol programmable, baterai AA hingga 18 bulan.",
                "275000", 3, "photo-1527864550417-7fd91fc51a46");

        // ---- Kriya Rumah ----
        product(kriya, cat.get("Rumah & Dapur"), "Set Cangkir Keramik Matte 6 Pcs",
                "Enam cangkir keramik glasir matte kapasitas 250 ml. Aman untuk microwave dan pencuci piring. Dikemas dalam kotak kokoh.",
                "239000", 60, "photo-1495474472287-4d71bcdd2085");
        product(kriya, cat.get("Rumah & Dapur"), "Lampu Meja LED Dimmable dengan Port USB",
                "Tiga suhu warna dan lima tingkat kecerahan, lengan fleksibel, port pengisian USB 5V/1A, hemat daya 9 watt.",
                "189000", 45, "photo-1507473885765-e6ed057f782c");
        product(kriya, cat.get("Rumah & Dapur"), "Set Panci Anti Lengket 5 Pcs Induksi",
                "Lima panci dan wajan berlapis anti lengket, dasar tebal kompatibel kompor gas, listrik, dan induksi. Pegangan tahan panas.",
                "749000", 18, "photo-1556911220-bff31c812dba");
        product(kriya, cat.get("Buku & Alat Tulis"), "Buku Catatan Hardcover A5 Dotted 192 Halaman",
                "Kertas 100 gsm bebas asam, ikat elastis, penanda halaman, dan kantong belakang. Cocok untuk jurnal dan bullet journal.",
                "89000", 120, "photo-1531346878377-a5be20888e57");

        // ---- Arena Sport & Style ----
        product(arena, cat.get("Fashion"), "Sepatu Lari Pria Ringan Breathable",
                "Upper mesh breathable, midsole busa responsif, outsole karet dengan grip kuat. Tersedia ukuran 39–45.",
                "799000", 35, "photo-1542291026-7eec264c27ff");
        product(arena, cat.get("Fashion"), "Jam Tangan Analog Minimalis Strap Kulit",
                "Case stainless steel 40 mm, kaca mineral, strap kulit asli, tahan percikan air 3 ATM. Garansi mesin 1 tahun.",
                "459000", 22, "photo-1523275335684-37898b6baf30");
        product(arena, cat.get("Fashion"), "Kacamata Hitam Polarized UV400",
                "Lensa polarized anti silau dengan perlindungan UV400, frame ringan tahan lentur. Termasuk hard case dan kain pembersih.",
                "329000", 50, "photo-1572635196237-14b3f281503f");
        product(arena, cat.get("Fashion"), "Ransel Harian 20L Water Resistant",
                "Kompartemen laptop hingga 15,6 inci, saku samping untuk botol, bahan water resistant, dan tali punggung berbantalan.",
                "389000", 28, "photo-1553062407-98eeb64c6a62");
        product(arena, cat.get("Olahraga"), "Matras Yoga TPE 6mm Anti Slip",
                "Permukaan dua sisi anti slip, ketebalan 6 mm untuk menopang sendi, ramah lingkungan, dilengkapi tali pengikat.",
                "179000", 70, "photo-1601925260368-ae2f83cf8b7f");
        product(arena, cat.get("Olahraga"), "Dumbbell Adjustable 2–20 kg (Sepasang)",
                "Beban dapat diatur dari 2 hingga 20 kg per sisi, gagang karet anti selip, hemat tempat untuk latihan di rumah.",
                "1290000", 0, "photo-1517836357463-d25dfeac3438");
        product(arena, cat.get("Kecantikan"), "Serum Vitamin C 15% + Hyaluronic Acid 30ml",
                "Membantu mencerahkan dan melembapkan kulit. Formula ringan cepat meresap, cocok untuk semua jenis kulit. Terdaftar BPOM.",
                "159000", 85, "photo-1620916566398-39f1143ab7be");
        product(arena, cat.get("Kecantikan"), "Eau de Parfum Woody Citrus 50ml",
                "Aroma segar citrus dengan sentuhan kayu cedar dan musk. Ketahanan 6–8 jam, cocok untuk pria dan wanita.",
                "425000", 32, "photo-1541643600914-78b084683601");

        log.info("Data contoh dimuat. Akun demo: seller1@demo.com / customer@demo.com (password: {})", DEMO_PASSWORD);
    }

    private User user(String name, String email, Role role) {
        return userRepository.save(User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(DEMO_PASSWORD))
                .role(role)
                .build());
    }

    private Store store(User owner, String name, String description, String address) {
        return storeRepository.save(Store.builder()
                .user(owner)
                .storeName(name)
                .description(description)
                .address(address)
                .build());
    }

    private void product(Store store, Category category, String name, String description,
                         String price, int stock, String unsplashPhotoId) {
        productRepository.save(Product.builder()
                .store(store)
                .category(category)
                .name(name)
                .description(description)
                .price(new BigDecimal(price))
                .stock(stock)
                .imageUrl("https://images.unsplash.com/" + unsplashPhotoId + "?auto=format&fit=crop&w=800&q=80")
                .build());
    }
}
