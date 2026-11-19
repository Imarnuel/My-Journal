# CHART STORY FORM v2: one component for New chart story (empty and filled) and the saved Chart story.
# Same layout, same behaviour everywhere; only the starting state and the footer differ.
# Behaviour: the voice note pre-fills only what you haven't set yourself; every field can be set by hand;
# charts reorder by drag or menu; tags autocomplete from tags you've used, new tags ask their kind once;
# destructive actions show a toast with Undo.
import json as _sj, collections as _sc

def _gsym(k, svg):
    inner = svg[svg.index(">") + 1: svg.rindex("</svg>")]
    return f'<symbol id="g{k}" viewBox="0 0 320 180">{inner}</symbol>'
GSYMS = ('<svg aria-hidden="true" width="0" height="0" style="position: absolute; width: 0; height: 0; overflow: hidden"><defs>'
         + "".join(_gsym(k, GU[k]) for k in ("W", "D", "4H", "E", "A")) + '</defs></svg>')

_tc = _sc.Counter(t for e in ENTRIES for t in e["tags"])
_tc.update({"Liquidity grab": 3})
_kind = {t: "Mistake" for t in MISTAKES}
_kind.update({t: "Neutral" for t in NEUTRAL_TAGS})
VOCAB = [{"t": t, "n": n, "k": _kind.get(t, "Good")} for t, n in _tc.most_common()]

SETUPS_L = [SU, LB, AR]
HEADS = ["Calm", "Confident", "Focused", "Rushed", "Tired", "Frustrated"]
PAIRS_L = ["GBPUSD", "EURUSD", "XAUUSD", "GBPJPY", "USDJPY", "AUDUSD", "EURJPY", "USDCAD", "NZDUSD"]
STATUS_L = [["Taken", "Counts in your results"], ["Watched", "You saw it, didn't take it"], ["Not filled", "Order never triggered"], ["Analysis", "Charts before trading"]]

FILL = dict(before="Short from last week's 4H supply zone with weekly and daily bearish. Entered on the 15m retest after a break of structure, on plan.",
            refl="Waiting for the candle to close kept the entry calm and on plan. Worth repeating.", sugg=True,
            setup=SU, tags=[{"t": "Supply zone", "k": "Good"}, {"t": "Break of structure", "k": "Good"}, {"t": "Retest", "k": "Good"}], plan="Followed", head="Calm")
BASE = dict(pair="GBPUSD", dir="Short", status="Taken", acct="Funded 100K", dt="2026-11-16T09:45",
            nums={"Entry": "1.26840", "Stop": "1.27010", "Target": "1.26480", "Exit": "1.26482", "Size": "0.50 lots", "Result": "+2.1R"})
INIT = {
    "new": dict(BASE, charts=[["W", "Weekly"], ["D", ""], ["4H", "4H"], ["E", "15m"]], before="", refl="", sugg=False, setup=None, tags=[], plan=None, head=None, rec=False, len="0:24"),
    "newfilled": dict(BASE, charts=[["W", "Weekly"], ["D", ""], ["4H", "4H"], ["E", "15m"]], rec=True, len="0:24", **FILL),
    "saved": dict(BASE, charts=[["W", "Weekly"], ["D", ""], ["4H", "4H"], ["E", "15m"], ["A", "15m"]], rec=True, len="0:24",
                  **dict(FILL, refl="Patience paid off: no rushing, held to target. Bring the same patience to Gold.", sugg=False)),
}

def _mbtn(label_hole, toggle, exp, aria):
    return (f'<button type="button" class="ghost tagfield" aria-haspopup="listbox" aria-expanded="{{{{ {exp} }}}}" aria-label="{aria}" onClick="{{{{ {toggle} }}}}" style="justify-content: space-between; position: relative; z-index: 5">'
            f'{label_hole}<span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>')

def _opts(lst, width="100%", extra=""):
    return (f'<div role="listbox" style="{MENU_BOX}; left: 0; width: {width}">'
            f'<sc-for list="{{{{ {lst} }}}}" as="o" hint-placeholder-count="4"><button type="button" role="option" aria-selected="{{{{ o.selS }}}}" onClick="{{{{ o.pick }}}}" class="kit-opt" style="{OPT}; background: {{{{ o.bg }}}}">'
            '<span style="display: flex; flex-direction: column; gap: 2px"><span>{{ o.label }}</span><sc-if value="{{ o.hasHint }}" hint-placeholder-val="{{ false }}"><span style="font-size: 12px; color: #8C939F">{{ o.hint }}</span></sc-if></span>'
            f'<sc-if value="{{{{ o.sel }}}}" hint-placeholder-val="{{{{ false }}}}"><span style="display: flex">{IC["check"]}</span></sc-if></button></sc-for>{extra}</div>')

def _menu_field(key, aria, ph, extra=""):
    lab = (f'<sc-if value="{{{{ {key}Set }}}}" hint-placeholder-val="{{{{ true }}}}"><span class="pill">{{{{ {key}Val }}}}</span></sc-if>'
           f'<sc-if value="{{{{ {key}Unset }}}}" hint-placeholder-val="{{{{ false }}}}"><span style="font-size: 14px; color: #8C939F">{ph}</span></sc-if>')
    return (f'<div style="position: relative">{_mbtn(lab, key + "Toggle", key + "Exp", aria)}'
            f'<sc-if value="{{{{ {key}Open }}}}" hint-placeholder-val="{{{{ false }}}}">{backdrop()}{_opts(key + "Opts", "100%", extra)}</sc-if></div>')

def _row(label, field):
    return (f'<div style="display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 12px; align-items: center; min-height: 48px; border-top: 1px solid #1B1F27">'
            f'<dt class="lbl" style="margin: 0">{label}</dt><dd style="margin: 0; min-width: 0; padding: 4px 0 4px 10px">{field}</dd></div>')

XICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>'
TAGS_FIELD = ('<div style="position: relative">'
              '<div class="ghost tagfield" role="group" aria-label="Tags" style="cursor: text; flex-wrap: wrap; position: relative; z-index: 5">'
              '<sc-for list="{{ tagPills }}" as="p" hint-placeholder-count="3"><span class="pill" style="display: inline-flex; align-items: center; gap: 4px; padding-right: 4px">{{ p.t }}'
              '<button type="button" aria-label="{{ p.rmLabel }}" onClick="{{ p.rm }}" style="width: 22px; height: 22px; border: 0; border-radius: 6px; background: transparent; color: #8C939F; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0">' + XICON + '</button></span></sc-for>'
              '<input id="taginput" type="text" role="combobox" aria-expanded="{{ tagExp }}" aria-autocomplete="list" aria-label="Add a tag" placeholder="{{ tagPh }}" value="{{ tagQ }}" onChange="{{ tagType }}" onFocus="{{ tagFocus }}" onKeyDown="{{ tagKey }}" '
              'style="flex: 1; min-width: 90px; font: inherit; font-size: 13px; color: #ECEEF1; background: transparent; border: 0; outline: none; padding: 4px 2px"></div>'
              '<sc-if value="{{ tagMenu }}" hint-placeholder-val="{{ false }}">' + backdrop() +
              f'<div role="listbox" aria-label="Matching tags" style="{MENU_BOX}; left: 0; right: 0">'
              '<sc-for list="{{ tagSug }}" as="o" hint-placeholder-count="2"><button type="button" role="option" onClick="{{ o.pick }}" class="kit-opt" style="' + OPT + '; font-size: 13px; min-height: 36px">'
              '<span>{{ o.t }}</span><span style="font-size: 12px; color: #8C939F">{{ o.used }}</span></button></sc-for>'
              '<sc-if value="{{ tagCanAdd }}" hint-placeholder-val="{{ true }}"><button type="button" role="option" onClick="{{ tagAskKind }}" class="kit-opt" style="' + OPT + '; font-size: 13px; min-height: 36px; color: #A3AAB5">{{ tagAddLabel }}</button></sc-if>'
              '<sc-if value="{{ tagNone }}" hint-placeholder-val="{{ false }}"><span style="font-size: 13px; color: #8C939F; padding: 8px 12px">Type to find a tag or make a new one</span></sc-if>'
              '</div></sc-if>'
              '<sc-if value="{{ kindAsk }}" hint-placeholder-val="{{ false }}">' + backdrop() +
              f'<div role="dialog" aria-label="New tag" style="{MENU_BOX}; left: 0; right: 0; padding: 12px; gap: 10px">'
              '<span style="font-size: 13px; color: #ECEEF1">What kind of tag is <b>{{ kindTag }}</b>? You only set this once.</span>'
              '<div style="display: flex; gap: 6px; flex-wrap: wrap"><sc-for list="{{ kinds }}" as="k" hint-placeholder-count="3"><button type="button" class="btn btn-g" onClick="{{ k.pick }}" style="min-height: 36px; flex: 1; flex-direction: column; gap: 0; padding: 4px 10px">'
              '<span style="font-size: 13px; font-weight: 600">{{ k.label }}</span><span style="font-size: 11px; color: #8C939F; font-weight: 400">{{ k.hint }}</span></button></sc-for></div></div></sc-if>'
              '</div>')

PLAN_SEG = ('<div role="group" aria-label="Plan" style="display: flex; gap: 2px; padding: 2px; background: #0E1014; border: 1px solid #252A33; border-radius: 8px">'
            '<sc-for list="{{ planOpts }}" as="o" hint-placeholder-count="2"><button type="button" aria-pressed="{{ o.pressed }}" onClick="{{ o.pick }}" style="flex: 1; font: inherit; font-size: 13px; font-weight: {{ o.fw }}; color: {{ o.fg }}; background: {{ o.bg }}; border: 0; border-radius: 6px; padding: 0 10px; min-height: 34px; cursor: pointer">{{ o.label }}</button></sc-for></div>')

def _fact(key, aria):
    return (f'<span style="position: relative; display: inline-flex"><button type="button" aria-haspopup="listbox" aria-expanded="{{{{ {key}Exp }}}}" aria-label="{aria}: {{{{ {key}Val }}}}" onClick="{{{{ {key}Toggle }}}}" '
            f'style="font: inherit; font-size: 14px; font-weight: 500; color: #ECEEF1; background: transparent; border: 0; border-bottom: 1px dashed #4A515E; padding: 2px 0; cursor: pointer; position: relative; z-index: 5">{{{{ {key}Val }}}}</button>'
            f'<sc-if value="{{{{ {key}Open }}}}" hint-placeholder-val="{{{{ false }}}}">{backdrop()}{_opts(key + "Opts", "240px")}</sc-if></span>')
SEP = '<span aria-hidden="true" style="color: #4A515E">·</span>'
DATE_FACT = ('<span style="position: relative; display: inline-flex"><button type="button" aria-haspopup="dialog" aria-expanded="{{ dtExp }}" aria-label="Date and time: {{ dtLabel }}" onClick="{{ dtToggle }}" '
             'style="font: inherit; font-size: 14px; font-weight: 500; color: #ECEEF1; background: transparent; border: 0; border-bottom: 1px dashed #4A515E; padding: 2px 0; cursor: pointer; position: relative; z-index: 5">{{ dtLabel }}</button>'
             '<sc-if value="{{ dtOpen }}" hint-placeholder-val="{{ false }}">' + backdrop() +
             f'<div role="dialog" aria-label="Date and time" style="{MENU_BOX}; right: 0; width: 260px; padding: 12px; gap: 10px">'
             '<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #A3AAB5">Date and time<input type="datetime-local" value="{{ dtDraft }}" onChange="{{ dtSetDraft }}" style="font: inherit; font-size: 14px; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 8px; padding: 8px 10px; color-scheme: dark"></label>'
             '<span style="font-size: 12px; color: #8C939F">The session follows the time.</span>'
             '<div style="display: flex; gap: 8px; justify-content: flex-end"><button type="button" class="btn btn-g" onClick="{{ kClose }}" style="min-height: 36px">Cancel</button><button type="button" class="btn btn-p" onClick="{{ dtSave }}" style="min-height: 36px">Save</button></div></div></sc-if></span>')
FACTS = ('<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px">'
         + SEP.join([_fact("pair", "Pair"), _fact("dir", "Direction"), _fact("status", "Status"), _fact("acct", "Account"), DATE_FACT]) + '</div>')
NUMS = ('<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; font-size: 13px; color: #A3AAB5; padding-top: 4px">'
        '<sc-for list="{{ numLine }}" as="x" hint-placeholder-count="4"><span class="num">{{ x }}</span></sc-for>'
        '<span class="num" style="color: {{ resCol }}; font-weight: 600">{{ resVal }}</span>'
        '<button type="button" class="btn btn-q" aria-expanded="{{ numExp }}" onClick="{{ toggleNums }}" style="min-height: 28px; padding: 0 4px; font-size: 13px">{{ numBtn }}</button></div>'
        '<sc-if value="{{ numOpen }}" hint-placeholder-val="{{ false }}"><div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 10px; padding-top: 6px">'
        '<sc-for list="{{ numFields }}" as="x" hint-placeholder-count="6"><label style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><span class="lbl" style="font-size: 12px">{{ x.label }}</span>'
        '<input class="ghost num" type="text" value="{{ x.v }}" onChange="{{ x.set }}" placeholder="Type it" style="margin: 0; width: 100%; box-sizing: border-box; padding: 0 8px; font-size: 14px; font-weight: 600; min-height: 34px"></label></sc-for>'
        '</div></sc-if>')

THUMBS = ('<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; align-items: start">'
          '<sc-for list="{{ charts }}" as="c" hint-placeholder-count="4"><figure draggable="true" onDragStart="{{ c.drag }}" onDragOver="{{ dragOver }}" onDrop="{{ c.drop }}" aria-roledescription="Draggable chart" style="margin: 0; display: flex; flex-direction: column; gap: 4px; min-width: 0; cursor: grab">'
          '<button type="button" aria-label="{{ c.showLabel }}" aria-pressed="{{ c.pressed }}" onClick="{{ c.show }}" class="chart" style="display: block; padding: 0; border: 0; cursor: pointer; box-shadow: {{ c.ring }}">'
          '<sc-if value="{{ c.isSym }}" hint-placeholder-val="{{ true }}"><svg viewBox="0 0 320 180" aria-hidden="true" style="display: block; width: 100%; height: auto"><use href="{{ c.href }}"></use></svg></sc-if>'
          '<sc-if value="{{ c.isImg }}" hint-placeholder-val="{{ false }}"><img src="{{ c.src }}" alt="" style="display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover"></sc-if></button>'
          '<figcaption style="display: flex; justify-content: space-between; align-items: center; min-height: 22px"><span class="lbl" style="font-size: 12px">{{ c.cap }}</span>'
          '<span style="position: relative; display: inline-flex"><button type="button" aria-label="{{ c.menuLabel }}" aria-haspopup="menu" aria-expanded="{{ c.mExp }}" onClick="{{ c.mToggle }}" style="width: 26px; height: 22px; border: 0; border-radius: 6px; background: transparent; color: #8C939F; cursor: pointer; font-size: 13px; letter-spacing: 1px; padding: 0; position: relative; z-index: 5">···</button>'
          '<sc-if value="{{ c.mOpen }}" hint-placeholder-val="{{ false }}">' + backdrop() +
          f'<div role="menu" style="{MENU_BOX}; right: 0; width: 170px">'
          '<sc-if value="{{ c.canLeft }}" hint-placeholder-val="{{ true }}"><button type="button" role="menuitem" class="kit-opt" onClick="{{ c.left }}" style="' + OPT + '">Move left</button></sc-if>'
          '<sc-if value="{{ c.canRight }}" hint-placeholder-val="{{ true }}"><button type="button" role="menuitem" class="kit-opt" onClick="{{ c.right }}" style="' + OPT + '">Move right</button></sc-if>'
          '<sc-if value="{{ c.canRemove }}" hint-placeholder-val="{{ true }}"><button type="button" role="menuitem" class="kit-opt" onClick="{{ c.remove }}" style="' + OPT + '; color: #FF9A4D">Remove</button></sc-if>'
          '<sc-if value="{{ c.onlyOne }}" hint-placeholder-val="{{ false }}"><span style="font-size: 12px; color: #8C939F; padding: 6px 12px">A story keeps at least one chart</span></sc-if>'
          '</div></sc-if></span></figcaption></figure></sc-for>'
          '<label aria-label="Add or paste another chart" style="position: relative; font: inherit; border: 1.5px dashed #353B46; border-radius: 8px; color: #8C939F; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 12px; aspect-ratio: 16 / 9">'
          + IC["plus"] + 'Add<input type="file" accept="image/*" multiple onChange="{{ addChart }}" style="position: absolute; width: 1px; height: 1px; opacity: 0"></label></div>')

CHARTS = ('<section aria-label="Charts" style="min-width: 0; display: flex; flex-direction: column; gap: 14px">'
          '<figure style="margin: 0; display: flex; flex-direction: column; gap: 8px"><div class="chart" style="border-radius: 12px">'
          '<sc-if value="{{ bigSym }}" hint-placeholder-val="{{ true }}"><svg viewBox="0 0 320 180" role="img" aria-label="{{ bigAlt }}" style="display: block; width: 100%; height: auto"><use href="{{ bigHref }}"></use></svg></sc-if>'
          '<sc-if value="{{ bigImg }}" hint-placeholder-val="{{ false }}"><img src="{{ bigSrc }}" alt="Your chart" style="display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: contain; background: #0E1014"></sc-if></div>'
          '<figcaption style="display: flex; justify-content: space-between; align-items: baseline"><span class="lbl">{{ bigCap }}</span><span class="lbl">{{ bigPos }}</span></figcaption></figure>'
          + THUMBS + '<p class="lbl" style="margin: 0; font-size: 12px">Drag to reorder, or use each chart\'s menu.</p></section>')

PAUSE = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg>'
def _note(label, val, set_, rows=2):
    return (f'<div style="display: flex; flex-direction: column; gap: 4px"><div style="display: flex; align-items: center; gap: 8px; min-height: 28px"><label for="n{label[0]}" class="lbl" style="font-size: 12px; font-weight: 600; color: #A3AAB5">{label}</label>{{{{ SLOT }}}}</div>'
            f'<textarea id="n{label[0]}" class="ghost" rows="{rows}" placeholder="Fills from your note, or write it yourself" value="{{{{ {val} }}}}" onChange="{{{{ {set_} }}}}" '
            'style="border: 1px solid #2E343E; background: #0E1014; border-radius: 10px; cursor: text; font-size: 14px; line-height: 1.6; padding: 8px 10px; resize: vertical; color: #ECEEF1"></textarea></div>')
SUGG = ('<sc-if value="{{ sugg }}" hint-placeholder-val="{{ false }}"><span style="font-size: 11px; font-weight: 600; color: #B9A6FF; border: 1px solid #4A3F75; border-radius: 5px; padding: 0 6px; line-height: 1.6">Suggested</span>'
        '<span class="lbl" style="font-size: 12px; margin-left: auto">Inferred from your note</span>'
        '<button type="button" class="btn btn-q" onClick="{{ keepRefl }}" style="min-height: 28px; padding: 0 6px; font-size: 13px">Keep</button>'
        '<button type="button" class="btn btn-q" onClick="{{ dropRefl }}" style="min-height: 28px; padding: 0 6px; font-size: 13px; color: #8C939F">Delete</button></sc-if>')

NOTES = ('<section aria-labelledby="nh" style="display: flex; flex-direction: column; gap: 12px; padding: 18px 20px 20px; background: #15181E; border: 1px solid #252A33; border-radius: 16px">'
         '<div style="display: flex; justify-content: space-between; align-items: baseline"><h2 id="nh" style="margin: 0; font-size: 16px; font-weight: 600">Notes</h2><span class="lbl" style="font-size: 12px">Optional</span></div>'
         # not recorded yet
         '<sc-if value="{{ talkBtn }}" hint-placeholder-val="{{ false }}"><button type="button" aria-label="Record your note" onClick="{{ startRec }}" style="font: inherit; text-align: left; display: flex; align-items: center; gap: 14px; width: 100%; padding: 16px; border-radius: 12px; background: #0E1014; border: 1px dashed #4A515E; color: #ECEEF1; cursor: pointer">'
         f'<span style="flex: none; width: 48px; height: 48px; border-radius: 24px; background: #B9A6FF; color: #0E1014; display: flex; align-items: center; justify-content: center">{IC["mic"]}</span>'
         '<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 16px; font-weight: 600">Talk it through</span><span class="meta" style="font-size: 13px">Why you took it and how it went. It fills both notes and the details you haven\'t set.</span></span></button></sc-if>'
         # recording
         '<sc-if value="{{ recording }}" hint-placeholder-val="{{ false }}"><div role="status" style="display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 12px; background: #0E1014; border: 1px solid #4A3F75">'
         '<span aria-hidden="true" style="flex: none; width: 12px; height: 12px; border-radius: 6px; background: #FF9A4D"></span>'
         '<span style="display: flex; flex-direction: column; gap: 2px; flex: 1"><span style="font-size: 15px; font-weight: 600">Listening · {{ recTime }}</span><span class="meta" style="font-size: 13px">Talk as long as you like. Stop when you\'re done.</span></span>'
         '<button type="button" class="btn btn-q" onClick="{{ cancelRec }}">Cancel</button><button type="button" class="btn btn-p" onClick="{{ stopRec }}">Stop</button></div></sc-if>'
         + _note("Before / during", "before", "setBefore").replace("{{ SLOT }}", "")
         + _note("Reflection", "refl", "setRefl").replace("{{ SLOT }}", SUGG)
         # voice note controls
         + '<sc-if value="{{ hasRec }}" hint-placeholder-val="{{ true }}"><div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding-top: 4px">'
         '<button type="button" aria-label="{{ playLabel }}" onClick="{{ togglePlay }}" style="flex: none; width: 28px; height: 28px; border-radius: 14px; border: 0; background: #ECEEF1; color: #0E1014; display: flex; align-items: center; justify-content: center; cursor: pointer">'
         f'<sc-if value="{{{{ playing }}}}" hint-placeholder-val="{{{{ false }}}}">{PAUSE}</sc-if><sc-if value="{{{{ paused }}}}" hint-placeholder-val="{{{{ true }}}}">{IC["play"]}</sc-if></button>'
         '<span class="lbl" style="font-size: 12px">{{ playText }}</span>'
         '<button type="button" class="btn btn-q" aria-expanded="{{ saidExp }}" onClick="{{ toggleSaid }}" style="min-height: 28px; padding: 0 6px; font-size: 13px">What you said</button>'
         f'<button type="button" class="btn btn-q" aria-label="Re-record your voice note" title="Re-record" onClick="{{{{ startRec }}}}" style="margin-left: auto; min-height: 28px; padding: 0 6px; font-size: 13px">{IC["mic"]}</button></div>'
         '<sc-if value="{{ said }}" hint-placeholder-val="{{ false }}"><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #A3AAB5; padding: 10px 12px; border-radius: 10px; background: #0E1014">TRANSCRIPT</p></sc-if></sc-if>'
         '</section>')

TRANSCRIPT = (f'"Weekly and daily both bearish, so I took the {mk("4H supply pullback")}. Price came into last week\'s {mk("supply zone")}, the fifteen minute {mk("broke structure")}, '
              f'I waited for the candle to close and got in on the {mk("retest")}. Felt {mk("calm")}. Stuck to the {mk("plan")}."')

def details(mode):
    head = '<span class="lbl" style="font-size: 12px">{{ detailsHint }}</span>'
    foot = ('<div style="padding: 16px 20px; border-top: 1px solid #252A33; display: flex; align-items: center; gap: 10px">'
            '<a href="Main.dc.html" class="btn btn-q">Cancel</a><a href="Story.dc.html" class="btn btn-p" style="flex: 1; justify-content: center">Save story</a></div>') if mode != "saved" else (
            '<div style="padding: 16px 20px; border-top: 1px solid #252A33; display: flex; flex-direction: column; gap: 8px">'
            '<a href="Main.dc.html" class="btn btn-p" style="justify-content: center">Done</a><span class="lbl" style="font-size: 12px; text-align: center">Changes save as you make them</span></div>')
    return f'''<aside aria-label="Details" style="flex: 2 1 380px; min-width: 0; position: sticky; top: 24px; display: flex; flex-direction: column; background: #15181E; border: 1px solid #252A33; border-radius: 16px">
<section aria-labelledby="th" style="padding: 18px 20px 12px; display: flex; flex-direction: column; gap: 4px">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding-bottom: 6px"><h2 id="th" style="margin: 0; font-size: 16px; font-weight: 600">Details</h2>{head}</div>
<dl style="margin: 0; display: flex; flex-direction: column">
{_row("Setup", _menu_field("setup", "Setup", "Pick a setup", '<a href="SetupEdit.dc.html" class="kit-opt" style="' + OPT + '; color: #A3AAB5; text-decoration: none">' + IC["plus"] + 'New setup</a>'))}
{_row("Tags", TAGS_FIELD)}
{_row("Plan", PLAN_SEG)}
{_row("Headspace", _menu_field("head", "Headspace", "Pick one"))}
</dl></section>
<section aria-label="Trade" style="padding: 16px 20px; border-top: 1px solid #252A33; display: flex; flex-direction: column; gap: 8px">
<span class="lbl" style="font-size: 12px">{"From your charts and MT5, or typed by you" if mode == "saved" else "Read from your charts and MT5 · tap anything to change"}</span>
{FACTS}
{NUMS}
</section>
{foot}
</aside>'''

STORY_MENU2 = ('<span style="position: relative; display: inline-flex"><button type="button" aria-label="More actions" aria-haspopup="menu" aria-expanded="{{ smExp }}" onClick="{{ smToggle }}" style="width: 40px; height: 40px; border: 1px solid #353B46; border-radius: 10px; background: transparent; color: #ECEEF1; cursor: pointer; font-size: 18px; letter-spacing: 1px; position: relative; z-index: 5">···</button>'
               '<sc-if value="{{ smOpen }}" hint-placeholder-val="{{ false }}">' + backdrop() + f'<div role="menu" style="{MENU_BOX}; right: 0; width: 220px">'
               '<button type="button" role="menuitem" class="kit-opt" onClick="{{ pinT }}" style="' + OPT + '">{{ pinLabel }}</button>'
               '<button type="button" role="menuitem" class="kit-opt" onClick="{{ dtToggle }}" style="' + OPT + '">Change date</button>'
               '<button type="button" role="menuitem" class="kit-opt" onClick="{{ exclT }}" style="' + OPT + '">{{ exclLabel }}</button>'
               '<button type="button" role="menuitem" class="kit-opt" onClick="{{ delStory }}" style="' + OPT + '; color: #FF9A4D">Delete story</button></div></sc-if></span>')

def story_form(mode):
    if mode == "saved":
        top = (BACK("Main.dc.html", "Trade log")
               + title_block('{{ pairVal }} ' + dchip("{{ dirVal }}") + '<sc-if value="{{ pinned }}" hint-placeholder-val="{{ false }}"><span style="font-size: 12px; font-weight: 600; color: #ECEEF1; background: #252A33; border-radius: 6px; padding: 2px 8px">Textbook example</span></sc-if>',
                             "{{ subLine }}", '<span class="num" style="font-size: 30px; font-weight: 600; color: {{ resCol }}">{{ resVal }}</span>' + STORY_MENU2)
               + '<sc-if value="{{ excluded }}" hint-placeholder-val="{{ false }}"><div style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; border: 1px solid #353B46"><span class="meta">Excluded from your stats. It still shows in your trade log and playbook.</span><button type="button" class="btn btn-q" onClick="{{ exclT }}" style="margin-left: auto">Include again</button></div></sc-if>')
        top = top.replace('font-size: 30px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em">{{ pairVal }}', 'font-size: 30px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; display: flex; align-items: center; gap: 12px">{{ pairVal }}', 1)
        extra = ANALYSIS_LINK.replace(f'<div class="chart" style="flex: none; width: 112px">{GU["D"]}</div>', '<div class="chart" style="flex: none; width: 112px"><svg viewBox="0 0 320 180" aria-hidden="true" style="display: block; width: 100%; height: auto"><use href="#gD"></use></svg></div>')
    else:
        top = BACK("Main.dc.html", "Trade log") + title_block("New chart story", "Drop the charts and talk it through. Your note fills the tags.")
        extra = ""
    body = f'''
{GSYMS}
<sc-if value="{{{{ alive }}}}" hint-placeholder-val="{{{{ true }}}}">
{top}
<div style="display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-start">
<div style="flex: 3 1 520px; min-width: 0; display: flex; flex-direction: column; gap: 20px">
{CHARTS}
{NOTES.replace("TRANSCRIPT", TRANSCRIPT)}
{extra}
</div>
{details(mode)}
</div>
</sc-if>
<sc-if value="{{{{ gone }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 120px 0">
<span style="font-size: 18px; font-weight: 600">Story deleted</span><span class="meta">Its charts and notes are gone. Your numbers no longer include it.</span>
<div style="display: flex; gap: 8px"><button type="button" class="btn btn-g" onClick="{{{{ undoDel }}}}">Undo</button><a href="Main.dc.html" class="btn btn-p">Back to trade log</a></div></div></sc-if>
{TOAST}
'''
    return body

STORY_JS = """
renderVals() {
  const st = this.state || {};
  const INIT = %s, MODE = '%s', VOCAB = %s, SETUPS = %s, HEADS = %s, PAIRS = %s, STATUS = %s, ACCTS = %s, FILL = %s;
  const kit = this.kitVals();
  const I = INIT[MODE];
  const g = (k) => (k in st ? st[k] : I[k]);
  const set = (o) => this.setState(o);
  const km = st.kmenu || null;
  const choice = (k, list, val, toastMsg) => list.map((o) => { const v = Array.isArray(o) ? o[0] : o, h = Array.isArray(o) ? o[1] : '';
    return { label: v, hint: h, hasHint: !!h, sel: v === val, selS: v === val ? 'true' : 'false', bg: v === val ? '#1B1F27' : 'transparent', pick: () => set({ [k]: v, kmenu: null }) }; });
  // charts
  const charts = g('charts');
  const selI = Math.min(st.sel == null ? charts.length - 1 : st.sel, charts.length - 1);
  const move = (i, j) => { const c = charts.slice(); const [x] = c.splice(i, 1); c.splice(j, 0, x); set({ charts: c, sel: j, kmenu: null }); };
  const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
  const big = charts[selI];
  // voice
  const rec = g('rec'), recording = !!st.recording, playing = !!st.playing;
  const fillNow = () => {
    const upd = { rec: true, recording: false, recSec: 0, said: false };
    const filled = [];
    if (!g('before')) { upd.before = FILL.before; }
    if (!g('refl')) { upd.refl = FILL.refl; upd.sugg = true; }
    if (!g('setup')) { upd.setup = FILL.setup; filled.push('setup'); }
    const have = g('tags').map((t) => t.t); const add = FILL.tags.filter((t) => !have.includes(t.t));
    if (add.length) { upd.tags = g('tags').concat(add); filled.push(add.length + (add.length === 1 ? ' tag' : ' tags')); }
    if (!g('plan')) { upd.plan = FILL.plan; filled.push('plan'); }
    if (!g('head')) { upd.head = FILL.head; filled.push('headspace'); }
    const prev = {}; for (const k of Object.keys(upd)) prev[k] = k in st ? st[k] : I[k];
    prev.recording = false; prev.recSec = 0;
    clearInterval(this._rt); set(upd);
    this.toast(filled.length ? 'From your note: notes, ' + filled.join(', ') : 'Notes filled from your note', prev);
  };
  const stopPlay = () => { clearInterval(this._pt); };
  // tags
  const tags = g('tags');
  const q = st.tagQ || '';
  const ql = q.trim().toLowerCase();
  const have = tags.map((t) => t.t.toLowerCase());
  const sug = ql ? VOCAB.filter((v) => v.t.toLowerCase().includes(ql) && !have.includes(v.t.toLowerCase())).slice(0, 6) : VOCAB.filter((v) => !have.includes(v.t.toLowerCase())).slice(0, 5);
  const exact = VOCAB.some((v) => v.t.toLowerCase() === ql) || have.includes(ql);
  const addTag = (t, k) => { set({ tags: tags.concat([{ t: t, k: k }]), tagQ: '', kmenu: null, kindFor: null }); };
  const nice = (s) => s.trim().charAt(0).toUpperCase() + s.trim().slice(1);
  // numbers
  const nums = g('nums');
  const res = nums.Result || '';
  const rv = parseFloat(res.replace('\\u2212', '-'));
  // date
  const dt = g('dt');
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], SM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [dpart, tpart] = dt.split('T'); const [yy, mm, dd] = dpart.split('-').map(Number);
  const dtLabel = DAYS[new Date(Date.UTC(yy, mm - 1, dd)).getUTCDay()] + ' ' + dd + ' ' + SM[mm - 1] + ', ' + tpart;
  const hr = Number(tpart.slice(0, 2)); const sess = hr < 7 ? 'Asia' : (hr < 13 ? 'London' : 'New York');
  const pinned = !!st.pinned, excluded = !!st.excluded;
  return Object.assign(kit, {
    setupOpen: km === 'setup', setupExp: km === 'setup' ? 'true' : 'false', setupToggle: () => set({ kmenu: km === 'setup' ? null : 'setup' }), headOpen: km === 'head', headExp: km === 'head' ? 'true' : 'false', headToggle: () => set({ kmenu: km === 'head' ? null : 'head' }), pairOpen: km === 'pair', pairExp: km === 'pair' ? 'true' : 'false', pairToggle: () => set({ kmenu: km === 'pair' ? null : 'pair' }), dirOpen: km === 'dir', dirExp: km === 'dir' ? 'true' : 'false', dirToggle: () => set({ kmenu: km === 'dir' ? null : 'dir' }), statusOpen: km === 'status', statusExp: km === 'status' ? 'true' : 'false', statusToggle: () => set({ kmenu: km === 'status' ? null : 'status' }), acctOpen: km === 'acct', acctExp: km === 'acct' ? 'true' : 'false', acctToggle: () => set({ kmenu: km === 'acct' ? null : 'acct' }), dtOpen: km === 'dt', dtExp: km === 'dt' ? 'true' : 'false', dtToggle: () => set({ kmenu: km === 'dt' ? null : 'dt' }), smOpen: km === 'sm', smExp: km === 'sm' ? 'true' : 'false', smToggle: () => set({ kmenu: km === 'sm' ? null : 'sm' }),
    alive: !st.deleted, gone: !!st.deleted, undoDel: () => set({ deleted: false }),
    // charts
    bigSym: !big.src, bigImg: !!big.src, bigHref: '#g' + big.k, bigSrc: big.src || '', bigAlt: (big.cap || 'Chart') + ', chart ' + (selI + 1) + ' of ' + charts.length,
    bigCap: big.cap || '', bigPos: (selI + 1) + ' of ' + charts.length,
    charts: charts.map((c, i) => ({ isSym: !c.src, isImg: !!c.src, href: '#g' + c.k, src: c.src || '', cap: c.cap || '', pressed: i === selI ? 'true' : 'false', ring: i === selI ? '0 0 0 2px #ECEEF1' : 'none',
      showLabel: 'Show ' + ORD[i] + ' chart', menuLabel: 'Actions for ' + ORD[i] + ' chart', show: () => set({ sel: i }),
      mOpen: km === 'c' + i, mExp: km === 'c' + i ? 'true' : 'false', mToggle: () => set({ kmenu: km === 'c' + i ? null : 'c' + i }),
      canLeft: i > 0, canRight: i < charts.length - 1, canRemove: charts.length > 1, onlyOne: charts.length === 1,
      left: () => move(i, i - 1), right: () => move(i, i + 1),
      remove: () => { const c = charts.slice(); c.splice(i, 1); set({ charts: c, sel: Math.min(selI, c.length - 1), kmenu: null }); this.toast('Chart removed', { charts: charts, sel: selI }); },
      drag: (e) => { this._drag = i; try { e.dataTransfer.effectAllowed = 'move'; } catch (_) {} },
      drop: (e) => { e.preventDefault(); if (this._drag != null && this._drag !== i) move(this._drag, i); this._drag = null; } })),
    dragOver: (e) => e.preventDefault(),
    addChart: (ev) => { const fs = Array.from(ev.target.files || []); if (!fs.length) return; const add = fs.map((f) => ({ src: URL.createObjectURL(f), cap: '' })); set({ charts: charts.concat(add), sel: charts.length + add.length - 1 }); this.toast(add.length === 1 ? 'Chart added' : add.length + ' charts added'); },
    // notes
    talkBtn: !rec && !recording, recording: recording, hasRec: rec && !recording,
    recTime: '0:' + String(st.recSec || 0).padStart(2, '0'),
    startRec: () => { stopPlay(); clearInterval(this._rt); set({ recording: true, recSec: 0, playing: false }); this._rt = setInterval(() => this.setState((s) => ({ recSec: (s.recSec || 0) + 1 })), 1000); },
    cancelRec: () => { clearInterval(this._rt); set({ recording: false, recSec: 0 }); },
    stopRec: fillNow,
    before: g('before'), refl: g('refl'), sugg: !!g('sugg') && !!g('refl'),
    setBefore: (e) => set({ before: e.target.value }), setRefl: (e) => set({ refl: e.target.value, sugg: false }),
    keepRefl: () => set({ sugg: false }), dropRefl: () => { const r = g('refl'); set({ refl: '', sugg: false }); this.toast('Reflection deleted', { refl: r, sugg: true }); },
    playing: playing, paused: !playing, playLabel: playing ? 'Pause your voice note' : 'Play your voice note',
    playText: playing || st.pSec ? 'Playing 0:' + String(st.pSec || 0).padStart(2, '0') + ' of ' + g('len') : 'From your ' + g('len') + ' voice note',
    togglePlay: () => { if (playing) { stopPlay(); set({ playing: false }); return; } set({ playing: true }); this._pt = setInterval(() => this.setState((s) => { const n = (s.pSec || 0) + 1; if (n > 24) { clearInterval(this._pt); return { playing: false, pSec: 0 }; } return { pSec: n }; }), 1000); },
    said: !!st.said, saidExp: st.said ? 'true' : 'false', toggleSaid: () => set({ said: !st.said }),
    // details
    detailsHint: rec ? 'From your note \\u00b7 tap any to change' : 'From your note, or set them yourself',
    setupSet: !!g('setup'), setupUnset: !g('setup'), setupVal: g('setup') || '', setupOpts: choice('setup', SETUPS, g('setup')),
    headSet: !!g('head'), headUnset: !g('head'), headVal: g('head') || '', headOpts: choice('head', HEADS, g('head')),
    tagPills: tags.map((t, i) => ({ t: t.t, rmLabel: 'Remove ' + t.t, rm: () => { const n = tags.slice(); n.splice(i, 1); set({ tags: n }); this.toast('Removed ' + t.t, { tags: tags }); } })),
    tagPh: tags.length ? '' : 'Add a tag', tagQ: q, tagExp: km === 'tag' ? 'true' : 'false',
    tagType: (e) => set({ tagQ: e.target.value, kmenu: 'tag' }), tagFocus: () => { if (km !== 'tag') set({ kmenu: 'tag' }); },
    tagKey: (e) => { if (e.key === 'Enter') { e.preventDefault(); if (sug.length && ql) addTag(sug[0].t, sug[0].k); else if (ql && !exact) set({ kmenu: 'kind', kindFor: nice(q) }); }
                     if (e.key === 'Backspace' && !q && tags.length) { set({ tags: tags.slice(0, -1) }); } if (e.key === 'Escape') set({ kmenu: null }); },
    tagMenu: km === 'tag', tagSug: sug.map((v) => ({ t: v.t, used: 'used ' + v.n + (v.n === 1 ? ' time' : ' times'), pick: () => addTag(v.t, v.k) })),
    tagCanAdd: !!ql && !exact, tagAddLabel: 'Add \\u201c' + nice(q) + '\\u201d as a new tag', tagNone: !ql && !sug.length,
    tagAskKind: () => set({ kmenu: 'kind', kindFor: nice(q) }),
    kindAsk: km === 'kind', kindTag: st.kindFor || '',
    kinds: [['Good', 'Something to repeat'], ['Mistake', 'Counts in costliest mistakes'], ['Neutral', 'Just context']].map(([k, h]) => ({ label: k, hint: h, pick: () => { addTag(st.kindFor, k); this.toast('New tag \\u201c' + st.kindFor + '\\u201d (' + k.toLowerCase() + ')'); } })),
    planOpts: ['Followed', 'Not followed'].map((o) => { const s = g('plan') === o; return { label: o, pressed: s ? 'true' : 'false', fw: s ? 600 : 500, fg: s ? '#0E1014' : '#A3AAB5', bg: s ? '#ECEEF1' : 'transparent', pick: () => set({ plan: s ? null : o }) }; }),
    // facts
    pairVal: g('pair'), pairOpts: choice('pair', PAIRS, g('pair')),
    dirVal: g('dir'), dirOpts: choice('dir', ['Long', 'Short'], g('dir')),
    statusVal: g('status'), statusOpts: choice('status', STATUS, g('status')),
    acctVal: g('acct'), acctOpts: choice('acct', ACCTS, g('acct')),
    dtLabel: dtLabel, dtDraft: st.dtDraft || dt, dtSetDraft: (e) => set({ dtDraft: e.target.value }),
    dtSave: () => { const v = st.dtDraft; if (v) { set({ dt: v, kmenu: null, dtDraft: null }); this.toast('Date changed', { dt: dt }); } else set({ kmenu: null }); },
    numOpen: !!st.numOpen, numExp: st.numOpen ? 'true' : 'false', numBtn: st.numOpen ? 'Done' : 'Edit numbers', toggleNums: () => set({ numOpen: !st.numOpen }),
    numLine: ['Entry', 'Stop', 'Target', 'Exit'].filter((k) => nums[k]).map((k) => k + ' ' + nums[k]),
    numFields: ['Entry', 'Stop', 'Target', 'Exit', 'Size', 'Result'].map((k) => ({ label: k, v: nums[k] || '', set: (e) => set({ nums: Object.assign({}, nums, { [k]: e.target.value }) }) })),
    resVal: g('status') === 'Taken' ? (res || 'No result yet') : g('status'), resCol: g('status') !== 'Taken' || isNaN(rv) ? '#A3AAB5' : (rv > 0 ? '#5BA2FF' : (rv < 0 ? '#FF9A4D' : '#ECEEF1')),
    // saved story
    subLine: g('status') + ' \\u00b7 ' + g('acct') + ' \\u00b7 ' + dtLabel + ' to 13:20 \\u00b7 ' + sess,
    pinned: pinned, pinLabel: pinned ? 'Unpin textbook example' : 'Pin as textbook',
    pinT: () => { set({ pinned: !pinned, kmenu: null }); this.toast(pinned ? 'Unpinned' : 'Pinned as a textbook example in ' + (g('setup') || 'your playbook'), { pinned: pinned }); },
    excluded: excluded, exclLabel: excluded ? 'Include in stats' : 'Exclude from stats',
    exclT: () => { set({ excluded: !excluded, kmenu: null }); this.toast(excluded ? 'Back in your stats' : 'Excluded from stats', { excluded: excluded }); },
    delStory: () => { set({ deleted: true, kmenu: null }); }
  });
}
%s
"""
def story_script_for(mode):
    init = {k: dict(v, charts=[{"k": c[0], "cap": c[1]} for c in v["charts"]]) for k, v in INIT.items()}
    return STORY_JS % (_sj.dumps(init), mode, _sj.dumps(VOCAB), _sj.dumps(SETUPS_L), _sj.dumps(HEADS), _sj.dumps(PAIRS_L), _sj.dumps(STATUS_L),
                       _sj.dumps([n for n, t, p in ACCTS]), _sj.dumps(FILL), KIT_METHODS)

newstory = story_form("new")
newstory_typed = story_form("new")
storypage = story_form("saved")
newstory_script = story_script_for("new")
newstory_typed_script = story_script_for("newfilled")
story_script = story_script_for("saved")
