# ONE DATASET. Every screen's numbers, lists and filters are computed from ENTRIES.
# Executed inside gen2.py's namespace (after dash.py so SU/LB/AR/UN exist; it also defines them itself).
import random, datetime as _dt, json as _json

SU, LB, AR, UN = "4H supply pullback", "London breakout", "Asian range fade", "Unsorted"
REAL_ACCTS = ["Main account", "Funded 100K", "Challenge 50K"]
PRACTICE_ACCTS = ["Demo account", "Backtesting"]
SESSION_OF = {AR: "Asia", LB: "London"}
MISTAKES = ["Moved stop", "Entered before close", "Chased entry"]
TIMES = {"Asia": ["02:15", "03:40", "04:30"], "London": ["08:20", "09:05", "09:45", "10:30"], "New York": ["14:10", "14:45", "15:30"]}

# Weeks: Monday, R per taken trade, takeaway, watched, not filled
WEEKS_SPEC = [
    ("2026-11-16", None, None, 0, 0),          # this week, still running: not in Past weeks
    ("2026-11-09", None, "Leave the stop where I planned it. No moving it to breakeven before 1R.", 2, 0),
    ("2026-11-02", None, "Wait for the 15m candle to close before entering.", 5, 1),
    ("2026-10-26", [1.6, -1, -1], None, 1, 0),
    ("2026-10-19", [1.4, 1.4, 1.4, -1, -1], "Only trade London and New York. Skip Asia.", 2, 1),
    ("2026-10-05", [1.1, 1.1, -1, -1, -1, -1], "Stop trading after two losses in a day.", 0, 1),
    ("2026-09-21", [1.9, 2.0, -1, -1], "Mark the Asian range before London opens.", 1, 0),
    ("2026-09-14", [1.6, -1], None, 0, 0),
    ("2026-09-07", [2.2, 2.0, -1, -1, -1], "No trades in the first 15 minutes of the session.", 2, 1),
    ("2026-08-31", [1.4, -1, -1], None, 1, 0),
    ("2026-08-24", [2.4, -1, -1], "Take the trade at my level or let it go.", 1, 0),
    ("2026-08-17", [-1, -1], None, 0, 1),
    ("2026-08-03", [1.0, 1.0, -1], "Check the daily bias before the 4H.", 1, 0),
    ("2026-07-27", [1.3, 1.3, -1], "Size down after a loss, not up.", 0, 0),
    ("2026-07-20", [-1, -1], None, 1, 0),
    ("2026-07-13", [1.8, 1.2, -1, -1], "Wait for London to pick a side.", 2, 1),
    ("2026-07-06", [2.8, -1], "Write the plan before the session, not during.", 0, 0),
    ("2026-06-22", [1.2, 1.0, -1], "Leave winners alone once they pass 1R.", 1, 0),
    ("2026-06-15", [-1, -1], None, 0, 0),
    ("2026-06-01", [2.8, -1], "Trade less on Mondays.", 1, 0),
    ("2026-04-20", [2.8, -1, -1], "One setup only this week.", 0, 1),
    ("2026-04-06", [-1, -1], None, 0, 0),
    ("2026-03-23", [2.0, -1], "Wait for the retest.", 1, 0),
    ("2026-03-16", [1.0, -1, -1], None, 0, 0),
    ("2026-03-09", [1.2, 1.2], "Same as last week: patience on entries.", 0, 0),
    ("2026-03-02", [-1, -1], None, 1, 0),
    ("2026-01-19", [1.5, -1], "Start journaling every trade with a chart.", 0, 0),
    ("2026-01-12", [-1], None, 0, 0),
    ("2025-12-15", [1.4, 1.4], "Keep risk at 1% no matter what.", 0, 0),
    ("2025-12-08", [-1, -1], None, 0, 0),
    ("2025-11-24", [1.3, -1], None, 0, 0),
]

# November 2026 is hand-written: the dashboard, trade log and stories already show these trades.
# (date, pair, dir, R, setup, session, followed, mistakes, account, time, reflection)
NOV = [
    ("2026-11-02", "GBPUSD", "Short", 1.8, SU, "London", True, [], "Funded 100K", "09:10", None),
    ("2026-11-02", "EURUSD", "Long", -1.0, LB, "London", False, ["Entered before close"], "Funded 100K", "08:20", "Entered before the 15m candle closed again."),
    ("2026-11-03", "USDJPY", "Short", -1.0, AR, "Asia", True, [], "Challenge 50K", "03:40", None),
    ("2026-11-04", "XAUUSD", "Long", 2.2, SU, "New York", True, [], "Funded 100K", "14:45", None),
    ("2026-11-05", "GBPUSD", "Short", -1.0, SU, "London", False, ["Moved stop"], "Main account", "09:45", "Pulled my stop in and got taken out by the wick."),
    ("2026-11-05", "NZDUSD", "Long", -1.0, UN, "New York", False, ["Chased entry"], "Challenge 50K", "15:30", None),
    ("2026-11-06", "GBPJPY", "Short", 1.5, LB, "London", True, [], "Funded 100K", "08:20", None),
    ("2026-11-09", "GBPUSD", "Short", 2.1, SU, "London", True, [], "Funded 100K", "09:45", None),
    ("2026-11-10", "XAUUSD", "Long", 2.6, SU, "New York", True, [], "Funded 100K", "14:10", None),
    ("2026-11-10", "EURUSD", "Long", -1.0, LB, "London", True, [], "Main account", "08:20", None),
    ("2026-11-11", "AUDUSD", "Short", 1.0, AR, "Asia", True, [], "Challenge 50K", "02:15", None),
    ("2026-11-11", "GBPUSD", "Short", -1.0, SU, "London", False, ["Moved stop"], "Funded 100K", "10:30", "Moved my stop to breakeven too early and got wicked out before it went to target."),
    ("2026-11-11", "USDJPY", "Long", -1.0, AR, "Asia", True, [], "Challenge 50K", "04:30", None),
    ("2026-11-12", "GBPJPY", "Short", 1.7, LB, "London", True, [], "Challenge 50K", "09:20", None),
    ("2026-11-12", "XAUUSD", "Long", 2.0, SU, "New York", True, [], "Main account", "14:30", "Patience on the retest paid off. Same again on Gold."),
    ("2026-11-12", "USDCAD", "Short", -1.0, UN, "London", False, ["Entered before close"], "Main account", "11:00", "Entered before the 15m candle closed. Wait for the close."),
    ("2026-11-13", "GBPUSD", "Short", -1.0, SU, "New York", True, [], "Funded 100K", "15:40", None),
    ("2026-11-13", "EURJPY", "Long", -1.0, LB, "London", False, ["Moved stop", "Chased entry"], "Challenge 50K", "10:05", "Chased the London open after missing my entry. Moved the stop too."),
    ("2026-11-16", "EURUSD", "Long", 0.6, UN, "London", True, [], "Main account", "11:10", None),
    ("2026-11-16", "GBPUSD", "Short", 2.1, SU, "London", True, [], "Funded 100K", "09:45", None),
]
# a few practice trades: excluded from numbers unless the practice account is ticked
PRACTICE = [
    ("2026-11-10", "GBPUSD", "Short", 2.4, SU, "London", True, [], "Demo account", "09:05", None),
    ("2026-11-03", "EURJPY", "Long", -1.0, LB, "London", True, [], "Demo account", "08:20", None),
    ("2026-10-21", "XAUUSD", "Long", 1.8, SU, "New York", True, [], "Demo account", "14:45", None),
]

PAIRS = ["GBPUSD", "EURUSD", "XAUUSD", "GBPJPY", "USDJPY", "AUDUSD", "EURJPY", "USDCAD", "NZDUSD"]
LOSS_REFL = {"Moved stop": "Touched the stop again. It was in the right place.",
             "Entered before close": "Went in before the candle closed. Wait for it.",
             "Chased entry": "Chased after missing the entry. Should have let it go."}
WIN_REFL = ["Waited for my level and it paid.", "Clean setup, took it without overthinking.", "Let it run to target instead of closing early."]

def _d(s): return _dt.date.fromisoformat(s)
rnd = random.Random(7)
ENTRIES = []   # every record: taken trades plus watched, not filled
def _add(e): e["id"] = f"e{len(ENTRIES)+1}"; ENTRIES.append(e)

for row in NOV + PRACTICE:
    d, pair, dirn, r, setup, sess, fol, mis, acct, tm, refl = row
    _add(dict(date=d, pair=pair, dir=dirn, r=r, setup=setup, session=sess, followed=fol, mistakes=mis, account=acct, time=tm, refl=refl, status="Taken"))

SPECIAL = [
    dict(date="2026-11-16", time="15:20", pair="AUDUSD", dir="Long", status="Running", account="Main account", setup=UN, charts=1, note=True),
    dict(date="2026-11-16", time="13:00", pair="EURJPY", dir="Long", status="Watched", account="Funded 100K", setup=UN, charts=1, note=True),
    dict(date="2026-11-16", time="07:30", pair="GBPUSD, XAUUSD", dir=None, status="Analysis", account="Funded 100K", setup=None, charts=2, note=True,
         plan="Dollar weak into New York. Only shorts on GBP below the weekly level."),
    dict(date="2026-11-12", time="16:00", pair="NZDUSD", dir="Short", status="Not filled", account="Main account", setup=LB, charts=1, note=True),
]
for e in SPECIAL:
    base = dict(r=None, session="London", followed=None, mistakes=[], refl=None)
    base.update(e); _add(base)

for mon, rs, take, w, nf in WEEKS_SPEC:
    m = _d(mon)
    if rs:
        days = sorted(rnd.sample(range(5), min(len(rs), 5)) + [rnd.randrange(5) for _ in range(max(0, len(rs) - 5))])
        for i, r in enumerate(rs):
            setup = rnd.choice([SU, SU, LB, AR, UN])
            sess = SESSION_OF.get(setup) or rnd.choice(["London", "New York"])
            win = r > 0
            fol = True if win else rnd.random() < 0.55
            mis = [] if fol else [rnd.choice(MISTAKES)]
            refl = (LOSS_REFL[mis[0]] if mis and rnd.random() < 0.7 else (rnd.choice(WIN_REFL) if win and rnd.random() < 0.35 else None))
            _add(dict(date=str(m + _dt.timedelta(days=days[i])), pair=rnd.choice(PAIRS), dir=rnd.choice(["Long", "Short"]), r=r, setup=setup, session=sess,
                      followed=fol, mistakes=mis, account=rnd.choice(["Funded 100K", "Funded 100K", "Main account", "Challenge 50K"]),
                      time=rnd.choice(TIMES[sess]), refl=refl, status="Taken"))
    for k in range(w + nf):
        setup = rnd.choice([SU, LB, AR])
        sess = SESSION_OF.get(setup) or "London"
        _add(dict(date=str(m + _dt.timedelta(days=rnd.randrange(5))), pair=rnd.choice(PAIRS), dir=rnd.choice(["Long", "Short"]), r=None, setup=setup,
                  session=sess, followed=None, mistakes=[], account="Funded 100K", time=rnd.choice(TIMES[sess]), refl=None,
                  status="Watched" if k < w else "Not filled"))

GOOD_TAGS = ["Supply zone", "Break of structure", "Retest", "Liquidity sweep", "Demand zone", "Trend continuation"]
NEUTRAL_TAGS = ["News day", "Asia range", "Low volume"]
for e in ENTRIES:
    h = int(e["id"][1:])
    e.setdefault("charts", 0 if (e["date"] == "2026-11-16" and e["pair"] == "EURUSD") else 1 + (h * 7) % 5)
    e.setdefault("note", e["refl"] is not None or h % 4 != 0)
    e.setdefault("plan", None)
    pool = [("Supply zone" if e["dir"] == "Short" else "Demand zone"), "Break of structure", "Retest", "Liquidity sweep", "Trend continuation"]
    good = [] if (e["status"] != "Taken" or (e["r"] or 0) <= 0) else [pool[h % 5], pool[(h * 3 + 1) % 5]][: 1 + h % 2]
    good = list(dict.fromkeys(good))
    neutral = [NEUTRAL_TAGS[h % 3]] if h % 7 == 0 else []
    e["tags"] = e["mistakes"] + good + neutral
    e["also"] = "Funded 100K" if (e["date"] == "2026-11-12" and e["pair"] == "XAUUSD") else None
    e["mt5"] = f"#4{8231 - h}" if e["status"] in ("Taken", "Running") and e["account"] != "Demo account" else None
# the story on canvas: GBPUSD, 16 Nov
for e in ENTRIES:
    if e["date"] == "2026-11-16" and e["pair"] == "GBPUSD" and e["status"] == "Taken":
        e["tags"] = ["Supply zone", "Break of structure", "Retest"]; e["charts"] = 5; e["mt5"] = None; e["note"] = True
    if e["date"] == "2026-11-16" and e["pair"] == "EURUSD": e["mt5"] = "#48231"; e["note"] = False
    if e["date"] == "2026-11-13" and e["pair"] == "EURJPY": e["note"] = False
ENTRIES.sort(key=lambda e: (e["date"], e["time"]), reverse=True)
TAKES = {mon: take for mon, rs, take, w, nf in WEEKS_SPEC}
TODAY = _d("2026-11-16")      # the canvas's "today": Monday 16 November
THIS_WEEK = "2026-11-16"

def week_of(datestr):
    d = _d(datestr); return str(d - _dt.timedelta(days=d.weekday()))

# ---- checks: November must match the dashboard's TR exactly ----
_nov = [e for e in ENTRIES if e["status"] == "Taken" and e["date"] >= "2026-11-01" and e["account"] in REAL_ACCTS]
assert len(_nov) == 20 and round(sum(e["r"] for e in _nov), 1) == 7.6, (len(_nov), sum(e["r"] for e in _nov))
_wk = [e for e in _nov if week_of(e["date"]) == "2026-11-09"]
assert len(_wk) == 11 and round(sum(e["r"] for e in _wk), 1) == 3.4

def taken(accts=REAL_ACCTS):
    return [e for e in ENTRIES if e["status"] == "Taken" and e["account"] in accts]
