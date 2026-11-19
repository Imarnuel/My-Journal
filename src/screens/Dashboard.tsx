// Not ported yet: renders the prototype frame (Dashboard.dc.html) as a working baseline.
// Port it to the shared store following src/screens/Accounts.tsx, then delete this comment.
import { ProtoScreen } from "./ProtoScreen";
import View from "./views/Dashboard.view";
import make from "./logic/Dashboard.logic";

export function Dashboard() {
  return <ProtoScreen make={make as never} View={View as never} />;
}
