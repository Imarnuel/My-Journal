import type { CSSProperties } from "react";
import { ICONS } from "../icons.data";

export type IconName = keyof typeof ICONS & string;

/** The exact canvas icon (handoff/design-tokens/icons), monochrome, currentColor. */
export function Icon({ name, size, style, className }: { name: IconName; size?: number; style?: CSSProperties; className?: string }) {
  const ic = ICONS[name];
  if (!ic) throw new Error(`Unknown icon ${name}`);
  const { width, height, ...rest } = ic.a;
  const toReact = Object.fromEntries(
    Object.entries(rest).map(([k, v]) => [k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v]),
  );
  return (
    <svg
      width={size ?? width}
      height={size ?? height}
      {...toReact}
      aria-hidden="true"
      style={style}
      className={className}
      dangerouslySetInnerHTML={{ __html: ic.i }}
    />
  );
}
