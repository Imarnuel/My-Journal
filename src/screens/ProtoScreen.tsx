// Renders a prototype frame as-is (generated view + prototype logic). Behaviour baseline only.
import type { ComponentType } from "react";
import { useStore } from "../data/store";
import { useDC } from "./useDC";

export function ProtoScreen({ make, View }: { make: (b: unknown) => new () => never; View: ComponentType<{ v: unknown }> }) {
  const appearance = useStore((s) => s.appearance);
  const dark = appearance === "dark" || (appearance === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  const v = useDC(make as never, { darkPreview: dark });
  return <View v={v} />;
}
