// Routes from handoff/docs/03-screens.md, and the prototype file each one comes from.
export const FRAME_ROUTE: Record<string, string> = {
  "Start.dc.html": "/start",
  "Dashboard.dc.html": "/",
  "Main.dc.html": "/log",
  "MainCal.dc.html": "/log?view=grid",
  "NewStory.dc.html": "/new",
  "NewStoryTyped.dc.html": "/new",
  "Story.dc.html": "/story/e20",
  "PlaybookHome.dc.html": "/playbook",
  "Playbook.dc.html": "/playbook/4h-supply-pullback",
  "SetupEdit.dc.html": "/playbook/4h-supply-pullback/edit",
  "Review.dc.html": "/review",
  "Accounts.dc.html": "/accounts",
  "AddAccount.dc.html": "/accounts/new",
  "EditAccount.dc.html": "/accounts/funded-100k",
  "Settings.dc.html": "/settings",
  "States.dc.html": "/dev/states",
};

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
