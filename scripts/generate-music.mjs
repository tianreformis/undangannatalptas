/**
 * Membuat musik latar instrumental (music box + pad) untuk undangan.
 * Melodi/aransemen orisinal sederhana, bebas royalti.
 *
 * Jalankan:
 *   node scripts/generate-music.mjs
 *   ffmpeg -y -i scripts/.tmp/natal-instrumental.wav -codec:a libmp3lame -b:a 96k -ac 1 public/audio/natal-instrumental.mp3
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT_WAV = resolve(HERE, '.tmp/natal-instrumental.wav')

const sampleRate = 44100
const duration = 32
const total = sampleRate * duration
const buffer = new Float32Array(total)

const TWO_PI = Math.PI * 2

const chords = [
  { bass: 130.81, notes: [261.63, 329.63, 392.0, 493.88] }, // Cmaj7
  { bass: 110.0, notes: [220.0, 261.63, 329.63, 392.0] }, // Am7
  { bass: 87.31, notes: [174.61, 220.0, 261.63, 329.63] }, // Fmaj7
  { bass: 98.0, notes: [196.0, 246.94, 293.66, 392.0] }, // G
]

const arpeggio = [0, 1, 2, 3, 2, 1, 0, 2, 3, 1, 2, 0, 3, 1, 0, 2]
const stepSeconds = 0.5
const chordSeconds = 8

function addBell(startSeconds, frequency, amplitude) {
  const start = Math.floor(startSeconds * sampleRate)
  const length = Math.floor(3.4 * sampleRate)

  for (let i = 0; i < length; i += 1) {
    const index = start + i
    if (index >= total) break

    const t = i / sampleRate
    const attack = 1 - Math.exp(-90 * t)
    const decay = Math.exp(-3.1 * t)
    const envelope = attack * decay
    const shimmer = Math.sin(TWO_PI * frequency * t)
    const body = 0.28 * Math.sin(TWO_PI * frequency * 2 * t) * Math.exp(-4.2 * t)
    const sparkle = 0.1 * Math.sin(TWO_PI * frequency * 3 * t) * Math.exp(-6 * t)

    buffer[index] += (shimmer + body + sparkle) * envelope * amplitude
  }
}

function addPad(startSeconds, seconds, rootFrequency, amplitude) {
  const start = Math.floor(startSeconds * sampleRate)
  const length = Math.floor(seconds * sampleRate)
  const voices = [rootFrequency, rootFrequency * 1.5, rootFrequency * 2]

  for (let i = 0; i < length; i += 1) {
    const index = start + i
    if (index >= total) break

    const t = i / sampleRate
    const fadeIn = Math.min(1, t / 2.2)
    const fadeOut = Math.min(1, (seconds - t) / 2.4)
    const envelope = Math.max(0, Math.min(fadeIn, fadeOut))
    const vibrato = Math.sin(TWO_PI * 0.18 * t) * 0.0016

    let value = 0
    voices.forEach((frequency, voiceIndex) => {
      value += Math.sin(TWO_PI * frequency * (1 + vibrato) * t + voiceIndex * 0.7)
      value += Math.sin(TWO_PI * frequency * 1.003 * t) * 0.4
    })

    buffer[index] += (value / (voices.length * 1.4)) * envelope * amplitude
  }
}

chords.forEach((chord, chordIndex) => {
  const chordStart = chordIndex * chordSeconds

  addPad(chordStart, chordSeconds + 0.4, chord.bass, 0.055)

  arpeggio.forEach((noteIndex, stepIndex) => {
    const time = chordStart + stepIndex * stepSeconds
    if (time >= duration) return
    const accent = stepIndex % 4 === 0 ? 0.19 : 0.13
    addBell(time, chord.notes[noteIndex], accent)
  })
})

// Lingkaran penutup agar peralihan loop tetap halus.
addPad(0, 2.4, chords[0].bass, 0.035)

// Fade in/out global.
const fadeInSamples = Math.floor(1.2 * sampleRate)
const fadeOutSamples = Math.floor(2.6 * sampleRate)
for (let i = 0; i < fadeInSamples; i += 1) buffer[i] *= i / fadeInSamples
for (let i = 0; i < fadeOutSamples; i += 1) buffer[total - 1 - i] *= i / fadeOutSamples

// Normalisasi halus.
let peak = 0
for (let i = 0; i < total; i += 1) peak = Math.max(peak, Math.abs(buffer[i]))
const gain = peak > 0 ? 0.72 / peak : 1

// Tulis WAV 16-bit mono.
const bytesPerSample = 2
const dataSize = total * bytesPerSample
const wav = Buffer.alloc(44 + dataSize)
wav.write('RIFF', 0)
wav.writeUInt32LE(36 + dataSize, 4)
wav.write('WAVE', 8)
wav.write('fmt ', 12)
wav.writeUInt32LE(16, 16)
wav.writeUInt16LE(1, 20)
wav.writeUInt16LE(1, 22)
wav.writeUInt32LE(sampleRate, 24)
wav.writeUInt32LE(sampleRate * bytesPerSample, 28)
wav.writeUInt16LE(bytesPerSample, 32)
wav.writeUInt16LE(16, 34)
wav.write('data', 36)
wav.writeUInt32LE(dataSize, 40)

for (let i = 0; i < total; i += 1) {
  const sample = Math.max(-1, Math.min(1, buffer[i] * gain))
  wav.writeInt16LE(Math.round(sample * 32767), 44 + i * bytesPerSample)
}

mkdirSync(dirname(OUT_WAV), { recursive: true })
writeFileSync(OUT_WAV, wav)
console.log(`WAV ditulis: ${OUT_WAV} (${(wav.length / 1024 / 1024).toFixed(1)} MB)`)
