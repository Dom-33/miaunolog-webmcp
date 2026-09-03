import { MEDIA_DB, type AudioRef } from "./types";
import { nowIso, uid } from "./types";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(MEDIA_DB.dbName, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(MEDIA_DB.storeName)) {
        db.createObjectStore(MEDIA_DB.storeName);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveClipBlob(blob: Blob): Promise<AudioRef> {
  const id = uid();
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(MEDIA_DB.storeName, "readwrite");
    tx.objectStore(MEDIA_DB.storeName).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return {
    id,
    source: "user-record",
    mimeType: blob.type || "audio/webm",
    durationMs: undefined,
    createdAt: nowIso(),
    label: "Recording",
    license: null,
  };
}

export async function getClipBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(MEDIA_DB.storeName, "readonly");
    const req = tx.objectStore(MEDIA_DB.storeName).get(id);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return blob;
}

export async function deleteClip(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(MEDIA_DB.storeName, "readwrite");
    tx.objectStore(MEDIA_DB.storeName).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}


const ACCEPTED_AUDIO = [
  "audio/webm",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/aac",
  "audio/flac",
];

export function isAcceptedAudioFile(file: File): { ok: boolean; reason?: string } {
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  const extOk = /\.(webm|ogg|mp3|m4a|mp4|wav|aac|flac)$/i.test(name);
  if (type && ACCEPTED_AUDIO.some((t) => type === t || type.startsWith(t))) {
    return { ok: true };
  }
  if (!type && extOk) return { ok: true };
  if (type.startsWith("audio/") && extOk) return { ok: true };
  return {
    ok: false,
    reason:
      "Unsupported or unrecognized format. Try WebM, OGG, MP3, M4A, WAV (depending on the browser).",
  };
}

export async function saveUploadedFile(file: File): Promise<AudioRef> {
  const check = isAcceptedAudioFile(file);
  if (!check.ok) throw new Error(check.reason ?? "Invalid file");
  const ref = await saveClipBlob(file);
  return {
    ...ref,
    source: "user-upload",
    mimeType: file.type || ref.mimeType,
    label: file.name.slice(0, 80) || "Uploaded file",
  };
}

export async function listInputDevices(): Promise<{
  supported: boolean;
  devices: { deviceId: string; label: string }[];
  message?: string;
}> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return {
      supported: false,
      devices: [],
      message: "The browser does not expose the media device list.",
    };
  }
  try {
    // Fără permisiune, label-urile pot fi goale
    const all = await navigator.mediaDevices.enumerateDevices();
    const inputs = all
      .filter((d) => d.kind === "audioinput")
      .map((d, i) => ({
        deviceId: d.deviceId,
        label: d.label || `Audio input ${i + 1}`,
      }));
    if (inputs.length === 0) {
      return {
        supported: true,
        devices: [],
        message:
          "No input device (microphone) detected. On Windows, “Stereo Mix” or playback-only devices (e.g. NVIDIA HD Audio) do not capture voice — choose a real microphone in Sound settings → Input.",
      };
    }
    return { supported: true, devices: inputs };
  } catch {
    return {
      supported: false,
      devices: [],
      message: "Could not enumerate devices. Check browser permissions.",
    };
  }
}


/** Un singur AudioContext reutilizat — Chrome pornește suspended până la gesture. */
let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AC();
  }
  return sharedCtx;
}

type ToneSpec = {
  freq: number;
  dur: number;
  type: OscillatorType;
  gain: number;
  freqEnd?: number;
  vibratoHz?: number;
};

const TONE_MAP: Record<string, ToneSpec> = {
  miau: { freq: 780, freqEnd: 620, dur: 0.32, type: "triangle", gain: 0.12 },
  "miau-lung": { freq: 720, freqEnd: 480, dur: 0.85, type: "triangle", gain: 0.11 },
  mew: { freq: 980, freqEnd: 860, dur: 0.22, type: "sine", gain: 0.1 },
  purr: { freq: 55, dur: 1.4, type: "sine", gain: 0.18, vibratoHz: 25 },
  trill: { freq: 720, freqEnd: 920, dur: 0.28, type: "triangle", gain: 0.1 },
  chirp: { freq: 1200, freqEnd: 900, dur: 0.12, type: "square", gain: 0.06 },
  chatter: { freq: 1100, dur: 0.45, type: "square", gain: 0.05 },
  hiss: { freq: 3200, dur: 0.5, type: "sawtooth", gain: 0.04 },
  spit: { freq: 1800, dur: 0.08, type: "sawtooth", gain: 0.1 },
  growl: { freq: 90, dur: 0.7, type: "sawtooth", gain: 0.1 },
  yowl: { freq: 480, freqEnd: 320, dur: 1.0, type: "triangle", gain: 0.12 },
  caterwaul: { freq: 520, freqEnd: 700, dur: 1.1, type: "triangle", gain: 0.11 },
  shriek: { freq: 1500, freqEnd: 1100, dur: 0.18, type: "sawtooth", gain: 0.08 },
  sigh: { freq: 180, freqEnd: 90, dur: 0.4, type: "sine", gain: 0.08 },
  gurgle: { freq: 220, freqEnd: 280, dur: 0.35, type: "sine", gain: 0.09 },
  silent: { freq: 0, dur: 0, type: "sine", gain: 0 },
};

/**
 * DEV ONLY — ton sintetic. Nu expune în UI ca exemplu de vocalizare felină.
 * Trebuie apelat din handler de click (user gesture) ca AudioContext să pornească în Chrome.
 */

/** Monitor RMS pe un MediaStream — pentru indicator de nivel și detecție tăcere. */
export type LevelMonitor = {
  /** 0–1, actualizat ~de 10–20 ori/s */
  getLevel: () => number;
  /** peak maxim văzut de la start */
  getPeak: () => number;
  stop: () => void;
};

export function createLevelMonitor(stream: MediaStream): LevelMonitor {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.4;
  source.connect(analyser);
  const data = new Uint8Array(analyser.fftSize);
  let peak = 0;
  let stopped = false;

  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  function sample(): number {
    if (stopped) return 0;
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    let localPeak = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
      const a = Math.abs(v);
      if (a > localPeak) localPeak = a;
    }
    const rms = Math.sqrt(sum / data.length);
    if (localPeak > peak) peak = localPeak;
    // scară utilă pentru UI (mic gains)
    return Math.min(1, rms * 4);
  }

  return {
    getLevel: sample,
    getPeak: () => peak,
    stop: () => {
      stopped = true;
      try {
        source.disconnect();
        analyser.disconnect();
        void ctx.close();
      } catch {
        /* ignore */
      }
    },
  };
}

/** Prag: sub acesta pe toată durata ≈ fără semnal util */
export const SILENCE_PEAK_THRESHOLD = 0.02;

export async function playSyntheticTone(kind: string): Promise<{ ok: boolean; reason?: string }> {
  const spec = TONE_MAP[kind] ?? {
    freq: 600,
    dur: 0.3,
    type: "triangle" as OscillatorType,
    gain: 0.1,
  };

  if (kind === "silent" || spec.freq <= 0 || spec.dur <= 0) {
    return { ok: false, reason: "Silence — no playback tone." };
  }

  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = spec.type;
    osc.frequency.setValueAtTime(spec.freq, t0);
    if (spec.freqEnd != null && spec.freqEnd !== spec.freq) {
      osc.frequency.linearRampToValueAtTime(spec.freqEnd, t0 + spec.dur);
    }

    const peak = spec.gain;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
    gain.gain.setValueAtTime(peak, t0 + Math.max(0.05, spec.dur - 0.08));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + spec.dur);

    if (spec.vibratoHz) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = spec.vibratoHz;
      lfoGain.gain.value = peak * 0.45;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start(t0);
      lfo.stop(t0 + spec.dur);
    }

    if (kind === "chatter") {
      gain.gain.cancelScheduledValues(t0);
      gain.gain.setValueAtTime(0.0001, t0);
      for (let i = 0; i < 6; i++) {
        const st = t0 + i * 0.07;
        gain.gain.setValueAtTime(0.0001, st);
        gain.gain.exponentialRampToValueAtTime(peak, st + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.05);
      }
    }

    osc.start(t0);
    osc.stop(t0 + spec.dur + 0.02);

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Eroare Web Audio";
    return { ok: false, reason: msg };
  }
}
