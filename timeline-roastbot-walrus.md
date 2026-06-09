# Timeline Pengerjaan — "Roast Bot" Walrus Memory World Cup

**Project:** Prediction Roaster bertenaga Walrus Memory
**Periode timeline:** 9 Juni – 15 Juni 2026 (7 hari)
**Deadline submission:** 24 Juni 2026 · **Pengumuman:** 2 Juli 2026

---

## Konteks Strategis

Tiga hal yang harus dijaga sepanjang pengerjaan:

1. **Milestone paling kritis:** MVP harus **live di Walrus Mainnet sebelum Kamis 11 Juni** (kickoff Piala Dunia). Laga pembuka = "Hari ke-1" memori agent. Kalau telat deploy, data prediksi telat terkumpul dan arc *before/after* jadi pendek.
2. **Inti penilaian = momen before/after.** Juri membandingkan agent hari ke-1 (roast sopan, belum kenal kamu) vs agent setelah 4+ hari (roast personal yang merujuk riwayat prediksi). Pastikan kontras ini terlihat jelas di interface publik.
3. **Buffer:** 7 hari ini fokus *build + akumulasi data awal*. Setelah hari ke-7 (16–24 Juni) masih ada waktu untuk terus mengumpulkan data laga, polish, dan submit. Jangan habiskan semua energi di minggu pertama.

---

## Hari 1 — Selasa, 9 Juni: Fondasi & Setup

**Tujuan:** Semua akun, tooling, dan kerangka proyek siap. Belum perlu fitur.

- [ ] Registrasi di DeepSurge + isi form submission Airtable (project name, deskripsi, GitHub repo, kontak)
- [ ] Join Walrus Discord; catat handle teman kalau mau saling referral (bonus 25%)
- [ ] Baca dokumentasi MemWal SDK (Python/TS) di walrus.xyz — fokus pada: cara membuat *memory space*, store, dan semantic retrieve
- [ ] Buat wallet Sui khusus "Sessions" (yang nanti dilaporkan ke panitia)
- [ ] Scaffold repo: Next.js (frontend) + FastAPI (backend) + struktur folder
- [ ] **Desain data model memori** — ini yang menentukan kualitas roast nanti:
  - `prediction`: user_id, match_id, predicted_winner, predicted_score, confidence, timestamp
  - `result`: match_id, actual_result, correct? (true/false)
  - `user_profile` (diturunkan dari memori): tim favorit, pola bias, streak benar/salah, hot-take menonjol

**Deliverable:** Repo publik live + entri DeepSurge + wallet Sessions tercatat.
**Kriteria yang dilayani:** Technical Execution (fondasi).

---

## Hari 2 — Rabu, 10 Juni: Core Build (Prediksi + Integrasi Memory)

**Tujuan:** Alur "user submit prediksi → tersimpan di Walrus" jalan end-to-end.

- [ ] Endpoint FastAPI: submit prediksi, simpan via MemWal SDK ke memory space per-user
- [ ] Endpoint: ambil daftar laga hari ini (sumber: API skor publik, atau seed manual jadwal grup dulu untuk MVP)
- [ ] Halaman Next.js: form prediksi sederhana + halaman "Prediksi Saya"
- [ ] Uji baca-tulis memori: submit prediksi → restart sesi → pastikan agent bisa retrieve kembali (bukti persistensi)
- [ ] Connect wallet Sui di frontend (kamu sudah familiar wagmi; sesuaikan ke Sui)

**Deliverable:** Bisa submit prediksi dan data benar-benar tersimpan + terbaca dari Walrus.
**Kriteria:** Technical Execution + Memory Depth (pondasi persistensi).

---

## Hari 3 — Kamis, 11 Juni: DEPLOY MAINNET + Laga Pembuka 🚀

**Tujuan:** Live di Mainnet sebelum kickoff. Ini hari paling penting.

- [ ] Deploy backend + frontend (Vercel untuk Next.js sesuai workflow kamu)
- [ ] Pastikan MemWal terhubung ke **Walrus Mainnet**, bukan testnet
- [ ] Smoke test di production: submit 1 prediksi nyata
- [ ] **Submit prediksi untuk laga pembuka** (Meksiko vs Afrika Selatan, Korea Selatan vs Czechia) — ini jadi "Hari ke-1" memori agent
- [ ] Ajak 2–3 teman ikut submit prediksi (makin banyak user, makin kaya demo)

**Deliverable:** Aplikasi live di Mainnet + data prediksi nyata pertama masuk.
**Kriteria:** Technical Execution (live & berfungsi) — syarat wajib submission.

---

## Hari 4 — Jumat, 12 Juni: Roast Engine v1

**Tujuan:** Agent bisa menilai hasil dan mengeluarkan roast pertama.

- [ ] Logika resolve hasil: setelah laga selesai, tandai prediksi benar/salah, update memori
- [ ] Roast engine v1: LLM membaca memori user → generate roast. Hari ini masih "ringan" (data baru 1 hari) — ini sengaja, untuk menangkap *before* state
- [ ] Simpan setiap roast ke log (untuk ditampilkan publik)
- [ ] Submit prediksi laga hari ini (Kanada, USA vs Paraguay, dll.) — terus tambah data

**Deliverable:** Roast pertama muncul + tersimpan. Screenshot "agent hari ke-1" untuk demo before/after.
**Kriteria:** Memory Depth (awal) + Creativity.

---

## Hari 5 — Sabtu, 13 Juni: Interface Publik & Shareability

**Tujuan:** Memori terlihat dan menarik untuk dibagikan (banyak laga hari ini = banyak data).

- [ ] Halaman publik: riwayat prediksi + roast log per user (syarat wajib: "memory visible & meaningful")
- [ ] **Shareable roast card** (gambar/komponen untuk diposting di X dengan #Walrus)
- [ ] Polish UI/UX (manfaatkan skill frontend kamu — bikin punya karakter, jangan template default)
- [ ] Submit prediksi banyak laga (Brasil vs Maroko, dll.)

**Deliverable:** Interface publik rapi + fitur share.
**Kriteria:** Creativity & Flair (ini bobot besar untuk viralitas).

---

## Hari 6 — Minggu, 14 Juni: Memory Depth — Pembeda Utama

**Tujuan:** Roast naik level dari "menilai 1 laga" jadi "merujuk pola lintas sesi". **Inilah yang dinilai juri.**

- [ ] Tingkatkan roast engine: agent harus merujuk pola dari beberapa hari, contoh:
  - *"Ini ketiga kalinya kamu jagoin tim tuan rumah dan salah terus."*
  - *"Confidence-mu 90% tapi akurasi cuma 25%, percaya diri yang salah tempat."*
  - Deteksi bias tim favorit, streak, kontradiksi
- [ ] Uji eksplisit kontras **Hari ke-1 vs Hari ke-4**: ambil user yang aktif sejak 11 Juni, tunjukkan roast-nya makin personal
- [ ] Submit prediksi laga hari ini (Jerman, Belanda vs Jepang, dll.)

**Deliverable:** Roast yang jelas-jelas mustahil ada di hari pertama. Catat 1 contoh before/after terbaik untuk demo.
**Kriteria:** Memory Depth & Authenticity (bobot terbesar).

---

## Hari 7 — Senin, 15 Juni: Polish, Feedback & Persiapan Submit

**Tujuan:** Menutup loop hackathon + rapikan untuk submission.

- [ ] Isi Walrus Memory feedback form + buat tiket GitHub yang relevan (ini juga jalur ke Feedback Prize: 6 pemenang @ $50)
- [ ] Posting demo/screenshot ke X dengan **#Walrus** (syarat wajib)
- [ ] Rapikan README repo: cara install, arsitektur, alamat wallet Sessions
- [ ] Mulai draft skrip demo video (≤ 3 menit) — struktur: masalah → agent hari ke-1 → agent hari ke-4 (momen before/after) → cara kerja Walrus Memory
- [ ] Bug fixing & stabilitas (juri menilai "does it work?")

**Deliverable:** Feedback terkirim, X post live, README & skrip demo siap.
**Kriteria:** Technical Execution (completeness) + Feedback Prize.

---

## Setelah Hari 7 (16–24 Juni) — Catatan

- Terus biarkan user submit prediksi → data makin kaya → roast makin tajam → demo before/after makin meyakinkan.
- Rekam & edit demo video.
- Final check semua syarat submission, lalu submit jauh sebelum deadline 24 Juni.

---

## Peta Kriteria Penilaian → Hari

| Kriteria | Bobot fokus | Dibangun di |
|---|---|---|
| Memory Depth & Authenticity | Tertinggi | Hari 2, 4, **6** |
| Creativity & Flair | Tinggi | Hari 4, **5** |
| Technical Execution & Completeness | Wajib | Hari 1, **3**, 7 |

## Checklist Syarat Wajib Submission

- [ ] Live di Walrus Mainnet
- [ ] Memori benar-benar mengubah perilaku agent (before/after terlihat)
- [ ] Interface publik menampilkan memori (riwayat + roast log)
- [ ] Wallet khusus Sessions
- [ ] Link live project + demo video ≤ 3 menit
- [ ] Feedback form + tiket GitHub
- [ ] Join Discord
- [ ] Post #Walrus di X
- [ ] Form Airtable + entri DeepSurge
