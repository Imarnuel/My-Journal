import { CHART_SPRITE } from "./sprite.data";

/** Placeholder chart drawings, referenced with <use href="#lx0" />. Mounted once at the root. */
export function ChartSprite() {
  return <div aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: CHART_SPRITE }} />;
}
