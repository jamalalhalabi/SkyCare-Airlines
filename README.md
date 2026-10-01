# SkyCare Navigator

**Your AI travel companion inside the airport.**
*Know where to go. Know what to do.*

**Live prototype:** https://jamalalhalabi.github.io/SkyCare-Navigate/

> SkyCare Navigator is an academic aviation customer-experience concept created for an Aviation Customer Relations course. It is not affiliated with any airline or airport. The "Demo Air" carrier, the sample trip, and the terminal map are fictional.

---

## Contents

1. [What SkyCare Navigator is](#1-what-skycare-navigator-is)
2. [Why it exists](#2-why-it-exists)
3. [Product vision](#3-product-vision)
4. [What is real and what is simulated](#4-what-is-real-and-what-is-simulated)
5. [File structure](#5-file-structure)
6. [Presentation Mode](#6-presentation-mode)
7. [Updating GitHub Pages](#7-updating-github-pages)
8. [Offline mode (PWA)](#8-offline-mode-pwa)
9. [Replacing the demo data](#9-replacing-the-demo-data)
10. [The Sky assistant (simulated AI)](#10-the-sky-assistant-simulated-ai)
11. [Future production architecture](#11-future-production-architecture)
12. [Privacy design](#12-privacy-design)
    - [Trip sessions, storage, and privacy controls](#trip-sessions-storage-and-privacy-controls)
13. [Adding the QR code](#13-adding-the-qr-code)
14. [Troubleshooting](#14-troubleshooting)
15. [References](#15-references)

---

## 1. What SkyCare Navigator is

SkyCare Navigator is **not an airline**. It is an independent passenger-assistance app concept that helps travelers get through airports and handle the confusing parts of air travel.

The passenger imports a trip once. SkyCare then knows the flights, gates, times, connection, bags, and personal needs, and guides the passenger through the airport one step at a time.

The whole website follows one sample journey:

**Fort Lauderdale (FLL) → Istanbul (IST) → Dubai (DXB)**

Main features:

| Feature | Passenger problem it solves |
|---|---|
| AR-style navigation | Signs are confusing or in another language |
| Live gate change | The gate moves and the passenger doesn't notice |
| Connection Rush Mode | Late arrival, tight connection, too much on screen |
| Ask Sky (AI assistant) | "Where do I go?" "Do I have time to eat?" |
| Smart detours | Food, restroom, or coffee without risking the flight |
| I Have a Problem | Not knowing which desk handles what |
| Medical assistance | Searching directories during an emergency |
| Accessible route | Repeating the same need at every stage |
| Family Guardian | Children seated away from their adult |
| Travel Group and Meet Me | Getting separated in a large airport |
| Language assistance | Can't ask for help in the local language |
| Offline airport packs | No data or Wi-Fi after landing abroad |
| Talk to a person | Technology isn't enough |

## 2. Why it exists

The course assignment asks how to improve the customer experience in aviation and why customers would choose one company over competitors.

SkyCare's answer:

> Great customer service is not only solving problems after they happen. It is reducing confusion before the passenger needs to ask for help.

Airports already have the information. Passengers still have to find it, understand it, and decide what to do next. SkyCare connects that information to the passenger's own trip.

## 3. Product vision

- **One trip, one assistant.** Import once; everything else is personalized.
- **Context over features.** SkyCare behaves differently depending on time left, gate distance, gate changes, accessibility needs, family status, the current problem, and connectivity.
- **One next step at a time.** The passenger should not have to figure out where to go, who to ask, or what to do next.
- **Humans for judgment.** AI handles information. People handle judgment, care, and emergencies.
- **Honest by design.** When a connection is at risk, SkyCare says so and routes the passenger to the airline.

## 4. What is real and what is simulated

This is an interactive **prototype**. It demonstrates the passenger experience; it does not connect to any airline, airport, or emergency system.

**Working in the prototype**

- Demo trip loading and itinerary display
- Smart context engine (demo clock, gate, needs, connectivity)
- AR-style route animation, gate change, accessible route
- Connection Rush Mode, smart detours, help routing, map filters
- Offline caching of the website on the live GitHub Pages site
- Phrase book in five languages and browser text-to-speech (when the device has a voice)
- Optional camera view (camera only; no positioning)

**Simulated (would require real integrations)**

| Simulated feature | What production would need |
|---|---|
| Boarding-pass scan and reservation import | Airline APIs or a secure document scanner |
| Sky AI responses | A secure backend connected to an AI model |
| Indoor position and walking times | Airport indoor maps and positioning (beacons, Wi-Fi, UWB, device sensors) |
| Gate changes, boarding times, bag scans | Airline and airport live data feeds |
| Medical and emergency requests | Direct, authorized airport and emergency-system integration |
| Travel Group and Meet Me location sharing | Secure, consent-based location service |
| Meal preorder | Participating airline catering systems |
| eSIM and SIM guidance | Authorized telecom and eSIM partners |
| Family seat changes | Airline action (SkyCare cannot change seat inventory) |

Uploaded boarding-pass files are **never read or sent anywhere**. Every import method loads the same demo trip.

No statistics, success rates, or partnerships are claimed. Walking times, pack sizes, and trip details are demo values.

## 5. File structure

```
SkyCare-Airlines/
├── index.html              ← Page structure and all visible text
├── styles.css              ← Colors, layout, animations, Presentation Mode, responsive rules
├── script.js               ← All interactive features (numbered sections 1–23)
├── data/
│   └── demo-data.js        ← Two sample trips, map, routes, packs, phrases, services
├── manifest.webmanifest    ← Makes the site installable as an app
├── service-worker.js       ← Offline caching (app shell; airport packs kept separately)
├── images/
│   ├── favicon.svg         ← Logo in the browser tab
│   ├── icon-192.png        ← App icon
│   └── icon-512.png        ← App icon (large)
├── README.md               ← This guide
└── SPEAKER-NOTES.md        ← 15-minute presentation plan
```

No Node.js, npm, frameworks, database, or build step. Open `index.html` and it works.

**Fonts:** Barlow and IBM Plex Mono load from Google Fonts when online. Offline, the site falls back to system fonts automatically.

## 6. Presentation Mode

1. Click **Present** in the top bar (or press **P**).
2. The site becomes a 12-scene presentation:

| # | Scene | Sections shown |
|---|---|---|
| 1 | The Problem | Customer problem |
| 2 | Meet SkyCare Navigator | Hero |
| 3 | Load the Journey | Trip import → Dashboard |
| 4 | AR Navigation | AR demo + gate change |
| 5 | Connection Rush Mode | Rush Mode |
| 6 | Ask Sky | Sky chat → Smart detours |
| 7 | I Have a Problem | Help routing → Medical |
| 8 | Family + Accessibility | Family Guardian → Accessibility → Travel Group |
| 9 | Offline, Storage + Language | Offline packs → Privacy & Storage → Language |
| 10 | Human + AI | Talk to a person |
| 11 | How It Could Work | Technology realism → Privacy |
| 12 | Why SkyCare | Comparison → Research → Closing |

Scenes with more than one part show small dots next to the title.

**Controls**

| Action | Key or button |
|---|---|
| Next | → , Page Down, or the cyan arrow |
| Previous | ← , Page Up, or the left arrow |
| First / last | Home / End |
| Full screen | F or the corners icon |
| Exit | Esc (exits full screen first) or X |

- All buttons and demos keep working inside Presentation Mode.
- Tall scenes scroll inside the slide with the mouse wheel or trackpad.
- Tip: open `index.html?present` (or the live link with `?present` at the end) to start directly in Presentation Mode.
- Detailed sections not in the sequence (Profile, Meet Me, Stay Connected, Meals, Map) are still on the normal website.
- The **Start a new journey?** dialog also works in Presentation Mode. While it is open the arrow keys do nothing; **Esc** closes the dialog without leaving the presentation.

## 7. Updating GitHub Pages

The repository name stays **SkyCare-Airlines**; the live link does not change.

**Using the GitHub website (no software needed)**

1. Go to https://github.com/jamalalhalabi/SkyCare-Airlines
2. Click **Add file → Upload files**.
3. Drag in: `index.html`, `styles.css`, `script.js`, `manifest.webmanifest`, `service-worker.js`, `README.md`, `SPEAKER-NOTES.md`, and the `data` and `images` folders.
4. Replace existing files when asked.
5. Write a message such as `Rebuild as SkyCare Navigator`, then click **Commit changes**.
6. Wait 1–3 minutes, then open the live link and refresh.

**Using GitHub Desktop**

1. Copy the new files into your local `SkyCare-Airlines` folder (replace the old ones).
2. In GitHub Desktop, write a summary and click **Commit to main**.
3. Click **Push origin**.

**Check it:** Settings → Pages should show the site is published from the `main` branch, `/ (root)` folder.

**After future edits:** open `service-worker.js` and change the cache version (currently `skycare-navigator-v2`) to `v3`, `v4`, and so on. That tells visitors' browsers to download the new version instead of the cached one.

## 8. Offline mode (PWA)

SkyCare's offline story is part of the product: international travelers often land with no SIM, data, or Wi-Fi.

**How it works on the live site**

- On the first visit, `service-worker.js` saves the app shell (`index.html`, `styles.css`, `script.js`, `data/demo-data.js`, icons, and the manifest) in the cache `skycare-navigator-v2`.
- After that, the site opens and works with no internet connection.
- The top bar shows **ONLINE · OFFLINE READY** once the offline copy is saved, and **OFFLINE · PACKS ACTIVE** when the connection drops.
- The Offline section is split in two:
  - **Current trip airports:** one card per airport on the loaded ticket. Each shows **Download pack**, or **Already on this device ✓** when that airport was downloaded earlier (on this trip or a previous one).
  - **Downloaded airports · on this device:** every pack stored on this device, whatever the trip. An airport that is not on the current ticket appears only here, so an old trip never looks active.
- Each downloaded pack has **Remove download**. Removing one deletes its marker and its own cache (`skycare-pack-IST`, for example) right away. Other packs and the app shell are untouched, and the service worker stays registered.
- New packs can't download while offline (real or simulated); packs already on the device keep working.
- The **Simulate offline** switch demonstrates the offline experience during a presentation without disconnecting Wi-Fi.

**What offline does not do:** live gate changes cannot arrive offline. Try **Simulate Gate Change** while offline; SkyCare explains that it is using the last downloaded gate and that live updates resume when connectivity returns.

**Opening from a folder:** browsers do not run service workers for files opened directly from your computer (`file://`). Everything else still works; the Offline section says caching turns on at the live site.

**Test it yourself:** open the live site once, then turn on airplane mode and refresh.

## 9. Replacing the demo data

All demo data lives in **`data/demo-data.js`**. The sections are labeled:

| Section | What to change |
|---|---|
| `trips` | The two demo tickets (Trip A FLL → IST → DXB, Trip B MIA → LHR → CDG): passenger, flights, gates, times, seats, baggage, booking codes, emergency numbers, destination connectivity, meal service |
| `scenarios` | The four demo clock moments, as minutes before the connecting flight's boarding closes |
| `map` | The fictional terminal: zones, gates, restrooms, food, help desks, medical, elevators, meeting points (x, y in a 1000 × 560 drawing) |
| `routes` | Walking routes and minutes to each gate |
| `detours` | Extra minutes each stop adds, and time spent there |
| `packs` | Every airport pack a traveler can download (FLL, IST, DXB, MIA, LHR, CDG) |
| `languages`, `phrases` | Phrase book (add a language by adding a key to both) |
| `trips[n].connectivity` | Destination connectivity guidance (Dubai for Trip A, Paris for Trip B) |
| `trips[n].meals` | Meal options and cutoff note for that trip's flight |
| `humans` | Human services and where each desk is |

The file is JavaScript (not JSON) on purpose, so the site still works when opened from a folder.

Keep the map labeled as fictional unless you use official, verified airport data. Both demo trips reuse the same fictional transfer-terminal layout; its title changes to the connection airport (for example "LHR DEMO TERMINAL MAP") and it stays labeled fictional.

## 10. The Sky assistant (simulated AI)

**The public prototype uses a local simulated AI assistant. A production version would connect securely to an AI service through a protected backend.**

- **No AI API key is stored anywhere in this project.** GitHub Pages is public, so any key in JavaScript would be exposed.
- Sky's logic is in `script.js`, section **10. SKY ASSISTANT**.
- `intents` is a list of keyword patterns. Each one writes a response using the live trip context (time, gate, walk, mode, accessibility, meal preference, connectivity).
- Safety comes first: medical and missing-family messages are checked before anything else.
- Food, coffee, and other stops go through `evalDetour`, which refuses stops when the connection is too tight.
- **Connecting a real AI later:** set `SKY_CONFIG.endpoint` to the URL of your own protected backend. The site sends `{ message, context }`; the backend holds the key, calls the AI service, and returns `{ text, actions }`. If the backend fails, Sky falls back to local responses.

## 11. Future production architecture

```
Airline data ─┐                                ┌─ Airline agents
Airport data ─┼─► Secure SkyCare backend ─► App ┼─ Airport services
Positioning ──┤   · Travel context engine       └─ Emergency systems
Telecom ──────┘   · AI language model
                  · Privacy and consent layer
```

| Area | Requirements |
|---|---|
| Airline data | Flight status, boarding time, gate, baggage, reservation integration |
| Airport data | Indoor map, points of interest, accessible routes, medical stations, restrooms, service desks |
| Positioning | Bluetooth beacons, Wi-Fi positioning, ultra-wideband where available, device sensors, indoor map matching |
| AI | Secure backend, language model, travel context engine |
| Emergency | Direct, authorized airport integration |
| Offline | Downloaded airport packs |
| Privacy | Explicit consent, temporary group sharing, encryption, deletion after the trip |

A production implementation would require airport, airline, mapping, telecom, and emergency-service partnerships.

## 12. Privacy design

- Your location belongs to you.
- Travel-group sharing is opt-in; each member chooses for themselves.
- Temporary location sharing ends automatically after the trip.
- Passengers control who can see their location and can stop at any time.
- SkyCare never exposes traveler location publicly.
- Meet Me only picks places both people are allowed to reach.

### Trip sessions, storage, and privacy controls

**Every new journey starts clean.** SkyCare keeps three kinds of data apart, all in the traveler's own browser (nothing is sent anywhere):

| Kind | What it holds | Where | Lifetime |
|---|---|---|---|
| **1. Trip session** | Itinerary, gate and gate-change state, connection/Rush Mode clock, baggage, route and Smart Detour, accessibility assistance for this trip, medical/help requests, Family Guardian seating, Travel Group and Meet Me sharing, meal choice/preorder, customer-service routing, and the Ask Sky conversation | `sessionStorage`, keys `skycare:active` and `skycare:trip:<sessionId>` | This browser tab only. Discarded on New Trip, on Delete Current Trip Data, or when the tab closes |
| **2. Preferences** | Phrase-book language and "start every trip step-free" default. No trip details | `localStorage`, key `skycare:prefs` | Until changed or cleared |
| **3. Device airport packs** | Which airports are downloaded, plus a small per-airport resource | `localStorage` key `skycare:packs` and Cache Storage `skycare-pack-<CODE>` | Until removed; reused by any future trip |

**What persists after a refresh**

- Refreshing during an active trip restores **that same trip** (same session ID): itinerary, gate change, Rush Mode clock, detours, assistance, family/group state, meal choice, and the Ask Sky conversation.
- The saved session is namespaced by a unique trip session ID, so it can never be mixed with another itinerary. A new tab starts with no trip.
- Airport packs and preferences always persist.

**What resets when a new ticket or reservation loads**

- Loading a ticket while a trip is active (demo buttons, boarding-pass upload, reservation lookup, or **New Trip** in the itinerary or dashboard) first shows **Start a new journey?**, which lists what will be cleared and confirms that downloaded airport packs stay.
- **Start New Trip** clears the Sky conversation (all messages, typing indicators, and action buttons), itinerary, route/map session, gate change, Rush Mode, baggage and help state, family/group state, accessibility assistance for that journey, medical requests, meal state, detours, and the stored session, then returns to trip import. The new trip gets a new session ID and a fresh Sky greeting.
- A reply Sky was still "typing" when the trip was reset is discarded; it can never appear in the next conversation.
- Nothing is inherited from the previous trip. The only carry-overs are preferences and downloaded airport packs.

**Demo tickets:** Trip A (FLL → IST → DXB, booking `SKY7Q2`) and Trip B (MIA → LHR → CDG, booking `SKY4L9`). Uploading any boarding pass loads Trip A (the file is never read).

**Privacy & Storage (Profile)**

| Control | What it does |
|---|---|
| **Delete Current Trip Data** | Confirms, then removes the active trip session and its conversation. Airport packs and preferences stay |
| **Clear Conversation** | Clears only the Sky chat and starts a fresh greeting. The trip, gate, route, baggage, and itinerary stay. Also available inside Ask Sky |
| **Downloaded Airports · Remove** | Removes one airport pack (marker + its cache). Other packs stay |
| **Clear All SkyCare Data** | Confirms, then removes only SkyCare-owned data: the trip session, conversation, preferences, pack markers, and SkyCare Cache Storage entries (`skycare-navigator-*`, `skycare-pack-*`). Other sites' storage is not touched. The page reloads in a first-use state and the service worker rebuilds its offline copy |

On-screen wording: "Trip information is temporary. Reusable airport maps may remain on your device for future journeys. You control what SkyCare keeps."

**Service worker and cache behavior**

- `skycare-navigator-v2` holds the app shell only. A new version removes older `skycare-navigator-*` caches but never removes airport-pack caches.
- `skycare-pack-<CODE>` caches belong to airport packs and are created/removed by the page.
- Trip reset never deletes the app shell and never unregisters the service worker.
- Browsers from v1 that still have the old `skycare-pack-XXX` markers are migrated automatically to the new downloaded-airports list.

## 13. Adding the QR code

The closing page has a placeholder labeled **SCAN TO EXPLORE SKYCARE**.

1. Create a QR code for `https://jamalalhalabi.github.io/SkyCare-Airlines/` with any QR generator.
2. Save it as `images/qr-code.png`.
3. In `index.html`, search for `QR CODE PLACEHOLDER` and replace the `<div class="qr-placeholder">…</div>` block with:
   ```html
   <img src="images/qr-code.png" alt="QR code linking to the SkyCare Navigator live site" class="qr-img">
   ```
4. Add `"./images/qr-code.png"` to `CORE_FILES` in `service-worker.js` and bump the cache version.

## 14. Troubleshooting

| Problem | Fix |
|---|---|
| Old version still showing | Bump the cache version in `service-worker.js`, then hard refresh (Ctrl + Shift + R) |
| Want a completely fresh start | Profile → Privacy & Storage → **Clear All SkyCare Data** |
| An old trip keeps coming back after refresh | That is the same-trip restore. Use **New Trip** or **Delete Current Trip Data**, or close the tab |
| Site looks plain | Keep all files and folders together; check `styles.css` uploaded |
| Buttons do nothing | Check `script.js` and `data/demo-data.js` both uploaded |
| "Speak Phrase" silent | The device lacks a voice for that language; the text still works |
| Camera demo stays simulated | Camera needs permission and https (works on the live site) |
| Full screen doesn't work | Press F11 (Windows) or Ctrl + Cmd + F (Mac) |

## 15. References

Bogicevic, V., Yang, W., Bilgihan, A., & Bujisic, M. (2013). Airport service quality drivers of passenger satisfaction. *Tourism Review, 68*(4), 3–18. https://doi.org/10.1108/TR-09-2013-0047

Bosch, S. J., & Gharaveis, A. (2017). Flying solo: A review of the literature on wayfinding for older adults experiencing visual or cognitive decline. *Applied Ergonomics, 58*, 327–333. https://doi.org/10.1016/j.apergo.2016.07.010

Castillo-Manzano, J. I., & López-Valpuesta, L. (2013). Check-in services and passenger behaviour: Self service technologies in airport systems. *Computers in Human Behavior, 29*(6), 2431–2437. https://doi.org/10.1016/j.chb.2013.05.030

Chen, C.-F. (2008). Investigating structural relationships between service quality, perceived value, satisfaction, and behavioral intentions for air passengers: Evidence from Taiwan. *Transportation Research Part A: Policy and Practice, 42*(4), 709–717. https://doi.org/10.1016/j.tra.2008.01.007

Churchill, A., Dada, E., de Barros, A. G., & Wirasinghe, S. C. (2008). Quantifying and validating measures of airport terminal wayfinding. *Journal of Air Transport Management, 14*(3), 151–158. https://doi.org/10.1016/j.jairtraman.2008.03.005

Migacz, S. J., Zou, S., & Petrick, J. F. (2018). The "terminal" effects of service failure on airlines: Examining service recovery with justice theory. *Journal of Travel Research, 57*(1), 83–98. https://doi.org/10.1177/0047287516684979

Park, J.-W., Robertson, R., & Wu, C.-L. (2004). The effect of airline service quality on passengers' behavioural intentions: A Korean case study. *Journal of Air Transport Management, 10*(6), 435–439. https://doi.org/10.1016/j.jairtraman.2004.06.001

Qing, Z., Sun, C., & Reneker, J. (2021). Evaluation of airport wayfinding accessibility with the use of a wheelchair simulator. *Transportation Research Record, 2675*(4), 52–60. https://doi.org/10.1177/0361198120980445

U.S. Department of Transportation. (2024, August 9). *Family seating in air transportation* [Proposed rule, Docket No. DOT-OST-2024-0091]. Federal Register. https://www.federalregister.gov/documents/2024/08/09/2024-17323/family-seating-in-air-transportation

U.S. Department of Transportation. (2025, February 5). *Airline passengers with disabilities bill of rights*. https://www.transportation.gov/airconsumer/disabilitybillofrights

Wen, B., & Chi, C. G.-q. (2013). Examine the cognitive and affective antecedents to service recovery satisfaction: A field study of delayed airline passengers. *International Journal of Contemporary Hospitality Management, 25*(3), 306–327. https://doi.org/10.1108/09596111311310991

---

*SkyCare Navigator is an academic aviation customer-experience concept.*
