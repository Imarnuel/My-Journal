# Prototype

The 16 frames from the Claude Design canvas, runnable in any browser.

```bash
python3 -m http.server 8765
# open http://localhost:8765/
```

- `*.dc.html` are the frames. Each holds its markup (with `{{ holes }}`, `<sc-if>` and `<sc-for>`), its stylesheet, and its logic in a `<script type="text/x-dc">` class.
- `support.js` is a small runtime that renders them in a normal browser. It must be served over http (opening the files directly also works in most browsers, but links and fonts behave best when served).
- `?theme=dark` on any frame shows it in dark mode (the same as Settings > Appearance > Dark).
- `canvas.json` is the canvas layout (frame positions and sizes).
- Fonts: the frames load Inter from Google Fonts. Offline, install Inter locally so the layout matches the screenshots.

This is a reference, not code to ship. Build the app with real components (see `docs/04-build-plan.md`); use the prototype to check layout, copy and behaviour.
