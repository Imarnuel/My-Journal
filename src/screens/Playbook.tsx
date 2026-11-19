// Not ported yet: renders the prototype frame (PlaybookHome.dc.html) as a working baseline.
// Port it to the shared store following src/screens/Accounts.tsx, then delete this comment.
import { ProtoScreen } from "./ProtoScreen";
import View from "./views/PlaybookHome.view";
import make from "./logic/PlaybookHome.logic";

export function Playbook() {
  return <ProtoScreen make={make as never} View={View as never} />;
}
