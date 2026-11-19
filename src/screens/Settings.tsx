// Not ported yet: renders the prototype frame (Settings.dc.html) as a working baseline.
// Port it to the shared store following src/screens/Accounts.tsx, then delete this comment.
import { ProtoScreen } from "./ProtoScreen";
import View from "./views/Settings.view";
import make from "./logic/Settings.logic";

export function Settings() {
  return <ProtoScreen make={make as never} View={View as never} />;
}
