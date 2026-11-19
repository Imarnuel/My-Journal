// Not ported yet: renders the prototype frame (Start.dc.html) as a working baseline.
// Port it to the shared store following src/screens/Accounts.tsx, then delete this comment.
import { ProtoScreen } from "./ProtoScreen";
import View from "./views/Start.view";
import make from "./logic/Start.logic";

export function Start() {
  return <ProtoScreen make={make as never} View={View as never} />;
}
