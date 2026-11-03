/**
 * Semua data acara diatur di file ini.
 * Selama masih kosong, undangan tetap tampil rapi dengan teks "Segera diinformasikan".
 * Tidak ada tanggal/lokasi yang dikarang di dalam kode.
 */
export default {
  organizer: 'Perkantas',
  title: 'Perayaan Natal',
  theme: '', // tema Natal, diisi nanti
  verse: { text: '', reference: '' }, // ayat firman, diisi nanti
  date: '', // diisi nanti (format ISO, mis. "2026-12-20")
  time: '', // diisi nanti (mis. "18:00" atau "18:00 - 21:00")
  timeZoneLabel: 'WIB',
  venueName: '', // diisi nanti
  address: '', // diisi nanti
  mapsUrl: '', // diisi nanti
  rundown: [], // [{ time: "", title: "" }] diisi nanti
  dressCode: '',
  contactPerson: { name: '', whatsapp: '' },
  rsvpEnabled: true,

  /* Opsional: musik latar instrumental Natal.
     Taruh file mp3 di public/audio/, lalu tulis path-nya di sini.
     Kosongkan ("") untuk menyembunyikan tombol musik. */
  music: '/audio/natal-instrumental.mp3',
}
