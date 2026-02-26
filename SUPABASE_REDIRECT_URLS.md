# Supabase Redirect URLs Configuration

Untuk mengatasi masalah redirect yang lari ke `catcoderr.netlify.app`, kamu perlu memperbarui daftar **Redirect URLs** di dashboard Supabase kamu.
Berdasarkan screenshot yang kamu kasih, **Site URL** kamu sudah benar (`https://catcoder.online`), tapi daftar Redirect URLs-nya masih memakai URL netlify lama.

Silakan **copy dan paste (tambahkan)** satu per satu URL di bawah ini ke kolom **Redirect URLs** dengan menekan tombol Add URL:

- `https://catcoder.online/reset-password`
- `https://catcoder.online/home`
- `https://catcoder.online/onboarding`
- `https://catcoder.online/auth/callback`
- `https://catcoder.online/**`

---

## 📋 Daftar Lengkap Redirect URLs (Kondisi Final)

Agar bersih dan menghindari error, saya sarankan untuk **menghapus semua yang bernama `catcoderr.netlify.app`** dan biarkan kondisinya menjadi seperti list di bawah ini:

1. `https://catcoder.online/reset-password`
2. `https://catcoder.online/home`
3. `https://catcoder.online/onboarding`
4. `https://catcoder.online/auth/callback`
5. `https://catcoder.online/**`
6. `http://localhost:5173/**`
7. `http://localhost:5173/home`
8. `http://localhost:5173/auth/callback`

Setelah disamakan dengan list di atas, semua proses login, lupa password, dan magic link kamu di domain baru (`catcoder.online`) serta di localhost akan berjalan tanpa ada error lempar ke netlify lagi!
