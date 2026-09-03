import { useEffect, useRef, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import {
  SILENCE_PEAK_THRESHOLD,
  createLevelMonitor,
  getClipBlob,
  listInputDevices,
  saveClipBlob,
  saveUploadedFile,
  type LevelMonitor,
} from "../lib/media";
import { getActiveProfile, getProfile, upsertProfile } from "../lib/storage";
import type { AudioRef } from "../lib/types";

export function AscultaPage() {
  const search = useSearch({ from: "/asculta" }) as {
    profile?: string;
    attach?: "journal" | "profile";
  };
  const [recording, setRecording] = useState(false);
  const [lastRef, setLastRef] = useState<AudioRef | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [devices, setDevices] = useState<{ deviceId: string; label: string }[]>([]);
  const [deviceMsg, setDeviceMsg] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [activeTrackLabel, setActiveTrackLabel] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const monitorRef = useRef<LevelMonitor | null>(null);
  const levelTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (playUrl) URL.revokeObjectURL(playUrl);
      stopLevelLoop();
      monitorRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [playUrl]);

  useEffect(() => {
    void refreshDevices(false);
  }, []);

  async function refreshDevices(afterPermission: boolean) {
    const r = await listInputDevices();
    setDevices(r.devices);
    if (r.message) setDeviceMsg(r.message);
    else setDeviceMsg(null);

    if (r.devices.length === 0) {
      setSelectedDeviceId("");
      return;
    }

    setSelectedDeviceId((prev) => {
      if (prev && r.devices.some((d) => d.deviceId === prev)) return prev;
      // preferă ceva care nu arată a „Stereo Mix” dacă există alternativă
      const nonMix = r.devices.find(
        (d) => !/stereo\s*mix/i.test(d.label) && d.deviceId && d.deviceId !== "default",
      );
      return (nonMix ?? r.devices[0]).deviceId;
    });

    if (afterPermission && r.devices.length) {
      setDeviceMsg(
        `Devices detected after permission: ${r.devices.length}. Choose the microphone from the list before Rec.`,
      );
    }
  }

  function stopLevelLoop() {
    if (levelTimerRef.current != null) {
      window.clearInterval(levelTimerRef.current);
      levelTimerRef.current = null;
    }
    setLevel(0);
  }

  function targetProfile() {
    if (search.profile) return getProfile(search.profile) ?? null;
    return getActiveProfile();
  }

  async function attachIfNeeded(ref: AudioRef) {
    if (search.attach !== "profile") return;
    const p = targetProfile();
    if (!p) {
      setInfo("No active profile — clip saved locally but not attached.");
      return;
    }
    upsertProfile({
      ...p,
      audioRefs: [...p.audioRefs, { ...ref, label: ref.label ?? "Profile clip" }],
      updatedAt: new Date().toISOString(),
    });
    setInfo(`Clip attached to profile “${p.name}”.`);
  }

  async function start() {
    setError(null);
    setInfo(null);
    setWarning(null);
    setActiveTrackLabel(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "This browser does not support audio capture. Use “Upload file” with a recording from your phone.",
        );
        return;
      }

      // Dacă lista e goală, cerem o dată permisiune generică ca să populăm label-urile
      if (devices.length === 0 || !selectedDeviceId) {
        try {
          const warm = await navigator.mediaDevices.getUserMedia({ audio: true });
          warm.getTracks().forEach((t) => t.stop());
          await refreshDevices(true);
        } catch {
          /* handled below on real open */
        }
      }

      const deviceId = selectedDeviceId;
      if (!deviceId) {
        setError(
          "No input device selected. Connect a microphone or use “Upload file”.",
        );
        return;
      }

      // Verifică că deviceId încă există
      const listed = await listInputDevices();
      setDevices(listed.devices);
      const stillThere = listed.devices.some((d) => d.deviceId === deviceId);
      if (!stillThere) {
        setSelectedDeviceId(listed.devices[0]?.deviceId ?? "");
        setError(
          "The selected device is no longer available (disconnected?). Choose again from the list.",
        );
        if (listed.message) setDeviceMsg(listed.message);
        return;
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation: true,
          noiseSuppression: true,
        },
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        // Fallback controlat dacă exact eșuează
        const name = e instanceof DOMException ? e.name : "";
        if (name === "OverconstrainedError" || name === "NotFoundError") {
          setError(
            "The chosen device cannot be opened. Select another input or reload the page after connecting a microphone.",
          );
          await refreshDevices(true);
          return;
        }
        throw e;
      }

      streamRef.current = stream;
      await refreshDevices(true);

      const track = stream.getAudioTracks()[0];
      const settings = track?.getSettings?.() ?? {};
      const usedId = typeof settings.deviceId === "string" ? settings.deviceId : deviceId;
      const usedLabel =
        track?.label ||
        listed.devices.find((d) => d.deviceId === usedId)?.label ||
        "unknown";
      setActiveTrackLabel(usedLabel);

      // Monitor nivel real
      monitorRef.current?.stop();
      const mon = createLevelMonitor(stream);
      monitorRef.current = mon;
      stopLevelLoop();
      levelTimerRef.current = window.setInterval(() => {
        setLevel(mon.getLevel());
      }, 80);

      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stopLevelLoop();
        const peak = monitorRef.current?.getPeak() ?? 0;
        monitorRef.current?.stop();
        monitorRef.current = null;
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const ref = await saveClipBlob(blob);
        setLastRef(ref);
        if (playUrl) URL.revokeObjectURL(playUrl);
        setPlayUrl(URL.createObjectURL(blob));
        await attachIfNeeded(ref);

        // Avertisment pe semnal real, nu pe blob.size — nu blocăm salvarea
        if (peak < SILENCE_PEAK_THRESHOLD) {
          setWarning(
            "No useful audio signal was detected during recording (level near zero). Check the selected microphone, Windows input volume, and that “Stereo Mix” is not selected without a source. The clip was still saved — you can play it back to verify.",
          );
        } else {
          setWarning(null);
        }
        setActiveTrackLabel(null);
      };

      mediaRef.current = rec;
      rec.start();
      setRecording(true);
      setTimeout(() => {
        if (mediaRef.current?.state === "recording") stop();
      }, 30_000);
    } catch (e) {
      stopLevelLoop();
      monitorRef.current?.stop();
      monitorRef.current = null;
      const name = e instanceof DOMException ? e.name : "";
      if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setError(
          "No microphone found. Connect a real microphone or use “Upload file”.",
        );
      } else if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setError(
          "Microphone permission was denied. Enable it in the site settings of your browser.",
        );
      } else {
        setError(
          "Could not start capture. Check the selected device or upload an audio file.",
        );
      }
    }
  }

  function stop() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    setInfo(null);
    setWarning(null);
    try {
      const ref = await saveUploadedFile(file);
      setLastRef(ref);
      if (playUrl) URL.revokeObjectURL(playUrl);
      setPlayUrl(URL.createObjectURL(file));
      await attachIfNeeded(ref);
      setInfo(`File saved: ${file.name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload the file.");
    }
  }

  async function replay() {
    if (!lastRef) return;
    const blob = await getClipBlob(lastRef.id);
    if (!blob) {
      setError("The clip is no longer in IndexedDB.");
      return;
    }
    if (playUrl) URL.revokeObjectURL(playUrl);
    setPlayUrl(URL.createObjectURL(blob));
  }

  const levelPct = Math.round(level * 100);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-sage">Lab</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">Listen</h1>
        <p className="mt-2 text-ink-muted">
          Record or upload a file of your cat’s voice. Clips stay on this device
          (IndexedDB).
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-paper-2/40 p-4 text-sm">
        <label className="block font-medium text-ink" htmlFor="mic-select">
          Input device
        </label>
        <select
          id="mic-select"
          className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-sage"
          value={selectedDeviceId}
          disabled={recording}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
        >
          {devices.length === 0 && (
            <option value="">— no devices listed —</option>
          )}
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="mt-2 text-xs text-sage underline"
          disabled={recording}
          onClick={() => void refreshDevices(false)}
        >
          Refresh list
        </button>
        {deviceMsg && (
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">{deviceMsg}</p>
        )}
        {activeTrackLabel && recording && (
          <p className="mt-2 text-xs text-sage">
            Recording on track: <strong>{activeTrackLabel}</strong>
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-paper-2/40 p-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={recording ? stop : () => void start()}
            className={`h-20 w-20 rounded-full text-sm font-semibold text-paper ${
              recording ? "bg-clay animate-pulse" : "bg-sage hover:bg-sage-light"
            }`}
          >
            {recording ? "Stop" : "Rec"}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={recording}
            className="rounded-xl border border-line bg-paper px-4 py-3 text-sm font-medium text-ink hover:border-sage disabled:opacity-50"
          >
            Upload file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.webm,.ogg,.mp3,.m4a,.wav,.aac,.flac"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {recording && (
          <div className="mx-auto mt-4 max-w-xs">
            <div className="mb-1 flex justify-between text-[11px] text-ink-muted">
              <span>Signal level</span>
              <span>{levelPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-paper">
              <div
                className="h-full rounded-full bg-sage transition-[width] duration-75"
                style={{ width: `${levelPct}%` }}
              />
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-ink-muted">
          {recording
            ? "Recording…"
            : "Choose the microphone → Rec, or Upload a file from phone/PC"}
        </p>
        {error && (
          <p className="mt-3 rounded-lg border border-clay/40 bg-clay/5 px-3 py-2 text-left text-sm text-clay">
            {error}
          </p>
        )}
        {warning && (
          <p className="mt-3 rounded-lg border border-line bg-paper px-3 py-2 text-left text-sm text-ink-muted">
            {warning}
          </p>
        )}
        {info && (
          <p className="mt-3 rounded-lg border border-line bg-paper px-3 py-2 text-left text-sm text-sage">
            {info}
          </p>
        )}
      </div>

      {lastRef && (
        <div className="rounded-2xl border border-line p-4">
          <p className="text-sm font-medium text-ink">Last saved clip</p>
          <p className="text-xs text-ink-muted">
            {lastRef.label ?? "Clip"} ·{" "}
            {lastRef.source === "user-upload" ? "uploaded" : "recorded"} ·{" "}
            {lastRef.mimeType ?? "audio"}
          </p>
          {playUrl && <audio className="mt-3 w-full" controls src={playUrl} />}
          <button type="button" onClick={() => void replay()} className="mt-2 text-sm text-sage underline">
            Reload from IndexedDB
          </button>
        </div>
      )}
    </div>
  );
}
