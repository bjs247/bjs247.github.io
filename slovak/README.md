# Slovak Practice Site (Starter)

This is a **static website** (HTML/CSS/JS) for learning Slovak from English.

## What’s included

### Lesson 1: Alphabet
- **Learn:** click each letter to hear your audio + see a short hint.
- **Practice:** **multiple choice** (listen → choose the letter you heard).
  - No microphone needed.
  - Correct → removed from the queue  
  - Incorrect → sent to the back

### Lesson 2: Greetings
- **Examples first:** practice is locked until you mark examples as done.
- **Practice has two phases (runs phase 1, then auto-continues to phase 2):**
  1) **Slovak → English:** user **types** the meaning (no microphone).
  2) **English → Slovak:** user **types** the Slovak phrase.

After submitting, the site shows whether the answer matched (based on the accepted answers list) and then plays the correct Slovak audio for reinforcement.

### Lesson 3: Pronouns
- **Examples first:** practice is locked until you mark examples as done.
- **Practice has two phases:**
  1) **Slovak → English:** type the meaning of the pronoun
  2) **Fill in the blank:** type the missing Slovak pronoun in a sentence template

### Lesson 4: Conjugation
- **Examples first:** practice is locked until you mark examples as done.
- **Practice has two phases:**
  1) **Verb forms:** type the correct conjugated verb form (present tense)
  2) **Sentence blanks:** type the missing verb form inside a sentence template

## Run locally

From the project folder:

```bash
python3 -m http.server 8080
```

Then open:

- http://localhost:8080

> Run the site via a local server so the browser can load JSON + audio reliably.

## Add your audio files

Put your recordings here:

- Lesson 1 letters: `audio/lesson1/`
- Lesson 2 greetings: `audio/lesson2/`
- Lesson 3 pronouns: `audio/lesson3/`
- Lesson 4 conjugation (optional): `audio/lesson4/`

See `audio/README.md` for the expected filenames.

You can also use **Home → Audio checklist** to scan which files are missing.

## Edit lesson content

- `data/alphabet.json` (Lesson 1)
- `data/greetings.json` (Lesson 2)
- `data/pronouns.json` (Lesson 3)
- `data/conjugation.json` (Lesson 4)

You can change:
- the list/order of letters/phrases
- audio file paths
- English meanings
- accepted English answers (`acceptEn`)

## Acceptable answers

Lesson 2 uses:
- `acceptEn` for Slovak → English typed answers
- `acceptSk` for English → Slovak typed answers

Lessons 3 and 4 use the same matching logic:
- provide an `acceptEn`, `acceptSk`, or `accept` list depending on the exercise

You can add more acceptable variants (synonyms / alternative wording) by adding more strings to these lists.
