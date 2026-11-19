// Not ported yet: renders the prototype frame (EditAccount.dc.html) as a working baseline.
// Port it to the shared store following src/screens/Accounts.tsx, then delete this comment.
import { ProtoScreen } from "./ProtoScreen";
import View from "./views/EditAccount.view";
import make from "./logic/EditAccount.logic";

export function EditAccount() {
  return <ProtoScreen make={make as never} View={View as never} />;
}
