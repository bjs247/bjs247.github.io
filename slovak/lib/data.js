let _alphabet = null;
let _greetings = null;
let _pronouns = null;
let _conjugation = null;

async function loadJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return await res.json();
}

export async function getAlphabet() {
  if (_alphabet) return _alphabet;
  _alphabet = await loadJson("data/alphabet.json");
  return _alphabet;
}

export async function getGreetings() {
  if (_greetings) return _greetings;
  _greetings = await loadJson("data/greetings.json");
  return _greetings;
}

export async function getPronouns() {
  if (_pronouns) return _pronouns;
  _pronouns = await loadJson("data/pronouns.json");
  return _pronouns;
}

export async function getConjugation() {
  if (_conjugation) return _conjugation;
  _conjugation = await loadJson("data/conjugation.json");
  return _conjugation;
}
