# NEW CHART STORY v3: calm, three things in order. Charts, a sentence you can tap, your note, Save.
# Executed last. Replaces newstory, newstory_typed and their scripts.

def ns_tile(chart, caption, name, menu=False):
    cap = f'<span class="lbl">{caption}</span>' if caption else '<span></span>'
    if menu:
        btn = (f'<button type="button" aria-label="Actions for {name} chart" aria-haspopup="menu" onClick="{{{{ toggleMenu }}}}" style="width: 28px; height: 24px; border: 0; border-radius: 6px; background: transparent; color: #8C939F; cursor: pointer; font-size: 14px; letter-spacing: 1px; padding: 0">···</button>')
        more = f'<span style="position: relative; display: inline-flex">{btn}<sc-if value="{{{{ menuOpen }}}}" hint-placeholder-val="{{{{ false }}}}">{CHART_MENU(name)}</sc-if></span>'
    else:
        more = f'<button type="button" aria-label="Actions for {name} chart" aria-haspopup="menu" style="width: 28px; height: 24px; border: 0; border-radius: 6px; background: transparent; color: #8C939F; cursor: pointer; font-size: 14px; letter-spacing: 1px; padding: 0">···</button>'
    return (f'<figure draggable="true" aria-roledescription="Draggable chart" style="margin: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0; cursor: grab">'
            f'<div class="chart">{chart}</div>'
            f'<figcaption style="display: flex; justify-content: space-between; align-items: center; gap: 6px; min-height: 22px">{cap}{more}</figcaption></figure>')

NS_ADD = f'<button type="button" aria-label="Add or paste another chart" style="font: inherit; border: 1.5px dashed #353B46; border-radius: 8px; background: transparent; color: #8C939F; cursor: pointer; display: flex; align-items: center; justify-content: center; aspect-ratio: 16 / 9">{IC["plus"]}</button>'

def ns_charts(menu):
    return ('<section aria-label="Charts, in the order you added them" style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; align-items: start">'
            + ns_tile(GU["W"], "Weekly", "first") + ns_tile(GU["D"], "", "second") + ns_tile(GU["4H"], "4H", "third", menu=menu)
            + ns_tile(GU["E"], "15m", "fourth") + NS_ADD + '</section>')

def schip(text, hole=None):
    on = f' onClick="{{{{ {hole} }}}}"' if hole else ""
    return (f'<button type="button" aria-haspopup="listbox"{on} style="font: inherit; display: inline-flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 500; color: #ECEEF1; background: #15181E; border: 1px solid #252A33; border-radius: 9px; padding: 0 10px 0 12px; min-height: 38px; cursor: pointer">'
            f'{text}<span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>')

CHK = '<span style="display: flex">' + IC["check"] + '</span>'
def status_menu():
    opts = (("Taken", "Counts in your results"), ("Watched", "You saw it, didn't take it"), ("Not filled", "Order never triggered"), ("Analysis", "Charts before trading"))
    rows = "".join(
        f'<button type="button" role="option" aria-selected="{"true" if o == "Taken" else "false"}" style="font: inherit; text-align: left; display: flex; justify-content: space-between; align-items: center; gap: 12px; color: #ECEEF1; background: {"#1B1F27" if o == "Taken" else "transparent"}; border: 0; border-radius: 8px; padding: 8px 12px; cursor: pointer">'
        f'<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 14px; font-weight: 500">{o}</span><span style="font-size: 12px; color: #8C939F">{h}</span></span>'
        f'{CHK if o == "Taken" else ""}</button>' for o, h in opts)
    return f'<div role="listbox" aria-label="Status" style="position: absolute; z-index: 6; top: calc(100% + 6px); left: 0; width: 250px; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 12px; box-shadow: 0 20px 48px rgba(0,0,0,0.55); display: flex; flex-direction: column; gap: 2px">{rows}</div>'

SUMMARY = f'''<section aria-label="What we read" style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
{schip("GBPUSD")}{schip("Short")}
<span style="position: relative; display: inline-flex">{schip("Taken", "toggleStatus")}<sc-if value="{{{{ statusOpen }}}}" hint-placeholder-val="{{{{ false }}}}">{status_menu()}</sc-if></span>
{schip("Funded 100K")}{schip("Mon 16 Nov, 09:45")}
</div>
<p class="lbl" style="margin: 0">Read from your charts and MT5. Tap anything that's wrong.</p>
</section>'''

def note(typed_text=""):
    ta = (f'<textarea aria-label="Your note" rows="4" placeholder="Why you took it, how you felt, what happened" style="font: inherit; font-size: 15px; line-height: 1.5; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 12px; padding: 14px 16px; resize: vertical">{typed_text}</textarea>')
    return f'''<section aria-label="Your note" style="display: flex; flex-direction: column; gap: 10px">
<sc-if value="{{{{ talk }}}}" hint-placeholder-val="{{{{ {"false" if typed_text else "true"} }}}}"><div style="display: flex; flex-direction: column; gap: 10px">
<button type="button" aria-label="Record your note" style="font: inherit; text-align: left; display: flex; align-items: center; gap: 16px; width: 100%; padding: 18px 20px; border-radius: 14px; background: #15181E; border: 1px solid #252A33; color: #ECEEF1; cursor: pointer">
<span style="flex: none; width: 52px; height: 52px; border-radius: 26px; background: #B9A6FF; color: #0E1014; display: flex; align-items: center; justify-content: center">{IC["mic"]}</span>
<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 16px; font-weight: 600">Talk it through</span><span class="meta">Optional. Why you took it and how it went.</span></span>
</button>
<button type="button" class="btn btn-q" style="align-self: flex-start; padding: 0 4px; min-height: 32px; font-size: 13px" onClick="{{{{ toType }}}}">Type instead</button>
</div></sc-if>
<sc-if value="{{{{ typing }}}}" hint-placeholder-val="{{{{ {"true" if typed_text else "false"} }}}}"><div style="display: flex; flex-direction: column; gap: 10px">
{ta}
<button type="button" class="btn btn-q" style="align-self: flex-start; padding: 0 4px; min-height: 32px; font-size: 13px" onClick="{{{{ toTalk }}}}">{IC["mic"]}Record instead</button>
</div></sc-if>
</section>'''

def ns_page(menu, typed_text=""):
    return f'''
<div style="max-width: 760px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 32px">
<div style="display: flex; flex-direction: column; gap: 14px">{BACK("Main.dc.html", "Trade log")}<h1 style="margin: 0; font-family: Geist, sans-serif; font-size: 28px; font-weight: 600; line-height: 1.2">New chart story</h1></div>
{ns_charts(menu)}
{SUMMARY}
{note(typed_text)}
<div style="display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px"><a href="Main.dc.html" class="btn btn-q">Cancel</a><a href="Story.dc.html" class="btn btn-p" style="min-width: 160px; justify-content: center">Save</a></div>
</div>
'''

newstory = ns_page(True)
newstory_typed = ns_page(False, "Weekly and daily bearish. 4H tapped last week's supply, waited for the 15m break and got in on the retest. Felt calm.")
newstory_script = """
renderVals() {
  const st = this.state || {};
  const t = !!st.typing;
  return { talk: !t, typing: t, toType: () => this.setState({ typing: true }), toTalk: () => this.setState({ typing: false }),
           menuOpen: !!st.menu, toggleMenu: () => this.setState({ menu: !st.menu, statusOpen: false }),
           statusOpen: !!st.statusOpen, toggleStatus: () => this.setState({ statusOpen: !st.statusOpen, menu: false }) };
}
"""
newstory_typed_script = newstory_script.replace("const t = !!st.typing;", "const t = st.typing !== false;")
