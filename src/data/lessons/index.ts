import type { Lesson } from '../../types';

export const lessons: Lesson[] = [
    // =====================================================
    // PYTHON - TIER 1: SEEDLING (Complete Beginner)
    // =====================================================
    {
        id: 'py-t1-hello',
        title: 'Hello, World!',
        description: 'Write your very first Python program and understand how computers execute code.',
        tier: 1,
        language: 'python',
        sections: [
            {
                id: 'welcome',
                type: 'text',
                title: 'Welcome to Programming!',
                content: `Selamat datang di dunia programming! 

Di pelajaran pertama ini, kamu akan menulis program pertamamu. Jangan khawatir, kita akan mulai dari yang paling dasar.

Perjalananmu menjadi seorang Software Engineer dimulai dari sini.`
            },
            {
                id: 'what-is-programming',
                type: 'text',
                title: 'Apa itu Programming?',
                content: `Sebelum kita mulai coding, mari kita pahami konsep dasarnya.

Programming sebenarnya hanyalah cara kita **"berbicara"** dengan komputer.

Sama seperti manusia punya bahasa (Indonesia, Inggris), komputer juga punya bahasa. Kita menulis instruksi dalam bahasa yang komputer pahami, dan komputer akan menjalankan instruksi tersebut dengan patuh.`
            },
            {
                id: 'why-python',
                type: 'text',
                title: 'Mengapa Python?',
                content: `Di kursus ini, kita menggunakan bahasa **Python**.
                
Python adalah bahasa yang sangat populer dan ramah untuk pemula karena:
- Sintaksnya sederhana (mirip bahasa Inggris)
- Tidak perlu setup yang rumit
- Banyak digunakan di perusahaan besar (Google, NASA, Netflix)`
            },
            {
                id: 'concept',
                type: 'text',
                title: 'Konsep: print()',
                content: `Setiap perjalanan dimulai dengan satu langkah. Di programming, langkah pertama biasanya adalah menampilkan teks ke layar.
                
Di Python, kita menggunakan fungsi bernama \`print()\`.

**Bayangkan ini:**
Kamu menyuruh robot untuk "katakan sesuatu".
Di Python, perintahnya adalah: \`print("sesuatu")\``
            },
            {
                id: 'anatomy',
                type: 'text',
                title: 'Bedah Kode',
                content: `Mari kita lihat anatomi dari perintah \`print\`:

\`\`\`
print("teks yang ingin ditampilkan")
\`\`\`

**Aturan Main:**
1. \`print\` adalah kata perintahnya.
2. Tanda kurung \`(...)\` adalah tempat kita menaruh "isi pesan".
3. Tanda kutip \`"..."\` memberi tahu komputer bahwa ini adalah Teks, bukan perintah.

Jika kamu lupa tanda kutip, komputer akan bingung!`
            },
            {
                id: 'examples',
                type: 'text',
                title: 'Contoh Nyata',
                content: `Berikut adalah beberapa contoh penggunaan yang benar:

**Menyapa Dunia:**
\`\`\`python
print("Halo, Dunia!")
\`\`\`
Output: \`Halo, Dunia!\`

**Menyatakan Fakta:**
\`\`\`python
print("Python itu seru")
\`\`\`
Output: \`Python itu seru\`

**Suara Kucing:**
\`\`\`python
print("Meow!")
\`\`\`
Output: \`Meow!\``
            },
            {
                id: 'guided-practice',
                type: 'code',
                title: 'Giliranmu!',
                content: `Sekarang saatnya kamu mencoba sendiri.
                
Tugas pertamamu: Tulis kode untuk menampilkan **"Hello, World!"** ke layar.

**Checklist:**
- [ ] Ketik \`print\`
- [ ] Buka kurung \`(\`
- [ ] Buka kutip \`"\`
- [ ] Tulis **Hello, World!**
- [ ] Tutup kutip \`"\`
- [ ] Tutup kurung \`)\`

Kode sudah disiapkan, coba klik **Run Code** untuk melihat hasilnya!`,
                codeTemplate: 'print("Hello, World!")',

                hints: ['Pastikan menggunakan tanda kutip ganda (" ")', 'Perhatikan huruf besar/kecil']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Tantangan Terakhir',
                content: `Luar biasa! Kamu sudah menjalankan program pertamamu.

Tantangan terakhir sebelum lanjut ke bab berikutnya:
**Ubah kodenya untuk menyapa diri kamu sendiri!**

Contoh: \`print("Halo, Budi!")\``,
                codeTemplate: 'print("Halo, ...")',
                hints: ['Ganti teks di dalam tanda kutip dengan namamu']
            }
        ],
        xpReward: 50,
        estimatedTime: 10
    },
    {
        id: 'py-t1-variables',
        title: 'Variabel: Menyimpan Data',
        description: 'Pelajari cara menyimpan dan menggunakan data dengan variabel.',
        tier: 1,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Apa itu Variabel?',
                content: `Bayangkan variabel seperti sebuah **kotak** yang memiliki label nama.

Di dalam kotak ini, kamu bisa menyimpan berbagai macam benda (data).
- Kotak berlabel "nama" bisa menyimpan teks "Budi".
- Kotak berlabel "umur" bisa menyimpan angka 17.

Dalam programming, variabel adalah konsep paling dasar untuk menyimpan informasi.`
            },
            {
                id: 'why-vars',
                type: 'text',
                title: 'Mengapa Variabel Penting?',
                content: `Kenapa tidak langsung tulis datanya saja?

Variabel membuat kodemu:
1.  **Fleksibel**: Kamu bisa mengubah isi kotak tanpa mengubah kode lainnya.
2.  **Mudah Dibaca**: \`luas = p * l\` lebih mudah dimengerti daripada \`50 = 10 * 5\`.
3.  **Reusable**: Data yang disimpan bisa dipanggil berkali-kali.`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Cara Membuat Variabel',
                content: `Di Python, membuat variabel itu sangat simpel. Kamu tidak perlu "deklarasi" tipe data (seperti di C++ atau Java).

Cukup tulis nama variabel, tanda sama dengan, lalu nilainya.

**Rumus:**
\`nama_variabel = nilai\`

**Contoh:**
\`\`\`python
nama = "Budi"
umur = 17
tinggi = 170.5
\`\`\``
            },
            {
                id: 'naming-rules',
                type: 'text',
                title: 'Aturan Penamaan',
                content: `Kamu tidak bisa sembarangan memberi nama variabel. Ada aturannya:

**Boleh:**
-   Huruf (a-z, A-Z)
-   Angka (0-9)
-   Underscore (_)

**Tidak Boleh:**
-   Diawali dengan angka (Contoh salah: \`1nama\`)
-   Mengandung spasi (Contoh salah: \`nama saya\`)
-   Menggunakan kata kunci Python (seperti \`print\`, \`if\`, \`for\`)

**Tips:** Gunakan **snake_case** (huruf kecil semua dipisah underscore) agar mudah dibaca. Contoh: \`nama_lengkap\`.`
            },
            {
                id: 'examples',
                type: 'text',
                title: 'Contoh Penggunaan',
                content: `Lihat bagaimana kita menggunakan variabel dalam kode nyata.

**Contoh 1: Menyapa dengan Nama**
\`\`\`python
nama = "Siti"
print(nama)
\`\`\`
Output: \`Siti\`

**Contoh 2: Menggabungkan dengan Teks**
\`\`\`python
nama = "Andi"
print("Halo, " + nama)
\`\`\`
Output: \`Halo, Andi\``
            },
            {
                id: 'guided',
                type: 'code',
                title: 'Coba Sendiri',
                content: `Sekarang giliranmu.

Tugas:
1.  Buat variabel bernama \`nama_hewan\`
2.  Isi dengan nama hewan favoritmu (misal: "Kucing")
3.  Tampilkan isi variabel tersebut.

Kode dasar sudah disiapkan.`,
                codeTemplate: 'nama_hewan = "..."\nprint(nama_hewan)',

                hints: ['Isi titik-titik dengan teks', 'Jangan lupa tanda kutip untuk teks']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Tantangan Variabel',
                content: `Mari kita buat program perkenalan singkat.

Buatlah dua variabel:
1.  \`nama\` berisi namamu
2.  \`hobi\` berisi hobimu

Lalu tampilkan keduanya menggunakan \`print\`.

Contoh Output:
\`Budi\`
\`Mancing\``,
                codeTemplate: 'nama = "..."\nhobi = "..."\n\nprint(nama)\nprint(hobi)',
                hints: ['Buat satu variabel per baris', 'Gunakan print terpisah untuk masing-masing variabel']
            }
        ],
        xpReward: 75,
        estimatedTime: 15
    },
    {
        id: 'py-t1-datatypes',
        title: 'Tipe Data Dasar',
        description: 'Kenali perbedaan antara teks, angka bulat, dan angka desimal.',
        tier: 1,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Jenis-Jenis Data',
                content: `Komputer membedakan data berdasarkan jenisnya. Kamu tidak bisa menjumlahkan "Budi" + 10, kan?

Di Python, ada 3 tipe data dasar yang wajib kamu tahu sekarang:
1.  **String** (Teks)
2.  **Integer** (Angka Bulat)
3.  **Float** (Angka Desimal)`
            },
            {
                id: 'string',
                type: 'text',
                title: 'String (Teks)',
                content: `String adalah kumpulan karakter atau teks. Cirinya selalu diapit oleh **tanda kutip** (bisa satu \`'\` atau dua \`"\`).

**Contoh:**
\`"Halo Dunia"\`
\`'Python itu asik'\`
\`"12345"\` (Ini tetap dianggap teks karena ada kutipnya!)`
            },
            {
                id: 'number',
                type: 'text',
                title: 'Integer & Float (Angka)',
                content: `Untuk angka, kita punya dua jenis:

**1. Integer (int)**
Angka bulat tanpa koma. Bisa positif atau negatif.
Contoh: \`10\`, \`0\`, \`-5\`, \`1000\`

**2. Float**
Angka pecahan atau desimal. Di programming, kita pakai **titik** \`.\` bukan koma.
Contoh: \`3.14\`, \`2.5\`, \`-0.01\``
            },
            {
                id: 'check-type',
                type: 'text',
                title: 'Mengecek Tipe Data',
                content: `Kadang kita bingung, "ini data tipe apa ya?".

Python punya alat bantu bernama \`type()\`.

\`\`\`python
print(type("Halo"))
print(type(17))
\`\`\`

Output:
\`<class 'str'>\` (artinya String)
\`<class 'int'>\` (artinya Integer)`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Eksperimen Tipe Data',
                content: `Coba kita lihat bedanya String dan Integer saat dijumlahkan.

Kode di bawah ini akan error jika kamu menjumlahkan string dengan integer secara langsung.

Tugas:
1. Perbaiki variabel \`angka_dua\` agar menjadi integer (hapus tanda kutipnya).
2. Jalankan kode.`,
                codeTemplate: 'angka_satu = 5\nangka_dua = "10" # Hapus tanda kutip ini!\n\nhasil = angka_satu + angka_dua\nprint(hasil)',

                hints: ['Hapus tanda kutip disekitar angka 10', 'Integer tidak memakai kutip']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Tantangan Biodata',
                content: `Buatlah 3 variabel dengan tipe data yang tepat untuk menyimpan biodata ini:

1.  \`nama\` (String): Isi dengan "CatCoder"
2.  \`level\` (Integer): Isi dengan 1
3.  \`rating\` (Float): Isi dengan 5.0

Lalu print ketiganya berurutan.`,
                codeTemplate: '# Tulis kodemu di sini\n',
                hints: ['String pakai kutip, angka tidak', 'Float pakai titik']
            }
        ],
        xpReward: 75,
        estimatedTime: 12
    },
    {
        id: 'py-t1-input',
        title: 'Input: Terima Masukan User',
        description: 'Buat program interaktif yang menerima input dari pengguna.',
        tier: 1,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Komunikasi Dua Arah',
                content: `Sejauh ini, program kita hanya "berbicara" sendiri (output).
                
Agar lebih seru, program harus bisa "mendengar" (input) dari user.
Bayangkan seperti chat bot:
Bot: "Siapa namamu?"
Kamu: "Budi"
Bot: "Halo Budi!"`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Fungsi input()',
                content: `Kita menggunakan fungsi \`input()\` untuk meminta data.

**Sintaks:**
\`\`\`python
variabel_penampung = input("Pesan pertanyaan untuk user")
\`\`\`

Program akan **berhenti** sejenak dan menunggu user mengetik sesuatu lalu menekan Enter.`
            },
            {
                id: 'example',
                type: 'text',
                title: 'Contoh Sederhana',
                content: `Mari lihat kode program sapaan.

\`\`\`python
nama = input("Siapa namamu? ")
print("Halo " + nama)
\`\`\`

Saat dijalankan:
1. Muncul teks "Siapa namamu? "
2. User ketik "Andi"
3. Variabel \`nama\` sekarang berisi "Andi"
4. Print menampilkan "Halo Andi"`
            },
            {
                id: 'important',
                type: 'text',
                title: 'Penting: Input Selalu String',
                content: `Ini aturan emas yang sering dilupakan pemula:
**Apapun yang diketik user di input(), akan dianggap sebagai TEXT (String).**

Meskipun user mengetik angka \`100\`, Python menganggapnya sebagai teks \`"100"\`.

Jika kamu ingin menjumlahkannya, kamu harus mengubahnya menjadi angka dulu (Konversi).`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Simulasi Input',
                content: `Karena ini adalah text editor, kita tidak bisa melakukan input interaktif secara langsung. Kita akan mensimulasikannya.

Tugas:
Gunakan variabel untuk menggabungkan kata sapaan.`,
                codeTemplate: 'nama = "Programmer"\npesan = "Semangat belajar, " + nama\nprint(pesan)',

                hints: ['Gunakan operator + untuk menggabungkan string']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Tantangan Chatbot',
                content: `Buatlah program chatbot sederhana.

1.  Buat variabel \`nama\` isi dengan namamu.
2.  Buat variabel \`makanan\` isi dengan makanan favoritmu.
3.  Print kalimat: "Halo [nama], aku tahu kamu suka [makanan]"

Gunakan teknik penggabungan string (+)`,
                codeTemplate: 'nama = "..."\nmakanan = "..."\n\n# Gabungkan dan print di sini',
                hints: ['Contoh: print("Halo " + nama + "...")']
            }
        ],
        xpReward: 75,
        estimatedTime: 15
    },

    // =====================================================
    // PYTHON - TIER 2: SPROUT (Basic Control Flow)
    // =====================================================
    {
        id: 'py-t2-conditionals',
        title: 'Percabangan: If/Else',
        description: 'Buat program yang bisa mengambil keputusan berdasarkan kondisi.',
        tier: 2,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Membuat Keputusan',
                content: `Dalam kehidupan nyata, kita sering membuat keputusan:
-   **Jika** hujan, bawa payung.
-   **Jika** nilai ujian >= 75, lulus. **Jika tidak**, remedial.

Program komputer juga perlu kemampuan ini. Di Python, kita menggunakan percabangan (Branching) dengan \`if\`, \`elif\`, dan \`else\`.`
            },
            {
                id: 'syntax-if',
                type: 'text',
                title: 'Konsep Dasar: If',
                content: `Kita mulai dari yang paling sederhana: \`if\` (jika).

Kode di dalam blok \`if\` hanya akan dijalankan **JIKA** kondisinya benar (True).

**Sintaks:**
\`\`\`python
if kondisi:
    lakukan_sesuatu()
\`\`\`

**Contoh:**
\`\`\`python
nilai = 80
if nilai > 75:
    print("Selamat, kamu lulus!")
\`\`\`
Karena 80 > 75, maka pesan akan muncul.`
            },
            {
                id: 'syntax-else',
                type: 'text',
                title: 'Pilihan Ganda: Else',
                content: `Bagaimana jika kondisinya salah? Kita pakai \`else\` (selain itu).

\`\`\`python
nilai = 50
if nilai > 75:
    print("Lulus")
else:
    print("Belum lulus")
\`\`\`
Karena 50 tidak lebih besar dari 75, program akan melompat ke bagian \`else\`.`
            },
            {
                id: 'operators',
                type: 'text',
                title: 'Operator Perbandingan',
                content: `Untuk membuat kondisi, gunakan simbol-simbol ini:

-   \`==\` (Sama dengan) <- Hati-hati, beda dengan \`=\`
-   \`!=\` (Tidak sama dengan)
-   \`>\` (Lebih besar)
-   \`<\` (Lebih kecil)
-   \`>=\` (Lebih besar sama dengan)
-   \`<=\` (Lebih kecil sama dengan)`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Cek Angka Positif',
                content: `Coba buat logika sederhana untuk mengecek apakah sebuah angka positif atau negatif.

Tugas:
Lengkapi kode untuk mengecek jika \`angka\` kurang dari 0.`,
                codeTemplate: 'angka = -5\n\nif angka > 0:\n    print("Positif")\nelif angka < 0:\n    # Tulis kodemu di sini\n    print("Negatif")',

                hints: ['Gunakan elif angka < 0:', 'Jangan lupa titik dua (:)']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Tantangan SIM',
                content: `Buat sistem pengecekan umur untuk SIM.

1.  Buat variabel \`umur\`.
2.  Jika \`umur\` >= 17, print "Boleh buat SIM".
3.  Jika tidak, print "Belum cukup umur".

Coba set \`umur\` jadi 16 untuk melihat hasilnya.`,
                codeTemplate: 'umur = 16\n# Tulis logika if/else di sini\n',
                hints: ['Gunakan if umur >= 17:', 'Gunakan else: untuk kondisi lainnya']
            }
        ],
        xpReward: 100,
        estimatedTime: 20
    },
    {
        id: 'py-t2-loops-for',
        title: 'Perulangan: For Loop',
        description: 'Jalankan kode berulang kali dengan for loop.',
        tier: 2,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Mengapa Perlu Loop?',
                content: `Bayangkan jika kamu harus menampilkan teks "Saya tidak akan telat lagi" sebanyak 100 kali.

Capek kalau diketik manual kan?
\`\`\`python
print("Saya tidak akan telat lagi")
print("Saya tidak akan telat lagi")
# ... 98 baris lagi ...
\`\`\`

Programmer malas (dalam artian positif), jadi kita pakai **Loop** untuk mengulanginya otomatis!`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Konsep: for loop',
                content: `Di Python, \`for\` loop digunakan untuk mengulangi kode sejumlah kali yang ditentukan.

Kita biasanya menggunakan fungsi \`range(n)\` untuk membuat urutan angka.

**Contoh:**
\`\`\`python
for i in range(5):
    print("Halo")
\`\`\`
Kode di atas akan menampilkan "Halo" sebanyak 5 kali (0 sampai 4).`
            },
            {
                id: 'range-detail',
                type: 'text',
                title: 'Bedah range()',
                content: `Fungsi \`range()\` itu unik.

-   \`range(5)\` = 0, 1, 2, 3, 4 (5 angka, mulai dari 0)
-   \`range(1, 4)\` = 1, 2, 3 (mulai dari 1, berhenti SEBELUM 4)

**Penting:** Batas atas (angka kedua) tidak pernah diikutsertakan.`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Hitung Mundur',
                content: `Kita bisa menggunakan range dengan langkah mundur.

Tugas: Jelajahi kode di bawah dan coba jalankan.`,
                codeTemplate: 'print("Mulai hitung mundur...")\nfor i in range(3, 0, -1):\n    print(i)\nprint("Meluncur!")',

                hints: ['Parameter ketiga range adalah "langkah" (step)', '-1 artinya mundur']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Tantangan Kelipatan',
                content: `Tampilkan angka kelipatan 5 dari 5 sampai 25.
(Hasil: 5, 10, 15, 20, 25)

Tips: Gunakan \`range(start, stop, step)\`. Ingat, *stop* tidak termasuk, jadi mungkin kamu perlu angka 26?`,
                codeTemplate: '# Gunakan for loop dan range disini\n',
                hints: ['range(5, 26, 5)', 'start=5, stop=26, step=5']
            }
        ],
        xpReward: 125,
        estimatedTime: 20
    },
    {
        id: 'py-t2-functions',
        title: 'Fungsi: Kode Reusable',
        description: 'Buat blok kode yang bisa dipanggil berkali-kali.',
        tier: 2,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Apa itu Fungsi?',
                content: `Fungsi (Function) adalah **blok kode yang diberi nama**.

Bayangkan seperti resep masakan. Kamu tulis resepnya sekali (\`def\`), lalu kamu bisa memasaknya (\`call\`) berkali-kali kapanpun kamu mau tanpa harus mengingat detail setiap langkahnya.`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Cara Membuat Fungsi',
                content: `Gunakan kata kunci \`def\` (definisi).

**Sintaks:**
\`\`\`python
def nama_fungsi():
    # kode di sini
    print("Fungsi dijalankan")
\`\`\`

**Cara Memanggil:**
\`\`\`python
nama_fungsi()
\`\`\``
            },
            {
                id: 'parameters',
                type: 'text',
                title: 'Parameter (Input)',
                content: `Fungsi bisa menerima data agar lebih fleksibel. Data ini disebut **Parameter**.

\`\`\`python
def sapa(nama):
    print("Halo " + nama)

sapa("Budi")  # Output: Halo Budi
sapa("Siti")  # Output: Halo Siti
\`\`\`

Di sini, \`nama\` adalah variabel spesial yang isinya berubah tergantung apa yang kita kirim saat memanggil fungsi.`
            },
            {
                id: 'return',
                type: 'text',
                title: 'Return (Output)',
                content: `Fungsi juga bisa **mengembalikan nilai** menggunakan \`return\`.

Bedanya dengan print apa?
-   \`print\` hanya menampilkan teks ke layar.
-   \`return\` memberikan nilai kembali ke kode program, yang bisa disimpan di variabel.

\`\`\`python
def tambah(a, b):
    return a + b

hasil = tambah(5, 3)
print(hasil) # 8
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Latihan Fungsi',
                content: `Buatlah fungsi sederhana bernama \`kuadrat\` yang menerima satu angka, dan mengembalikan hasil pangkat duanya.`,
                codeTemplate: 'def kuadrat(angka):\n    # Tulis kodemu disini\n    return ...\n\nprint(kuadrat(4))',

                hints: ['Gunakan operator ** 2 untuk pangkat dua']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Tantangan Diskon',
                content: `Buat fungsi bernama \`hitung_diskon\`.
1.  Menerima parameter \`harga\`.
2.  Mengembalikan harga setelah didiskon 10%.

Rumus: \`harga - (harga * 0.1)\`

Contoh: \`hitung_diskon(10000)\` harusnya return \`9000\`.`,
                codeTemplate: 'def hitung_diskon(harga):\n    # Return harga akhir\n    pass\n\nprint(hitung_diskon(10000))',
                hints: ['Gunakan return harga * 0.9 atau rumus di atas']
            }
        ],
        xpReward: 150,
        estimatedTime: 25
    },

    // =====================================================
    // JAVASCRIPT - TIER 1
    // =====================================================
    {
        id: 'js-t1-hello',
        title: 'Hello, JavaScript!',
        description: 'Tulis program JavaScript pertamamu dan kenali console.log().',
        tier: 1,
        language: 'javascript',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'JavaScript: Bahasa Web',
                content: `JavaScript (JS) adalah bahasa yang membuat website menjadi **hidup**!

HTML hanya membuat struktur (seperti tulang).
CSS mempercantik tampilan (seperti baju).
JavaScript memberikan "otak" dan kemampuan bergerak.

Setiap tombol yang kamu klik, notifikasi yang muncul, animasi di website... itu semua kerjaan JavaScript.`
            },
            {
                id: 'console',
                type: 'text',
                title: 'Menampilkan Pesan',
                content: `Langkah pertama: Bagaimana cara JS menampilkan pesan?

Kita menggunakan \`console.log()\`.
Perintah ini mengirim pesan rahasia ke "Console" browser (tempat spesial untuk programmer melihat log).

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

Mirip \`print()\` di Python, tapi lebih panjang sedikit.`
            },
            {
                id: 'syntax-details',
                type: 'text',
                title: 'Detail Sintaks',
                content: `Perhatikan beberapa hal penting di JS:

1.  **Kurung** \`()\`: Mengapit isi pesan.
2.  **Kutip** \`""\` atau \`''\`: Menandakan teks.
3.  **Titik Koma** \`;\`: Menandakan akhir baris perintah (seperti titik dalam kalimat).

Meskipun JS modern sering membolehkan kita menghapus \`;\`, sebagai pemula, **biasakan pakai titik koma** agar rapi.`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Coba Sendiri',
                content: `Tampilkan "Hello, World!" menggunakan console.log().

Jangan lupa titik komanya ya!`,
                codeTemplate: 'console.log("Hello, World!");',

                hints: ['Gunakan console.log() dengan teks dalam kutip', 'Akhiri dengan titik koma ;']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Tantangan Web Developer',
                content: `Sebagai calon Web Developer, tugas pertamamu adalah menyapa pengunjung.

Tulis kode untuk menampilkan:
**"Selamat datang di websiteku!"**`,
                codeTemplate: '// Tulis kodemu di sini\n',
                hints: ['Gunakan console.log(...)', 'Pastikan teksnya sama persis']
            }
        ],
        xpReward: 50,
        estimatedTime: 10
    },
    {
        id: 'js-t1-variables',
        title: 'Variables: let, const',
        description: 'Pelajari cara modern mendeklarasikan variabel di JavaScript.',
        tier: 1,
        language: 'javascript',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Variabel di JavaScript',
                content: `Dulu, JS hanya punya satu cara membuat variabel: \`var\`.
Tapi \`var\` punya banyak masalah dan membingungkan.

Di Javascript Modern (ES6+), kita punya 2 teman baru yang lebih baik:
1.  **const** (Constant)
2.  **let**`
            },
            {
                id: 'const-vs-let',
                type: 'text',
                title: 'const vs let',
                content: `**1. const (Gunakan ini DULU!)**
Buat variabel yang nilainya **TIDAK AKAN** berubah.
\`\`\`javascript
const nama = "Budi";
const tgl_lahir = "1 Januari";
\`\`\`

**2. let (Gunakan jika perlu berubah)**
Buat variabel yang nilainya **MUNGKIN** berubah nanti.
\`\`\`javascript
let skor = 0;
skor = 10;
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Latihan Variabel',
                content: `Buat variabel \`nama\` menggunakan \`const\`, lalu tampilkan.`,
                codeTemplate: 'const nama = "CatCoder";\nconsole.log(nama);',

                hints: ['const nama = "..."', 'Jangan lupa titik koma']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Tantangan Update Skor',
                content: `Kita simulasi skor game.

1.  Buat variabel \`skor\` pakai \`let\`, isi dengan 0.
2.  Print \`skor\`.
3.  Ubah \`skor\` jadi 100.
4.  Print \`skor\` lagi.`,
                codeTemplate: 'let skor = 0;\n// Lanjutkan...\n',
                hints: ['Jangan pakai const karena nilainya berubah', 'Pakai console.log untuk print']
            }
        ],
        xpReward: 75,
        estimatedTime: 15
    },

    // =====================================================
    // C++ - TIER 1
    // =====================================================
    {
        id: 'cpp-t1-hello',
        title: 'Hello, C++!',
        description: 'Tulis program C++ pertamamu dan pahami strukturnya.',
        tier: 1,
        language: 'cpp',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'C++: Bahasa High Performance',
                content: `C++ adalah rajanya kecepatan.

Bahasa ini dipakai untuk membuat:
- Game Engine besar (Unreal Engine)
- Browser (Chrome, Firefox)
- Sistem Operasi (Windows)

C++ sedikit lebih rumit dari Python, tapi memberimu kontrol penuh atas komputer.`
            },
            {
                id: 'structure',
                type: 'text',
                title: 'Anatomi C++',
                content: `Program C++ punya struktur wajib. Tidak bisa langsung tulis perintah.

\`\`\`cpp
#include <iostream>

int main() {
    std::cout << "Hello";
    return 0;
}
\`\`\`

**Apa itu??**
1.  \`#include <iostream>\`: Import alat input-output.
2.  \`int main() { ... }\`: Fungsi utama. Kode dimulai dari sini.
3.  \`std::cout\`: Perintah print ("Character Output").
4.  \`return 0\`: Memberitahu OS bahwa program sukses.`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Latihan Hello World',
                content: `Tulis ulang program Hello World C++ dengan benar.`,
                codeTemplate: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}',

                hints: ['Jangan lupa std::cout', 'Perhatikan tanda << (arah panah ke kiri)', 'Titik koma wajib!']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Tantangan C++',
                content: `Buat program C++ yang menampilkan namamu sendiri.

Ingat strukturnya:
1. Include library
2. Main function
3. Cout namamu
4. Return 0`,
                codeTemplate: '#include <iostream>\n\nint main() {\n    // Tulis kodemu di sini\n}',
                hints: ['std::cout << "Namamu";', 'Jangan lupa return 0;']
            }
        ],
        xpReward: 50,
        estimatedTime: 12
    },
    {
        id: 'cpp-t1-variables',
        title: 'Variables & Types',
        description: 'Pelajari tipe data dan deklarasi variabel di C++.',
        tier: 1,
        language: 'cpp',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Statically Typed',
                content: `C++ itu "Statically Typed".

Artinya: **Kamu harus bilang ke komputer, tipe data apa yang mau disimpan.**

-   Kalau mau simpan angka, harus bilang "Ini Integer".
-   Kalau mau simpan teks, harus bilang "Ini String".

Tidak boleh asal ganti-ganti di tengah jalan!`
            },
            {
                id: 'types',
                type: 'text',
                title: 'Kamus Tipe Data',
                content: `Hafalkan tipe data dasar ini:

-   \`int\`: Angka bulat (42)
-   \`double\`: Angka desimal (3.14)
-   \`char\`: Satu hurud ('A')
-   \`string\`: Teks ("Halo") -> Perlu \`#include <string>\`
-   \`bool\`: True/False`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Deklarasi Variabel',
                content: `**Rumus:**
\`TipeData namaVariabel = Nilai;\`

**Contoh:**
\`\`\`cpp
int umur = 17;
double tinggi = 170.5;
std::string nama = "Budi";
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Latihan Variabel',
                content: `Lengkapi kode berikut untuk menampilkan umur.`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int umur = 17;\n    cout << "Umur: " << umur;\n    return 0;\n}',

                hints: ['Gunakan cout << "Teks" << variabel', 'using namespace std; agar tidak perlu tulis std:: terus']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Biodata C++',
                content: `Buat 2 variabel di dalam main():
1.  \`int level\` dengan nilai 5.
2.  \`double exp\` dengan nilai 50.5.

Tampilkan keduanya. Gunakan \`std::endl\` atau \`\\n\` untuk baris baru.`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Buat variabel dan print\n    return 0;\n}',
                hints: ['cout << level << endl;', 'cout << exp << endl;']
            }
        ],
        xpReward: 75,
        estimatedTime: 15
    }
];

// Helper functions
export const getLessonsByLanguage = (language: string) => lessons.filter(l => l.language === language);
export const getLessonById = (id: string) => lessons.find(l => l.id === id);
export const getLessonsByTier = (tier: number) => lessons.filter(l => l.tier === tier);
export const getLessonCount = () => ({
    python: lessons.filter(l => l.language === 'python').length,
    javascript: lessons.filter(l => l.language === 'javascript').length,
    cpp: lessons.filter(l => l.language === 'cpp').length,
    total: lessons.length
});
