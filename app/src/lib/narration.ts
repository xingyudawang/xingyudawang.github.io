/**
 * Narration engine.
 *
 * The source project spoke the whole transcript in one `SpeechSynthesisUtterance`.
 * That breaks in two very visible ways:
 *   1. Chrome/Edge silently stop after ~15 s of a single utterance, so long
 *      guide texts were cut off mid-sentence.
 *   2. There was no way to know when speech actually started, so the UI could
 *      not show a live transcript, progress, or a stop button that works.
 *
 * This manager chunks text on punctuation, queues the chunks, tracks which
 * sentence is playing, and exposes a tiny observable store so any component can
 * render the live transcript.
 */

export type NarrationState = {
  status: 'idle' | 'speaking' | 'paused' | 'unsupported' | 'blocked';
  /** id of whatever requested the narration (hotspot / mural / cave) */
  sourceId: string | null;
  title: string;
  lang: string;
  /** all chunks of the current text */
  chunks: string[];
  /** index of the chunk currently being spoken */
  chunkIndex: number;
  /** characters spoken so far, for a progress read-out */
  spokenChars: number;
  totalChars: number;
};

const LANG_MAP: Record<string, string> = {
  zh: 'zh-CN',
  en: 'en-US',
  ja: 'ja-JP',
  fr: 'fr-FR',
};

const EMPTY: NarrationState = {
  status: 'idle',
  sourceId: null,
  title: '',
  lang: 'zh-CN',
  chunks: [],
  chunkIndex: 0,
  spokenChars: 0,
  totalChars: 0,
};

/**
 * Split into speakable chunks without breaking mid-sentence.
 * Latin text splits on `. ! ? ;` plus CJK `。！？；`,
 * and we also hard-split anything longer than `maxLen` on commas.
 */
export function chunkText(text: string, maxLen = 110): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  // Split after sentence terminators, keeping them attached to the sentence.
  const sentences = clean.match(/[^。！？；!?;\.]+[。！？；!?;\.]*/g) ?? [clean];
  const out: string[] = [];
  let buffer = '';

  const push = (s: string) => {
    const t = s.trim();
    if (t) out.push(t);
  };

  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if ((buffer + s).length <= maxLen) {
      buffer += s;
      continue;
    }
    if (buffer) push(buffer);
    buffer = '';
    if (s.length <= maxLen) {
      buffer = s;
    } else {
      // Long sentence: split on commas / spaces so we never exceed the cap.
      const parts = s.split(/(?<=[，,、：:\s])/);
      let acc = '';
      for (const p of parts) {
        if ((acc + p).length > maxLen && acc) {
          push(acc);
          acc = '';
        }
        acc += p;
      }
      buffer = acc;
    }
  }
  if (buffer) push(buffer);
  return out;
}

class NarrationManager {
  private state: NarrationState = EMPTY;
  private listeners = new Set<(s: NarrationState) => void>();
  private voices: SpeechSynthesisVoice[] = [];
  private queue: string[] = [];
  private cursor = 0;
  private lang = 'zh-CN';
  private cancelled = false;
  private voicesBound = false;

  supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  getState = (): NarrationState => this.state;

  subscribe = (fn: (s: NarrationState) => void) => {
    this.listeners.add(fn);
    fn(this.state);
    return () => {
      this.listeners.delete(fn);
    };
  };

  private emit(patch: Partial<NarrationState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l(this.state));
  }

  private loadVoices() {
    if (!this.supported) return;
    const list = window.speechSynthesis.getVoices();
    if (list.length) this.voices = list;
    if (!this.voicesBound) {
      this.voicesBound = true;
      window.speechSynthesis.addEventListener?.('voiceschanged', () => {
        const v = window.speechSynthesis.getVoices();
        if (v.length) this.voices = v;
      });
    }
  }

  /**
   * Pick the most natural-sounding voice available.
   *
   * Scoring strongly prefers the high-quality neural voices browsers expose
   * (Microsoft's Xiaoxiao / Yunxi / Yunjian family on Edge and Windows, Google's
   * Wavenet voices on Chrome), then any online voice, then local fallbacks —
   * and demotes the robotic legacy engines.
   */
  pickVoice(langPrefix: string): SpeechSynthesisVoice | undefined {
    this.loadVoices();
    const candidates = this.voices.filter((v) =>
      v.lang.replace('_', '-').toLowerCase().startsWith(langPrefix.toLowerCase())
    );
    if (!candidates.length) return undefined;

    const score = (v: SpeechSynthesisVoice) => {
      let s = 0;
      const n = v.name.toLowerCase();
      if (/xiaoxiao|yunxi|yunjian|xiaoyi|yunjie|yunyang|yunfeng|xiaohan|xiaomeng|xiaomo|xiaorui|xiaoshuang|xiaoxuan|xiaoyan|xiaoyou|xiaozhen|liaoning|shaanxi|shandong|tingting|huihui|kangkang/.test(n)) s += 140;
      if (/neural|natural|premium|enhanced|wavenet|online/.test(n)) s += 110;
      if (/google/.test(n)) s += 90;
      if (/普通话|中文|mandarin|mainland/.test(n)) s += 45;
      if (!v.localService) s += 55; // online voices are consistently smoother
      if (v.localService) s += 6;
      if (/huihui|kangkang|yaoyao/.test(n)) s -= 25; // child voices feel wrong for narration
      if (/desktop|compact|espeak|default|synth/.test(n)) s -= 90;
      return s;
    };

    return [...candidates].sort((a, b) => score(b) - score(a))[0];
  }

  hasVoiceFor(lang: 'zh' | 'en' | 'ja' | 'fr'): boolean {
    this.loadVoices();
    const prefix = LANG_MAP[lang] ?? 'zh-CN';
    return this.voices.some((v) =>
      v.lang.replace('_', '-').toLowerCase().startsWith(prefix.slice(0, 2))
    );
  }

  /**
   * Start narrating `text`. Safe to call from a tap handler (required by iOS).
   * Calling again with a different sourceId replaces the current narration.
   */
  speak(sourceId: string, title: string, text: string, lang: 'zh' | 'en' | 'ja' | 'fr' = 'zh') {
    if (!this.supported) {
      this.emit({ status: 'unsupported', sourceId, title, lang: LANG_MAP[lang], chunks: chunkText(text) });
      return;
    }

    this.stopInternal();

    const chunks = chunkText(text);
    this.lang = LANG_MAP[lang] ?? 'zh-CN';
    this.queue = chunks;
    this.cursor = 0;
    this.cancelled = false;

    this.emit({
      status: chunks.length ? 'speaking' : 'idle',
      sourceId,
      title,
      lang: this.lang,
      chunks,
      chunkIndex: 0,
      spokenChars: 0,
      totalChars: text.length,
    });

    if (!chunks.length) return;

    // Chrome needs the engine resumed after any prior cancel().
    try {
      window.speechSynthesis.resume();
    } catch {
      /* noop */
    }
    this.speakCurrentChunk();
  }

  private speakCurrentChunk() {
    if (this.cancelled) return;
    const chunk = this.queue[this.cursor];
    if (chunk === undefined) {
      this.emit({ status: 'idle', chunkIndex: 0, spokenChars: this.state.totalChars });
      return;
    }

    const utter = new SpeechSynthesisUtterance(chunk);
    utter.lang = this.lang;
    const voice = this.pickVoice(this.lang.slice(0, 2));
    if (voice) utter.voice = voice;
    // natural, measured museum-guide pacing: slightly slower for Chinese,
    // neutral pitch, no artifical exaggeration
    utter.rate = this.lang.startsWith('zh') ? 0.9 : this.lang.startsWith('ja') ? 0.95 : 0.97;
    utter.pitch = 1.0;
    utter.volume = 1;

    const chunkStartChars = this.queue
      .slice(0, this.cursor)
      .reduce((acc, c) => acc + c.length, 0);

    utter.onstart = () => {
      if (this.cancelled) return;
      this.emit({ status: 'speaking', chunkIndex: this.cursor });
    };

    utter.onend = () => {
      if (this.cancelled) return;
      const next = this.cursor + 1;
      this.emit({
        chunkIndex: next,
        spokenChars: chunkStartChars + chunk.length,
      });
      this.cursor = next;
      // a short breath between sentences — back-to-back utterances sound rushed
      const breathe = chunk.trim().endsWith('。') || chunk.trim().endsWith('.') || chunk.trim().endsWith('！') || chunk.trim().endsWith('!') || chunk.trim().endsWith('？') || chunk.trim().endsWith('?');
      const delay = this.queue[next] ? (breathe ? 260 : 90) : 0;
      this.pauseTimer = window.setTimeout(() => {
        this.pauseTimer = 0;
        if (!this.cancelled) this.speakCurrentChunk();
      }, delay);
    };

    utter.onerror = (e) => {
      // 'interrupted' / 'canceled' are expected whenever we stop deliberately.
      if (this.cancelled) return;
      const reason = (e as SpeechSynthesisErrorEvent).error;
      if (reason === 'not-allowed') {
        this.emit({ status: 'blocked' });
        return;
      }
      this.cursor += 1;
      this.speakCurrentChunk();
    };

    this.chain = utter;
    try {
      window.speechSynthesis.speak(utter);
    } catch {
      this.emit({ status: 'blocked' });
    }
  }

  private chain: SpeechSynthesisUtterance | null = null;
  private pauseTimer = 0;

  pause() {
    if (!this.supported) return;
    window.speechSynthesis.pause();
    this.emit({ status: 'paused' });
  }

  resume() {
    if (!this.supported) return;
    window.speechSynthesis.resume();
    this.emit({ status: 'speaking' });
  }

  get isPaused() {
    return this.state.status === 'paused';
  }

  private stopInternal() {
    this.cancelled = true;
    this.queue = [];
    this.cursor = 0;
    this.chain = null;
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = 0;
    }
    if (this.supported) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* noop */
      }
    }
  }

  stop() {
    this.stopInternal();
    this.emit({ ...EMPTY, status: this.supported ? 'idle' : 'unsupported' });
  }

  /** Is this source currently being narrated? */
  isActive(sourceId: string) {
    return this.state.sourceId === sourceId && this.state.status !== 'idle';
  }
}

export const narration = new NarrationManager();

/** Stop narration when the tab is hidden — otherwise it keeps talking over other apps. */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && narration.getState().status === 'speaking') narration.stop();
  });
}

// Warm the voice list as early as possible: Chrome only populates
// speechSynthesis.getVoices() after the first call / the 'voiceschanged' event,
// and the natural voices are the difference between a guide and a robot.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
}
