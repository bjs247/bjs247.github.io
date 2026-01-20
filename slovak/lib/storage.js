const KEY = "slovak_practice_progress_v1";

function defaultProgress() {
  return {
    lesson1: { mastered: {} },
    lesson2: { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} },
    lesson3: { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} },
    lesson4: { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} },
    settings: {
      strictness: 60,        // (legacy) pass score 0–100 for audio similarity
      dtwBandPct: 0.25,      // (legacy) DTW band as % of sequence length
      useSpeechIfAvailable: true
    }
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    const def = defaultProgress();

    // Merge shallowly but ensure lesson buckets always exist
    return {
      ...def,
      ...parsed,
      lesson1: { ...def.lesson1, ...(parsed.lesson1 || {}) },
      lesson2: { ...def.lesson2, ...(parsed.lesson2 || {}) },
      lesson3: { ...def.lesson3, ...(parsed.lesson3 || {}) },
      lesson4: { ...def.lesson4, ...(parsed.lesson4 || {}) },
      settings: { ...def.settings, ...(parsed.settings || {}) }
    };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress) {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function resetProgress() {
  const p = defaultProgress();
  saveProgress(p);
  return p;
}

// Backward compatible:
// - v3 calls: setExamplesDone(progress, true)
// - new calls: setExamplesDone(progress, "lesson3", true)
export function setExamplesDone(progress, lessonIdOrDone = true, doneMaybe = true) {
  let lessonId = "lesson2";
  let done = true;

  if (typeof lessonIdOrDone === "boolean") {
    done = lessonIdOrDone;
  } else {
    lessonId = lessonIdOrDone;
    done = doneMaybe;
  }

  if (lessonId === "lesson2") {
    progress.lesson2 = progress.lesson2 || { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} };
    progress.lesson2.examplesDone = !!done;
  }

  if (lessonId === "lesson3") {
    progress.lesson3 = progress.lesson3 || { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} };
    progress.lesson3.examplesDone = !!done;
  }

  if (lessonId === "lesson4") {
    progress.lesson4 = progress.lesson4 || { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} };
    progress.lesson4.examplesDone = !!done;
  }

  saveProgress(progress);
}

function bucketFor(progress, lessonKey) {
  // Be defensive in case older saved progress is missing lesson3
  progress.lesson1 = progress.lesson1 || { mastered: {} };
  progress.lesson2 = progress.lesson2 || { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} };
  progress.lesson3 = progress.lesson3 || { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} };
  progress.lesson4 = progress.lesson4 || { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} };

  switch (lessonKey) {
    case "lesson1":
      progress.lesson1.mastered = progress.lesson1.mastered || {};
      return progress.lesson1.mastered;
    case "lesson2_phase1":
      progress.lesson2.phase1Mastered = progress.lesson2.phase1Mastered || {};
      return progress.lesson2.phase1Mastered;
    case "lesson2_phase2":
      progress.lesson2.phase2Mastered = progress.lesson2.phase2Mastered || {};
      return progress.lesson2.phase2Mastered;
    case "lesson3_phase1":
      progress.lesson3.phase1Mastered = progress.lesson3.phase1Mastered || {};
      return progress.lesson3.phase1Mastered;
    case "lesson3_phase2":
      progress.lesson3.phase2Mastered = progress.lesson3.phase2Mastered || {};
      return progress.lesson3.phase2Mastered;
    case "lesson4_phase1":
      progress.lesson4.phase1Mastered = progress.lesson4.phase1Mastered || {};
      return progress.lesson4.phase1Mastered;
    case "lesson4_phase2":
      progress.lesson4.phase2Mastered = progress.lesson4.phase2Mastered || {};
      return progress.lesson4.phase2Mastered;
    default:
      return null;
  }
}

export function markMastered(progress, lessonKey, itemId, value = true) {
  const bucket = bucketFor(progress, lessonKey);
  if (!bucket) return;

  if (value) bucket[itemId] = true;
  else delete bucket[itemId];

  saveProgress(progress);
}

export function isMastered(progress, lessonKey, itemId) {
  const bucket = bucketFor(progress, lessonKey);
  if (!bucket) return false;
  return !!bucket[itemId];
}
