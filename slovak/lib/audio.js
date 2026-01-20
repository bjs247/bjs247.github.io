// Audio helpers

const _existCache = new Map();

export async function audioExists(url) {
  if (!url) return false;
  if (_existCache.has(url)) return _existCache.get(url);
  try {
    // Prefer HEAD to avoid downloading large files
    let res = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (!res.ok) {
      // Some servers don't support HEAD
      res = await fetch(url, { method: "GET", cache: "no-store" });
    }
    const ok = res.ok;
    _existCache.set(url, ok);
    return ok;
  } catch {
    _existCache.set(url, false);
    return false;
  }
}

export async function playAudio(url) {
  if (!url) throw new Error("No audio URL");
  const ok = await audioExists(url);
  if (!ok) throw new Error(`Missing audio file: ${url}`);
  const audio = new Audio(url);
  audio.preload = "auto";
  await audio.play();
  return audio;
}

export function makeAudioButton({ url, label = "Play audio", small = false }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = small ? "ghost" : "secondary";
  btn.textContent = label;
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      await playAudio(url);
    } catch (e) {
      alert(e?.message || String(e));
    } finally {
      btn.disabled = false;
    }
  });
  return btn;
}
