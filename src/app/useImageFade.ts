// Images fade in when they finish loading instead of popping in (the owner, 2026-11-22: "an animation while
// loading images, and not just the image suddenly appearing"; DESIGN.md › Motion). One watcher for the whole app:
// an image that isn't loaded yet when it appears (or gets a new src) is marked `data-loading` (hidden, its chart
// frame pulsing) until it loads or fails, then `data-loaded` (it fades in from a slight blur, globals.css).
// Images already loaded, from the cache or a blob, show at once.
import { useEffect } from "react";

function watch(img: HTMLImageElement) {
  if (img.complete && img.naturalWidth > 0) {
    img.removeAttribute("data-loading");
    return;
  }
  img.removeAttribute("data-loaded");
  img.setAttribute("data-loading", "");
  const done = () => {
    img.removeEventListener("load", done);
    img.removeEventListener("error", done);
    // The loaded state is set first, the hidden one removed a frame later, so the fade runs.
    img.setAttribute("data-loaded", "");
    requestAnimationFrame(() => img.removeAttribute("data-loading"));
  };
  img.addEventListener("load", done);
  img.addEventListener("error", done);
}

export function useImageFade() {
  useEffect(() => {
    document.querySelectorAll("img").forEach((i) => watch(i));
    const seen = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === "attributes" && m.target instanceof HTMLImageElement) watch(m.target);
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLImageElement) watch(n);
          else if (n instanceof Element) n.querySelectorAll("img").forEach((i) => watch(i));
        });
      }
    });
    seen.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
    return () => seen.disconnect();
  }, []);
}
