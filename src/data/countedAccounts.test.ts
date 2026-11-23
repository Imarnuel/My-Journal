import { describe, expect, it } from "vitest";
import { counted } from "../lib/calc";
import type { Account, Entry } from "../lib/types";
import { countedAccounts } from "./store";

const acct = (name: string, practice = false): Account => ({ name, type: practice ? "Demo" : "Live", practice, archived: false, source: "screenshots" }) as Account;
const trade = (id: string, account: string, r: number): Entry => ({ id, account, r, status: "Taken", date: "2026-11-20", time: "10:00", excluded: false }) as unknown as Entry;

describe("trades without an account (DESIGN.md › Trades without an account)", () => {
  const T = [trade("a", "", 2.1), trade("b", "", -1), trade("c", "Main", 1)];
  it("count in a journal with no accounts yet", () => {
    expect(counted(T, countedAccounts([], [])).map((e) => e.id)).toEqual(["a", "b"]);
  });
  it("count while every real account is ticked, practice ones aside", () => {
    const accounts = [acct("Main"), acct("Demo", true)];
    expect(counted(T, countedAccounts(accounts, ["Main"])).map((e) => e.id).sort()).toEqual(["a", "b", "c"]);
  });
  it("drop out when the menu is narrowed to some accounts", () => {
    const accounts = [acct("Main"), acct("Funded")];
    expect(counted(T, countedAccounts(accounts, ["Main"])).map((e) => e.id)).toEqual(["c"]);
  });
});
