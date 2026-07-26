/* ============================================================
   Spelling Star — 14 Day Spelling Adventure (Class 1)
   Pure vanilla JavaScript. No build step, no libraries.

   How it works:
     HOME  -> pick a day from the 14-day map
     LEARN -> see + hear all 10 words of the day
     QUIZ  -> 10 questions (missing letter / build the word / listen & spell)
     RESULT-> stars, score and words to practise again

   Progress is saved in localStorage so it survives a refresh.
   ============================================================ */
'use strict';

/* ------------------------------------------------------------
   1. THE 14 DAY CURRICULUM (140 words)
   Built up from easy CVC words -> sight words -> blends ->
   digraphs -> magic-e -> two syllable words.
   ------------------------------------------------------------ */
const CURRICULUM = [
  { day: 1,  focus: '-at & -an words',      words: ['cat','hat','bat','mat','rat','man','can','fan','pan','ran'] },
  { day: 2,  focus: '-ap & -ag words',      words: ['cap','map','tap','nap','lap','bag','tag','rag','wag','jam'] },
  { day: 3,  focus: '-ed, -en & -et words', words: ['bed','red','ten','pen','hen','men','net','pet','wet','jet'] },
  { day: 4,  focus: '-ig & -in words',      words: ['big','dig','pig','wig','fig','pin','win','tin','bin','fin'] },
  { day: 5,  focus: '-it & -ip words',      words: ['sit','hit','bit','fit','lit','lip','tip','rip','zip','dip'] },
  { day: 6,  focus: '-op & -ot words',      words: ['top','hop','mop','pop','dot','hot','pot','cot','not','got'] },
  { day: 7,  focus: '-ug & -un words',      words: ['bug','hug','rug','mug','jug','bun','fun','run','sun','nut'] },
  { day: 8,  focus: 'Everyday words 1',     words: ['the','and','you','are','for','was','said','they','have','with'] },
  { day: 9,  focus: 'Everyday words 2',     words: ['this','that','what','when','then','from','some','come','here','there'] },
  { day: 10, focus: 'Two letters together', words: ['stop','step','spin','swim','skip','slip','snap','spot','star','stem'] },
  { day: 11, focus: 'sh & ch sounds',       words: ['ship','shop','shut','fish','wish','chin','chop','chip','much','such'] },
  { day: 12, focus: 'th, wh & ck sounds',   words: ['thin','path','bath','math','whip','duck','lock','sock','rock','neck'] },
  { day: 13, focus: 'Magic "e" words',      words: ['cake','make','bike','kite','home','nose','cute','game','name','time'] },
  { day: 14, focus: 'Big kid words',        words: ['apple','happy','water','table','green','house','mouse','sunny','funny','party'] }
];

const TOTAL_DAYS = CURRICULUM.length;
const VOWELS = 'aeiou';
const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';

/* ------------------------------------------------------------
   2. SAVED PROGRESS
   ------------------------------------------------------------ */
const STORAGE_KEY = 'spelling-star-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { days: parsed.days || {}, streak: parsed.streak || 0, lastDate: parsed.lastDate || null };
      }
    }
  } catch (err) {
    // Corrupted or blocked storage - just start fresh.
  }
  return { days: {}, streak: 0, lastDate: null };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Private browsing may block storage; the app still works for this session.
  }
}

let state = loadState();

/** A day is unlocked if it is day 1, already done, or the day right after the last finished one. */
function isUnlocked(dayNumber) {
  if (dayNumber === 1) return true;
  if (state.days[dayNumber]) return true;
  return Boolean(state.days[dayNumber - 1]);
}

function daysCompleted() {
  return Object.keys(state.days).length;
}

/** Keeps the 🔥 streak going when the child practises on consecutive days. */
function updateStreak() {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (state.lastDate === today) return;
  state.streak = state.lastDate === yesterday ? state.streak + 1 : 1;
  state.lastDate = today;
}

/* ------------------------------------------------------------
   3. LITTLE HELPERS
   ------------------------------------------------------------ */
const $ = (id) => document.getElementById(id);

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomOf(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/** Clears a container and appends the given nodes. */
function fill(node, children) {
  node.innerHTML = '';
  children.forEach((child) => node.appendChild(child));
}

/** Creates an element with optional class, text and click handler. */
function make(tag, options) {
  const opts = options || {};
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.html !== undefined) node.innerHTML = opts.html;
  if (opts.aria) node.setAttribute('aria-label', opts.aria);
  if (opts.id) node.id = opts.id;
  if (opts.onClick) node.addEventListener('click', opts.onClick);
  return node;
}

/* ------------------------------------------------------------
   4. TALKING (Web Speech API)
   The first tap on the page unlocks audio on iOS/Android.
   ------------------------------------------------------------ */
let chosenVoice = null;

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  chosenVoice =
    voices.find((v) => /en-(GB|IN|US)/i.test(v.lang) && /female|zira|samantha|karen/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    voices[0];
}

if ('speechSynthesis' in window) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

/** Says a word slowly and clearly. */
function say(text, rate) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate || 0.75;
    utterance.pitch = 1.15;
    if (chosenVoice) utterance.voice = chosenVoice;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    // Audio is a bonus - never break the app if it is unavailable.
  }
}

/** Says the word, then spells it letter by letter. */
function sayAndSpell(word) {
  say(word, 0.7);
  window.setTimeout(() => say(word.split('').join(', '), 0.6), 900);
}

/* ------------------------------------------------------------
   5. SCREEN SWITCHING
   ------------------------------------------------------------ */
const SCREENS = ['screen-home', 'screen-day', 'screen-result'];

function showScreen(id, title) {
  SCREENS.forEach((s) => $(s).classList.toggle('hidden', s !== id));
  $('topTitle').textContent = title;
  $('backBtn').classList.toggle('hidden', id === 'screen-home');
  window.scrollTo(0, 0);
}

/* ------------------------------------------------------------
   6. HOME SCREEN
   ------------------------------------------------------------ */
function starString(count) {
  return '★★★'.slice(0, count) + '☆☆☆'.slice(0, 3 - count);
}

function renderHome() {
  const done = daysCompleted();
  $('overallBar').style.width = Math.round((done / TOTAL_DAYS) * 100) + '%';
  $('overallText').textContent = done + ' of ' + TOTAL_DAYS + ' days done';
  $('streakChip').textContent = '🔥 ' + (state.streak || 0);
  $('expertBadge').classList.toggle('hidden', done < TOTAL_DAYS);

  const cards = CURRICULUM.map((lesson) => {
    const saved = state.days[lesson.day];
    const unlocked = isUnlocked(lesson.day);
    const isNext = unlocked && !saved;

    const card = make('button', {
      className: 'day-card' + (saved ? ' done' : '') + (isNext ? ' next' : '') + (unlocked ? '' : ' locked'),
      aria: 'Day ' + lesson.day + ': ' + lesson.focus + (unlocked ? '' : ' (locked)')
    });
    card.appendChild(make('div', { className: 'num', text: unlocked ? 'Day ' + lesson.day : '🔒' }));
    card.appendChild(make('div', { className: 'focus', text: lesson.focus }));
    card.appendChild(make('div', { className: 'stars', text: starString(saved ? saved.stars : 0) }));

    card.addEventListener('click', () => {
      if (!unlocked) {
        say('Finish day ' + (lesson.day - 1) + ' first!');
        return;
      }
      startDay(lesson.day);
    });
    return card;
  });

  fill($('homeGrid'), cards);
  showScreen('screen-home', '⭐ Spelling Star');
}

/* ------------------------------------------------------------
   7. A DAY SESSION
   ------------------------------------------------------------ */
let session = null;

function startDay(dayNumber) {
  const lesson = CURRICULUM.find((l) => l.day === dayNumber);
  session = {
    day: dayNumber,
    lesson: lesson,
    learnIndex: 0,
    questions: buildQuestions(lesson.words),
    questionIndex: 0,
    points: 0,
    attempts: 0,
    missed: [],
    typed: ''
  };
  renderLearn();
}

/** Each of the 10 words is quizzed once, cycling through the 3 activity types. */
function buildQuestions(words) {
  const types = ['missing', 'build', 'spell'];
  return shuffle(words).map((word, index) => ({ word: word, type: types[index % types.length] }));
}

function setDayProgress(step, totalSteps, label) {
  $('dayBar').style.width = Math.round((step / totalSteps) * 100) + '%';
  $('dayStepText').textContent = label;
}

/* ---------- 7a. LEARN: look, listen, repeat ---------- */
function renderLearn() {
  const word = session.lesson.words[session.learnIndex];
  const total = session.lesson.words.length;
  setDayProgress(session.learnIndex + 1, total, 'Word ' + (session.learnIndex + 1) + ' of ' + total);
  showScreen('screen-day', 'Day ' + session.day + ' · Learn');

  const stage = $('stage');
  fill(stage, [
    make('p', { className: 'stage-kicker', text: 'Step 1 · Look and listen' }),
    make('h2', { className: 'stage-title', text: session.lesson.focus }),
    make('div', { className: 'word-big', text: word }),
    make('button', { className: 'speak-btn', text: '🔊', aria: 'Hear the word ' + word, onClick: () => sayAndSpell(word) }),
    make('p', { className: 'hint', text: 'Tap the speaker, then say the word out loud.' }),
    make('button', {
      className: 'btn btn-primary',
      text: session.learnIndex === total - 1 ? '✅ I am ready — start the quiz!' : 'Next word →',
      onClick: () => {
        if (session.learnIndex === total - 1) {
          startQuiz();
        } else {
          session.learnIndex += 1;
          renderLearn();
        }
      }
    }),
    make('button', { className: 'btn btn-ghost', text: 'Skip to the quiz', onClick: startQuiz })
  ]);

  sayAndSpell(word);
}

/* ---------- 7b. QUIZ ---------- */
function startQuiz() {
  session.questionIndex = 0;
  session.points = 0;
  session.missed = [];
  renderQuestion();
}

function renderQuestion() {
  const q = session.questions[session.questionIndex];
  const total = session.questions.length;
  session.attempts = 0;
  session.typed = '';
  setDayProgress(session.questionIndex + 1, total, 'Question ' + (session.questionIndex + 1) + ' of ' + total);
  showScreen('screen-day', 'Day ' + session.day + ' · Quiz');

  if (q.type === 'missing') renderMissingLetter(q);
  else if (q.type === 'build') renderBuild(q);
  else renderSpell(q);
}

/** Activity A — pick the missing letter. */
function renderMissingLetter(q) {
  const word = q.word;
  const hideAt = Math.floor(Math.random() * word.length);
  const answer = word[hideAt];
  const masked = word.split('').map((ch, i) => (i === hideAt ? '_' : ch)).join('');

  // Distractors come from the same letter family so the choice is fair.
  const pool = VOWELS.includes(answer) ? VOWELS : CONSONANTS;
  const choices = new Set([answer]);
  while (choices.size < 3) choices.add(randomOf(pool.split('')));

  const stage = $('stage');
  const feedback = make('div', { className: 'feedback', id: 'feedback' });

  const options = make('div', { className: 'options' });
  shuffle(Array.from(choices)).forEach((letter) => {
    options.appendChild(make('button', {
      className: 'option',
      text: letter,
      aria: 'Letter ' + letter,
      onClick: () => judge(letter === answer, word, feedback)
    }));
  });

  fill(stage, [
    make('p', { className: 'stage-kicker', text: 'Which letter is missing?' }),
    make('button', { className: 'speak-btn', text: '🔊', aria: 'Hear the word', onClick: () => say(word) }),
    make('div', { className: 'word-hidden', text: masked }),
    options,
    feedback
  ]);

  say(word);
}

/** Activity B — build the word from jumbled letter tiles. */
function renderBuild(q) {
  const word = q.word;
  let letters = shuffle(word.split(''));
  if (letters.join('') === word && word.length > 2) letters = shuffle(letters); // avoid giving it away

  const stage = $('stage');
  const slot = make('div', { className: 'answer-slot', id: 'slot', text: '' });
  const feedback = make('div', { className: 'feedback', id: 'feedback' });
  const tiles = make('div', { className: 'tiles' });

  letters.forEach((letter) => {
    const tile = make('button', { className: 'tile', text: letter, aria: 'Letter ' + letter });
    tile.addEventListener('click', () => {
      session.typed += letter;
      tile.classList.add('used');
      slot.textContent = session.typed;
      say(letter, 0.9);
      if (session.typed.length === word.length) {
        judge(session.typed === word, word, feedback, tiles);
      }
    });
    tiles.appendChild(tile);
  });

  fill(stage, [
    make('p', { className: 'stage-kicker', text: 'Build the word' }),
    make('button', { className: 'speak-btn', text: '🔊', aria: 'Hear the word', onClick: () => say(word) }),
    slot,
    tiles,
    make('button', {
      className: 'btn btn-ghost',
      text: '⌫ Undo',
      onClick: () => {
        if (!session.typed) return;
        session.typed = session.typed.slice(0, -1);
        slot.textContent = session.typed;
        const used = tiles.querySelectorAll('.tile.used');
        if (used.length) used[used.length - 1].classList.remove('used');
      }
    }),
    feedback
  ]);

  say(word);
}

/** Activity C — hear the word, then spell it on the A-Z keyboard. */
function renderSpell(q) {
  const word = q.word;
  const stage = $('stage');
  const slot = make('div', { className: 'answer-slot', id: 'slot', text: '' });
  const feedback = make('div', { className: 'feedback', id: 'feedback' });
  const keyboard = make('div', { className: 'keyboard' });

  'abcdefghijklmnopqrstuvwxyz'.split('').forEach((letter) => {
    keyboard.appendChild(make('button', {
      className: 'key',
      text: letter,
      aria: 'Letter ' + letter,
      onClick: () => {
        if (session.typed.length >= word.length + 3) return;
        session.typed += letter;
        slot.textContent = session.typed;
      }
    }));
  });

  keyboard.appendChild(make('button', {
    className: 'key wide',
    text: '⌫',
    aria: 'Delete last letter',
    onClick: () => {
      session.typed = session.typed.slice(0, -1);
      slot.textContent = session.typed;
    }
  }));

  fill(stage, [
    make('p', { className: 'stage-kicker', text: 'Listen, then spell it' }),
    make('button', { className: 'speak-btn', text: '🔊', aria: 'Hear the word again', onClick: () => sayAndSpell(word) }),
    slot,
    keyboard,
    make('button', {
      className: 'btn btn-accent',
      text: '✔️ Check my spelling',
      onClick: () => {
        if (!session.typed) { say('Tap the letters first.'); return; }
        judge(session.typed === word, word, feedback);
      }
    }),
    feedback
  ]);

  say(word, 0.7);
}

/**
 * Scores an answer. First try correct = 1 point, second try = half a point.
 * After two wrong tries the correct spelling is revealed and we move on.
 */
function judge(isCorrect, word, feedback, tiles) {
  const slot = $('slot');
  session.attempts += 1;

  if (isCorrect) {
    session.points += session.attempts === 1 ? 1 : 0.5;
    feedback.className = 'feedback ok';
    feedback.textContent = randomOf(['Great job! 🎉', 'Perfect! ⭐', 'You did it! 👏', 'Super spelling! 🌟']);
    if (slot) slot.classList.add('correct');
    say(randomOf(['Great job', 'Perfect', 'Well done']), 0.9);
    window.setTimeout(nextQuestion, 1100);
    return;
  }

  if (slot) { slot.classList.add('wrong'); }
  session.missed.push(word);

  if (session.attempts === 1) {
    feedback.className = 'feedback bad';
    feedback.textContent = 'Almost! Try once more 💪';
    say('Try again');
    // Reset the answer so the child can retry.
    window.setTimeout(() => {
      session.typed = '';
      if (slot) { slot.textContent = ''; slot.className = 'answer-slot'; }
      if (tiles) tiles.querySelectorAll('.tile.used').forEach((t) => t.classList.remove('used'));
      feedback.textContent = '';
    }, 1200);
    return;
  }

  feedback.className = 'feedback bad';
  feedback.textContent = 'The word is: ' + word.toUpperCase();
  sayAndSpell(word);
  window.setTimeout(nextQuestion, 2600);
}

function nextQuestion() {
  session.questionIndex += 1;
  if (session.questionIndex >= session.questions.length) finishDay();
  else renderQuestion();
}

/* ------------------------------------------------------------
   8. RESULT SCREEN
   ------------------------------------------------------------ */
function finishDay() {
  const total = session.questions.length;
  const percent = Math.round((session.points / total) * 100);
  const stars = percent >= 90 ? 3 : percent >= 70 ? 2 : 1;

  // Keep the best result for the day.
  const previous = state.days[session.day];
  if (!previous || previous.stars < stars) {
    state.days[session.day] = { stars: stars, percent: percent };
  }
  updateStreak();
  saveState();

  $('resultStars').textContent = starString(stars);
  $('resultTitle').textContent =
    stars === 3 ? 'Spelling superstar! 🌟' : stars === 2 ? 'Really good work! 👏' : 'Nice try — keep going! 💪';
  $('resultScore').textContent = 'You scored ' + percent + '% on Day ' + session.day + '.';

  const missed = Array.from(new Set(session.missed));
  const missedBox = $('resultMissed');
  missedBox.innerHTML = '';
  if (missed.length) {
    missedBox.appendChild(make('p', { text: 'Words to practise again:' }));
    missedBox.appendChild(make('p', { html: '<strong>' + missed.join(' · ') + '</strong>' }));
  } else {
    missedBox.appendChild(make('p', { text: 'You spelled every word correctly! 🎯' }));
  }

  showScreen('screen-result', 'Day ' + session.day + ' · Done');
  say(stars === 3 ? 'Excellent! You are a spelling star!' : 'Well done! Keep practising.', 0.85);
}

/* ------------------------------------------------------------
   9. WIRING UP THE BUTTONS
   ------------------------------------------------------------ */
$('backBtn').addEventListener('click', () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  renderHome();
});

$('mapBtn').addEventListener('click', renderHome);

$('againBtn').addEventListener('click', () => startDay(session.day));

$('resetBtn').addEventListener('click', () => {
  if (window.confirm('Clear all stars and start from Day 1?')) {
    state = { days: {}, streak: 0, lastDate: null };
    saveState();
    renderHome();
  }
});

// TODO (optional extras): add your own word list, a printable certificate,
// or a "spelling bee" mode that mixes words from every finished day.

renderHome();
