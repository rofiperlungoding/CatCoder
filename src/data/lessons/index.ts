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
                id: 'intro',
                type: 'text',
                title: '🌱 Welcome to Programming!',
                content: `Selamat datang di dunia programming! 

Di pelajaran pertama ini, kamu akan menulis program pertamamu. Jangan khawatir, kita akan mulai dari yang paling dasar.

**Apa itu Programming?**
Programming adalah cara kita "berbicara" dengan komputer. Kita menulis instruksi dalam bahasa yang komputer pahami, dan komputer akan menjalankan instruksi tersebut.

**Mengapa Python?**
Python adalah bahasa yang sangat ramah untuk pemula karena:
- Sintaksnya sederhana dan mudah dibaca
- Tidak perlu setup yang rumit
- Banyak digunakan di dunia nyata (AI, Data Science, Web)`
            },
            {
                id: 'concept',
                type: 'text',
                title: '📖 Mengenal print()',
                content: `**Fungsi print()** adalah cara Python menampilkan teks ke layar.

Bayangkan kamu ingin komputer mengatakan sesuatu. Kamu perlu "mencetak" (print) kata-kata tersebut ke layar.

**Anatomi print():**
\`\`\`
print("teks yang ingin ditampilkan")
\`\`\`

Perhatikan:
1. \`print\` - nama fungsi (perintah)
2. \`(\` dan \`)\` - kurung pembuka dan penutup
3. \`"\` dan \`"\` - tanda kutip mengapit teks
4. Teks di dalam kutip akan ditampilkan`
            },
            {
                id: 'example1',
                type: 'text',
                title: '👀 Contoh-Contoh',
                content: `Lihat beberapa contoh penggunaan print():

**Contoh 1:** Menampilkan sapaan
\`\`\`python
print("Halo!")
\`\`\`
Output: \`Halo!\`

**Contoh 2:** Menampilkan kalimat
\`\`\`python
print("Saya sedang belajar Python")
\`\`\`
Output: \`Saya sedang belajar Python\`

**Contoh 3:** Menampilkan emoji
\`\`\`python
print("🐱 Meow!")
\`\`\`
Output: \`🐱 Meow!\``
            },
            {
                id: 'guided-practice',
                type: 'code',
                title: '🎯 Latihan Terbimbing',
                content: `Sekarang giliranmu! Tulis kode untuk menampilkan "Hello, World!" ke layar.

**Tips:**
- Pastikan menggunakan tanda kutip ganda (" ")
- Perhatikan huruf besar/kecil di "Hello, World!"
- Jangan lupa tanda seru di akhir

Kode sudah disiapkan, coba klik "Run Code" untuk melihat hasilnya!`,
                codeTemplate: 'print("Hello, World!")',
                expectedOutput: 'Hello, World!',
                hints: ['Gunakan print() dengan teks di dalam kutip', 'Pastikan teksnya persis: Hello, World!']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: '🏆 Tantangan Mini',
                content: `Sekarang coba modifikasi kode di atas untuk menampilkan namamu sendiri!

Contoh: \`print("Halo, namaku Budi!")\`

Setelah berhasil, kamu sudah resmi menjadi programmer! 🎉`,
                hints: ['Ganti teks di dalam kutip dengan sapaan yang menyertakan namamu']
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
                title: '📦 Apa itu Variabel?',
                content: `Bayangkan variabel seperti **kotak berlabel** yang bisa menyimpan sesuatu.

Misalnya:
- Kotak berlabel "nama" menyimpan "Budi"
- Kotak berlabel "umur" menyimpan 17
- Kotak berlabel "tinggi" menyimpan 170.5

Dalam programming, kita sering perlu menyimpan data untuk digunakan nanti. Variabel membantu kita melakukan itu!

**Mengapa Variabel Penting?**
- Menyimpan data untuk digunakan berkali-kali
- Membuat kode lebih mudah dibaca
- Memungkinkan data berubah selama program berjalan`
            },
            {
                id: 'concept',
                type: 'text',
                title: '📝 Cara Membuat Variabel',
                content: `Di Python, membuat variabel sangat mudah:

\`\`\`python
nama_variabel = nilai
\`\`\`

**Contoh:**
\`\`\`python
nama = "Budi"
umur = 17
tinggi = 170.5
\`\`\`

**Aturan Penamaan Variabel:**
✅ Boleh menggunakan huruf, angka, underscore
✅ Harus diawali huruf atau underscore
❌ Tidak boleh diawali angka
❌ Tidak boleh mengandung spasi
❌ Tidak boleh menggunakan kata khusus Python`
            },
            {
                id: 'example',
                type: 'text',
                title: '👀 Contoh Penggunaan',
                content: `**Contoh 1:** Menyimpan dan menampilkan nama
\`\`\`python
nama = "Siti"
print(nama)
\`\`\`
Output: \`Siti\`

**Contoh 2:** Mengubah nilai variabel
\`\`\`python
skor = 100
print(skor)
skor = 150
print(skor)
\`\`\`
Output: \`100\` lalu \`150\`

**Contoh 3:** Menggunakan variabel dalam kalimat
\`\`\`python
nama = "Andi"
print("Halo, " + nama)
\`\`\`
Output: \`Halo, Andi\``
            },
            {
                id: 'guided',
                type: 'code',
                title: '🎯 Latihan Terbimbing',
                content: `Buat variabel bernama "nama" dan isi dengan namamu, lalu tampilkan dengan print().

**Langkah-langkah:**
1. Buat variabel: \`nama = "NamaMu"\`
2. Tampilkan: \`print(nama)\``,
                codeTemplate: 'nama = "CatCoder"\nprint(nama)',
                expectedOutput: 'CatCoder',
                hints: ['Ingat format: nama_variabel = "nilai"', 'Gunakan print(nama) tanpa tanda kutip di sekitar nama']
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
                title: '🎨 Jenis-Jenis Data',
                content: `Dalam programming, data memiliki "tipe" yang berbeda-beda. Ini penting karena komputer memperlakukan setiap tipe secara berbeda.

**3 Tipe Data Dasar di Python:**

1. **String (str)** - Teks
   Contoh: \`"Halo"\`, \`"123"\`, \`"Budi"\`

2. **Integer (int)** - Angka Bulat
   Contoh: \`10\`, \`-5\`, \`1000\`

3. **Float** - Angka Desimal
   Contoh: \`3.14\`, \`-2.5\`, \`99.99\``
            },
            {
                id: 'detail',
                type: 'text',
                title: '🔍 Perbedaan Penting',
                content: `**String vs Number:**
\`\`\`python
# Ini string (teks)
nomor_hp = "08123456789"

# Ini integer (angka)
umur = 17

# Ini float (desimal)
tinggi = 170.5
\`\`\`

**Mengapa perbedaan ini penting?**
- \`"5" + "3"\` menghasilkan \`"53"\` (gabungan teks)
- \`5 + 3\` menghasilkan \`8\` (penjumlahan angka)

**Cara mengecek tipe data:**
\`\`\`python
print(type("Halo"))  # <class 'str'>
print(type(42))      # <class 'int'>
print(type(3.14))    # <class 'float'>
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: '🎯 Latihan',
                content: `Buat 3 variabel dengan tipe data berbeda dan tampilkan!`,
                codeTemplate: 'nama = "Python"\numur = 32\nrating = 4.9\nprint(nama)\nprint(umur)\nprint(rating)',
                expectedOutput: 'Python',
                hints: ['String menggunakan tanda kutip', 'Integer tidak perlu tanda kutip', 'Float adalah angka dengan titik desimal']
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
                title: '⌨️ Program Interaktif',
                content: `Sampai sekarang, program kita hanya menampilkan output. Tapi bagaimana jika kita ingin user bisa memberikan input?

**Fungsi input()** memungkinkan program meminta data dari user.

Bayangkan program seperti percakapan:
- Program: "Siapa namamu?"
- User: "Budi"
- Program: "Halo, Budi!"`
            },
            {
                id: 'syntax',
                type: 'text',
                title: '📝 Cara Menggunakan input()',
                content: `**Sintaks Dasar:**
\`\`\`python
variabel = input("Pesan untuk user: ")
\`\`\`

**Contoh:**
\`\`\`python
nama = input("Siapa namamu? ")
print("Halo, " + nama + "!")
\`\`\`

**Penting:** 
- input() selalu mengembalikan STRING
- Untuk angka, perlu dikonversi: \`int(input(...))\``
            },
            {
                id: 'example',
                type: 'text',
                title: '👀 Contoh Program',
                content: `**Program Sapaan:**
\`\`\`python
nama = input("Masukkan nama: ")
print("Selamat datang, " + nama + "!")
\`\`\`

**Program Kalkulator Sederhana:**
\`\`\`python
angka1 = int(input("Angka pertama: "))
angka2 = int(input("Angka kedua: "))
hasil = angka1 + angka2
print("Hasil: " + str(hasil))
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: '🎯 Latihan',
                content: `Karena simulator kita tidak bisa menerima input real, kita akan simulasikan dengan variabel.`,
                codeTemplate: '# Simulasi input\nnama = "CatCoder"\nprint("Halo, " + nama + "!")',
                expectedOutput: 'Halo, CatCoder!',
                hints: ['Gunakan + untuk menggabungkan string', 'Jangan lupa spasi dalam string jika perlu']
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
                title: '🔀 Membuat Keputusan',
                content: `Dalam kehidupan nyata, kita sering membuat keputusan:
- **Jika** hujan, bawa payung
- **Jika** nilai >= 75, lulus. **Kalau tidak**, remedial.

Program juga perlu membuat keputusan! Di Python, kita menggunakan **if, elif, else**.`
            },
            {
                id: 'syntax',
                type: 'text',
                title: '📝 Sintaks If/Else',
                content: `**Struktur Dasar:**
\`\`\`python
if kondisi:
    # kode jika kondisi True
else:
    # kode jika kondisi False
\`\`\`

**Dengan elif (else if):**
\`\`\`python
if kondisi1:
    # jika kondisi1 True
elif kondisi2:
    # jika kondisi2 True
else:
    # jika semua False
\`\`\`

**PENTING:** Perhatikan indentasi (spasi 4x) setelah if/else!`
            },
            {
                id: 'operators',
                type: 'text',
                title: '⚖️ Operator Perbandingan',
                content: `Untuk membuat kondisi, gunakan operator ini:

| Operator | Arti |
|----------|------|
| \`==\` | Sama dengan |
| \`!=\` | Tidak sama dengan |
| \`>\` | Lebih besar |
| \`<\` | Lebih kecil |
| \`>=\` | Lebih besar atau sama |
| \`<=\` | Lebih kecil atau sama |

**Contoh:**
\`\`\`python
umur = 18
if umur >= 17:
    print("Boleh punya SIM")
\`\`\``
            },
            {
                id: 'example',
                type: 'text',
                title: '👀 Contoh Program',
                content: `**Cek Nilai:**
\`\`\`python
nilai = 85
if nilai >= 90:
    print("A - Excellent!")
elif nilai >= 80:
    print("B - Good!")
elif nilai >= 70:
    print("C - Fair")
else:
    print("Perlu belajar lagi")
\`\`\`
Output: \`B - Good!\``
            },
            {
                id: 'practice',
                type: 'code',
                title: '🎯 Latihan',
                content: `Buat program yang mengecek apakah angka positif, negatif, atau nol.`,
                codeTemplate: 'angka = 10\nif angka > 0:\n    print("Positif")\nelif angka < 0:\n    print("Negatif")\nelse:\n    print("Nol")',
                expectedOutput: 'Positif',
                hints: ['Gunakan > untuk lebih besar dari', 'Gunakan < untuk lebih kecil dari', 'Perhatikan indentasi!']
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
                title: '🔄 Mengapa Perlu Perulangan?',
                content: `Bayangkan kamu harus menulis:
\`\`\`python
print("1")
print("2")
print("3")
... sampai 100
\`\`\`

Capek, kan? Loop membuat ini mudah!`
            },
            {
                id: 'syntax',
                type: 'text',
                title: '📝 Sintaks For Loop',
                content: `**With range():**
\`\`\`python
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4
\`\`\`

**range(start, end):**
\`\`\`python
for i in range(1, 6):
    print(i)  # 1, 2, 3, 4, 5
\`\`\`

**Iterasi list:**
\`\`\`python
buah = ["apel", "jeruk", "mangga"]
for b in buah:
    print(b)
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: '🎯 Latihan',
                content: `Print angka 1 sampai 5 menggunakan for loop.`,
                codeTemplate: 'for i in range(1, 6):\n    print(i)',
                expectedOutput: '1',
                hints: ['range(1, 6) menghasilkan 1,2,3,4,5', 'Batas akhir range tidak termasuk']
            }
        ],
        xpReward: 125,
        estimatedTime: 20
    },
    {
        id: 'py-t2-functions',
        title: 'Fungsi: Kode yang Bisa Dipakai Ulang',
        description: 'Buat blok kode yang bisa dipanggil berkali-kali.',
        tier: 2,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: '🧩 Apa itu Fungsi?',
                content: `Fungsi adalah **blok kode yang diberi nama** dan bisa dipanggil kapan saja.

Bayangkan resep masakan - kamu tulis sekali, bisa dimasak berkali-kali!

**Keuntungan Fungsi:**
- Kode tidak perlu ditulis ulang
- Program lebih terorganisir
- Mudah di-debug dan diperbaiki`
            },
            {
                id: 'syntax',
                type: 'text',
                title: '📝 Cara Membuat Fungsi',
                content: `**Sintaks:**
\`\`\`python
def nama_fungsi(parameter):
    # kode fungsi
    return hasil
\`\`\`

**Contoh:**
\`\`\`python
def sapa(nama):
    return "Halo, " + nama + "!"

print(sapa("Budi"))  # Halo, Budi!
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: '🎯 Latihan',
                content: `Buat fungsi greet yang mengembalikan sapaan.`,
                codeTemplate: 'def greet(nama):\n    return "Halo, " + nama + "!"\n\nprint(greet("CatCoder"))',
                expectedOutput: 'Halo, CatCoder!',
                hints: ['Gunakan def untuk mendefinisikan fungsi', 'return untuk mengembalikan nilai']
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
                title: '🌐 JavaScript: Bahasa Web',
                content: `JavaScript adalah bahasa yang membuat website menjadi interaktif!

Setiap tombol yang kamu klik, animasi yang kamu lihat, sebagian besar digerakkan oleh JavaScript.

**Di mana JavaScript digunakan?**
- Website interaktif
- Mobile apps (React Native)
- Server (Node.js)
- Game browser`
            },
            {
                id: 'console',
                type: 'text',
                title: '📝 console.log()',
                content: `Di JavaScript, kita menggunakan **console.log()** untuk menampilkan output.

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

Ini seperti \`print()\` di Python!`
            },
            {
                id: 'practice',
                type: 'code',
                title: '🎯 Latihan',
                content: `Tampilkan "Hello, World!" menggunakan console.log()`,
                codeTemplate: 'console.log("Hello, World!");',
                expectedOutput: 'Hello, World!',
                hints: ['Gunakan console.log() dengan teks dalam kutip', 'Jangan lupa titik koma di akhir!']
            }
        ],
        xpReward: 50,
        estimatedTime: 10
    },
    {
        id: 'js-t1-variables',
        title: 'Variables: let, const, var',
        description: 'Pelajari cara mendeklarasikan variabel di JavaScript.',
        tier: 1,
        language: 'javascript',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: '📦 Variabel di JavaScript',
                content: `JavaScript punya 3 cara mendeklarasikan variabel:

1. **let** - Variabel yang bisa diubah
2. **const** - Konstanta (tidak bisa diubah)
3. **var** - Cara lama (hindari!)

**Rekomendasi:**
- Gunakan \`const\` sebagai default
- Gunakan \`let\` jika nilai perlu berubah`
            },
            {
                id: 'syntax',
                type: 'text',
                title: '📝 Sintaks',
                content: `\`\`\`javascript
// const - tidak bisa diubah
const nama = "Budi";

// let - bisa diubah
let skor = 100;
skor = 150; // OK!

// var - hindari
var umur = 17;
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: '🎯 Latihan',
                content: `Buat variabel dengan const dan tampilkan.`,
                codeTemplate: 'const nama = "CatCoder";\nconsole.log(nama);',
                expectedOutput: 'CatCoder',
                hints: ['const untuk nilai yang tidak berubah', 'Jangan lupa titik koma!']
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
                title: '⚡ C++: Bahasa yang Powerful',
                content: `C++ adalah bahasa yang sangat cepat dan powerful!

**Digunakan untuk:**
- Game (Unreal Engine)
- Sistem Operasi
- Browser (Chrome, Firefox)
- Aplikasi kinerja tinggi

C++ lebih kompleks dari Python, tapi sangat worth it untuk dipelajari!`
            },
            {
                id: 'structure',
                type: 'text',
                title: '📝 Struktur Program C++',
                content: `\`\`\`cpp
#include <iostream>  // Library untuk input/output

int main() {         // Fungsi utama
    std::cout << "Hello, World!";
    return 0;        // Program selesai
}
\`\`\`

**Penjelasan:**
- \`#include\` - menyertakan library
- \`int main()\` - titik awal program
- \`std::cout\` - untuk output
- \`return 0\` - program sukses`
            },
            {
                id: 'practice',
                type: 'code',
                title: '🎯 Latihan',
                content: `Tulis program Hello World di C++.`,
                codeTemplate: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}',
                expectedOutput: 'Hello, World!',
                hints: ['Gunakan std::cout << untuk output', 'Jangan lupa return 0; di akhir main()']
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
                title: '📊 Tipe Data C++',
                content: `C++ adalah bahasa **statically typed** - kamu harus mendeklarasikan tipe variabel!

**Tipe Data Umum:**
| Tipe | Deskripsi | Contoh |
|------|-----------|--------|
| int | Angka bulat | 42 |
| double | Angka desimal | 3.14 |
| char | Satu karakter | 'A' |
| string | Teks | "Hello" |
| bool | True/False | true |`
            },
            {
                id: 'syntax',
                type: 'text',
                title: '📝 Deklarasi Variabel',
                content: `\`\`\`cpp
int umur = 17;
double tinggi = 170.5;
char nilai = 'A';
string nama = "Budi";
bool lulus = true;
\`\`\`

**Penting:** Setiap variabel HARUS punya tipe!`
            },
            {
                id: 'practice',
                type: 'code',
                title: '🎯 Latihan',
                content: `Buat beberapa variabel dan tampilkan.`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int umur = 17;\n    cout << "Umur: " << umur;\n    return 0;\n}',
                expectedOutput: 'Umur: 17',
                hints: ['Gunakan cout << untuk output', 'Bisa chain dengan << untuk multiple output']
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
