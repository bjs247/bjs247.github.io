import { el, clear, qs, sleep } from "./lib/dom.js";
import { getAlphabet, getGreetings, getPronouns, getConjugation } from "./lib/data.js";
import { loadProgress, resetProgress, saveProgress, markMastered, isMastered, setExamplesDone } from "./lib/storage.js";
import { audioExists, playAudio, makeAudioButton } from "./lib/audio.js";
import { anyMatch } from "./lib/text.js";

const app = qs("#app");
const resetBtn = qs("#resetBtn");

let progress = loadProgress();
let cleanup = () => {};

resetBtn.addEventListener("click", () => {
  const ok = confirm("Reset your saved progress on this device?");
  if (!ok) return;
  resetProgress();
  progress = loadProgress();
  route();
});

window.addEventListener("hashchange", route);
window.addEventListener("load", route);

function parseHash() {
  const raw = (location.hash || "#/").slice(1);
  const [pathRaw, queryRaw] = raw.split("?");
  const path = (pathRaw || "/").replace(/\/+$/g, "") || "/";
  const params = new URLSearchParams(queryRaw || "");
  return { path, params };
}

async function route() {
  try { cleanup?.(); } catch {}
  cleanup = () => {};
  progress = loadProgress();

  const { path, params } = parseHash();
  const parts = path.split("/").filter(Boolean);

  if (parts.length === 0) return renderHome();
  if (parts[0] === "audio") return renderAudioChecklist();

  if (parts[0] === "lesson1") {
    if (parts[1] === "practice") {
      return renderLesson1Practice({ all: params.get("all") === "1" });
    }
    return renderLesson1Learn();
  }

  if (parts[0] === "lesson2") {
    if (parts[1] === "practice") {
      const phase = parseInt(params.get("phase") || "1", 10);
      const all = params.get("all") === "1";
      return renderLesson2Practice({ phase: phase === 2 ? 2 : 1, all });
    }
    return renderLesson2Examples();
  }

  if (parts[0] === "lesson3") {
    if (parts[1] === "practice") {
      const phase = parseInt(params.get("phase") || "1", 10);
      const all = params.get("all") === "1";
      return renderLesson3Practice({ phase: phase === 2 ? 2 : 1, all });
    }
    return renderLesson3Examples();
  }

  if (parts[0] === "lesson4") {
    if (parts[1] === "practice") {
      const phase = parseInt(params.get("phase") || "1", 10);
      const all = params.get("all") === "1";
      return renderLesson4Practice({ phase: phase === 2 ? 2 : 1, all });
    }
    return renderLesson4Examples();
  }


  renderHome();
}

function renderHome() {
  clear(app);

  const header = el("div", { class: "card" }, [
    el("h1", {}, ["Slovak from English — Typing Practice"]),
    el("p", { class: "muted" }, [
      "Lesson 1: Alphabet (listen → multiple choice). ",
      "Lesson 2: Greetings (examples first, then practice: Slovak→English typing, English→Slovak typing). ",
      "Lesson 3: Pronouns (examples first, then practice: meanings + sentence blanks). ",
      "Lesson 4: Conjugation (examples first, then practice: type verb forms + fill sentence blanks)."
    ])
  ]);

  // Lesson 1 summary
  const l1Mastered = Object.keys(progress.lesson1.mastered || {}).length;

  const lesson1Card = el("div", { class: "card col-6" }, [
    el("h2", {}, ["Lesson 1: Alphabet"]),
    el("p", { class: "muted" }, [
      `Letters mastered: ${l1Mastered}`
    ]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "secondary", href: "#/lesson1" }, ["Open lesson"]),
      el("a", { class: "primary", href: "#/lesson1/practice" }, ["Practice (unfinished)"]),
      el("a", { class: "ghost", href: "#/lesson1/practice?all=1" }, ["Practice (all)"])
    ])
  ]);

  // Lesson 2 summary
  const l2ex = progress.lesson2.examplesDone;
  const l2p1 = Object.keys(progress.lesson2.phase1Mastered || {}).length;
  const l2p2 = Object.keys(progress.lesson2.phase2Mastered || {}).length;

  const lesson2Card = el("div", { class: "card col-6" }, [
    el("h2", {}, ["Lesson 2: Greetings"]),
    el("p", { class: "muted" }, [
      `Examples: ${l2ex ? "completed ✅" : "not completed yet"}`,
      el("br"),
      `Slovak → English (typed) mastered: ${l2p1}`,
      el("br"),
      `English → Slovak (typed) mastered: ${l2p2}`
    ]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "secondary", href: "#/lesson2" }, ["Open examples"]),
      el("a", {
        class: l2ex ? "primary" : "secondary",
        href: l2ex ? "#/lesson2/practice?phase=1" : "#/lesson2",
        "aria-disabled": l2ex ? "false" : "true"
      }, ["Practice"])
    ]),
    !l2ex ? el("small", {}, ["You must go through the examples before practice unlocks."]) : null
  ]);



  // Lesson 3 summary
  const l3 = progress.lesson3 || { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} };
  const l3ex = !!l3.examplesDone;
  const l3p1 = Object.keys(l3.phase1Mastered || {}).length;
  const l3p2 = Object.keys(l3.phase2Mastered || {}).length;

  const lesson3Card = el("div", { class: "card col-6" }, [
    el("h2", {}, ["Lesson 3: Pronouns"]),
    el("p", { class: "muted" }, [
      `Examples: ${l3ex ? "completed ✅" : "not completed yet"}`,
      el("br"),
      `Definitions mastered: ${l3p1}`,
      el("br"),
      `Sentences mastered: ${l3p2}`
    ]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "secondary", href: "#/lesson3" }, ["Open examples"]),
      el("a", {
        class: l3ex ? "primary" : "secondary",
        href: l3ex ? "#/lesson3/practice?phase=1" : "#/lesson3",
        "aria-disabled": l3ex ? "false" : "true"
      }, ["Practice"])
    ]),
    !l3ex ? el("small", {}, ["You must go through the examples before practice unlocks."]) : null
  ]);

  // Lesson 4 summary
  const l4 = progress.lesson4 || { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} };
  const l4ex = !!l4.examplesDone;
  const l4p1 = Object.keys(l4.phase1Mastered || {}).length;
  const l4p2 = Object.keys(l4.phase2Mastered || {}).length;

  const lesson4Card = el("div", { class: "card col-6" }, [
    el("h2", {}, ["Lesson 4: Conjugation"]),
    el("p", { class: "muted" }, [
      `Examples: ${l4ex ? "completed ✅" : "not completed yet"}`,
      el("br"),
      `Verb forms mastered: ${l4p1}`,
      el("br"),
      `Sentence blanks mastered: ${l4p2}`
    ]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "secondary", href: "#/lesson4" }, ["Open examples"]),
      el("a", {
        class: l4ex ? "primary" : "secondary",
        href: l4ex ? "#/lesson4/practice?phase=1" : "#/lesson4",
        "aria-disabled": l4ex ? "false" : "true"
      }, ["Practice"])
    ]),
    !l4ex ? el("small", {}, ["You must go through the examples before practice unlocks."]) : null
  ]);
  app.appendChild(header);
  const grid = el("div", { class: "grid" }, [lesson1Card, lesson2Card, lesson3Card, lesson4Card]);
  app.appendChild(grid);
}

async function renderLesson1Learn() {
  clear(app);
  const data = await getAlphabet();

  const top = el("div", { class: "card" }, [
    el("h1", {}, [data.title]),
    el("p", { class: "muted" }, [
      "Step 1: listen to each letter. Step 2: practice with multiple choice (no microphone needed)."
    ]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "ghost", href: "#/" }, ["← Main menu"]),
      el("a", { class: "primary", href: "#/lesson1/practice" }, ["Start practice"])
    ])
  ]);

  const list = el("div", { class: "card" }, [
    el("h2", {}, ["Letters"]),
    el("p", { class: "muted" }, [
      "Add your recordings in ",
      el("span", { class: "kbd" }, ["audio/lesson1/"]),
      " using the filenames listed in ",
      el("span", { class: "kbd" }, ["audio/README.md"]),
      "."
    ])
  ]);

  const grid = el("div", { class: "grid" }, []);
  for (const letter of data.letters) {
    const mastered = isMastered(progress, "lesson1", letter.id);
    const card = el("div", { class: "card col-3" }, [
      el("div", { class: "rowtitle" }, [
        el("div", {}, [
          el("div", { class: "bigletter", style: "font-size:44px;margin:0;" }, [letter.grapheme]),
          mastered ? el("small", {}, ["Mastered ✅"]) : el("small", { class: "muted" }, ["Not mastered"])
        ]),
        makeAudioButton({ url: letter.audio, label: "▶︎", small: true })
      ]),
      letter.hint ? el("div", { class: "muted" }, [letter.hint]) : el("div", { class: "muted" }, ["Listen to the audio."])
    ]);
    grid.appendChild(card);
  }
  list.appendChild(grid);

  app.appendChild(top);
  app.appendChild(list);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sampleDistinct(source, n, excludeSet = new Set()) {
  const pool = source.filter(x => !excludeSet.has(x));
  const out = [];
  while (pool.length && out.length < n) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool[i]);
    pool.splice(i, 1);
  }
  return out;
}

function renderQueuePills(container, queue, currentId) {
  clear(container);
  for (const item of queue) {
    const label = item.grapheme || item.sk || item.subjectSk || item.en || item.subjectEn || item.id;
    const pill = el("span", { class: "pill" + (item.id === currentId ? " pill--active" : "") }, [label]);
    container.appendChild(pill);
  }
}

async function renderLesson1Practice({ all = false } = {}) {
  clear(app);
  const data = await getAlphabet();
  const lettersAll = data.letters;

  const letters = all
    ? lettersAll
    : lettersAll.filter(l => !isMastered(progress, "lesson1", l.id));

  if (!letters.length) {
    app.appendChild(el("div", { class: "card" }, [
      el("h1", {}, ["Lesson 1 practice"]),
      el("p", { class: "muted" }, ["No letters left in your practice queue."]),
      el("div", { class: "btnrow" }, [
        el("a", { class: "ghost", href: "#/" }, ["← Main menu"]),
        el("a", { class: "secondary", href: "#/lesson1" }, ["Back to lesson"]),
        el("a", { class: "primary", href: "#/lesson1/practice?all=1" }, ["Practice all letters"])
      ])
    ]));
    return;
  }

  // Queue stays in lesson order, but wrong answers go to the back.
  let queue = [...letters];
  let current = queue[0];
  let locked = false;

  const top = el("div", { class: "card" }, [
    el("h1", {}, [data.title]),
    el("p", { class: "muted" }, [
      "Listen and choose the letter you hear. ",
      "Correct → removed from the queue. Incorrect → sent to the back."
    ]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "ghost", href: "#/" }, ["← Main menu"]),
      el("a", { class: "secondary", href: "#/lesson1" }, ["Open lesson"])
    ])
  ]);

  const queuePills = el("div", { class: "pillrow" }, []);

  const prompt = el("div", {}, []);
  const choices = el("div", { class: "choices" }, []);
  const feedback = el("div", {}, []);

  const container = el("div", { class: "card" }, [
    el("h2", {}, ["Practice queue"]),
    queuePills,
    prompt,
    choices,
    feedback
  ]);

  app.appendChild(top);
  app.appendChild(container);

  function setFeedback(decision, chosenId) {
    clear(feedback);

    const ok = decision === true;
    const statusClass = ok ? "good" : "bad";
    const title = ok ? "Correct ✅" : "Not quite ❌";
    const msg = ok
      ? "Nice! This letter will be removed from your queue."
      : "This letter will go to the back of the queue.";

    const box = el("div", { class: `status ${statusClass}` }, [
      el("div", {}, [el("strong", {}, [title])]),
      el("div", { class: "muted" }, [msg]),
      el("div", { class: "muted", style: "margin-top:6px;" }, [
        `You chose: ${chosenId || "—"}`
      ]),
      el("div", { class: "muted", style: "margin-top:6px;" }, [
        `Correct: ${current.grapheme}`
      ])
    ]);

    if (current.hint) {
      box.appendChild(el("div", { class: "muted", style: "margin-top:6px;" }, [current.hint]));
    }

    // Reinforce with correct audio
    box.appendChild(el("div", { style: "margin-top:8px;" }, [
      makeAudioButton({ url: current.audio, label: "▶︎ Play correct audio", small: false })
    ]));

    const continueBtn = el("button", { class: "primary", type: "button", style: "margin-top:10px;" }, ["Continue"]);
    continueBtn.addEventListener("click", () => {
      if (ok) {
        markMastered(progress, "lesson1", current.id, true);
        queue.shift();
      } else {
        // move current to back
        const first = queue.shift();
        queue.push(first);
      }

      if (!queue.length) {
        clear(app);
        app.appendChild(el("div", { class: "card" }, [
          el("h1", {}, ["Alphabet practice complete ✅"]),
          el("p", { class: "muted" }, ["You finished practicing all letters in this session."]),
          el("div", { class: "btnrow" }, [
            el("a", { class: "primary", href: "#/" }, ["Back to main menu"]),
            el("a", { class: "secondary", href: "#/lesson1/practice?all=1" }, ["Practice all letters again"])
          ])
        ]));
        return;
      }

      current = queue[0];
      locked = false;
      renderStep();
    });

    feedback.appendChild(box);
    feedback.appendChild(continueBtn);
  }

  function renderStep() {
    renderQueuePills(queuePills, queue, current.id);

    clear(prompt);
    clear(choices);
    clear(feedback);

    prompt.appendChild(el("div", { class: "rowtitle" }, [
      el("div", {}, [
        el("h3", {}, ["Which letter is this sound?"]),
        el("div", { class: "muted" }, ["Click play, then choose one option."])
      ]),
      makeAudioButton({ url: current.audio, label: "▶︎ Play sound", small: false })
    ]));

    // Build 4-way multiple choice: correct + 3 random distractors
    const distractors = sampleDistinct(
      lettersAll,
      3,
      new Set([current])
    );

    const opts = shuffle([current, ...distractors]);
    for (const opt of opts) {
      const btn = el("button", { class: "secondary choicebtn", type: "button" }, [opt.grapheme]);
      btn.addEventListener("click", async () => {
        if (locked) return;
        locked = true;

        const correct = opt.id === current.id;
        // show immediate feedback
        // visually mark buttons
        for (const b of Array.from(choices.querySelectorAll("button"))) {
          b.disabled = true;
        }
        // highlight selection
        btn.classList.add(correct ? "choicebtn--correct" : "choicebtn--wrong");

        // also highlight the correct option if wrong
        if (!correct) {
          for (const b of Array.from(choices.querySelectorAll("button"))) {
            if (b.textContent === current.grapheme) b.classList.add("choicebtn--correct");
          }
        }

        // small delay so highlight is visible before audio plays
        await sleep(150);
        try { await playAudio(current.audio); } catch {}

        setFeedback(correct, opt.grapheme);
      });

      choices.appendChild(btn);
    }
  }

  renderStep();
}

async function renderLesson2Examples() {
  clear(app);
  const data = await getGreetings();

  const top = el("div", { class: "card" }, [
    el("h1", {}, [data.title]),
    el("p", { class: "muted" }, [data.intro]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "ghost", href: "#/" }, ["← Main menu"]),
      el("button", { class: "primary", type: "button", id: "doneBtn" }, [
        progress.lesson2.examplesDone ? "Examples completed ✅" : "Mark examples as done"
      ]),
      el("a", {
        class: progress.lesson2.examplesDone ? "secondary" : "ghost",
        href: progress.lesson2.examplesDone ? "#/lesson2/practice?phase=1" : "#/lesson2",
        "aria-disabled": progress.lesson2.examplesDone ? "false" : "true"
      }, ["Go to practice"])
    ])
  ]);

  const list = el("div", { class: "card" }, [
    el("h2", {}, ["Examples"]),
    el("p", { class: "muted" }, [
      "Listen and repeat. When you feel ready, mark examples as done to unlock practice."
    ])
  ]);

  const grid = el("div", { class: "grid" }, []);
  for (const it of data.items) {
    grid.appendChild(el("div", { class: "card col-6" }, [
      el("div", { class: "rowtitle" }, [
        el("div", {}, [
          el("div", { class: "bigletter", style: "font-size:34px;margin:0;" }, [it.sk]),
          el("small", { class: "muted" }, [it.en])
        ]),
        makeAudioButton({ url: it.audio, label: "▶︎", small: true })
      ])
    ]));
  }
  list.appendChild(grid);

  app.appendChild(top);
  app.appendChild(list);

  const doneBtn = qs("#doneBtn");
  doneBtn.addEventListener("click", () => {
    setExamplesDone(progress, true);
    progress = loadProgress();
    route();
  });
}

async function renderLesson2Practice({ phase = 1, all = false } = {}) {
  clear(app);

  if (!progress.lesson2.examplesDone) {
    app.appendChild(el("div", { class: "card" }, [
      el("h1", {}, ["Lesson 2 practice is locked"]),
      el("p", { class: "muted" }, ["You need to go through the examples first."]),
      el("div", { class: "btnrow" }, [
        el("a", { class: "primary", href: "#/lesson2" }, ["Go to examples"]),
        el("a", { class: "ghost", href: "#/" }, ["← Main menu"])
      ])
    ]));
    return;
  }

  const data = await getGreetings();
  const itemsAll = data.items;

  const phaseKey = phase === 1 ? "lesson2_phase1" : "lesson2_phase2";
  const phaseTitle = phase === 1
    ? "Phase 1: Slovak → English (type the meaning)"
    : "Phase 2: English → Slovak (type the Slovak phrase)";

  const items = all
    ? itemsAll
    : itemsAll.filter(it => !isMastered(progress, phaseKey, it.id));

  if (!items.length) {
    // Phase complete screen
    const next = phase === 1 ? "#/lesson2/practice?phase=2" : "#/";
    const nextLabel = phase === 1 ? "Start Phase 2" : "Back to main menu";
    app.appendChild(el("div", { class: "card" }, [
      el("h1", {}, [data.title]),
      el("h2", {}, [phaseTitle]),
      el("p", { class: "muted" }, ["Nothing left in your queue for this phase."]),
      el("div", { class: "btnrow" }, [
        el("a", { class: "ghost", href: "#/lesson2" }, ["Open examples"]),
        el("a", { class: "secondary", href: "#/lesson2/practice?phase=1&all=1" }, ["Practice phase 1 again"]),
        el("a", { class: "secondary", href: "#/lesson2/practice?phase=2&all=1" }, ["Practice phase 2 again"]),
        el("a", { class: "primary", href: next }, [nextLabel])
      ])
    ]));
    return;
  }

  let queue = [...items];
  let current = queue[0];
  let decision = null;
  let stepState = "answering"; // "answering" | "feedback"
  let continueAction = null;

  // User input (typed)
  let user = { typed: "" };

  const top = el("div", { class: "card" }, [
    el("h1", {}, [data.title]),
    el("h2", {}, [phaseTitle]),
    el("p", { class: "muted" }, [
      "Correct → removed from the queue. Incorrect → sent to the back."
    ]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "ghost", href: "#/" }, ["← Main menu"]),
      el("a", { class: "secondary", href: "#/lesson2" }, ["Open examples"]),
      el("a", { class: phase === 1 ? "primary" : "secondary", href: "#/lesson2/practice?phase=1" }, ["Phase 1"]),
      el("a", { class: phase === 2 ? "primary" : "secondary", href: "#/lesson2/practice?phase=2" }, ["Phase 2"])
    ])
  ]);

  const queuePills = el("div", { class: "pillrow" }, []);
  const prompt = el("div", {}, []);
  const controls = el("div", {}, []);
  const feedback = el("div", {}, []);

  const container = el("div", { class: "card" }, [
    el("h2", {}, ["Practice queue"]),
    queuePills,
    el("div", { class: "grid" }, [
      el("div", { class: "col-6" }, [prompt]),
      el("div", { class: "col-6" }, [controls])
    ]),
    feedback
  ]);

  app.appendChild(top);
  app.appendChild(container);

  function resetUser() {
    user = { typed: "" };
  }

  cleanup = () => {
    resetUser();
  };

  function renderPrompt() {
    clear(prompt);
    if (phase === 1) {
      prompt.appendChild(el("div", { class: "rowtitle" }, [
        el("div", {}, [
          el("h3", {}, ["Translate to English"]),
          el("div", { class: "bigletter", style: "font-size:34px;margin-top:6px;" }, [current.sk]),
          el("div", { class: "muted", style: "margin-top:6px;" }, ["Type the meaning in English."])
        ]),
        makeAudioButton({ url: current.audio, label: "▶︎", small: true })
      ]));
    } else {
      prompt.appendChild(el("div", { class: "rowtitle" }, [
        el("div", {}, [
          el("h3", {}, ["Translate to Slovak"]),
          el("div", { class: "bigletter", style: "font-size:28px;margin-top:6px;" }, [current.en]),
          el("div", { class: "muted", style: "margin-top:6px;" }, ["Type the Slovak phrase (spelling)."]),
          el("div", { class: "muted" }, ["Tip: diacritics are optional — the checker accepts both."])
        ])
      ]));
    }
  }

  function renderControls() {
    clear(controls);

    if (phase === 1) {
      const field = el("div", { class: "field" }, [
        el("label", {}, ["Your answer (English)"]),
        el("input", { type: "text", id: "typedAnswer", placeholder: "Type the meaning…" })
      ]);

      const submitBtn = el("button", { class: "primary", type: "button" }, ["Submit"]);
      const submit = async () => {
        const typed = field.querySelector("input")?.value?.trim() || "";
        user.typed = typed;

        clear(feedback);
        if (!typed) {
          feedback.appendChild(el("div", { class: "status bad" }, [
            el("div", {}, [el("strong", {}, ["Type an answer first."])]),
            el("div", { class: "muted" }, ["Then press Submit."])
          ]));
          return;
        }

        const ok = anyMatch(typed, current.acceptEn || []);
        decision = ok;

        showFeedback();
      };

      submitBtn.addEventListener("click", submit);
      field.querySelector("input")?.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        // Keyboard flow:
        // - Enter (while answering) → Submit
        // - Enter (after graded) → Continue
        if (stepState === "feedback") {
          if (continueAction) continueAction();
          return;
        }
        submit();
      });

      controls.appendChild(field);
      controls.appendChild(el("div", { class: "btnrow" }, [submitBtn]));
      return;
    }

    const field = el("div", { class: "field" }, [
      el("label", {}, ["Your answer (Slovak)"]),
      el("input", { type: "text", id: "typedAnswerSk", placeholder: "Type the Slovak phrase…" })
    ]);

    const submitBtn = el("button", { class: "primary", type: "button" }, ["Submit"]);

    const submit = async () => {
      const typed = field.querySelector("input")?.value?.trim() || "";
      user.typed = typed;

      clear(feedback);
      if (!typed) {
        feedback.appendChild(el("div", { class: "status bad" }, [
          el("div", {}, [el("strong", {}, ["Type an answer first."])]),
          el("div", { class: "muted" }, ["Then press Submit."])
        ]));
        return;
      }

      const ok = anyMatch(typed, current.acceptSk || [current.sk]);
      decision = ok;
      showFeedback();
    };

    submitBtn.addEventListener("click", submit);
    field.querySelector("input")?.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (stepState === "feedback") {
        if (continueAction) continueAction();
        return;
      }
      submit();
    });

    controls.appendChild(field);
    controls.appendChild(el("div", { class: "btnrow" }, [submitBtn]));
  }

  async function showFeedback() {
    clear(feedback);

    stepState = "feedback";

    const statusClass = decision === true ? "good" : "bad";
    const title = decision === true ? "Correct ✅" : "Not quite ❌";
    const msg = decision === true
      ? "Nice! This item will be removed from your queue."
      : "This item will go to the back of the queue.";

    const details = el("div", { class: `status ${statusClass}` }, [
      el("div", {}, [el("strong", {}, [title])]),
      el("div", { class: "muted" }, [msg])
    ]);

    if (phase === 1) {
      if (user.typed) {
        details.appendChild(el("div", { class: "muted", style: "margin-top:6px;" }, [`You typed: “${user.typed}”`]));
        details.appendChild(el("div", { class: "muted", style: "margin-top:6px;" }, [`Correct meaning: ${current.en}`]));
      } else {
        details.appendChild(el("div", { class: "muted", style: "margin-top:6px;" }, ["Type an answer, then submit."]));
      }

      // Reinforce Slovak audio
      try { await playAudio(current.audio); } catch {}
    } else {
      if (user.typed) {
        details.appendChild(el("div", { class: "muted", style: "margin-top:6px;" }, [`You typed: “${user.typed}”`]));
      }
      details.appendChild(el("div", { class: "muted", style: "margin-top:6px;" }, [`Correct Slovak: ${current.sk}`]));
      details.appendChild(el("div", { class: "muted" }, [`Meaning: ${current.en}`]));

      // Reinforce with correct audio
      try { await playAudio(current.audio); } catch {}
    }

    const markCorrectBtn = el("button", { class: decision === true ? "primary" : "secondary", type: "button" }, ["I got it correct"]);
    const markWrongBtn = el("button", { class: decision === false ? "primary" : "secondary", type: "button" }, ["I got it wrong"]);
    const continueBtn = el("button", { class: "primary", type: "button" }, ["Continue"]);

    markCorrectBtn.addEventListener("click", () => {
      decision = true;
      markCorrectBtn.className = "primary";
      markWrongBtn.className = "secondary";
      continueBtn.disabled = false;
    });
    markWrongBtn.addEventListener("click", () => {
      decision = false;
      markWrongBtn.className = "primary";
      markCorrectBtn.className = "secondary";
      continueBtn.disabled = false;
    });

    continueAction = () => {
      if (decision === true) {
        markMastered(progress, phaseKey, current.id, true);
        queue.shift();
      } else {
        const first = queue.shift();
        queue.push(first);
      }

      resetUser();

      if (!queue.length) {
        // Move to next phase automatically if phase 1 done.
        if (phase === 1) {
          // If the user chose “practice again” (all=1), carry that into phase 2
          // so they can keep practicing without having to reset progress.
          location.hash = all
            ? "#/lesson2/practice?phase=2&all=1"
            : "#/lesson2/practice?phase=2";
          return;
        }

        clear(app);
        app.appendChild(el("div", { class: "card" }, [
          el("h1", {}, ["Greetings practice complete ✅"]),
          el("p", { class: "muted" }, ["You finished both phases of greetings practice."]),
          el("div", { class: "btnrow" }, [
            el("a", { class: "primary", href: "#/" }, ["Back to main menu"]),
            el("a", { class: "secondary", href: "#/lesson2/practice?phase=1&all=1" }, ["Practice again"])
          ])
        ]));
        return;
      }

      current = queue[0];
      decision = null;
      renderStep();
    };

    continueBtn.addEventListener("click", continueAction);

    feedback.appendChild(details);
    feedback.appendChild(el("div", { class: "btnrow", style: "margin-top:10px;" }, [
      markCorrectBtn, markWrongBtn, continueBtn
    ]));

    // Keyboard flow: after grading, hitting Enter again should continue.
    // Focusing the Continue button makes Enter activate it immediately.
    try { continueBtn.focus(); } catch {}
  }

  function renderStep() {
    stepState = "answering";
    continueAction = null;
    renderQueuePills(queuePills, queue, current.id);
    renderPrompt();
    renderControls();
    clear(feedback);

    // Autofocus the answer box so you can type immediately
    requestAnimationFrame(() => {
      const input = controls.querySelector("input");
      if (!input) return;
      input.focus();
      input.select(); // optional (highlights any existing text)
    });
  }

  renderStep();
}



async function renderLesson3Examples() {
  clear(app);
  const data = await getPronouns();

  const l3 = progress.lesson3 || { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} };

  const top = el("div", { class: "card" }, [
    el("h1", {}, [data.title]),
    el("p", { class: "muted" }, [data.intro || ""]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "ghost", href: "#/" }, ["← Main menu"]),
      el("button", { class: "primary", type: "button", id: "doneBtnL3" }, [
        l3.examplesDone ? "Examples completed ✅" : "Mark examples as done"
      ]),
      el("a", {
        class: l3.examplesDone ? "secondary" : "ghost",
        href: l3.examplesDone ? "#/lesson3/practice?phase=1" : "#/lesson3",
        "aria-disabled": l3.examplesDone ? "false" : "true"
      }, ["Go to practice"])
    ])
  ]);

  const chartCard = el("div", { class: "card" }, [
    el("h2", {}, ["Pronoun chart"]),
    el("p", { class: "muted" }, ["Listen to each pronoun. When you’re ready, mark examples as done to unlock practice."]),
    el("div", { class: "tablewrap" }, [
      el("table", { class: "table" }, [
        el("thead", {}, [
          el("tr", {}, [
            el("th", {}, ["English"]),
            el("th", {}, ["Slovak"]),
            el("th", {}, ["Notes"])
          ])
        ]),
        el("tbody", {}, (data.chart || []).map(row => el("tr", {}, [
          el("td", {}, [row.en]),
          el("td", {}, [
            el("span", { class: "audio-inline" }, [
              el("strong", {}, [row.sk]),
              row.audio ? makeAudioButton({ url: row.audio, label: "▶︎", small: true }) : null
            ])
          ]),
          el("td", {}, [row.note || ""])
        ])))
      ])
    ])
  ]);

  app.appendChild(top);
  app.appendChild(chartCard);

  if ((data.examples || []).length) {
    const exCard = el("div", { class: "card" }, [
      el("h2", {}, ["Example sentences"]),
      el("p", { class: "muted" }, ["Listen to hear pronouns in context."])
    ]);

    const grid = el("div", { class: "grid" }, []);
    for (const ex of data.examples) {
      grid.appendChild(el("div", { class: "card col-6" }, [
        el("div", { class: "rowtitle" }, [
          el("div", {}, [
            el("div", { class: "bigletter", style: "font-size:28px;margin:0;" }, [ex.sk]),
            el("small", { class: "muted" }, [ex.en])
          ]),
          ex.audio ? makeAudioButton({ url: ex.audio, label: "▶︎", small: true }) : null
        ])
      ]));
    }
    exCard.appendChild(grid);
    app.appendChild(exCard);
  }

  const doneBtn = qs("#doneBtnL3");
  doneBtn.addEventListener("click", () => {
    setExamplesDone(progress, "lesson3", true);
    progress = loadProgress();
    route();
  });
}

async function renderLesson3Practice({ phase = 1, all = false } = {}) {
  clear(app);

  const l3 = progress.lesson3 || { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} };

  if (!l3.examplesDone) {
    app.appendChild(el("div", { class: "card" }, [
      el("h1", {}, ["Lesson 3 practice is locked"]),
      el("p", { class: "muted" }, ["You need to go through the examples first."]),
      el("div", { class: "btnrow" }, [
        el("a", { class: "primary", href: "#/lesson3" }, ["Go to examples"]),
        el("a", { class: "ghost", href: "#/" }, ["← Main menu"])
      ])
    ]));
    return;
  }

  const data = await getPronouns();
  const itemsAll = phase === 1 ? (data.phase1 || []) : (data.phase2 || []);

  const phaseKey = phase === 1 ? "lesson3_phase1" : "lesson3_phase2";
  const phaseTitle = phase === 1
    ? "Phase 1: Slovak → English (type the meaning)"
    : "Phase 2: Use the pronoun in a sentence (type the missing pronoun)";

  const items = all
    ? itemsAll
    : itemsAll.filter(it => !isMastered(progress, phaseKey, it.id));

  if (!items.length) {
    const next = phase === 1 ? "#/lesson3/practice?phase=2" : "#/";
    const nextLabel = phase === 1 ? "Start Phase 2" : "Back to main menu";

    app.appendChild(el("div", { class: "card" }, [
      el("h1", {}, [data.title]),
      el("h2", {}, [phaseTitle]),
      el("p", { class: "muted" }, ["Nothing left in your queue for this phase."]),
      el("div", { class: "btnrow" }, [
        el("a", { class: "ghost", href: "#/lesson3" }, ["Open examples"]),
        el("a", { class: "secondary", href: "#/lesson3/practice?phase=1&all=1" }, ["Practice phase 1 again"]),
        el("a", { class: "secondary", href: "#/lesson3/practice?phase=2&all=1" }, ["Practice phase 2 again"]),
        el("a", { class: "primary", href: next }, [nextLabel])
      ])
    ]));
    return;
  }

  let queue = [...items];
  let current = queue[0];
  let decision = null;
  let stepState = "answering"; // "answering" | "feedback"
  let continueAction = null;

  let user = { typed: "" };

  const top = el("div", { class: "card" }, [
    el("h1", {}, [data.title]),
    el("h2", {}, [phaseTitle]),
    el("p", { class: "muted" }, ["Correct → removed from the queue. Incorrect → sent to the back."]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "ghost", href: "#/" }, ["← Main menu"]),
      el("a", { class: "secondary", href: "#/lesson3" }, ["Open examples"]),
      el("a", { class: phase === 1 ? "primary" : "secondary", href: "#/lesson3/practice?phase=1" }, ["Phase 1"]),
      el("a", { class: phase === 2 ? "primary" : "secondary", href: "#/lesson3/practice?phase=2" }, ["Phase 2"])
    ])
  ]);

  const queuePills = el("div", { class: "pillrow" }, []);
  const prompt = el("div", {}, []);
  const controls = el("div", {}, []);
  const feedback = el("div", {}, []);

  const container = el("div", { class: "card" }, [
    el("h2", {}, ["Practice queue"]),
    queuePills,
    el("div", { class: "grid" }, [
      el("div", { class: "col-6" }, [prompt]),
      el("div", { class: "col-6" }, [controls])
    ]),
    feedback
  ]);

  app.appendChild(top);
  app.appendChild(container);

  function resetUser() {
    user = { typed: "" };
  }

  cleanup = () => {
    resetUser();
  };

  function renderPrompt() {
    clear(prompt);

    if (phase === 1) {
      prompt.appendChild(el("div", { class: "rowtitle" }, [
        el("div", {}, [
          el("h3", {}, ["Translate to English"]),
          el("div", { class: "bigletter", style: "font-size:34px;margin-top:6px;" }, [current.sk]),
          el("div", { class: "muted", style: "margin-top:6px;" }, ["Type the meaning in English."])
        ]),
        current.audio ? makeAudioButton({ url: current.audio, label: "▶︎", small: true }) : null
      ]));
    } else {
      prompt.appendChild(el("div", {}, [
        el("h3", {}, ["Fill the missing pronoun"]),
        el("div", { class: "bigletter", style: "font-size:26px;margin-top:6px;" }, [current.en]),
        el("div", { class: "muted", style: "margin-top:6px;" }, ["Type the Slovak pronoun that completes this sentence:"]),
        el("div", { class: "bigletter", style: "font-size:28px;margin-top:8px;" }, [current.skTemplate])
      ]));
    }
  }

  function renderControls() {
    clear(controls);

    const label = phase === 1 ? "Your answer (English)" : "Your answer (pronoun)";
    const placeholder = phase === 1 ? "Type the meaning…" : "Type the pronoun…";

    const field = el("div", { class: "field" }, [
      el("label", {}, [label]),
      el("input", { type: "text", id: "typedAnswerL3", placeholder })
    ]);

    const submitBtn = el("button", { class: "primary", type: "button" }, ["Submit"]);

    const submit = () => {
      const typed = field.querySelector("input")?.value?.trim() || "";
      user.typed = typed;

      clear(feedback);
      if (!typed) {
        feedback.appendChild(el("div", { class: "status bad" }, [
          el("div", {}, [el("strong", {}, ["Type an answer first."])]),
          el("div", { class: "muted" }, ["Then press Submit."])
        ]));
        return;
      }

      if (phase === 1) {
        decision = anyMatch(typed, current.acceptEn || [current.en]);
      } else {
        decision = anyMatch(typed, current.acceptSk || [current.sk]);
      }

      showFeedback();
    };

    submitBtn.addEventListener("click", submit);

    field.querySelector("input")?.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (stepState === "feedback") {
        if (continueAction) continueAction();
        return;
      }
      submit();
    });

    controls.appendChild(field);
    controls.appendChild(el("div", { class: "btnrow" }, [submitBtn]));
  }

  async function showFeedback() {
    clear(feedback);
    stepState = "feedback";

    const statusClass = decision === true ? "good" : "bad";
    const title = decision === true ? "Correct ✅" : "Not quite ❌";
    const msg = decision === true
      ? "Nice! This item will be removed from your queue."
      : "This item will go to the back of the queue.";

    const details = el("div", { class: `status ${statusClass}` }, [
      el("div", {}, [el("strong", {}, [title])]),
      el("div", { class: "muted" }, [msg]),
      user.typed ? el("div", { class: "muted", style: "margin-top:6px;" }, [`You typed: “${user.typed}”`]) : null
    ]);

    if (phase === 1) {
      details.appendChild(el("div", { class: "muted", style: "margin-top:6px;" }, [`Correct meaning: ${current.en}`]));
      try { await playAudio(current.audio); } catch {}
    } else {
      details.appendChild(el("div", { class: "muted", style: "margin-top:6px;" }, [`Correct pronoun: ${current.sk}`]));
      if (current.skFull) details.appendChild(el("div", { class: "muted" }, [`Full sentence: ${current.skFull}`]));
      try { await playAudio(current.audio); } catch {}
    }

    const markCorrectBtn = el("button", { class: decision === true ? "primary" : "secondary", type: "button" }, ["I got it correct"]);
    const markWrongBtn = el("button", { class: decision === false ? "primary" : "secondary", type: "button" }, ["I got it wrong"]);
    const continueBtn = el("button", { class: "primary", type: "button" }, ["Continue"]);

    markCorrectBtn.addEventListener("click", () => {
      decision = true;
      markCorrectBtn.className = "primary";
      markWrongBtn.className = "secondary";
    });
    markWrongBtn.addEventListener("click", () => {
      decision = false;
      markWrongBtn.className = "primary";
      markCorrectBtn.className = "secondary";
    });

    continueAction = () => {
      if (decision === true) {
        markMastered(progress, phaseKey, current.id, true);
        queue.shift();
      } else {
        const first = queue.shift();
        queue.push(first);
      }

      resetUser();

      if (!queue.length) {
        if (phase === 1) {
          location.hash = all ? "#/lesson3/practice?phase=2&all=1" : "#/lesson3/practice?phase=2";
          return;
        }

        clear(app);
        app.appendChild(el("div", { class: "card" }, [
          el("h1", {}, ["Pronouns practice complete ✅"]),
          el("p", { class: "muted" }, ["You finished both phases of pronouns practice."]),
          el("div", { class: "btnrow" }, [
            el("a", { class: "primary", href: "#/" }, ["Back to main menu"]),
            el("a", { class: "secondary", href: "#/lesson3/practice?phase=1&all=1" }, ["Practice again"])
          ])
        ]));
        return;
      }

      current = queue[0];
      decision = null;
      renderStep();
    };

    continueBtn.addEventListener("click", continueAction);

    feedback.appendChild(details);
    feedback.appendChild(el("div", { class: "btnrow", style: "margin-top:10px;" }, [
      markCorrectBtn, markWrongBtn, continueBtn
    ]));

    // Enter-after-grade should Continue:
    try { continueBtn.focus(); } catch {}
  }

  function renderStep() {
    stepState = "answering";
    continueAction = null;
    renderQueuePills(queuePills, queue, current.id);
    renderPrompt();
    renderControls();
    clear(feedback);

    // Autofocus the answer box so you can type immediately
    requestAnimationFrame(() => {
      const input = controls.querySelector("input");
      if (!input) return;
      input.focus();
      input.select(); // optional (highlights any existing text)
    });
  }

  renderStep();
}

// ------------------------------
// Lesson 4: Conjugation
// ------------------------------

async function renderLesson4Examples() {
  clear(app);
  const data = await getConjugation();

  const l4 = progress.lesson4 || { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} };

  const top = el("div", { class: "card" }, [
    el("h1", {}, [data.title]),
    el("p", { class: "muted" }, [data.intro || ""]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "ghost", href: "#/" }, ["← Main menu"]),
      el("button", { class: "primary", type: "button", id: "doneBtnL4" }, [
        l4.examplesDone ? "Examples completed ✅" : "Mark examples as done"
      ]),
      el("a", {
        class: l4.examplesDone ? "secondary" : "ghost",
        href: l4.examplesDone ? "#/lesson4/practice?phase=1" : "#/lesson4",
        "aria-disabled": l4.examplesDone ? "false" : "true"
      }, ["Go to practice"])
    ])
  ]);

  app.appendChild(top);

  for (const verb of (data.verbs || [])) {
    const card = el("div", { class: "card" }, [
      el("h2", {}, [`Verb: ${verb.infinitive} — ${verb.english}`]),
      verb.note ? el("p", { class: "muted" }, [verb.note]) : null,
      el("div", { class: "tablewrap" }, [
        el("table", { class: "table" }, [
          el("thead", {}, [
            el("tr", {}, [
              el("th", {}, ["English subject"]),
              el("th", {}, ["Slovak pronoun"]),
              el("th", {}, ["Verb form"]),
              el("th", {}, ["Audio"])
            ])
          ]),
          el("tbody", {}, (verb.rows || []).map(r => el("tr", {}, [
            el("td", {}, [r.subjectEn]),
            el("td", {}, [r.subjectSk]),
            el("td", {}, [el("strong", {}, [r.form])]),
            el("td", {}, [r.audio ? makeAudioButton({ url: r.audio, label: "▶︎", small: true }) : el("span", { class: "muted" }, ["—"])])
          ])))
        ])
      ])
    ].filter(Boolean));
    app.appendChild(card);
  }

  if ((data.examples || []).length) {
    const exCard = el("div", { class: "card" }, [
      el("h2", {}, ["Example sentences"]),
      el("p", { class: "muted" }, ["Use these as models. (Audio is optional.)"])
    ]);

    const grid = el("div", { class: "grid" }, []);
    for (const ex of data.examples) {
      grid.appendChild(el("div", { class: "card col-6" }, [
        el("div", { class: "rowtitle" }, [
          el("div", {}, [
            el("div", { class: "bigletter", style: "font-size:28px;margin:0;" }, [ex.sk]),
            el("small", { class: "muted" }, [ex.en])
          ]),
          ex.audio ? makeAudioButton({ url: ex.audio, label: "▶︎", small: true }) : null
        ])
      ]));
    }
    exCard.appendChild(grid);
    app.appendChild(exCard);
  }

  const doneBtn = qs("#doneBtnL4");
  doneBtn.addEventListener("click", () => {
    setExamplesDone(progress, "lesson4", true);
    progress = loadProgress();
    route();
  });
}

async function renderLesson4Practice({ phase = 1, all = false } = {}) {
  clear(app);

  const l4 = progress.lesson4 || { examplesDone: false, phase1Mastered: {}, phase2Mastered: {} };
  if (!l4.examplesDone) {
    app.appendChild(el("div", { class: "card" }, [
      el("h1", {}, ["Lesson 4 practice is locked"]),
      el("p", { class: "muted" }, ["You need to go through the examples first."]),
      el("div", { class: "btnrow" }, [
        el("a", { class: "primary", href: "#/lesson4" }, ["Go to examples"]),
        el("a", { class: "ghost", href: "#/" }, ["← Main menu"])
      ])
    ]));
    return;
  }

  const data = await getConjugation();
  const itemsAll = phase === 1 ? (data.phase1 || []) : (data.phase2 || []);

  const phaseKey = phase === 1 ? "lesson4_phase1" : "lesson4_phase2";
  const phaseTitle = phase === 1
    ? "Phase 1: Type the correct verb form"
    : "Phase 2: Fill the missing verb form (sentence blanks)";

  const items = all
    ? itemsAll
    : itemsAll.filter(it => !isMastered(progress, phaseKey, it.id));

  if (!items.length) {
    const next = phase === 1 ? "#/lesson4/practice?phase=2" : "#/";
    const nextLabel = phase === 1 ? "Start Phase 2" : "Back to main menu";
    app.appendChild(el("div", { class: "card" }, [
      el("h1", {}, [data.title]),
      el("h2", {}, [phaseTitle]),
      el("p", { class: "muted" }, ["Nothing left in your queue for this phase."]),
      el("div", { class: "btnrow" }, [
        el("a", { class: "ghost", href: "#/lesson4" }, ["Open examples"]),
        el("a", { class: "secondary", href: "#/lesson4/practice?phase=1&all=1" }, ["Practice phase 1 again"]),
        el("a", { class: "secondary", href: "#/lesson4/practice?phase=2&all=1" }, ["Practice phase 2 again"]),
        el("a", { class: "primary", href: next }, [nextLabel])
      ])
    ]));
    return;
  }

  let queue = [...items];
  let current = queue[0];
  let decision = null;
  let stepState = "answering";
  let continueAction = null;
  let user = { typed: "" };

  const top = el("div", { class: "card" }, [
    el("h1", {}, [data.title]),
    el("h2", {}, [phaseTitle]),
    el("p", { class: "muted" }, ["Correct → removed from the queue. Incorrect → sent to the back."]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "ghost", href: "#/" }, ["← Main menu"]),
      el("a", { class: "secondary", href: "#/lesson4" }, ["Open examples"]),
      el("a", { class: phase === 1 ? "primary" : "secondary", href: "#/lesson4/practice?phase=1" }, ["Phase 1"]),
      el("a", { class: phase === 2 ? "primary" : "secondary", href: "#/lesson4/practice?phase=2" }, ["Phase 2"])
    ])
  ]);

  const queuePills = el("div", { class: "pillrow" }, []);
  const prompt = el("div", {}, []);
  const controls = el("div", {}, []);
  const feedback = el("div", {}, []);

  const container = el("div", { class: "card" }, [
    el("h2", {}, ["Practice queue"]),
    queuePills,
    el("div", { class: "grid" }, [
      el("div", { class: "col-6" }, [prompt]),
      el("div", { class: "col-6" }, [controls])
    ]),
    feedback
  ]);

  app.appendChild(top);
  app.appendChild(container);

  function resetUser() { user = { typed: "" }; }
  cleanup = () => { resetUser(); };

  function renderPrompt() {
    clear(prompt);

    if (phase === 1) {
      prompt.appendChild(el("div", {}, [
        el("h3", {}, ["Conjugate the verb"]),
        el("div", { class: "muted" }, [`Verb: ${current.verbSk} (${current.verbEn})`]),
        el("div", { class: "bigletter", style: "font-size:30px;margin-top:10px;" }, [
          `${current.subjectEn} (${current.subjectSk})`
        ]),
        el("div", { class: "muted", style: "margin-top:6px;" }, ["Type the correct present-tense form."])
      ]));
    } else {
      prompt.appendChild(el("div", {}, [
        el("h3", {}, ["Fill the missing verb form"]),
        el("div", { class: "muted" }, [`Verb: ${current.verbSk} (${current.verbEn})`]),
        el("div", { class: "bigletter", style: "font-size:26px;margin-top:10px;" }, [current.en]),
        el("div", { class: "muted", style: "margin-top:6px;" }, ["Type the missing verb form:"]),
        el("div", { class: "bigletter", style: "font-size:28px;margin-top:8px;" }, [current.skTemplate])
      ]));
    }
  }

  function renderControls() {
    clear(controls);

    const field = el("div", { class: "field" }, [
      el("label", {}, ["Your answer (verb form)"]),
      el("input", { type: "text", id: "typedAnswerL4", placeholder: "Type the verb form…" })
    ]);
    const submitBtn = el("button", { class: "primary", type: "button" }, ["Submit"]);

    const submit = () => {
      const typed = field.querySelector("input")?.value?.trim() || "";
      user.typed = typed;

      clear(feedback);
      if (!typed) {
        feedback.appendChild(el("div", { class: "status bad" }, [
          el("div", {}, [el("strong", {}, ["Type an answer first."])]),
          el("div", { class: "muted" }, ["Then press Submit."])
        ]));
        return;
      }

      decision = anyMatch(typed, current.accept || [current.answer]);
      showFeedback();
    };

    submitBtn.addEventListener("click", submit);
    field.querySelector("input")?.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (stepState === "feedback") {
        if (continueAction) continueAction();
        return;
      }
      submit();
    });

    controls.appendChild(field);
    controls.appendChild(el("div", { class: "btnrow" }, [submitBtn]));
  }

  async function showFeedback() {
    clear(feedback);
    stepState = "feedback";

    const ok = decision === true;
    const statusClass = ok ? "good" : "bad";
    const title = ok ? "Correct ✅" : "Not quite ❌";
    const msg = ok
      ? "Nice! This item will be removed from your queue."
      : "This item will go to the back of the queue.";

    const details = el("div", { class: `status ${statusClass}` }, [
      el("div", {}, [el("strong", {}, [title])]),
      el("div", { class: "muted" }, [msg]),
      user.typed ? el("div", { class: "muted", style: "margin-top:6px;" }, [`You typed: “${user.typed}”`]) : null,
      el("div", { class: "muted", style: "margin-top:6px;" }, [`Correct form: ${current.answer}`])
    ].filter(Boolean));

    if (phase === 1) {
      details.appendChild(el("div", { class: "muted" }, [`Full: ${current.subjectSk} ${current.answer}`]));
    } else {
      if (current.skFull) details.appendChild(el("div", { class: "muted" }, [`Full sentence: ${current.skFull}`]));
      try { await playAudio(current.audio); } catch {}
    }

    const markCorrectBtn = el("button", { class: ok ? "primary" : "secondary", type: "button" }, ["I got it correct"]);
    const markWrongBtn = el("button", { class: !ok ? "primary" : "secondary", type: "button" }, ["I got it wrong"]);
    const continueBtn = el("button", { class: "primary", type: "button" }, ["Continue"]);

    markCorrectBtn.addEventListener("click", () => {
      decision = true;
      markCorrectBtn.className = "primary";
      markWrongBtn.className = "secondary";
    });
    markWrongBtn.addEventListener("click", () => {
      decision = false;
      markWrongBtn.className = "primary";
      markCorrectBtn.className = "secondary";
    });

    continueAction = () => {
      if (decision === true) {
        markMastered(progress, phaseKey, current.id, true);
        queue.shift();
      } else {
        const first = queue.shift();
        queue.push(first);
      }

      resetUser();

      if (!queue.length) {
        if (phase === 1) {
          location.hash = all ? "#/lesson4/practice?phase=2&all=1" : "#/lesson4/practice?phase=2";
          return;
        }

        clear(app);
        app.appendChild(el("div", { class: "card" }, [
          el("h1", {}, ["Conjugation practice complete ✅"]),
          el("p", { class: "muted" }, ["You finished both phases of conjugation practice."]),
          el("div", { class: "btnrow" }, [
            el("a", { class: "primary", href: "#/" }, ["Back to main menu"]),
            el("a", { class: "secondary", href: "#/lesson4/practice?phase=1&all=1" }, ["Practice again"])
          ])
        ]));
        return;
      }

      current = queue[0];
      decision = null;
      renderStep();
    };

    continueBtn.addEventListener("click", continueAction);

    feedback.appendChild(details);
    feedback.appendChild(el("div", { class: "btnrow", style: "margin-top:10px;" }, [
      markCorrectBtn, markWrongBtn, continueBtn
    ]));

    // Enter-after-grade should Continue
    try { continueBtn.focus(); } catch {}
  }

  function renderStep() {
    stepState = "answering";
    continueAction = null;
    renderQueuePills(queuePills, queue, current.id);
    renderPrompt();
    renderControls();
    clear(feedback);

    // Autofocus the answer box so you can type immediately
    requestAnimationFrame(() => {
      const input = controls.querySelector("input");
      if (!input) return;
      input.focus();
      input.select(); // optional (highlights any existing text)
    });
  }

  renderStep();
}

async function renderAudioChecklist() {
  clear(app);

  const alpha = await getAlphabet();
  const greet = await getGreetings();
  const pron = await getPronouns();
  const conj = await getConjugation();

  const top = el("div", { class: "card" }, [
    el("h1", {}, ["Audio checklist"]),
    el("p", { class: "muted" }, [
      "This scans every audio file referenced by Lessons 1–4 and shows what’s missing."
    ]),
    el("div", { class: "btnrow" }, [
      el("a", { class: "ghost", href: "#/" }, ["← Main menu"]),
      el("button", { class: "primary", type: "button", id: "scanBtn" }, ["Scan now"])
    ])
  ]);

  const tableCard = el("div", { class: "card" }, [
    el("h2", {}, ["Files"]),
    el("p", { class: "muted", id: "scanNote" }, ["Not scanned yet."]),
    el("div", { class: "tablewrap" }, [
      el("table", {}, [
        el("thead", {}, [
          el("tr", {}, [
            el("th", {}, ["Lesson"]),
            el("th", {}, ["Item"]),
            el("th", {}, ["File"]),
            el("th", {}, ["Status"])
          ])
        ]),
        el("tbody", { id: "tbody" }, [])
      ])
    ])
  ]);

  app.appendChild(top);
  app.appendChild(tableCard);

  const tbody = qs("#tbody");
  const scanBtn = qs("#scanBtn");
  const scanNote = qs("#scanNote");

  const rows = [];

  function addRow(lesson, item, url) {
    const tr = el("tr", {}, [
      el("td", {}, [lesson]),
      el("td", {}, [item]),
      el("td", {}, [el("span", { class: "kbd" }, [url.replace("audio/","")])]),
      el("td", {}, [el("span", { class: "muted" }, ["Not checked"])])
    ]);
    tbody.appendChild(tr);
    rows.push({ tr, url });
  }

  for (const l of alpha.letters) addRow("Lesson 1", l.grapheme, l.audio);
  for (const it of greet.items) addRow("Lesson 2", it.sk, it.audio);
  // Lesson 3: pronouns
  for (const p of (pron.chart || [])) {
    if (p.audio) addRow("Lesson 3", p.sk, p.audio);
  }
  for (const ex of (pron.examples || [])) {
    if (ex.audio) addRow("Lesson 3", ex.sk, ex.audio);
  }

  // Lesson 4: conjugation (optional audio)
  for (const verb of (conj.verbs || [])) {
    for (const r of (verb.rows || [])) {
      if (r.audio) addRow("Lesson 4", `${verb.infinitive} — ${r.subjectSk}`, r.audio);
    }
  }
  for (const ex of (conj.examples || [])) {
    if (ex.audio) addRow("Lesson 4", ex.sk, ex.audio);
  }

  scanBtn.addEventListener("click", async () => {
    scanBtn.disabled = true;
    let okCount = 0;
    let badCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const { tr, url } = rows[i];
      const cell = tr.children[3];
      cell.textContent = "Checking…";

      const ok = await audioExists(url);
      if (ok) {
        okCount++;
        cell.innerHTML = "<span class='ok'>Found ✅</span>";
      } else {
        badCount++;
        cell.innerHTML = "<span class='bad'>Missing ❌</span>";
      }

      scanNote.textContent = `Checked ${i + 1} / ${rows.length}…`;
      await sleep(10);
    }

    scanNote.textContent = `Done. Found: ${okCount}. Missing: ${badCount}.`;
    scanBtn.disabled = false;
  });
}

// Default route
if (!location.hash) location.hash = "#/";
