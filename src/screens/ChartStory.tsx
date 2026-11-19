// Not ported yet: renders the prototype frame (Story.dc.html) as a working baseline.
// Port it to the shared store following src/screens/Accounts.tsx, then delete this comment.
import { ProtoScreen } from "./ProtoScreen";
import View from "./views/Story.view";
import make from "./logic/Story.logic";

export function ChartStory() {
  return <ProtoScreen make={make as never} View={View as never} />;
}
