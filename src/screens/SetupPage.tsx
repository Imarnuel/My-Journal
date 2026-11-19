// Not ported yet: renders the prototype frame (Playbook.dc.html) as a working baseline.
// Port it to the shared store following src/screens/Accounts.tsx, then delete this comment.
import { ProtoScreen } from "./ProtoScreen";
import View from "./views/Playbook.view";
import make from "./logic/Playbook.logic";

export function SetupPage() {
  return <ProtoScreen make={make as never} View={View as never} />;
}
