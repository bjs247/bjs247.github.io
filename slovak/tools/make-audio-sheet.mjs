// Usage:
//   node tools/make-audio-sheet.mjs > audio-sheet.csv
//
// This prints a CSV of the audio files referenced by the lessons,
// so you can track what you still need to record.

import fs from "node:fs";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const alphabet = readJson("data/alphabet.json");
const greetings = readJson("data/greetings.json");

const rows = [];
rows.push(["lesson","item","audio_file"].join(","));

for (const l of alphabet.letters) {
  rows.push(["lesson1", JSON.stringify(l.grapheme), JSON.stringify(l.audio)].join(","));
}

for (const it of greetings.items) {
  rows.push(["lesson2", JSON.stringify(it.sk), JSON.stringify(it.audio)].join(","));
}

process.stdout.write(rows.join("\n") + "\n");
