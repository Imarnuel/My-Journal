# WEEKLY REVIEW v2: one page per week, built only from what was already recorded.
# Charts, three numbers, mistakes that repeated, your reflections, one takeaway, past weeks.
# No steps, no patterns or AI insights, no money. Executed last.

WK = [  # date, pair, direction, R, setup, plan followed, chart seed
    ("13 Nov", "EURJPY", "Long", -1.0, "London breakout", False, 241),
    ("13 Nov", "GBPUSD", "Short", -1.0, "4H supply pullback", True, 221),
    ("12 Nov", "USDCAD", "Short", -1.0, "Unsorted", False, 251),
    ("12 Nov", "XAUUSD", "Long", 2.0, "4H supply pullback", True, None),
    ("12 Nov", "GBPJPY", "Short", 1.7, "London breakout", True, 201),
    ("11 Nov", "USDJPY", "Long", -1.0, "Asian range fade", True, 261),
    ("11 Nov", "GBPUSD", "Short", -1.0, "4H supply pullback", False, 271),
    ("11 Nov", "AUDUSD", "Short", 1.0, "Asian range fade", True, 281),
    ("10 Nov", "EURUSD", "Long", -1.0, "London breakout", True, 291),
    ("10 Nov", "XAUUSD", "Long", 2.6, "4H supply pullback", True, 301),
    ("9 Nov", "GBPUSD", "Short", 2.1, "4H supply pullback", True, 311),
]
wk_net = sum(w[3] for w in WK); wk_n = len(WK); wk_follow = sum(1 for w in WK if w[5])

def wcard(w):
    d, pair, dirn, r, setup, fol, seed = w
    chart = XA["E"] if seed is None else gallery(seed, dirn.lower(), r > 0)
    col = PROFIT if r > 0 else LOSS
    return f'''<li style="list-style: none; min-width: 0"><a href="Story.dc.html" style="display: flex; flex-direction: column; gap: 8px; text-decoration: none; color: #ECEEF1">
<span class="chart" style="display: block">{chart}</span>
<span style="display: flex; justify-content: space-between; align-items: center; gap: 6px"><span style="display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600">{pair}<span style="font-size: 11px; font-weight: 600; color: #C9CED6; border: 1px solid #353B46; border-radius: 5px; padding: 0 6px; line-height: 1.6">{dirn}</span></span><span class="num" style="font-size: 13px; font-weight: 600; color: {col}">{fr(r)}</span></span>
<span class="lbl" style="font-size: 12px">{d} · {setup}{"" if fol else " · Not followed"}</span></a></li>'''

REFL = [
    ("Moved my stop to breakeven too early and got wicked out before it went to target.", "GBPUSD", "11 Nov"),
    ("Entered before the 15m candle closed. Wait for the close.", "USDCAD", "12 Nov"),
    ("Patience on the retest paid off. Same again on Gold.", "XAUUSD", "12 Nov"),
    ("Chased the London open after missing my entry. Moved the stop too.", "EURJPY", "13 Nov"),
]

def wnum(label, value, sub, col="#ECEEF1"):
    return f'<div style="display: flex; flex-direction: column; gap: 4px; padding: 16px 18px; border-radius: 12px; border: 1px solid #1B1F27; min-width: 0"><span class="lbl">{label}</span><span class="num" style="font-size: 26px; font-weight: 600; color: {col}">{value}</span><span class="lbl" style="font-size: 12px">{sub}</span></div>'

PAST = [
    ("9 to 13 Nov", "This week", None),
    ("2 to 6 Nov", "Wait for the 15m candle to close before entering.", "7 trades · +1.5R"),
    ("26 to 30 Oct", None, "3 trades · −0.4R"),
    ("19 to 23 Oct", "Only trade London and New York. Skip Asia.", "5 trades · +2.2R"),
    ("5 to 9 Oct", "Stop trading after two losses in a day.", "6 trades · −1.8R"),
]
def past_row(w, take, sub):
    if take == "This week":
        return f'<li style="list-style: none; padding: 12px 14px; border-radius: 10px; background: #1B1F27; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 14px; font-weight: 600">{w}</span><span class="lbl" style="font-size: 12px">Open now</span></li>'
    t = (f'<span style="font-size: 13px; color: #C9CED6">“{take}”</span>' if take else '<span style="font-size: 13px; color: #8C939F">Not reviewed</span>')
    return f'<li style="list-style: none"><a href="Review.dc.html" style="display: flex; flex-direction: column; gap: 3px; padding: 12px 14px; border-radius: 10px; text-decoration: none; color: #ECEEF1"><span style="display: flex; justify-content: space-between; gap: 8px"><span style="font-size: 14px; font-weight: 600">{w}</span><span class="lbl" style="font-size: 12px">{sub}</span></span>{t}</a></li>'

# Past weeks: every week you traded. This month and last month in full; older months fold to one row; a year header when the list crosses a year.
NOV = PAST[:2]
OCT = PAST[2:]
SEP = [
    ("21 to 25 Sep", "Mark the Asian range before London opens.", "4 trades · +1.9R"),
    ("14 to 18 Sep", None, "2 trades · +0.6R"),
    ("7 to 11 Sep", "No trades in the first 15 minutes of the session.", "5 trades · +1.2R"),
    ("1 to 4 Sep", None, "3 trades · −0.6R"),
]
OLDER = [("August", "3 weeks · 8 trades · −0.6R"), ("July", "4 weeks · 11 trades · +2.4R"), ("June", "3 weeks · 7 trades · +1.0R"),
         ("April", "2 weeks · 5 trades · −1.2R"), ("March", "4 weeks · 9 trades · +0.4R"), ("January", "2 weeks · 3 trades · −0.5R")]
Y2025 = [("December", "2 weeks · 4 trades · +0.8R"), ("November", "1 week · 2 trades · +0.3R")]

def _mhead(label):
    return f'<li style="list-style: none; padding: 14px 14px 4px"><span class="lbl" style="font-size: 12px; font-weight: 600; letter-spacing: 0.02em">{label}</span></li>'
def _yhead(label):
    return f'<li style="list-style: none; padding: 18px 14px 4px; margin-top: 6px; border-top: 1px solid #1B1F27"><span style="font-size: 13px; font-weight: 600; color: #A3AAB5">{label}</span></li>'
def _fold(month, sub, key=None):
    btn = (f'<button type="button" aria-expanded="{{{{ {key}Exp }}}}" onClick="{{{{ {key}Toggle }}}}" ' if key else '<button type="button" aria-expanded="false" ')
    icon = lambda ic: f'<span style="color: #8C939F; display: flex">{IC[ic]}</span>'
    inner = lambda ic: (f'{btn}style="font: inherit; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 14px; border: 0; border-radius: 10px; background: transparent; color: #ECEEF1; cursor: pointer; text-align: left">'
                        f'<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 14px; font-weight: 600">{month}</span><span class="lbl" style="font-size: 12px">{sub}</span></span>{icon(ic)}</button>')
    if not key:
        return f'<li style="list-style: none">{inner("right")}</li>'
    weeks = "".join(past_row(*p) for p in SEP)
    return (f'<li style="list-style: none">'
            f'<sc-if value="{{{{ {key}Closed }}}}" hint-placeholder-val="{{{{ true }}}}">{inner("right")}</sc-if>'
            f'<sc-if value="{{{{ {key}Open }}}}" hint-placeholder-val="{{{{ false }}}}">{inner("chev")}<ol style="margin: 0; padding: 0 0 0 10px; display: flex; flex-direction: column; gap: 2px; border-left: 1px solid #1B1F27; margin-left: 14px">{weeks}</ol></sc-if>'
            f'</li>')

PAST_HTML = ('<ol style="margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px">'
             + _mhead("November") + "".join(past_row(*p) for p in NOV)
             + _mhead("October") + "".join(past_row(*p) for p in OCT)
             + _mhead("Earlier") + _fold("September", "4 weeks · 14 trades · +3.1R", "sep")
             + "".join(_fold(m, s) for m, s in OLDER)
             + _yhead("2025") + "".join(_fold(m, s) for m, s in Y2025)
             + '</ol>')

REVIEW_SCRIPT = """
renderVals() {
  const o = !!(this.state && this.state.sep);
  return { sepOpen: o, sepClosed: !o, sepExp: o ? 'true' : 'false', sepToggle: () => this.setState({ sep: !o }) };
}
"""

review = f'''
{title_block("Weekly review", "Week of 9 to 13 November", picker())}
<div style="display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-start">
<div style="flex: 999 1 640px; min-width: 0; display: flex; flex-direction: column; gap: 28px">

<div style="display: flex; align-items: baseline; gap: 10px; padding: 14px 16px; border-radius: 12px; border: 1px solid #1B1F27; flex-wrap: wrap">
<span class="lbl" style="font-size: 12px">Last week you said</span><span style="font-size: 14px; color: #ECEEF1">“Wait for the 15m candle to close before entering.”</span>
</div>

<section aria-labelledby="wn" style="display: flex; flex-direction: column; gap: 12px">
<h2 id="wn" style="margin: 0; font-size: 16px; font-weight: 600">The week</h2>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px">
{wnum("Net", fr(wk_net), "In R", rcol(wk_net))}{wnum("Trades taken", str(wk_n), "2 watched · 1 not filled")}{wnum("Plan followed", f"{wk_follow} of {wk_n}", "Trades where you stuck to it")}
</div>
</section>

<section aria-labelledby="wm" style="display: flex; flex-direction: column; gap: 10px">
<h2 id="wm" style="margin: 0; font-size: 16px; font-weight: 600">Mistakes you tagged more than once</h2>
<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; border: 1px solid #1B1F27">
<span style="display: flex; align-items: center; gap: 10px">{pill("Moved stop")}<span class="lbl">GBPUSD 11 Nov, EURJPY 13 Nov</span></span>
<span class="num" style="font-size: 15px; font-weight: 600; color: {LOSS}">{fr(-2.0)}</span>
</div>
</section>

<section aria-labelledby="wc" style="display: flex; flex-direction: column; gap: 12px">
<div style="display: flex; justify-content: space-between; align-items: baseline"><h2 id="wc" style="margin: 0; font-size: 16px; font-weight: 600">Your trades</h2><a href="Main.dc.html" class="meta" style="color: #A3AAB5">Open in trade log</a></div>
<ol style="margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px 14px">{"".join(wcard(w) for w in WK)}</ol>
</section>

<section aria-labelledby="wr" style="display: flex; flex-direction: column; gap: 10px">
<h2 id="wr" style="margin: 0; font-size: 16px; font-weight: 600">Your reflections</h2>
<ul style="margin: 0; padding: 0; display: flex; flex-direction: column">{"".join(f'<li style="list-style: none; padding: 12px 0; border-top: 1px solid #1B1F27; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 14px; color: #ECEEF1">“{t}”</span><span class="lbl" style="font-size: 12px">{p} · {d}</span></li>' for t, p, d in REFL)}</ul>
</section>

<section aria-labelledby="wt" style="display: flex; flex-direction: column; gap: 10px; padding: 18px 20px; border-radius: 14px; background: #15181E; border: 1px solid #252A33">
<label for="takeaway" id="wt" style="font-size: 16px; font-weight: 600">What I'll do differently next week</label>
<textarea id="takeaway" rows="2" placeholder="One thing, in your own words" style="font: inherit; font-size: 15px; line-height: 1.5; color: #ECEEF1; background: #0E1014; border: 1px solid #2E343E; border-radius: 10px; padding: 10px 12px; resize: vertical">Leave the stop where I planned it. No moving it to breakeven before 1R.</textarea>
<span class="lbl" style="font-size: 12px">Saved. It shows on your dashboard all next week.</span>
</section>
</div>

<aside aria-labelledby="pw" style="flex: 1 1 260px; min-width: 0; display: flex; flex-direction: column; gap: 8px">
<h2 id="pw" style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #A3AAB5">Past weeks</h2>
{PAST_HTML}
<p class="lbl" style="margin: 4px 0 0; font-size: 12px">Every week you traded is here. Weeks you didn't trade don't appear.</p>
</aside>
</div>
'''

# Dashboard: this week's takeaway sits above the numbers
_tk = ('<section aria-label="This week\'s focus" style="display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; padding: 14px 18px; border-radius: 12px; border: 1px solid #1B1F27">'
       '<span class="lbl" style="font-size: 12px">This week\'s focus</span>'
       '<span style="font-size: 15px; color: #ECEEF1">“Leave the stop where I planned it. No moving it to breakeven before 1R.”</span>'
       '<a href="Review.dc.html" class="lbl" style="font-size: 12px; color: #A3AAB5; margin-left: auto">From your review of 9 to 13 Nov</a></section>')
assert dashboard.count(TILES) == 1
dashboard = dashboard.replace(TILES, _tk + "\n" + TILES)
dashboard = dashboard.replace("Your <a href=\"Review.dc.html\">weekly review</a> on Saturday looks at why.", "Your <a href=\"Review.dc.html\">weekly review</a> is where you decide what to change.")

# Copy elsewhere
startpage = startpage.replace("A 10-minute review: your biggest leak, what's working, one rule to test.", "A short look back at your week's charts and reflections, and one thing to do differently. Only if you traded.")
settings = settings.replace("It's ready that morning, covering the 5 trading days before.", "One reminder that day, only if you traded that week.")
_a = states.index('<section style="display: flex; flex-direction: column; gap: 12px"><span class="lbl">Weekly review · first week</span>')
_b = states.index('</section>', _a) + len('</section>')
states = states[:_a] + states[_b:]

