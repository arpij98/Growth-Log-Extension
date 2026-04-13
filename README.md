# Growth-Log-Extension
# Growth Log

A Chrome extension for evening reflection. Built for one person, open to anyone who needs it.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white) ![Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen) ![No dependencies](https://img.shields.io/badge/dependencies-none-lightgrey)

---

## What it is

Growth Log is a lightweight Chrome extension that lives in your toolbar and opens in the evening. It's a place to log wins, record reflections, and look back at evidence of your own growth — especially on the days when you can't feel it.

It is not a habit tracker. It does not send you notifications. It does not have streaks. It just holds what you put into it and gives it back to you when you need it.

---

## Why I built it

I was working through a period of learned helplessness — a state where you stop trusting your own judgment because enough things have gone wrong that your internal scoring system breaks down. Wins stop landing. You get one and immediately discount it.

The insight that changed how I thought about this: the problem isn't a lack of wins. It's that you need a record you can actually return to. Something that exists outside your own memory, which is unreliable when you're doubting yourself.

So I built a tool that does one thing well — captures moments as they happen, and surfaces them back with a question worth sitting with.

---

## Features

**Growth Log (the main screen)**
- Log entries as a **Win** or **Reflection**
- Tag each entry with a category that matters to you
- Six default categories: AI & Code, Finance, First Principles, Boundaries, Self-care, Gut Trust
- Each entry, when opened, shows a randomised reflection prompt specific to its type
- Add a private note to go deeper
- Stats strip showing total wins, reflections, and today's count

**To-do**
- Simple task list with satisfying strikethrough on completion
- Open / Done tabs so finished tasks don't disappear — they move to a list you can look back at
- Done count shown as a win, not just a number

**Everything stays local**
- All data stored in your browser via `localStorage`
- Nothing is sent anywhere
- No accounts, no sign-in, no tracking

---

## Categories

The six default categories are not arbitrary. They map to the specific areas where self-trust tends to erode:

| Category | What it tracks |
|---|---|
| AI & Code | Building things, shipping, learning by doing |
| Finance | Understanding money, making decisions, not deferring |
| First principles | Moments where your reasoning held up — or didn't |
| Boundaries | Noticing, holding, recovering from boundary moments |
| Self-care | The basics that make everything else possible |
| Gut trust | When you listened to yourself — or overrode yourself and wish you hadn't |

---

## Installation

This extension is not on the Chrome Web Store. Install it manually:

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the `growth-extension` folder
6. Pin it to your toolbar

---

## Project structure

```
growth-extension/
├── manifest.json      # Chrome extension config (Manifest V3)
├── popup.html         # UI — all screens in a single file
├── popup.js           # All logic — no frameworks, no dependencies
└── icon.png           # Extension icon
```

No build step. No bundler. No framework. Just HTML, CSS, and vanilla JavaScript.

---

## Design decisions

**No frameworks** — this is a popup that opens for 60 seconds in the evening. It doesn't need React. Keeping it in vanilla JS means anyone can read it, fork it, and change it without a build environment.

**No external fonts or CDNs** — Chrome extensions have strict Content Security Policies. Everything is self-contained.

**localStorage over sync storage** — intentional. This data is personal. It lives on your machine, not in a Google account. If you want to move it, export it yourself.

**Two entry types, not ten** — Win and Reflection. The binary is enough. Adding more types creates friction at the moment you most need the tool to be frictionless.

---

## What's next

- [ ] Export entries as markdown or JSON
- [ ] Custom categories
- [ ] Weekly summary view — a single screen showing the week at a glance
- [ ] Optional daily reminder notification

---

## Built with

- Vanilla JavaScript (ES6+)
- Chrome Extensions Manifest V3
- `chrome.storage` API (localStorage in popup context)
- No external dependencies

---

*Built in April 2026. First project in a deliberate effort to build things that solve real problems.*
