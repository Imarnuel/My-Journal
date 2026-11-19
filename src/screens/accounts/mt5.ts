// MT5 connection test (Add account). The sync back end isn't designed yet (handoff/docs/06-open-items.md
// item 7), so this stands in for it: it answers after a short wait like a real check would, always
// successfully. Error states (wrong login, wrong server, failed test) aren't designed (item 2).
export type Mt5Result = { server: string; balance: string };

export function testConnection(login: string, server: string, _password: string, ms = 1200): Promise<Mt5Result> {
  void login;
  return new Promise((resolve) => setTimeout(() => resolve({ server, balance: "100,000 USD" }), ms));
}
