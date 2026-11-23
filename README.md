# A Tiny Ask 💌

An interactive, single-page romantic **date proposal and planner**. It starts with a playful question, a “No” button that keeps escaping, a confetti-filled confirmation, a date planner, and a personalized letter. Invites can be shared as a link or a downloadable QR card, and the chosen plan can come back automatically through Discord, email, or a pre-filled WhatsApp message.

The app itself is a static frontend: no backend, database, account system, or tracking. Optional notification requests go directly from the browser to the channels you configure.

![A Tiny Ask proposal screen](docs/preview.png)

## What it does

1. **The ask** — a warm, editorial proposal card. Try to catch the “No” button: it dodges your pointer, changes its wording, and eventually gives up after eight escapes, leaving only a full-width **YES**.
2. **The confirmation** — heart-and-petal confetti, a blooming flower, and a “Yay — it's a date” moment.
3. **The plan** — pick a day, a time, and one of six activities: coffee, a movie, dinner, a walk in the park, drinks, or a surprise.
4. **The letter** — a personalized note with the date, time, and activity laid out in a sealed-letter card.
5. **The response** — if notifications are configured, the plan is delivered on **Seal it with a letter 💌** and a subtle “Sent to …” badge appears. A pre-filled WhatsApp button can deliver it with zero setup. The response link, Web Share sheet, clipboard, and selectable link box remain as fallbacks.
6. **The QR invite** — the proposal composer renders a themed QR code for every generated invite. Download it as a framed high-resolution PNG or share the image/link from the phone’s share sheet.

You can create a custom proposal link from the footer and choose the sender and recipient names. Names default to the generic placeholders **Me** and **you**, producing “Dear you,” and “— Me 💌” in the letter.

## Features

- Responsive layout for mobile, tablet, and desktop
- Custom coral five-petal SVG flower with a sage leaf
- Custom canvas confetti using petal and heart shapes
- Continuous falling-petal background on later screens
- Date/time inputs displayed as `YYYY-MM-DD` and `HH:MM`
- Disabled submit button until the plan is complete
- URL-encoded proposal and response links
- Sender-side response view with an `.ics` calendar download
- Themed QR code for every proposal, generated entirely in the browser
- High-resolution QR PNG download with a “Scan me 💌” frame for printing or sharing as an image
- QR/link sharing through native file sharing when supported, with URL and clipboard fallbacks
- Optional automatic response delivery to Discord and Web3Forms email on seal
- Optional 1-click WhatsApp reply pre-filled with the date, time, plan, and confirmed link
- Native Web Share, Clipboard API, legacy copy fallbacks, and a visible selectable link when both are blocked
- Touch, mouse, and pointer dodging for the “No” button at small screen sizes
- Keyboard focus states, safe-area spacing, and reduced-motion support
- Bundled Fraunces and DM Sans fonts, so the app does not depend on Google Fonts at runtime

## Tech stack

| Tool | Purpose |
| --- | --- |
| React 18 + TypeScript | UI and state |
| Vite 5 | Development server and production build |
| Tailwind CSS 3 | Styling and responsive layout |
| Framer Motion | Screen transitions and micro-interactions |
| canvas-confetti | Custom petal and heart confetti |
| qrcode | Client-side QR generation and canvas export |
| Lucide React | Interface icons |
| Fontsource | Self-hosted variable fonts |

## Run it locally

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (included with Node.js)
- Git

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/<your-username>/date-maker.git
   cd date-maker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Optional — configure instant notifications locally:

   ```bash
   cp .env.example .env.local
   ```

   Fill in `.env.local`, then restart the dev server. Vite reads these values at startup. The file is ignored by Git.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed in the terminal, usually:

   ```text
   http://localhost:5173/
   ```

### Production build

```bash
npm run build
npm run preview
```

The build output is written to `dist/`. `npm run preview` serves that production build locally.

## How to use the app

### 1. Create the invite

1. Open the **publicly deployed** app, not a `localhost` URL, and select **Create your own proposal** in the footer.
2. Enter the two names. If either field is left blank, the app uses **Me** and **you**.
3. Optional: open **Instant Notify Setup**. You can add a Web3Forms access key, enable **Send the plan directly to my WhatsApp**, and enter a number with its country code.
4. Select **Create proposal link**.

### 2. Share it

- **Link:** use **Share the invite** or **Copy link**. If both are blocked, select the visible link box manually.
- **QR code:** every generated invite automatically gets a themed QR code. The recipient can scan it with a normal phone camera.
- **Download QR Image 📥:** saves a `1080 × 1320` PNG with a clean “Scan me 💌” frame. It is suitable for WhatsApp, Messenger, Instagram, email, or printing.
- **Share QR / Link:** on supported phones, this shares the QR PNG itself through the native share sheet. If file sharing is unavailable, it falls back to sharing the invite URL, then to the clipboard.

The QR code and link carry the optional WhatsApp/Web3Forms settings. Only add settings you are comfortable sharing with the recipient.

### 3. The recipient answers

1. They open the public link and tap **YES**.
2. They choose the day, time, and activity.
3. They select **Seal it with a letter 💌**.
4. If notifications are configured, the plan is sent immediately and a **Sent to [sender]! 💌** badge appears.
5. If a WhatsApp number was included, the primary button becomes **Send Plan via WhatsApp 💬**. It opens WhatsApp with the full plan and confirmed link already typed; they only tap Send.
6. Without a WhatsApp number, the primary button is **Share the good news 💌**, using native sharing (including WhatsApp, Messenger, email, and other share targets), clipboard fallbacks, and the visible link box.

### 4. The sender receives the answer

- Discord/email notifications include the recipient name, original sender, full day, time, activity, confirmed view link, and `.ics` calendar details.
- The confirmed view shows the plan and offers an **Add to calendar** `.ics` download.
- If no automatic channel is configured, the recipient can send the response link or the WhatsApp message manually.

### Link formats

```text
https://your-site.example/?from=Me&to=you
https://your-site.example/?from=Me&to=you&wa=YOUR_NUMBER_WITH_COUNTRY_CODE&wf=YOUR_WEB3FORMS_KEY
```

A response link carries the full plan:

```text
https://your-site.example/?reply=1&from=you&to=Me&date=2026-12-24&time=19%3A30&plan=movie
```

### Link parameters

| Parameter | Meaning |
| --- | --- |
| `from` | Sender name on a proposal link; responder name on a response link |
| `to` | Recipient name on a proposal link; original sender on a response link |
| `wa` | Optional WhatsApp number as digits with the country code, no punctuation |
| `wf` | Optional Web3Forms access key for a per-invite email notification |
| `reply=1` | Opens the sender-facing response view |
| `date` | Date in `YYYY-MM-DD` format |
| `time` | 24-hour time in `HH:MM` format |
| `plan` | One of `coffee`, `movie`, `dinner`, `walk`, `drinks`, or `surprise` |

Names are normalized, trimmed, stripped of control characters, and limited to 40 Unicode characters. Invalid dates, times, or plan IDs do not produce a response view.

## Optional instant notifications

Both channels are **off by default**. If neither an environment variable nor a per-invite Web3Forms key is configured, sealing the letter makes no notification request. The letter still works normally.

| Variable | Purpose |
| --- | --- |
| `VITE_DISCORD_WEBHOOK_URL` | Sends a rich Discord embed to one channel webhook |
| `VITE_WEB3FORMS_KEY` | Sends a formatted email through Web3Forms |

Copy `.env.example` to `.env.local` for local development, or add the variables in your Vercel/Netlify project settings and redeploy. Vite reads these values at build/start time; changing them requires a rebuild or restart.

### Discord setup

1. Open the Discord channel that should receive responses.
2. Go to **Channel settings → Integrations → Webhooks → New Webhook**.
3. Copy the webhook URL and set it as `VITE_DISCORD_WEBHOOK_URL`.
4. Keep the channel private; the notification contains the names and date plan.

### Web3Forms email setup

1. Create a form/access key at [Web3Forms](https://web3forms.com/).
2. Set it as `VITE_WEB3FORMS_KEY` for every invite on that deployment, or paste it into **Instant Notify Setup** for one invite.
3. If both the deployment key and an invite key exist, both receive the email.

### Important security note

`VITE_*` values are compiled into the public browser bundle. A Discord webhook URL or Web3Forms key configured this way is **not secret**; someone who inspects the deployed JavaScript can extract it. Use a dedicated webhook in a private channel, restrict/rotate the Web3Forms key, and never commit real values to Git. If you need stronger secrecy than a static client can provide, modify the app to send through a server-side proxy; this project intentionally stays static and does not include one.

The optional `wa` and `wf` values are also visible inside the invite link. The WhatsApp number is shown to the recipient, and a per-invite Web3Forms key can be read by anyone with the link.

## Privacy and security

- **No backend and no accounts.** The static app has no server-side storage.
- **No analytics or tracking scripts.**
- **No hardcoded secrets, webhook URLs, phone numbers, or personal contact details.** `.env` and `.env.local` are ignored; only `.env.example` is committed.
- **Notifications are opt-in.** Names and plan details leave the browser only when Discord, Web3Forms, or a per-invite notification key is configured. Those requests go directly to the configured endpoint.
- **No third-party runtime requests for fonts, icons, or QR assets.** The QR library is bundled. Optional notification requests are the exception.
- **Everything is encoded in the URL.** Proposal links contain the names and optional `wa`/`wf` settings. Response links contain the date, time, and activity.
- **Treat share links as private.** Anyone with a link can read the details encoded inside it, so only send it to the intended person.
- **Calendar files are generated locally** when the sender selects **Add to calendar**.
- **No `localStorage`, cookies, or database.** Notification keys and numbers travel in the invite URL, not persistent browser storage.

See the security note above before enabling Discord or Web3Forms notifications on a public deployment.

## Deploy it yourself

This is a static Vite app, so it works on any static host. No environment variables, server functions, or database setup are required. Environment variables are only needed if you want automatic Discord/email notifications.

**Do not share the `localhost` URL with the recipient.** Deploy first, then share the public deployment URL.

### Vercel

1. Push the project to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Use the **Vite** framework preset.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Optional: in **Project Settings → Environment Variables**, add `VITE_DISCORD_WEBHOOK_URL` and/or `VITE_WEB3FORMS_KEY`, then redeploy.
7. Open the generated `https://<project>.vercel.app` URL. That is the link/QR destination you share.

Remember: `VITE_*` values are bundled into the public JavaScript. Use dedicated/rotatable keys and read the security note above.

### GitHub Pages

This repository includes `.github/workflows/deploy.yml` for GitHub Pages.

1. Push `main` to GitHub.
2. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. Optional: add `VITE_DISCORD_WEBHOOK_URL` and/or `VITE_WEB3FORMS_KEY` under **Settings → Secrets and variables → Actions → New repository secret**.
4. Run the **Deploy to GitHub Pages** workflow, or push to `main`.
5. Share the published `https://<username>.github.io/date-maker/` URL.

The workflow builds with the repository-name base path, which is required for a project Pages site. Query-string share links work without SPA rewrites. If you use a custom domain or a user/organization Pages site at the domain root, remove the `--base="/<repository>/"` argument from the workflow.

### Netlify

1. Push the project to GitHub.
2. In Netlify, choose **Add new site → Import an existing project**.
3. Set the build command to `npm run build`.
4. Set the publish directory to `dist`.
5. Optional: add `VITE_DISCORD_WEBHOOK_URL` and/or `VITE_WEB3FORMS_KEY` in **Site configuration → Environment variables**, then redeploy.
6. Deploy and share the generated public URL.

### Any static host

Run:

```bash
npm run build
```

Then upload the contents of `dist/` to your host. The app only uses query-string links, so no server-side rewrite rules are needed. If your host serves the app from a subfolder, build with the matching base path:

```bash
npm run build -- --base="/your-subfolder/"
```

Environment variables must be present during the build because Vite embeds them at build time.

## Project structure

```text
date-maker/
├─ .github/workflows/ # GitHub Pages deployment
├─ docs/
│  └─ preview.png
├─ src/
│  ├─ components/     # Card, flower, share modal, QR invite, link box, toast
│  ├─ lib/            # URL sharing, date formatting, plans, clipboard,
│  │                  # notification delivery, WhatsApp reply helpers
│  ├─ steps/          # Ask, confirmation, planner, letter, reply screens
│  ├─ App.tsx         # Flow state and page shell
│  ├─ index.css       # Design tokens, picker styles, shared component styles
│  └─ main.tsx        # React entry point
├─ .env.example       # Optional Discord/Web3Forms placeholders
├─ index.html
├─ tailwind.config.js
├─ vite.config.ts
└─ package.json
```

## Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Customize it

- **Colors and shadows:** edit `tailwind.config.js` and the design tokens in `src/index.css`.
- **Activity choices:** edit `src/lib/plans.ts`.
- **Copy and letter wording:** edit the relevant screen in `src/steps/`.
- **Default names:** the `Me` and `you` fallbacks live in `src/lib/share.ts`.
- **QR frame and label:** edit `src/components/QrInvite.tsx`.
- **Notification formatting:** edit `src/lib/notify.ts`.
- **WhatsApp message:** edit `src/lib/whatsapp.ts`.

## Browser support

The app is designed for current iOS Safari, Android browsers, desktop Chrome, Edge, Firefox, and Safari, plus common in-app browsers. Clipboard access, native sharing, QR file sharing, and WhatsApp handoff depend on browser support and permissions; when sharing is blocked, the app falls back to legacy copy methods and finally a visible, selectable link box. QR generation uses the browser canvas and works offline after the app loads. Automatic notification delivery is best-effort: if the network, CORS, or an endpoint blocks the request, the letter remains usable and no false success badge is shown.

---

Made for a tiny question with a very big answer.
