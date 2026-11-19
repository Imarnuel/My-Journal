import { lazy, Suspense, useEffect, type MouseEvent } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ChartSprite } from "../components/charts/ChartSprite";
import { FRAME_ROUTE } from "./routes";
import { Accounts } from "../screens/Accounts";
import { Dashboard } from "../screens/Dashboard";
import { TradeLog } from "../screens/TradeLog";
import { ChartStory } from "../screens/ChartStory";
import { Playbook } from "../screens/Playbook";
import { SetupPage } from "../screens/SetupPage";
import { SetupEditor } from "../screens/SetupEditor";
import { WeeklyReview } from "../screens/WeeklyReview";
import { AddAccount } from "../screens/AddAccount";
import { EditAccount } from "../screens/EditAccount";
import { Settings } from "../screens/Settings";
import { Start } from "../screens/Start";

/** The untouched prototype frames, for side-by-side checks while developing (/proto/<Frame>). Not in production builds. */
const ProtoFrame = import.meta.env.DEV ? lazy(() => import("../screens/ProtoFrame")) : null;

/** Links in prototype views point at prototype files ("Main.dc.html"); keep navigation inside the app. */
function useFrameLinks() {
  const nav = useNavigate();
  const loc = useLocation();
  return (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a");
    const href = a?.getAttribute("href");
    if (!a || !href || href.startsWith("#")) return;
    const m = href.match(/^([A-Za-z]+\.dc\.html)/);
    if (m) {
      e.preventDefault();
      nav(loc.pathname.startsWith("/proto/") ? `/proto/${m[1].replace(".dc.html", "")}` : FRAME_ROUTE[m[1]] ?? "/");
    }
  };
}

export function App() {
  const onClick = useFrameLinks();
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <div onClickCapture={onClick}>
      <ChartSprite />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/start" element={<Start />} />
        <Route path="/log" element={<TradeLog />} />
        <Route path="/new" element={<ChartStory key="new" />} />
        <Route path="/story/:id" element={<ChartStory key="saved" />} />
        <Route path="/playbook" element={<Playbook />} />
        <Route path="/playbook/new" element={<SetupEditor key="new" />} />
        <Route path="/playbook/:setup" element={<SetupPage />} />
        <Route path="/playbook/:setup/edit" element={<SetupEditor key="edit" />} />
        <Route path="/review" element={<WeeklyReview />} />
        <Route path="/review/:week" element={<WeeklyReview />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/new" element={<AddAccount />} />
        <Route path="/accounts/:id" element={<EditAccount />} />
        <Route path="/settings" element={<Settings />} />
        {ProtoFrame ? <Route path="/proto/:frame" element={<Suspense fallback={null}><ProtoFrame /></Suspense>} /> : null}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
