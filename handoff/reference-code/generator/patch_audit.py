s = open('/home/claude/gen/gen2.py').read()

def rep(a, b, n=1):
    global s
    assert a in s, "MISSING: " + a[:90]
    s = s.replace(a, b, n)

# 1. screenshot count was wrong (5+5+4+3+3+1 = 21)
rep('From 5 MT5 trades and 20 screenshots.', 'From 5 MT5 trades and 21 screenshots.')

# 2. "still open" wording assumed MT5 for every account
rep('Their trades are already logged from MT5. Add a voice note if you remember, or save them as they are.',
    'Their charts and numbers are already in. Add a voice note if you remember, or save them as they are.')

# 3. saving from the row must show what you're confirming
rep('"Voice note added · nothing to check")}', '"Voice note added · 4H supply pullback · Followed · Calm")}')

# 4. picker contradicted the Accounts page (practice "always feeds your playbook")
rep("Practice accounts are unticked by default so they don't mix into your numbers.",
    "This only changes the numbers. Examples from every account stay in your playbook.")

# 5. "meets the rules" is a judgement the system can't make
rep('Targets the 4 you passed on', 'Targets the 4 setups you watched but didn\\\'t take')

# 6. review had no ending
rep('''Say it or type it") + '</div>', last=True)}''',
    '''Say it or type it") + '</div>' + '<button type="button" class="btn btn-p" style="align-self: flex-start; margin-top: 8px">Finish review</button>', last=True)}''')

# 7. sample account named "Practice" duplicated its own "Practice" tag
rep('("Practice", "Demo", True)', '("Demo account", "Demo", True)')
rep('{arow("Practice", "Demo", True,', '{arow("Demo account", "Demo", True,')

open('/home/claude/gen/gen2.py', 'w').write(s)
print("patched")
