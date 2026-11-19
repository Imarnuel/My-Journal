import { useEffect, type MouseEvent } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ProtoScreen } from "../screens/ProtoScreen";
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
import StartView from "../screens/views/Start.view";
import makeStart from "../screens/logic/Start.logic";
import DashboardView from "../screens/views/Dashboard.view";
import makeDashboard from "../screens/logic/Dashboard.logic";
import MainView from "../screens/views/Main.view";
import makeMain from "../screens/logic/Main.logic";
import MainCalView from "../screens/views/MainCal.view";
import makeMainCal from "../screens/logic/MainCal.logic";
import NewStoryView from "../screens/views/NewStory.view";
import makeNewStory from "../screens/logic/NewStory.logic";
import NewStoryTypedView from "../screens/views/NewStoryTyped.view";
import makeNewStoryTyped from "../screens/logic/NewStoryTyped.logic";
import StoryView from "../screens/views/Story.view";
import makeStory from "../screens/logic/Story.logic";
import PlaybookHomeView from "../screens/views/PlaybookHome.view";
import makePlaybookHome from "../screens/logic/PlaybookHome.logic";
import PlaybookView from "../screens/views/Playbook.view";
import makePlaybook from "../screens/logic/Playbook.logic";
import SetupEditView from "../screens/views/SetupEdit.view";
import makeSetupEdit from "../screens/logic/SetupEdit.logic";
import ReviewView from "../screens/views/Review.view";
import makeReview from "../screens/logic/Review.logic";
import AccountsView from "../screens/views/Accounts.view";
import makeAccounts from "../screens/logic/Accounts.logic";
import AddAccountView from "../screens/views/AddAccount.view";
import makeAddAccount from "../screens/logic/AddAccount.logic";
import EditAccountView from "../screens/views/EditAccount.view";
import makeEditAccount from "../screens/logic/EditAccount.logic";
import SettingsView from "../screens/views/Settings.view";
import makeSettings from "../screens/logic/Settings.logic";
import StatesView from "../screens/views/States.view";
import makeStates from "../screens/logic/States.logic";

/** Prototype baseline for a screen that isn't ported yet (fully working, but with its own copy of the data). */
const P = (f: string, make: unknown, View: unknown) => <ProtoScreen key={f} make={make as never} View={View as never} />;

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
        <Route path="/dev/states" element={P("States", makeStates, StatesView)} />
        <Route path="/proto/Start" element={<ProtoScreen key="Start" make={makeStart as never} View={StartView as never} />} />
        <Route path="/proto/Dashboard" element={<ProtoScreen key="Dashboard" make={makeDashboard as never} View={DashboardView as never} />} />
        <Route path="/proto/Main" element={<ProtoScreen key="Main" make={makeMain as never} View={MainView as never} />} />
        <Route path="/proto/MainCal" element={<ProtoScreen key="MainCal" make={makeMainCal as never} View={MainCalView as never} />} />
        <Route path="/proto/NewStory" element={<ProtoScreen key="NewStory" make={makeNewStory as never} View={NewStoryView as never} />} />
        <Route path="/proto/NewStoryTyped" element={<ProtoScreen key="NewStoryTyped" make={makeNewStoryTyped as never} View={NewStoryTypedView as never} />} />
        <Route path="/proto/Story" element={<ProtoScreen key="Story" make={makeStory as never} View={StoryView as never} />} />
        <Route path="/proto/PlaybookHome" element={<ProtoScreen key="PlaybookHome" make={makePlaybookHome as never} View={PlaybookHomeView as never} />} />
        <Route path="/proto/Playbook" element={<ProtoScreen key="Playbook" make={makePlaybook as never} View={PlaybookView as never} />} />
        <Route path="/proto/SetupEdit" element={<ProtoScreen key="SetupEdit" make={makeSetupEdit as never} View={SetupEditView as never} />} />
        <Route path="/proto/Review" element={<ProtoScreen key="Review" make={makeReview as never} View={ReviewView as never} />} />
        <Route path="/proto/Accounts" element={<ProtoScreen key="Accounts" make={makeAccounts as never} View={AccountsView as never} />} />
        <Route path="/proto/AddAccount" element={<ProtoScreen key="AddAccount" make={makeAddAccount as never} View={AddAccountView as never} />} />
        <Route path="/proto/EditAccount" element={<ProtoScreen key="EditAccount" make={makeEditAccount as never} View={EditAccountView as never} />} />
        <Route path="/proto/Settings" element={<ProtoScreen key="Settings" make={makeSettings as never} View={SettingsView as never} />} />
        <Route path="/proto/States" element={<ProtoScreen key="States" make={makeStates as never} View={StatesView as never} />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
