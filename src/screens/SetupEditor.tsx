// Not ported yet: renders the prototype frame (SetupEdit.dc.html) as a working baseline.
// Port it to the shared store following src/screens/Accounts.tsx, then delete this comment.
import { ProtoScreen } from "./ProtoScreen";
import View from "./views/SetupEdit.view";
import make from "./logic/SetupEdit.logic";

export function SetupEditor() {
  return <ProtoScreen make={make as never} View={View as never} />;
}
