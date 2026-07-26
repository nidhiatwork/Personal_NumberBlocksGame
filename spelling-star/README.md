# ⭐ Spelling Star — 14 Day Spelling Adventure

A free, offline-friendly spelling app for **Class 1 (age 5–7)**. Learn **140 words in 14 days** and earn the Spelling Expert trophy.

No installs, no accounts, no ads, no tracking. Everything runs in the browser.

---

## How to use it

1. Open `index.html` (or the GitHub Pages link below) on a phone, tablet or laptop.
2. Tap **Day 1** on the adventure map.
3. **Step 1 — Look & Listen:** tap 🔊 to hear each of the 10 words, then say it out loud.
4. **Step 2 — Quiz:** 10 questions mixing three game types:
   - **Which letter is missing?** — pick the right letter.
   - **Build the word** — tap jumbled letter tiles in the right order.
   - **Listen & Spell** — hear the word, spell it on the big A–Z keyboard.
5. Earn ⭐⭐⭐ stars. The next day unlocks automatically.
6. Do **one day every day** for 14 days — the 🔥 streak counter keeps track.

Wrong answers get a second try, then the app shows and spells the correct word.
Progress is saved automatically on the device.

---

## The 14 day plan

| Day | Focus | Words |
| --- | --- | --- |
| 1 | -at & -an words | cat, hat, bat, mat, rat, man, can, fan, pan, ran |
| 2 | -ap & -ag words | cap, map, tap, nap, lap, bag, tag, rag, wag, jam |
| 3 | -ed, -en & -et words | bed, red, ten, pen, hen, men, net, pet, wet, jet |
| 4 | -ig & -in words | big, dig, pig, wig, fig, pin, win, tin, bin, fin |
| 5 | -it & -ip words | sit, hit, bit, fit, lit, lip, tip, rip, zip, dip |
| 6 | -op & -ot words | top, hop, mop, pop, dot, hot, pot, cot, not, got |
| 7 | -ug & -un words | bug, hug, rug, mug, jug, bun, fun, run, sun, nut |
| 8 | Everyday words 1 | the, and, you, are, for, was, said, they, have, with |
| 9 | Everyday words 2 | this, that, what, when, then, from, some, come, here, there |
| 10 | Two letters together | stop, step, spin, swim, skip, slip, snap, spot, star, stem |
| 11 | sh & ch sounds | ship, shop, shut, fish, wish, chin, chop, chip, much, such |
| 12 | th, wh & ck sounds | thin, path, bath, math, whip, duck, lock, sock, rock, neck |
| 13 | Magic "e" words | cake, make, bike, kite, home, nose, cute, game, name, time |
| 14 | Big kid words | apple, happy, water, table, green, house, mouse, sunny, funny, party |

---

## Files

```
index.html                     App shell and all three screens
style.css                      Mobile-first styles (big 52px+ touch targets)
script.js                      Word list, games, scoring, progress saving
README.md                      This file
.github/workflows/deploy.yml   Auto-publish to GitHub Pages on push to main
```

---

## Run it locally

Just double-click `index.html`. That's it — no npm, no build step.

(Optional, if you want a local server: `python -m http.server 8000` then open `http://localhost:8000`.)

---

## Put it on your phone (GitHub Pages)

### Step 1 — Create the repository
1. Go to <https://github.com/new>
2. Name it `Personal_SpellingExpert`
3. Choose **Public** (needed for free GitHub Pages)
4. Do **not** add a README, .gitignore or license
5. Click **Create repository** and copy the URL

### Step 2 — Push the code

```bash
cd Personal_SpellingExpert

git init
git branch -M main
git config core.autocrlf false

git remote add origin https://github.com/<your-username>/Personal_SpellingExpert.git
# (if a remote already exists: git remote set-url origin <new-repo-url>)

git add .
git commit -m "Add Spelling Star 14-day app"
git push -u origin main
```

### Step 3 — Turn on GitHub Pages
1. Repository → **Settings** → **Pages**
2. Under **Source**, choose **GitHub Actions**
3. Wait 1–2 minutes for the workflow to finish
4. Your site: `https://<your-username>.github.io/Personal_SpellingExpert/`

> Prefer the simple route? Under **Source** pick **Deploy from a branch** → branch `main` → folder `/ (root)`.

### Step 4 — Add to the home screen
- **iOS Safari:** Share icon → *Add to Home Screen*
- **Android Chrome:** Menu (⋮) → *Add to Home screen*

---

## Notes for parents & teachers

- **Sound** uses the browser's built-in speech voice. The first tap on the page unlocks audio on iPhone/Android. If there is no sound, check the silent switch and volume.
- **Best routine:** 10–15 minutes a day, same time every day. Repeat a day whenever the score is below 2 stars.
- **Change the words:** open `script.js` and edit the `CURRICULUM` list at the top — each day is just a title and 10 words.
- **Reset progress:** the *Start over* link at the bottom of the home screen.
- **Privacy:** nothing leaves the device. Progress is stored only in the browser's local storage.
