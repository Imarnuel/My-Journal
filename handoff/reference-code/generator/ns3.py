# NEW CHART STORY v4: designed with care, not stripped.
# Same shape as the chart story page (charts left, a calm panel right), so what you create is what you'll later read.
# Structure: one big chart to look at, a labelled trade panel, the note, and a Save that is always in view.
# Executed after ns2.py.

def thumb(chart, caption, name, selected=False, menu=False):
    ring = "box-shadow: 0 0 0 2px #ECEEF1;" if selected else ""
    if menu:
        btn = (f'<button type="button" aria-label="Actions for {name} chart" aria-haspopup="menu" onClick="{{{{ toggleMenu }}}}" style="width: 26px; height: 22px; border: 0; border-radius: 6px; background: transparent; color: #8C939F; cursor: pointer; font-size: 13px; letter-spacing: 1px; padding: 0">···</button>')
        more = f'<span style="position: relative; display: inline-flex">{btn}<sc-if value="{{{{ menuOpen }}}}" hint-placeholder-val="{{{{ false }}}}">{CHART_MENU(name)}</sc-if></span>'
    else:
        more = f'<button type="button" aria-label="Actions for {name} chart" aria-haspopup="menu" style="width: 26px; height: 22px; border: 0; border-radius: 6px; background: transparent; color: #8C939F; cursor: pointer; font-size: 13px; letter-spacing: 1px; padding: 0">···</button>'
    cap = f'<span class="lbl" style="font-size: 12px">{caption}</span>' if caption else '<span></span>'
    return (f'<figure draggable="true" aria-roledescription="Draggable chart" style="margin: 0; display: flex; flex-direction: column; gap: 4px; min-width: 0; cursor: grab">'
            f'<button type="button" aria-label="Show {name} chart" aria-pressed="{"true" if selected else "false"}" class="chart" style="display: block; padding: 0; border: 0; cursor: pointer; {ring}">{chart}</button>'
            f'<figcaption style="display: flex; justify-content: space-between; align-items: center; min-height: 22px">{cap}{more}</figcaption></figure>')

ADD_T = f'<button type="button" aria-label="Add or paste another chart" style="font: inherit; border: 1.5px dashed #353B46; border-radius: 8px; background: transparent; color: #8C939F; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 12px; aspect-ratio: 16 / 9">{IC["plus"]}Add</button>'

def charts_col(menu):
    return f'''<section aria-label="Charts" style="flex: 3 1 520px; min-width: 0; display: flex; flex-direction: column; gap: 14px">
<figure style="margin: 0; display: flex; flex-direction: column; gap: 8px">
<div class="chart" style="border-radius: 12px">{GU["E"]}</div>
<figcaption style="display: flex; justify-content: space-between; align-items: baseline"><span class="lbl">15m</span><span class="lbl">4 of 4</span></figcaption>
</figure>
<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; align-items: start">
{thumb(GU["W"], "Weekly", "first")}{thumb(GU["D"], "", "second")}{thumb(GU["4H"], "4H", "third", menu=menu)}{thumb(GU["E"], "15m", "fourth", selected=True)}{ADD_T}
</div>
<p class="lbl" style="margin: 0">Drag to change the order. Paste or drop more any time.</p>
</section>'''

def prow(label, value_html, last=False):
    return (f'<div style="display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 12px; align-items: center; min-height: 52px; border-top: 1px solid #1B1F27">'
            f'<span class="lbl" style="font-size: 13px">{label}</span><div style="min-width: 0">{value_html}</div></div>')

def ghost(value, label):
    return f'<input class="ghost" type="text" aria-label="{label}" value="{value}" style="margin: 0; width: 100%; box-sizing: border-box; padding: 0 10px; font-size: 15px; font-weight: 500; min-height: 40px">'

def dd(value, label, hole=None, sub=""):
    on = f' onClick="{{{{ {hole} }}}}"' if hole else ""
    s = f'<span style="font-size: 12px; color: #8C939F; font-weight: 400">{sub}</span>' if sub else ""
    return (f'<button type="button" aria-haspopup="listbox" aria-label="{label}: {value}"{on} class="ghost" style="width: 100%; box-sizing: border-box; padding: 4px 10px; margin: 0; display: flex; justify-content: space-between; align-items: center; gap: 10px; text-align: left; cursor: pointer; min-height: 40px">'
            f'<span style="display: flex; flex-direction: column; gap: 1px"><span style="font-size: 15px; font-weight: 500">{value}</span>{s}</span><span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>')

def panel(typed_text=""):
    status = (f'<span style="position: relative; display: block">{dd("Taken", "Status", "toggleStatus", "Counts in your results")}'
              f'<sc-if value="{{{{ statusOpen }}}}" hint-placeholder-val="{{{{ false }}}}">{status_menu()}</sc-if></span>')
    talk = f'''<sc-if value="{{{{ talk }}}}" hint-placeholder-val="{{{{ {"false" if typed_text else "true"} }}}}"><div style="display: flex; flex-direction: column; gap: 8px">
<button type="button" aria-label="Record your note" style="font: inherit; text-align: left; display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 16px; border-radius: 12px; background: #0E1014; border: 1px solid #252A33; color: #ECEEF1; cursor: pointer">
<span style="flex: none; width: 44px; height: 44px; border-radius: 22px; background: #B9A6FF; color: #0E1014; display: flex; align-items: center; justify-content: center">{IC["mic"]}</span>
<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 15px; font-weight: 600">Talk it through</span><span class="meta" style="font-size: 13px">Why you took it, how you felt. Tags fill in from what you say.</span></span>
</button>
<button type="button" class="btn btn-q" style="align-self: flex-start; padding: 0 2px; min-height: 30px; font-size: 13px" onClick="{{{{ toType }}}}">Type instead</button>
</div></sc-if>'''
    typing = f'''<sc-if value="{{{{ typing }}}}" hint-placeholder-val="{{{{ {"true" if typed_text else "false"} }}}}"><div style="display: flex; flex-direction: column; gap: 8px">
<textarea aria-label="Your note" rows="5" placeholder="Why you took it, how you felt, what happened" style="font: inherit; font-size: 15px; line-height: 1.5; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 12px; padding: 12px 14px; resize: vertical">{typed_text}</textarea>
<button type="button" class="btn btn-q" style="align-self: flex-start; padding: 0 2px; min-height: 30px; font-size: 13px" onClick="{{{{ toTalk }}}}">{IC["mic"]}Record instead</button>
</div></sc-if>'''
    return f'''<aside aria-label="Trade and note" style="flex: 2 1 360px; min-width: 0; position: sticky; top: 24px; display: flex; flex-direction: column; background: #15181E; border: 1px solid #252A33; border-radius: 16px; overflow: visible">
<div style="padding: 18px 20px 6px; display: flex; justify-content: space-between; align-items: baseline; gap: 8px"><h2 style="margin: 0; font-size: 16px; font-weight: 600">Trade</h2><span class="lbl" style="font-size: 12px">Filled from your charts and MT5</span></div>
<div style="padding: 0 20px">
{prow("Pair", ghost("GBPUSD", "Pair"))}
{prow("Direction", seg("Direction", ["Long", "Short"], "Short"))}
{prow("Status", status)}
{prow("Account", dd("Funded 100K", "Account"))}
{prow("When", ghost("Mon 16 Nov, 09:45", "Date and time"))}
</div>
<div style="padding: 16px 20px 20px; border-top: 1px solid #252A33; margin-top: 6px; display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; justify-content: space-between; align-items: baseline"><h2 style="margin: 0; font-size: 16px; font-weight: 600">Note</h2><span class="lbl" style="font-size: 12px">Optional</span></div>
{talk}{typing}
</div>
<div style="padding: 16px 20px; border-top: 1px solid #252A33; display: flex; align-items: center; gap: 10px">
<a href="Main.dc.html" class="btn btn-q">Cancel</a><a href="Story.dc.html" class="btn btn-p" style="flex: 1; justify-content: center">Save story</a>
</div>
</aside>'''

def ns_page4(menu, typed_text=""):
    return f'''
{BACK("Main.dc.html", "Trade log")}
{title_block("New chart story", "One trade, watched setup or analysis at a time.")}
<div style="display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-start">
{charts_col(menu)}
{panel(typed_text)}
</div>
'''

newstory = ns_page4(True)
newstory_typed = ns_page4(False, "Weekly and daily bearish. 4H tapped last week's supply, waited for the 15m break and got in on the retest. Felt calm.")
