t = open("/home/claude/gen/ns4.py").read()

def rep(a, b, n=1):
    global t
    assert t.count(a) == n, (a[:80], t.count(a))
    t = t.replace(a, b)

# nblock: allow empty with placeholder
rep('def nblock(label, text, suggested=False, cpl=46):', 'def nblock(label, text, suggested=False, cpl=46, ph=""):')
rep('rows="{max(1, -(-len(text) // cpl))}" style="margin: 0; width: 100%;',
    'rows="{max(2 if not text else 1, -(-len(text) // cpl))}" placeholder="{ph}" style="margin: 0; width: 100%;')

# 1) Before your note: talk button, then the two notes as real fields you can write yourself
i = t.index("def note_before():")
j = t.index("</div></sc-if>'''", i) + len("</div></sc-if>'''")
t = t[:i] + '''def note_before():
    return f"""<div style="display: flex; flex-direction: column; gap: 14px">
<button type="button" aria-label="Record your note" style="font: inherit; text-align: left; display: flex; align-items: center; gap: 14px; width: 100%; padding: 16px; border-radius: 12px; background: #0E1014; border: 1px solid #353B46; color: #ECEEF1; cursor: pointer">
<span style="flex: none; width: 48px; height: 48px; border-radius: 24px; background: #B9A6FF; color: #0E1014; display: flex; align-items: center; justify-content: center">{IC["mic"]}</span>
<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 16px; font-weight: 600">Talk it through</span><span class="meta" style="font-size: 13px">Why you took it and how it went. It fills both notes and your tags.</span></span>
</button>
{nblock("Before / during", "", ph="Fills from your note, or write it yourself")}
{nblock("Reflection", "", ph="Fills from your note, or write it yourself")}
</div>"""''' + t[j:]

# 2) Captured fields are real, empty controls before the note
rep('''        return "".join(row(l, WAIT, None, raw=True) for l in ("Setup", "Tags", "Plan", "Headspace"))''',
    '''        return (row("Setup", pick_empty("Setup", "Pick a setup"), None, raw=True)
                + row("Tags", etags("Tags", [], "Add a tag"), None, raw=True)
                + row("Plan", seg("Plan", ["Followed", "Not followed"], ""), None, raw=True)
                + row("Headspace", pick_empty("Headspace", "Pick one"), None, raw=True))''')
t = t.replace("def tag_rows(after):", '''def pick_empty(label, ph):
    return (f'<button type="button" class="ghost tagfield" aria-haspopup="listbox" aria-label="{label}: none yet" style="justify-content: space-between">'
            f'<span style="font-size: 14px; color: #8C939F">{ph}</span><span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>')

def tag_rows(after):''', 1)
rep("""else '<span class="lbl" style="font-size: 12px">Fills in from your note</span>'""",
    """else '<span class="lbl" style="font-size: 12px">From your note, or set them yourself</span>'""")

# 3) Numbers: visible as a line, editable by hand
rep('''<span class="lbl" style="font-size: 12px">Read from your charts and MT5</span>
{factline()}''', '''<span class="lbl" style="font-size: 12px">Read from your charts and MT5 · tap anything to change</span>
{factline()}
{NUMBERS}''')
t = t.replace("def note_before():", '''def _numin(label, value):
    return (f'<label style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><span class="lbl" style="font-size: 12px">{label}</span>'
            f'<input class="ghost num" type="text" value="{value}" placeholder="Type it" style="margin: 0; width: 100%; box-sizing: border-box; padding: 0 8px; font-size: 14px; font-weight: 600; min-height: 34px"></label>')
NUMBERS = ('<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; font-size: 13px; color: #A3AAB5; padding-top: 4px">'
           '<span class="num">Entry 1.26840</span><span class="num">Stop 1.27010</span><span class="num">Target 1.26480</span><span class="num">Exit 1.26482</span>'
           '<span class="num" style="color: #5BA2FF; font-weight: 600">+2.1R</span>'
           '<button type="button" class="btn btn-q" onClick="{{ toggleNums }}" style="min-height: 28px; padding: 0 4px; font-size: 13px">Edit numbers</button></div>'
           '<sc-if value="{{ numOpen }}" hint-placeholder-val="{{ false }}"><div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 10px; padding-top: 6px">'
           + _numin("Entry", "1.26840") + _numin("Stop", "1.27010") + _numin("Target", "1.26480") + _numin("Exit", "1.26482") + _numin("Size", "0.50 lots") + _numin("Result", "+2.1R")
           + '</div></sc-if>')

def note_before():''', 1)

# scripts: numbers toggle in both frames
t = t.replace("NEWTAG = (", '''newstory_script = newstory_script.replace("statusOpen: !!st.statusOpen,", "statusOpen: !!st.statusOpen, numOpen: !!st.numOpen, toggleNums: () => this.setState({ numOpen: !st.numOpen }),")
NEWTAG = (''', 1)

# 4) Chart story page: Result is a field too
t += """
_a = '<label style="display: flex; flex-direction: column; gap: 4px"><span class="lbl">Planned</span><input class="ghost num" type="text" value="1 : 2.1" style="font-weight: 600; font-size: 15px"></label>'
assert storypage.count(_a) == 1
storypage = storypage.replace(_a, _a + '<label style="display: flex; flex-direction: column; gap: 4px"><span class="lbl">Result</span><input class="ghost num" type="text" value="+2.1R" style="font-weight: 600; font-size: 15px; color: #5BA2FF"></label>')
storypage = storypage.replace("Trade details · from MT5 and your position tool", "Trade details · from MT5 and your position tool, or typed by you")
"""
open("/home/claude/gen/ns4.py", "w").write(t)
print("patched")
