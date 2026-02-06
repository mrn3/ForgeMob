# ForgeMob — Creative Suite

A Canva/Adobe Express–style suite of creative and productivity apps built with **Adobe React Spectrum**, with **real-time multiplayer collaboration** via Yjs.

## Apps

| App | Description |
|-----|-------------|
| **Presentations** | Slides, text, backgrounds, add/remove slides, export/print |
| **Social Media** | Templates (Instagram, Facebook, Twitter, etc.), headline/body, export |
| **Docs** | Rich text document with real-time sync |
| **Sheets** | Spreadsheet with collaborative cells |
| **Whiteboard** | Infinite canvas, shapes (rect, circle), sticky notes, text |
| **Photo Editor** | Upload image, brightness/contrast/saturation/blur, filters (grayscale, sepia, invert), export |
| **Video** | Timeline, add clips and text overlays (collaborative) |
| **Print** | Flyer, poster, card, A4 templates; title/subtitle; print/PDF |
| **Websites** | Section-based builder (hero, text, gallery, CTA) |
| **Web Apps** | App name, description, pages (collaborative) |
| **Mobile Apps** | App name, screens, platform (iOS/Android), preview frame |

All apps use the same **document ID** in the URL. Open the same URL (or paste the same doc ID via “Open by ID”) in another tab or browser to see **real-time collaboration**.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Adobe React Spectrum** (Spectrum design system)
- **Yjs** + **y-websocket** for CRDT-based real-time sync
- **y-websockets-server** for the WebSocket backend

## Setup

```bash
npm install
```

## Run

You need **two** processes:

1. **Collaboration server** (WebSocket on port 1234):

   ```bash
   npm run server
   ```

2. **App** (Vite on port 5173):

   ```bash
   npm run dev
   ```

Then open **http://localhost:5173**.

- **New document**: click an app card → **New**.
- **Join existing**: click **Open by ID**, paste the document ID from the other tab/device.

## Testing All Apps

1. **Dashboard** — Click each app card and “New” to create a doc; confirm navigation to the editor.
2. **Presentations** — Add slide, edit title/content, switch slides, use Export/Print.
3. **Social** — Change template, edit headline/body; check preview; Export.
4. **Docs** — Type text; open same doc ID in another tab and confirm sync.
5. **Sheets** — Edit cells; open same doc ID in another tab and confirm sync.
6. **Whiteboard** — Choose tool (rect, circle, sticky, text), click canvas to add shapes; delete with Select + click.
7. **Photo** — Upload photo, move sliders (brightness, contrast, saturation, blur), change filter; Export.
8. **Video** — Add clip, add text overlay; confirm timeline updates.
9. **Print** — Change template, edit title/subtitle; Print/PDF.
10. **Websites** — Add section, change type, edit heading/body.
11. **Web Apps** — Edit app name, description, pages.
12. **Mobile** — Edit app name, screens, platform; check phone preview.

**Collaboration check**: For any app, copy the doc ID from the URL, open a new tab, go to Dashboard → same app → “Open by ID” → paste ID. Edit in one tab and confirm changes appear in the other.

## Build

```bash
npm run build
```

Output is in `dist/`. Serve with `npm run preview` (and keep `npm run server` running if you need collaboration).

## License

MIT
