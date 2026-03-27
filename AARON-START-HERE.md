# Aaron — Getting Started

Welcome! This guide assumes zero terminal experience. Follow every step exactly as written. If something doesn't look right, stop and ask Jamie or paste the error into Claude.

---

## Step 1: Open Terminal

Press **Cmd + Space** on your Mac, type **Terminal**, and press **Enter**. A window with a blinking cursor will open. This is where you'll type commands.

**Important things about Terminal:**
- You type a command and press **Enter** to run it
- When it's done, you'll see your username and a `%` sign again — that means it's ready for the next command
- If it looks like nothing is happening, it's probably still working. Wait for the `%` to come back
- When it asks for your Mac password, **you won't see any characters as you type** — that's normal security behavior. Just type your password and press Enter

---

## Step 2: Install Homebrew (a tool installer for Mac)

Copy and paste this entire line into Terminal and press Enter:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

It will ask for your Mac password. Type it (nothing will appear on screen — that's normal) and press Enter. Then it will download and install. This takes a few minutes.

**When it finishes**, it will show "Next steps" with two commands. They will look something like this (your username will be different):

```
echo >> /Users/YOURUSERNAME/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv zsh)"' >> /Users/YOURUSERNAME/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv zsh)"
```

**Copy all three lines exactly as shown in YOUR terminal** and paste them in and press Enter. There will be no confirmation — that's normal.

---

## Step 3: Install Node.js and Git tools

Run these one at a time. Wait for each to finish (wait for the `%` to reappear) before running the next:

```
brew install node
```

```
brew install git
```

```
brew install gh
```

---

## Step 4: Log into GitHub

Run:

```
gh auth login
```

It will ask you questions. Choose these answers:
1. **GitHub.com** (press Enter)
2. **HTTPS** (press Enter)
3. **Yes** to authenticate with your GitHub credentials (press Enter)
4. **Login with a web browser** (press Enter)

It will show a code and open your browser. Paste the code into the browser, click Authorize, and come back to Terminal.

---

## Step 5: Choose where to put the project

Run this to create a Projects folder on your Desktop:

```
mkdir -p ~/Desktop/Projects
```

Then go into it:

```
cd ~/Desktop/Projects
```

---

## Step 6: Clone (download) the project

```
git clone https://github.com/EKuzo-gg/EKUZO-Web.git
```

Then go into the project folder:

```
cd EKUZO-Web
```

---

## Step 7: Install the project's dependencies

```
npm install
```

This will take a minute. Wait for the `%` to come back.

---

## Step 8: Set up environment config

```
cp .env.local.example .env.local
```

No output means it worked.

---

## Step 9: Add the media files

Jamie sent you a zip with the large files (videos, animations). Unzip it, then drag the three folders into your project so they end up at:

```
EKUZO-Web/public/videos/        (3 video files)
EKUZO-Web/public/testimonial-videos/  (9 videos + text files)
EKUZO-Web/public/animations/    (3 .riv files)
```

You can do this in Finder — just navigate to `Desktop > Projects > EKUZO-Web > public` and drop them in.

---

## Step 10: Start the site

```
npx next dev -p 3001
```

Open your browser and go to: **http://localhost:3001**

You should see the EKUZO site. The live Framer reference is at **https://ekuzo.gg** — open both side by side for QA.

**To stop the server**, press **Ctrl + C** in Terminal.

---

## Working with Claude

You can use Claude to help you make changes. When you start a Claude chat for this project, paste this at the beginning:

> I'm working on the EKUZO web project — a Next.js site at ~/Desktop/Projects/EKUZO-Web. Read the CLAUDE.md file first for full project context. I'm Aaron, the designer — I handle front-end: visual QA, CSS, layout, component builds, and design fidelity. Jamie handles commerce and data. Check WORKLOG.md before starting any work to see what's changed recently. After finishing work, update WORKLOG.md with what you changed before I commit.

---

## Your daily workflow

Every time you sit down to work:

**1. Pull the latest changes** (in case Jamie pushed something):
```
cd ~/Desktop/Projects/EKUZO-Web
git pull
```

**2. Start the dev server:**
```
npx next dev -p 3001
```
(Open a second Terminal tab with **Cmd + T** for running other commands while the server is running)

**3. Do your work** (make changes with Claude's help)

**4. When you're done, push your changes.** In the second tab:
```
git add .
git commit -m "short description of what you changed"
git push
```

**5. Update the work log.** Before committing, ask Claude to update WORKLOG.md with what changed. This keeps Jamie's Claude instance aware of your work.

**6. Tell Jamie you pushed** so he knows to pull before he works.

---

## Quick reference

| What you want to do | Command |
|---|---|
| Start the site | `npx next dev -p 3001` |
| Stop the site | Ctrl + C |
| Open a new Terminal tab | Cmd + T |
| Get latest changes | `git pull` |
| Save and push your work | `git add .` then `git commit -m "message"` then `git push` |
| See what files you changed | `git status` |
| Go to the project folder | `cd ~/Desktop/Projects/EKUZO-Web` |

---

## Your first task: Homepage Visual QA

Once the site is running, here's your first job.

**1. Open these side by side in Chrome:**
- **http://localhost:3001** (our Next.js build)
- **https://ekuzo.gg** (the live Framer site — this is the target)

**2. Go section by section, top to bottom.** For every difference you see — spacing, font size, color, alignment, image positioning, torn paper transitions, anything — write it down. Use Chrome DevTools (right-click → Inspect) to check exact pixel values, colors, and font sizes on the Framer site.

**3. Build a full list** of every difference. Be specific. Example:
- "Hero heading is 72px on Framer but 64px on ours"
- "Growth section has 80px top padding on Framer, ours has 40px"
- "Torn paper between hero and growth section is missing"

**4. Paste the entire list into Claude** and ask it to fix everything. It will work through all the issues in one pass.

**5. Review the result.** Check each fix against the Framer site. Anything still off, note it and paste that shorter list back into Claude for a second pass.

**6. After the homepage is right, ask Claude to create `QA-PATTERNS.md`.** This should capture every recurring fix as a concrete rule with specific values. Example:
- "Section padding: 80px top/bottom on desktop, 48px on mobile"
- "Heading font: font-display font-black uppercase, use clamp() not fixed sizes"
- "Torn paper: use PNG not SVG, translate-y-[55%], z-20, parent needs overflow-clip"

**7. Then move to the next page.** Tell Claude:
> "Read QA-PATTERNS.md. Apply every pattern to the [programs/schools/parents/etc] page. Compare against ekuzo.gg/[page] and fix anything that matches the same issues we fixed on the homepage."

**8. After each page, review and add any new patterns** to QA-PATTERNS.md. Each pass gets tighter and faster.

The goal: by the time you've gone through all pages, the QA-PATTERNS.md file is a complete design spec and every page matches the Framer reference.

---

## If something breaks

- **"command not found"** — you might be in the wrong folder. Run `cd ~/Desktop/Projects/EKUZO-Web` and try again
- **"index.lock" error** — run `rm -f .git/index.lock` then try again
- **Merge conflict** — stop and tell Jamie. Don't force anything.
- **The site won't start** — make sure you ran `npm install` and that you don't have another server already running on port 3001
