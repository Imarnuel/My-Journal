// Development only: renders an untouched prototype frame (generated view + prototype logic) at /proto/<Frame>.
import { useParams } from "react-router-dom";
import { ProtoScreen } from "./ProtoScreen";

const views = import.meta.glob("./views/*.view.tsx", { eager: true }) as Record<string, { default: unknown }>;
const logic = import.meta.glob("./logic/*.logic.ts", { eager: true }) as Record<string, { default: unknown }>;

export default function ProtoFrame() {
  const { frame = "Dashboard" } = useParams();
  const View = views[`./views/${frame}.view.tsx`]?.default;
  const make = logic[`./logic/${frame}.logic.ts`]?.default;
  if (!View || !make) return <p style={{ padding: 32 }}>No prototype frame named {frame}.</p>;
  return <ProtoScreen key={frame} make={make as never} View={View as never} />;
}
