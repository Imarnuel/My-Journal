// Not ported yet: renders the prototype frame (Main.dc.html) as a working baseline.
// Port it to the shared store following src/screens/Accounts.tsx, then delete this comment.
import { ProtoScreen } from "./ProtoScreen";
import View from "./views/Main.view";
import make from "./logic/Main.logic";

export function TradeLog() {
  return <ProtoScreen make={make as never} View={View as never} />;
}
