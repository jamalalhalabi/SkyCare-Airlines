# SkyCare Airlines ✈️

**Travel Should Feel Better.**
*Book smarter. Travel easier. Arrive cared for.*

SkyCare Airlines is an interactive concept website for a fictional airline. It was created for an Aviation Customer Relations trade-show presentation and answers one question:

> What would a perfect airline customer service experience look like, and why should customers choose SkyCare over every competitor?

The site works like a real airline homepage **and** like a slide presentation. It runs online through GitHub Pages and offline by double-clicking `index.html`.

> SkyCare Airlines is a fictional airline concept created for an academic aviation customer-relations presentation. All contact details are demo content.

---

## Table of Contents

1. [What is included](#1-what-is-included)
2. [What each file does](#2-what-each-file-does)
3. [How to open the site offline](#3-how-to-open-the-site-offline)
4. [How to use Presentation Mode](#4-how-to-use-presentation-mode)
5. [How to edit text](#5-how-to-edit-text)
6. [How to replace or add images](#6-how-to-replace-or-add-images)
7. [How to publish on GitHub Pages (step by step)](#7-how-to-publish-on-github-pages-step-by-step)
8. [How to update the site after editing](#8-how-to-update-the-site-after-editing)
9. [Making the repository look professional](#9-making-the-repository-look-professional)
10. [Showing GitHub during the presentation](#10-showing-github-during-the-presentation)
11. [Offline backup plan](#11-offline-backup-plan)
12. [Troubleshooting](#12-troubleshooting)
13. [Research sources](#13-research-sources)

---

## 1. What is included

The site has 13 slides (a title slide, 11 content sections, and a closing slide):

| # | Section | What it shows |
|---|---------|---------------|
| 1 | Welcome | Hero with slogan and a sample boarding pass |
| 2 | The Problem | Pain points, an audience question, and a "typical vs. SkyCare" flow |
| 3 | Our Promise | Four pillars: Communicate, Empower, Care, Recover |
| 4 | Passenger Journey | Clickable timeline: Book, Check-In, Airport, Board, Fly, Arrive |
| 5 | Airport Experience | Four airport wayfinding signs |
| 6 | Cabin Experience | Comfort, Connectivity, Hospitality |
| 7 | Service Recovery | Interactive disruption scenarios (delay, cancellation, missed connection, delayed bag, damaged bag) |
| 8 | Technology + People | Split layout with a working phone app mockup |
| 9 | Our People | The SkyCare Service Standard: Listen, Own, Solve, Follow Up |
| 10 | Accountability | What an airline can and cannot control, service commitments, regulations, and success measures |
| 11 | Why SkyCare | Departure-board comparison that flips into place |
| 12 | Research | Five peer-reviewed studies and APA 7 references |
| 13 | Thank You | Contact page and closing |

Research is also woven into the Journey, Recovery, Technology, and Accountability slides, so every major claim has evidence next to it.

---

## 2. What each file does

```
skycare-airlines/
├── index.html      ← All the words and the page structure
├── styles.css      ← Colors, fonts, spacing, layout, animations
├── script.js       ← Interactive features (Presentation Mode, timeline, scenarios, app buttons)
├── README.md       ← This guide
├── SPEAKER-NOTES.md ← 15-minute talking points with timing and likely questions
└── images/
    └── favicon.svg ← The small SkyCare logo shown in the browser tab
```

- **index.html** is the page itself. Every heading, sentence, and list item lives here, and each section is labeled with a comment such as `SECTION 7: SERVICE RECOVERY`.
- **styles.css** controls how everything looks. The brand colors are at the very top inside `:root`.
- **script.js** makes things interactive. It also holds the text for the journey stages and the recovery scenarios.
- **images/** stores pictures. The site does not need any photos to work; all visuals are built with code, so nothing can show up as a broken image.

No installation or special software is required. There is no npm, framework, or build step.

**Fonts:** the site uses the free Barlow typeface family from Google Fonts, which gives it an airport-signage look. When you are online it loads automatically. When you are offline, the site automatically uses your computer's built-in fonts instead; everything still works and looks clean, just slightly less styled.

---

## 3. How to open the site offline

1. Open the `skycare-airlines` folder.
2. Double-click **index.html**.
3. It opens in your default browser (Chrome or Edge recommended).

Keep all files in the same folder. If `styles.css` or `script.js` is moved, the page will look plain or stop being interactive.

---

## 4. How to use Presentation Mode

1. Click **Presentation Mode** in the top navigation bar (or press **P**).
2. The navigation bar hides and a control bar appears at the bottom.
3. Move between sections:
   - **Right arrow** or **Next** → next section
   - **Left arrow** or **Previous** → previous section
   - **Page Down / Page Up** also work (handy with a presentation clicker)
4. The counter shows your position, for example **4 / 13**.
5. Click the **full screen** button (four corners icon) or press **F**.
6. Press **Esc** to leave full screen. Press **Esc** again (or click **X**) to leave Presentation Mode.

**Interactive sections while presenting**

- **Passenger Journey:** click a stage. Once a stage is selected, the arrow keys move through the stages. At the last stage (Arrive), the right arrow continues to the next slide.
- **Service Recovery:** click a scenario, then click **See How SkyCare Responds**. The steps appear one by one.
- **Technology + People:** click the buttons inside the phone to show demo messages.

**Timing:** see `SPEAKER-NOTES.md` for a slide-by-slide plan that totals about 15 minutes, with talking points and answers to likely questions.

---

## 5. How to edit text

You can edit with any text editor. **Visual Studio Code** (free) is the easiest, but Notepad (Windows) or TextEdit in plain-text mode (Mac) also work.

1. Right-click `index.html` → **Open with** → your editor.
2. Press **Ctrl + F** (Windows) or **Cmd + F** (Mac) and search for the words you want to change.
3. Change only the words between the tags. Example:

   ```html
   <h2>Why Fly SkyCare?</h2>
   ```
   Change `Why Fly SkyCare?` and leave `<h2>` and `</h2>` alone.
4. Save the file, then refresh the browser (**Ctrl + R** or **Cmd + R**).

**Special characters used in the HTML**

| Code | Shows as |
|------|----------|
| `&rsquo;` | ’ (apostrophe) |
| `&amp;` | & |
| `&middot;` | · |

**Text stored in script.js**

- Journey stage text: search for `journeyStages`
- Recovery scenario steps: search for `scenarios`

Each step looks like `["Right away", "Delay notification sent immediately"]`. The first part is the small label; the second part is the step. Keep the quotation marks and commas.

**Changing colors:** open `styles.css` and edit the values at the top, for example `--teal: #0B7A7A;`.

**Changing the presenter line:** search `index.html` for `Presented by`.

---

## 6. How to replace or add images

The site uses gradients and code-drawn graphics, so it looks complete with no photos. To add your own hero photo:

1. Choose a wide, landscape photo (at least 1920 × 1080). Use a photo you took or one with a free license (for example from Unsplash or Pexels). Avoid photos showing a real airline's logo.
2. Rename it `hero.jpg` (all lowercase) and put it in the `images` folder.
3. Open `styles.css`, search for `To use your own photo`, and follow the comment: replace the `background:` line in `.hero` with the line shown in the comment:

   ```css
   background: linear-gradient(160deg, rgba(8,22,49,.9), rgba(19,48,90,.6)), url("images/hero.jpg") center / cover;
   ```
   The dark overlay keeps the white text readable.
4. Save and refresh.

**Adding a photo anywhere else**

```html
<img src="images/cabin.jpg" alt="Flight attendant helping a passenger find a seat">
```

Always write a short `alt` description for accessibility.

**File name rules (important for GitHub Pages)**

- Use lowercase letters, numbers, and hyphens: `cabin-crew.jpg`
- No spaces: `Cabin Crew.JPG` will break online
- GitHub is case-sensitive, so `Hero.jpg` and `hero.jpg` are different files

---

## 7. How to publish on GitHub Pages (step by step)

### Step 1: Create a GitHub account

1. Go to **https://github.com**.
2. Click **Sign up**.
3. Enter your email, create a password, and choose a username. Your username becomes part of your website address, so choose something professional (for example `jamalalhalabi`).
4. Complete the verification puzzle and enter the code GitHub emails you.
5. You can skip the personalization questions.

### Step 2: Sign in

1. Go to **https://github.com** and click **Sign in**.
2. Enter your username or email and password.
3. If you turn on two-factor authentication, enter the code from your phone.

### Step 3: Create a new repository

A repository ("repo") is a project folder stored on GitHub.

1. Click the **+** icon in the top right corner → **New repository**.
2. **Repository name:** `skycare-airlines`
3. **Description:** `Interactive customer-service concept website for SkyCare Airlines, created for an aviation customer-relations presentation.`
4. **Public or Private:** choose **Public**.
   - GitHub Pages is free for public repositories. Private repositories need a paid plan to publish a site.
   - Public also lets your professor and classmates see your work. The project contains no personal data.
5. Leave "Add a README file" **unchecked** (you already have one).
6. Click **Create repository**.

### Step 4: Upload your files

1. On the new repository page, click the link **uploading an existing file**. (Later, use **Add file** → **Upload files**.)
2. Open your `skycare-airlines` folder on your computer.
3. Select **index.html, styles.css, script.js, README.md, SPEAKER-NOTES.md**, and the **images** folder, then drag them all into the browser window.
   - Drag the **contents** of the folder, not the folder itself. `index.html` must end up at the top level of the repository.
   - Chrome and Edge let you drag the `images` folder directly.
   - GitHub accepts up to 100 files and 25 MB per file in one browser upload. This project is far below both limits.
4. Wait until every file appears in the list.

### Step 5: Commit the files

"Commit" means "save this version."

1. Scroll down to **Commit changes**.
2. In the first box type: `Add SkyCare Airlines website`
3. Keep **Commit directly to the main branch** selected.
4. Click **Commit changes**.
5. Check that the repository shows `index.html`, `styles.css`, `script.js`, `README.md`, and the `images` folder.

### Step 6: Open Settings → Pages

1. At the top of the repository, click **Settings** (gear icon).
2. In the left sidebar, click **Pages**. It sits in the section called **Code and automation** (some accounts label it **Code, planning, and automation**).

### Step 7: Configure GitHub Pages

Under **Build and deployment**:

1. **Source:** `Deploy from a branch`
2. **Branch:** `main`
3. **Folder:** `/ (root)`
4. Click **Save**.

### Step 8: Wait for it to publish

Publishing usually takes a few minutes. GitHub says it can take **up to 10 minutes**. To watch progress, click the **Actions** tab. A green check next to "pages build and deployment" means it is done.

### Step 9: Find your live URL

Go back to **Settings → Pages** and refresh. You will see a message like:

> Your site is live at `https://YOURUSERNAME.github.io/skycare-airlines/`

Click **Visit site** to test it. Save this link.

### Step 10: Open the live site in class

1. On the classroom computer, open Chrome or Edge.
2. Type your URL (or open your repository and click the link in the About section).
3. Click **Presentation Mode**, then the full screen button.

Tips:
- Bookmark the link and email it to yourself before class.
- Test the classroom computer early if you can.
- Carry the offline backup (Section 11) in case the Wi-Fi is slow.

---

## 8. How to update the site after editing

1. Edit the file on your computer and test it by opening `index.html`.
   (Changes can take up to 10 minutes to appear on the live site.)
2. Open your repository on GitHub.
3. Click **Add file** → **Upload files**.
4. Drag in the changed file. It replaces the old one with the same name.
5. Write a commit message, such as `Update research section`, and click **Commit changes**.
6. Wait a few minutes (up to 10) and refresh your live site.

If you still see the old version, press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac) to force a fresh reload.

**Quick edits online:** click a file in the repository, click the **pencil icon**, make the change, and click **Commit changes**.

---

## 9. Making the repository look professional

**About section (right side of the repository home page)**

1. Click the **gear icon** next to **About**.
2. **Description:** `Interactive customer-service concept website for SkyCare Airlines, created for an aviation customer-relations presentation.`
3. **Website:** check **Use your GitHub Pages website** (or paste your live URL).
4. **Topics:** `aviation`, `customer-service`, `airline`, `github-pages`, `html`, `css`, `javascript`
5. Click **Save changes**.

Now your live link sits at the top of the repository, ready to click during the presentation.

**Other tips**

- **Clean file names:** lowercase, no spaces (already done).
- **README:** GitHub displays this file automatically below the file list, so it serves as the project's cover page.
- **Optional screenshot:** open the live site, take a screenshot of the hero, save it as `images/screenshot.png`, upload it, and add this line under the title of this README:

  ```markdown
  ![SkyCare Airlines homepage](images/screenshot.png)
  ```
- **Meaningful commit messages:** "Add service recovery scenarios" looks better than "update".

---

## 10. Showing GitHub during the presentation

**Before class:** open two browser tabs, one on your repository and one on the live site, so you are not typing in front of the class.

**Demo order (about 60 to 90 seconds)**

1. Show the `skycare-airlines` repository.
2. Point to the files: `index.html`, `styles.css`, `script.js`, and `images`.
3. Scroll down to show the README.
4. Point to the About section and the live website link.
5. Click the link to open the live site.
6. Click **Presentation Mode** and full screen.
7. Begin.

**Script**

> "Instead of building a traditional PowerPoint, I designed SkyCare as a working airline concept. This is my GitHub repository, where the project lives. The site is built with three core files: HTML for the content, CSS for the design, and JavaScript for the interactive features. Here is the README, which documents the project.
>
> The site is published through GitHub Pages, so anyone can open it from this link on any device. Because it is interactive, I can do more than describe good customer service. I can show it: how SkyCare communicates with passengers, how it responds when a flight is delayed, and how technology and people work together.
>
> Let me launch the live site and switch to Presentation Mode."

*(Click the link, enter Presentation Mode.)*

> "Welcome to SkyCare Airlines. Our belief is simple: travel should feel better."

**If the Wi-Fi fails:** "I also keep an offline copy, so the presentation works anywhere." Then open the backup from your USB drive or desktop.

---

## 11. Offline backup plan

**Download the backup from GitHub**

1. Open your repository.
2. Click the green **Code** button → **Download ZIP**.
3. Find the ZIP in your Downloads folder.

**Extract it**

- **Windows:** right-click the ZIP → **Extract All** → **Extract**.
- **Mac:** double-click the ZIP.

The folder will be named `skycare-airlines-main`. That is normal.

**Open it**

Open the extracted folder and double-click `index.html`. Do not open `index.html` from inside the ZIP without extracting; the styles may not load.

**Keep copies in two places**

- Your desktop
- A USB drive (copy the whole extracted folder)

**Test the offline version the night before**

1. Turn off Wi-Fi.
2. Double-click `index.html` in the backup folder.
3. Check that colors and layout look right, Presentation Mode works, the arrow keys move between sections, the journey stages and recovery scenarios respond, and the phone buttons show messages.
4. Test from the USB drive on another computer if possible.

Only the reference links and the Barlow fonts need the internet; everything else works offline (the page falls back to system fonts).

---

## 12. Troubleshooting

| Problem | Fix |
|---------|-----|
| The page looks plain, with no colors | `styles.css` is not in the same folder as `index.html`, or its name changed. Keep the exact name `styles.css`. |
| Buttons, timeline, or Presentation Mode do nothing | `script.js` is missing, renamed, or in a different folder. |
| GitHub Pages shows a 404 error | Wait 5 to 10 minutes. Check that `index.html` is at the top level of the repository (not inside another folder) and is spelled in lowercase. Confirm Settings → Pages uses `main` and `/ (root)`. |
| Live site shows old content | Press Ctrl + Shift + R (Cmd + Shift + R on Mac) and wait a few minutes after committing. |
| An image works offline but not online | The file name's capital letters do not match the code, or the name has spaces. Rename to lowercase with hyphens. |
| Arrow keys do not change sections | Click on an empty part of the page first. If the Journey tabs are selected, the arrows move through stages first. |
| Full screen does not work | Some browsers block it inside certain school kiosks. Press F11 (Windows) or Ctrl + Cmd + F (Mac) instead. |
| Esc does not leave Presentation Mode | The first Esc leaves full screen. Press Esc again, or click the X button. |
| Text is too small on the projector | Press Ctrl and + (Cmd and + on Mac) to zoom the browser. |
| Animations feel distracting | They automatically turn off if the computer has "reduce motion" enabled in its accessibility settings. |
| No Pages option in Settings | The repository is private. Change it to public in Settings → General → Danger Zone → Change visibility. |

---

## 13. Research sources

All sources were verified before use. The first five are peer-reviewed journal articles; the U.S. DOT source supports the regulations point on the Accountability slide.

Castillo-Manzano, J. I., & López-Valpuesta, L. (2013). Check-in services and passenger behaviour: Self service technologies in airport systems. *Computers in Human Behavior, 29*(6), 2431–2437. https://doi.org/10.1016/j.chb.2013.05.030

Chen, C.-F. (2008). Investigating structural relationships between service quality, perceived value, satisfaction, and behavioral intentions for air passengers: Evidence from Taiwan. *Transportation Research Part A: Policy and Practice, 42*(4), 709–717. https://doi.org/10.1016/j.tra.2008.01.007

Migacz, S. J., Zou, S., & Petrick, J. F. (2018). The "terminal" effects of service failure on airlines: Examining service recovery with justice theory. *Journal of Travel Research, 57*(1), 83–98. https://doi.org/10.1177/0047287516684979

Park, J.-W., Robertson, R., & Wu, C.-L. (2004). The effect of airline service quality on passengers' behavioural intentions: A Korean case study. *Journal of Air Transport Management, 10*(6), 435–439. https://doi.org/10.1016/j.jairtraman.2004.06.001

U.S. Department of Transportation. (2024, April 24). *Biden-Harris administration announces final rule requiring automatic refunds of airline tickets and ancillary service fees* [Press release]. https://www.transportation.gov/briefing-room/biden-harris-administration-announces-final-rule-requiring-automatic-refunds-airline

Wen, B., & Chi, C. G.-q. (2013). Examine the cognitive and affective antecedents to service recovery satisfaction: A field study of delayed airline passengers. *International Journal of Contemporary Hospitality Management, 25*(3), 306–327. https://doi.org/10.1108/09596111311310991

---

*SkyCare Airlines is a fictional airline concept created for an academic aviation customer-relations presentation. Built with HTML, CSS, and JavaScript. Hosted with GitHub Pages.*
