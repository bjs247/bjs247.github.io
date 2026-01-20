export function normalizeBasic(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")
    .replace(/[^\p{L}\p{N}\s'-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripDiacritics(s) {
  // NFD splits letters + diacritics; remove the combining marks
  return (s || "").normalize("NFD").replace(/\p{M}+/gu, "");
}

export function normalizeForMatch(s, { diacritics = false } = {}) {
  const basic = normalizeBasic(s);
  return diacritics ? basic : stripDiacritics(basic);
}

export function anyMatch(transcript, acceptList) {
  const t0 = normalizeForMatch(transcript, { diacritics: false });
  const t1 = normalizeForMatch(transcript, { diacritics: true });

  for (const raw of (acceptList || [])) {
    if (!raw) continue;
    const a0 = normalizeForMatch(raw, { diacritics: false });
    const a1 = normalizeForMatch(raw, { diacritics: true });

    if (a0 && (t0 === a0 || t0.split(" ").includes(a0) || t0.includes(a0))) return true;
    if (a1 && (t1 === a1 || t1.split(" ").includes(a1) || t1.includes(a1))) return true;
  }
  return false;
}
