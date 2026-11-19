// Not ported yet: renders the prototype frame (Review.dc.html) as a working baseline.
// Port it to the shared store following src/screens/Accounts.tsx, then delete this comment.
import { ProtoScreen } from "./ProtoScreen";
import View from "./views/Review.view";
import make from "./logic/Review.logic";

export function WeeklyReview() {
  return <ProtoScreen make={make as never} View={View as never} />;
}
