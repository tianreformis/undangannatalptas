# Musik latar undangan

Letakkan berkas musik instrumental Natal di folder ini, misalnya:

```
public/audio/natal-instrumental.mp3
```

Lalu pastikan path pada `src/config/event.js` sesuai:

```js
music: '/audio/natal-instrumental.mp3',
```

- Kosongkan (`music: ''`) bila tidak ingin menampilkan tombol musik sama sekali.
- Musik **tidak** diputar otomatis sebelum pengguna menekan tombol. Pemutaran dimulai saat tombol
  "Buka Undangan" ditekan (interaksi pengguna), lalu pengguna dapat mematikan/menyalakannya lewat
  tombol mengambang.
- Gunakan berkas berlisensi bebas (mis. Creative Commons) dan berukuran kecil (&lt; 3 MB) agar cepat
  dimuat di jaringan seluler.
- Bila berkas tidak ditemukan, tombol musik otomatis disembunyikan — tidak ada pesan error yang
  mengganggu tamu.
