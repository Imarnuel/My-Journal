# NEW CHART STORY v5: back to the plan. You drop the charts and talk; your note fills the tags.
# Right panel in the order you use it: your note, the tags it fills, the trade facts read from charts and MT5, Save.
# Frame 3 = before your note (tags waiting). Frame 3b = after your note (tags filled, voice dots).
# Executed after ns3.py (reuses charts_col and status_menu).

WAIT = '<span style="display: block; font-size: 14px; color: #5A6170; padding-left: 0">From your note</span>'
NONE_SAID = '<span style="display: block; font-size: 14px; color: #8C939F; padding-left: 0">None mentioned</span>'

def factline():
    sep = '<span aria-hidden="true" style="color: #4A515E">·</span>'
    def f(t, hole=None, label=""):
        on = f' onClick="{{{{ {hole} }}}}"' if hole else ""
        return (f'<button type="button" aria-haspopup="listbox" aria-label="{label}: {t}"{on} style="font: inherit; font-size: 14px; font-weight: 500; color: #ECEEF1; background: transparent; border: 0; border-bottom: 1px dashed #4A515E; padding: 2px 0; cursor: pointer">{t}</button>')
    status = f'<span style="position: relative; display: inline-flex">{f("Taken", "toggleStatus", "Status")}<sc-if value="{{{{ statusOpen }}}}" hint-placeholder-val="{{{{ false }}}}">{status_menu()}</sc-if></span>'
    return ('<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px">'
            + sep.join([f("GBPUSD", label="Pair"), f("Short", label="Direction"), status, f("Funded 100K", label="Account"), f("Mon 16 Nov, 09:45", label="Date and time")])
            + '</div>')

def _numin(label, value):
    return (f'<label style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><span class="lbl" style="font-size: 12px">{label}</span>'
            f'<input class="ghost num" type="text" value="{value}" placeholder="Type it" style="margin: 0; width: 100%; box-sizing: border-box; padding: 0 8px; font-size: 14px; font-weight: 600; min-height: 34px"></label>')
NUMBERS = ('<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; font-size: 13px; color: #A3AAB5; padding-top: 4px">'
           '<span class="num">Entry 1.26840</span><span class="num">Stop 1.27010</span><span class="num">Target 1.26480</span><span class="num">Exit 1.26482</span>'
           '<span class="num" style="color: #5BA2FF; font-weight: 600">+2.1R</span>'
           '<button type="button" class="btn btn-q" onClick="{{ toggleNums }}" style="min-height: 28px; padding: 0 4px; font-size: 13px">Edit numbers</button></div>'
           '<sc-if value="{{ numOpen }}" hint-placeholder-val="{{ false }}"><div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 10px; padding-top: 6px">'
           + _numin("Entry", "1.26840") + _numin("Stop", "1.27010") + _numin("Target", "1.26480") + _numin("Exit", "1.26482") + _numin("Size", "0.50 lots") + _numin("Result", "+2.1R")
           + '</div></sc-if>')

def note_before():
    return f"""<div style="display: flex; flex-direction: column; gap: 14px">
<button type="button" aria-label="Record your note" style="font: inherit; text-align: left; display: flex; align-items: center; gap: 14px; width: 100%; padding: 16px; border-radius: 12px; background: #0E1014; border: 1px solid #353B46; color: #ECEEF1; cursor: pointer">
<span style="flex: none; width: 48px; height: 48px; border-radius: 24px; background: #B9A6FF; color: #0E1014; display: flex; align-items: center; justify-content: center">{IC["mic"]}</span>
<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 16px; font-weight: 600">Talk it through</span><span class="meta" style="font-size: 13px">Why you took it and how it went. It fills both notes and your tags.</span></span>
</button>
{nblock("Before / during", "", ph="Fills from your note, or write it yourself")}
{nblock("Reflection", "", ph="Fills from your note, or write it yourself")}
</div>"""

def nblock(label, text, suggested=False, cpl=46, ph=""):
    tag = ('<span style="font-size: 11px; font-weight: 600; color: #B9A6FF; border: 1px solid #4A3F75; border-radius: 5px; padding: 0 6px; line-height: 1.6">Suggested</span>' if suggested else "")
    acts = ('<div style="display: flex; gap: 4px; align-items: center"><span class="lbl" style="font-size: 12px">Inferred from your note</span>'
            '<button type="button" class="btn btn-q" style="min-height: 28px; padding: 0 6px; font-size: 13px">Keep</button>'
            '<button type="button" class="btn btn-q" style="min-height: 28px; padding: 0 6px; font-size: 13px; color: #8C939F">Delete</button></div>') if suggested else ""
    return (f'<div style="display: flex; flex-direction: column; gap: 4px">'
            f'<div style="display: flex; align-items: center; gap: 8px"><span class="lbl" style="font-size: 12px; font-weight: 600; color: #A3AAB5">{label}</span>{tag}</div>'
            f'<textarea class="ghost" aria-label="{label}" rows="{max(2 if not text else 1, -(-len(text) // cpl))}" placeholder="{ph}" style="border: 1px solid #2E343E; background: #0E1014; border-radius: 10px; cursor: text; margin: 0; width: 100%; box-sizing: border-box; font: inherit; font-size: 14px; line-height: 1.55; color: #ECEEF1; padding: 10px 12px; resize: vertical; min-height: 0">{text}</textarea>{acts}</div>')

def notes_block(before, refl, suggested, transcript, length="0:24", cpl=72):
    return f"""<div style="display: flex; flex-direction: column; gap: 12px">
{nblock("Before / during", before, cpl=cpl)}
{nblock("Reflection", refl, suggested, cpl=cpl)}
<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding-top: 4px">
<button type="button" aria-label="Play your voice note" style="flex: none; width: 28px; height: 28px; border-radius: 14px; border: 0; background: #ECEEF1; color: #0E1014; display: flex; align-items: center; justify-content: center; cursor: pointer">{IC["play"]}</button>
<span class="lbl" style="font-size: 12px">From your {length} voice note</span>
<button type="button" class="btn btn-q" onClick="{{{{ toggleNote }}}}" style="min-height: 28px; padding: 0 6px; font-size: 13px">What you said</button>
<button type="button" class="btn btn-q" aria-label="Re-record your voice note" title="Re-record" style="margin-left: auto; min-height: 28px; padding: 0 6px; font-size: 13px">{IC["mic"]}</button>
</div>
<sc-if value="{{{{ noteLong }}}}" hint-placeholder-val="{{{{ false }}}}"><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #A3AAB5; padding: 10px 12px; border-radius: 10px; background: #0E1014">{transcript}</p></sc-if>
</div>"""

NOTE_AFTER = notes_block(
    "Short from last week's 4H supply zone with weekly and daily bearish. Entered on the 15m retest after a break of structure, on plan.",
    "Waiting for the candle to close kept the entry calm and on plan. Worth repeating.",
    True,
    f'"Weekly and daily both bearish, so I took the {mk("4H supply pullback")}. Price came into last week\'s {mk("supply zone")}, the fifteen minute {mk("broke structure")}, I waited for the candle to close and got in on the {mk("retest")}. {mk("Stuck to my plan")}. Felt {mk("calm")}, didn\'t rush it."')

KIND = {"good": ("rgba(91,162,255,0.14)", "#B4D3FF", "good"), "mistake": ("rgba(255,154,77,0.15)", "#FFC199", "mistake"), "neutral": (None, None, "neutral")}
def kpill(t, kind="neutral"):
    bg, fg, name = KIND[kind]
    p = pill(t, x=True)
    if bg:
        p = p.replace('<span class="pill">', f'<span class="pill" title="{t} ({name})" style="background: {bg}; color: {fg}">', 1)
    return p
TAG_SUGGEST = [("Li", "quidity sweep", 14), ("Li", "quidity grab", 3)]
def tag_menu():
    rows = "".join(
        f'<button type="button" role="option" aria-selected="{"true" if k == 0 else "false"}" style="font: inherit; font-size: 13px; text-align: left; display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #ECEEF1; background: {"#1B1F27" if k == 0 else "transparent"}; border: 0; border-radius: 6px; padding: 0 8px; min-height: 36px; cursor: pointer">'
        f'<span><b style="font-weight: 700">{a}</b>{b}</span><span style="font-size: 12px; color: #8C939F">used {n} times</span></button>'
        for k, (a, b, n) in enumerate(TAG_SUGGEST))
    return ('<div role="listbox" aria-label="Matching tags" style="position: absolute; z-index: 7; top: calc(100% + 6px); left: 0; right: 0; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 10px; box-shadow: 0 16px 36px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 2px">'
            + rows + '<button type="button" role="option" style="font: inherit; font-size: 13px; text-align: left; color: #A3AAB5; background: transparent; border: 0; border-radius: 6px; padding: 0 8px; min-height: 36px; cursor: pointer">Add "li" as a new tag</button></div>')

def etags(label, items, ph):
    pills = "".join(kpill(*i) if isinstance(i, tuple) else pill(i, x=True) for i in items)
    if label != "Tags":
        return (f'<div class="ghost tagfield" role="group" aria-label="{label}" style="cursor: text; flex-wrap: wrap">{pills}'
                f'<input type="text" aria-label="Add to {label.lower()}" placeholder="{ph}" style="flex: 1; min-width: 90px; font: inherit; font-size: 13px; color: #ECEEF1; background: transparent; border: 0; outline: none; padding: 3px 0"></div>')
    return (f'<div style="position: relative">'
            f'<div class="ghost tagfield" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-label="{label}" style="cursor: text; flex-wrap: wrap">{pills}'
            f'<input type="text" aria-label="Add a tag" aria-autocomplete="list" placeholder="{"" if items else ph}" onClick="{{{{ toggleTagSug }}}}" style="flex: 1; min-width: 90px; font: inherit; font-size: 13px; color: #ECEEF1; background: transparent; border: 0; outline: none; padding: 3px 0"></div>'
            f'<sc-if value="{{{{ tagSug }}}}" hint-placeholder-val="{{{{ false }}}}">{tag_menu()}</sc-if></div>')

newstory_script = newstory_script.replace("statusOpen: !!st.statusOpen,", "statusOpen: !!st.statusOpen, numOpen: !!st.numOpen, toggleNums: () => this.setState({ numOpen: !st.numOpen }), tagSug: !!st.tagSug, toggleTagSug: () => this.setState({ tagSug: !st.tagSug }),")
NEWTAG = ('<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 8px 0 4px 10px; font-size: 13px; color: #A3AAB5">'
          'New from your note: <span class="pill" style="background: transparent; border: 1px dashed #4A515E">Retest</span>'
          '<button type="button" class="btn btn-q" style="min-height: 28px; padding: 0 6px; font-size: 13px">Add as tag</button>'
          '<button type="button" class="btn btn-q" style="min-height: 28px; padding: 0 6px; font-size: 13px; color: #8C939F">Ignore</button></div>')

def pick_empty(label, ph):
    return (f'<button type="button" class="ghost tagfield" aria-haspopup="listbox" aria-label="{label}: none yet" style="justify-content: space-between">'
            f'<span style="font-size: 14px; color: #8C939F">{ph}</span><span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>')

def tag_rows(after):
    if not after:
        return (row("Setup", pick_empty("Setup", "Pick a setup"), None, raw=True)
                + row("Tags", etags("Tags", [], "Add a tag"), None, raw=True)
                + row("Plan", seg("Plan", ["Followed", "Not followed"], ""), None, raw=True)
                + row("Headspace", pick_empty("Headspace", "Pick one"), None, raw=True))
    return (row("Setup", pick("Setup", "4H supply pullback"), "voice", raw=True)
            + row("Tags", etags("Tags", ["Supply zone", "Break of structure", "Retest"], "Add a tag"), "voice", raw=True)
            + row("Plan", seg("Plan", ["Followed", "Not followed"], "Followed"), "voice", raw=True)
            + row("Headspace", pick("Headspace", "Calm"), "voice", raw=True))

def panel5(after):
    head_r = '<span class="lbl" style="font-size: 12px">From your note · tap any to change</span>' if after else '<span class="lbl" style="font-size: 12px">From your note, or set them yourself</span>'
    return f'''<aside aria-label="Details" style="flex: 2 1 380px; min-width: 0; position: sticky; top: 24px; display: flex; flex-direction: column; background: #15181E; border: 1px solid #252A33; border-radius: 16px">
<section aria-labelledby="th" style="padding: 18px 20px 12px; display: flex; flex-direction: column; gap: 4px">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding-bottom: 6px"><h2 id="th" style="margin: 0; font-size: 16px; font-weight: 600">Details</h2>{head_r}</div>
<dl style="margin: 0; display: flex; flex-direction: column">{tag_rows(after)}</dl>
</section>
<section aria-label="Trade" style="padding: 16px 20px; border-top: 1px solid #252A33; display: flex; flex-direction: column; gap: 8px">
<span class="lbl" style="font-size: 12px">Read from your charts and MT5 · tap anything to change</span>
{factline()}
{NUMBERS}
</section>
<div style="padding: 16px 20px; border-top: 1px solid #252A33; display: flex; align-items: center; gap: 10px">
<a href="Main.dc.html" class="btn btn-q">Cancel</a><a href="Story.dc.html" class="btn btn-p" style="flex: 1; justify-content: center">Save story</a>
</div>
</aside>'''

def ns_page5(after):
    return f'''
{BACK("Main.dc.html", "Trade log")}
{title_block("New chart story", "Drop the charts and talk it through. Your note fills the tags.")}
<div style="display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-start">
<div style="flex: 3 1 520px; min-width: 0; display: flex; flex-direction: column; gap: 20px">
{charts_col(not after).replace("flex: 3 1 520px; min-width: 0; ", "min-width: 0; ", 1)}
<section aria-labelledby="nh" style="display: flex; flex-direction: column; gap: 12px; padding: 18px 20px 20px; background: #15181E; border: 1px solid #252A33; border-radius: 16px">
<div style="display: flex; justify-content: space-between; align-items: baseline"><h2 id="nh" style="margin: 0; font-size: 16px; font-weight: 600">Notes</h2><span class="lbl" style="font-size: 12px">Optional</span></div>
{NOTE_AFTER if after else note_before()}
</section>
</div>
{panel5(after)}
</div>
'''

newstory = ns_page5(False)
newstory_typed = ns_page5(True)
newstory_typed_script = newstory_script

# ---- Notes collapse to two lines; click to expand ----
def clamp_note(text_html, size=14):
    base = f"margin: 0; font-size: {size}px; line-height: 1.65; color: #C9CED6; cursor: pointer"
    short = (f'<sc-if value="{{{{ noteShort }}}}" hint-placeholder-val="{{{{ true }}}}"><div style="display: flex; flex-direction: column; gap: 4px">'
             f'<p onClick="{{{{ toggleNote }}}}" style="{base}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden">{text_html}</p>'
             f'<button type="button" class="btn btn-q" onClick="{{{{ toggleNote }}}}" aria-expanded="false" style="align-self: flex-start; padding: 0 2px; min-height: 28px; font-size: 13px">Show all</button></div></sc-if>')
    full = (f'<sc-if value="{{{{ noteLong }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 4px">'
            f'<p onClick="{{{{ toggleNote }}}}" style="{base}">{text_html}</p>'
            f'<button type="button" class="btn btn-q" onClick="{{{{ toggleNote }}}}" aria-expanded="true" style="align-self: flex-start; padding: 0 2px; min-height: 28px; font-size: 13px">Show less</button></div></sc-if>')
    return short + full

import re as _re
_m = _re.search(r'<div style="display: flex; flex-direction: column; gap: 12px; padding-top: 8px">.*?</p>\n</div>', storypage, _re.S)
assert _m
_STORY_NOTES = ('<section aria-labelledby="snh" style="display: flex; flex-direction: column; gap: 10px; padding: 18px 20px; background: #15181E; border: 1px solid #252A33; border-radius: 14px"><h2 id="snh" style="margin: 0; font-size: 16px; font-weight: 600">Notes</h2>' + notes_block(
    "Short from last week's 4H supply zone with weekly and daily bearish. Entered on the 15m retest after a break of structure, on plan.",
    "Patience paid off: no rushing, held to target. Bring the same patience to Gold.",
    False,
    f'"Weekly and daily both bearish. 4H pulled back into last week\'s {mk("supply zone")}. Waited for the fifteen minute {mk("break of structure")} and got in on the retest. Felt {mk("calm")}, didn\'t rush it. Left it alone and it hit target. Next time I want the same patience on Gold."', cpl=72) + '</section>')
storypage = storypage.replace(_m.group(0), _STORY_NOTES)
_cap = '<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap"><h2 id="cap" style="margin: 0; font-size: 16px; font-weight: 600">What we captured</h2><span class="lbl">Change anything that looks off</span></div>'
assert storypage.count(_cap) == 1
storypage = storypage.replace(_cap, '<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap"><h2 id="cap" style="margin: 0; font-size: 16px; font-weight: 600">Details</h2><span class="lbl">Tap anything to change</span></div>')
storypage = storypage.replace(row("Lesson", "Same patience on Gold", "voice"), "")

_NOTE_JS = 'noteShort: !st.noteOpen, noteLong: !!st.noteOpen, toggleNote: () => this.setState({ noteOpen: !st.noteOpen }),'
newstory_typed_script = newstory_script.replace("return { talk: !t,", "return { " + _NOTE_JS + " talk: !t,")
story_script = """
renderVals() {
  const st = this.state || {};
  return { """ + _NOTE_JS + """ };
}
"""

# Trade details on the chart story page: 3 columns so prices aren't cut off
_a = 'grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px 20px; padding: 16px 20px; border: 1px solid #1B1F27'
assert storypage.count(_a) == 1
storypage = storypage.replace(_a, 'grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 20px; padding: 16px 20px; border: 1px solid #1B1F27')

# Chart story page: no separate Mistakes field; mistakes are tags of the Mistake kind
_a = row("Mistakes", tags("Mistakes", [], "None mentioned · add any"), None, raw=True)
assert storypage.count(_a) == 1
storypage = storypage.replace(_a, "")


_a = '<label style="display: flex; flex-direction: column; gap: 4px"><span class="lbl">Planned</span><input class="ghost num" type="text" value="1 : 2.1" style="font-weight: 600; font-size: 15px"></label>'
assert storypage.count(_a) == 1
storypage = storypage.replace(_a, _a + '<label style="display: flex; flex-direction: column; gap: 4px"><span class="lbl">Result</span><input class="ghost num" type="text" value="+2.1R" style="font-weight: 600; font-size: 15px; color: #5BA2FF"></label>')
storypage = storypage.replace("Trade details · from MT5 and your position tool", "Trade details · from MT5 and your position tool, or typed by you")
