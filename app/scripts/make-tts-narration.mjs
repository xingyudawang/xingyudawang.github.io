/**
 * Regenerate the pre-rendered narration tracks with the FREE Microsoft Edge TTS
 * service (no API key): zh-CN-XiaoxiaoNeural, 24 kHz / 48 kbps mono MP3.
 *
 * Run from `app/` (or any sibling dir):   node scripts/make-tts-narration.mjs
 * Requires the dev-only package:          pnpm add -D msedge-tts
 *
 * Outputs:
 *   ../media/tts/<cave>/<item>.zh.mp3      rendered audio (66 files)
 *   ../narration/tts-meta.json             sentence cue timings (reference)
 *   ../app/src/lib/ttsAudio.ts             VOICE_TRACKS map consumed by narration.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const VOICE = process.env.TTS_VOICE || 'zh-CN-XiaoxiaoNeural';
const RATE = process.env.TTS_RATE || '-5%';
const MEDIA = path.resolve('../media');
const NARR = path.resolve('../narration');
const TTS_TS = path.resolve('../app/src/lib/ttsAudio.ts');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

const manifest = JSON.parse(fs.readFileSync(path.join(NARR, 'narration-manifest.json'), 'utf8'));

/* ---- work list: only items that need their own audio file ---- */
const jobs = [];
for (const it of manifest.items) {
  if (!it.zh) continue; // fallback spots have no text of their own
  let sourceId = null;
  if (it.kind === 'cave-intro') sourceId = `${it.caveId}-intro`;
  else if (it.kind === 'cave-spot') sourceId = it.spotId;
  else if (it.kind === 'mural-guide') sourceId = it.muralId;
  else if (it.kind === 'welcome') sourceId = 'portal-intro';
  if (!sourceId || !it.file) continue;
  jobs.push({ sourceId, kind: it.kind, rel: it.file, text: it.zh });
}
console.log(`jobs: ${jobs.length} (voice=${VOICE}, rate=${RATE})`);

/* ---- synthesise one item, retrying on transient failures ---- */
async function synth(job) {
  const outDir = path.join(MEDIA, path.dirname(job.rel));
  const base = path.basename(job.rel); // e.g. intro.zh.mp3
  const finalMp3 = path.join(outDir, base);
  const finalCue = path.join(outDir, base.replace(/\.mp3$/, '.json'));
  fs.mkdirSync(outDir, { recursive: true });

  if (fs.existsSync(finalMp3) && fs.statSync(finalMp3).size > 5000) {
    console.log(`skip (exists): ${job.rel}`);
    return readCues(finalCue) ?? null;
  }

  let lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const tts = new MsEdgeTTS();
    try {
      await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, {
        sentenceBoundaryEnabled: true,
        wordBoundaryEnabled: false,
      });
      const r = await tts.toFile(outDir, esc(job.text), { rate: RATE });
      const buf = fs.readFileSync(r.audioFilePath);
      if (buf.length < 5000 || (buf[0] !== 0xff && buf[0] !== 0x49)) throw new Error(`bad mp3 (${buf.length} bytes)`);
      fs.renameSync(r.audioFilePath, finalMp3);
      let cues = null;
      if (r.metadataFilePath) {
        const raw = JSON.parse(fs.readFileSync(r.metadataFilePath, 'utf8'));
        cues = (raw.Metadata || [])
          .filter((x) => x.Type === 'SentenceBoundary' && x.Data?.text?.Text)
          .map((x) => ({
            text: unesc(x.Data.text.Text),
            start: +(x.Data.Offset / 1e7).toFixed(3),
            dur: +(x.Data.Duration / 1e7).toFixed(3),
          }));
        fs.writeFileSync(finalCue, JSON.stringify(cues));
        fs.rmSync(r.metadataFilePath, { force: true });
      }
      console.log(`ok ${job.rel} (${buf.length} bytes, ${cues?.length ?? 0} cues)`);
      return cues;
    } catch (e) {
      lastErr = e;
      console.log(`retry ${attempt}/3 ${job.rel}: ${e.message}`);
      await sleep(1500 * attempt);
    } finally {
      try { tts.close(); } catch { /* noop */ }
    }
  }
  console.log(`FAIL ${job.rel}: ${lastErr?.message}`);
  return null;
}

function readCues(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/* ---- run sequentially ---- */
const cuesById = new Map();
const failures = [];
let n = 0;
for (const job of jobs) {
  n += 1;
  console.log(`[${n}/${jobs.length}] ${job.rel}`);
  const cues = await synth(job);
  if (cues) cuesById.set(job.sourceId, cues);
  else if (!cuesById.has(job.sourceId)) failures.push(job.rel);
}

/* ---- resolve fallback spots to their mural's audio ---- */
const tracks = new Map();
const put = (sourceId, rel, cues) => {
  if (!tracks.has(sourceId)) tracks.set(sourceId, { audio: rel, cues });
};
for (const j of jobs) put(j.sourceId, j.rel, cuesById.get(j.sourceId) ?? null);
for (const it of manifest.items) {
  if (it.kind !== 'cave-spot-fallback' || !it.muralId) continue;
  const m = jobs.find((j) => j.sourceId === it.muralId);
  if (m) put(it.spotId, m.rel, cuesById.get(it.muralId) ?? null);
}

/* ---- emit ttsAudio.ts ---- */
const q = (s) => JSON.stringify(s);
const lines = [];
lines.push(`/**
 * Pre-rendered narration tracks (Microsoft Edge TTS, zh-CN-XiaoxiaoNeural).
 * Generated by app/scripts/make-tts-narration.mjs — do not edit by hand.
 *
 * \`cues\` are the exact sentence boundaries returned by the TTS engine, so the
 * live transcript can be highlighted in sync with the rendered audio.
 */
import { media } from './media';

export interface VoiceCue {
  text: string;
  /** start offset in seconds */
  start: number;
  /** duration in seconds */
  dur: number;
}

export interface VoiceTrack {
  audio: string;
  cues: VoiceCue[] | null;
}

export const VOICE_TRACKS: Record<string, { zh?: VoiceTrack }> = {`);
for (const [sourceId, t] of [...tracks.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const audio = `media(${q('tts/' + t.audio.replace(/^tts\//, ''))})`;
  const cues = t.cues && t.cues.length ? JSON.stringify(t.cues) : 'null';
  lines.push(`  ${q(sourceId)}: { zh: { audio: ${audio}, cues: ${cues} } },`);
}
lines.push('};');
fs.mkdirSync(path.dirname(TTS_TS), { recursive: true });
fs.writeFileSync(TTS_TS, lines.join('\n') + '\n');

const meta = {};
for (const [k, v] of [...cuesById.entries()].sort((a, b) => a[0].localeCompare(b[0]))) meta[k] = v;
fs.writeFileSync(path.join(NARR, 'tts-meta.json'), JSON.stringify(meta, null, 1));

console.log(`\ntracks: ${tracks.size} | cues: ${cuesById.size} | failures: ${failures.length}`);
if (failures.length) console.log('failed:', failures.join('\n'));
process.exit(0);
