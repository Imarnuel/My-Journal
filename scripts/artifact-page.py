"""Turn the Vite build in dist-artifact/ into a claude.ai artifact page: the page is published without its
own <html>/<head>/<body> (claude.ai adds them), so this keeps only the title, the theme script, the
stylesheet, the root element and the module script. Output: dist-artifact/journal.html."""
import re

src = open("dist-artifact/index.html").read()
title = "Trading Journal"
theme = re.search(r"<script>\s*// Resolve the theme.*?</script>", src, re.S).group(0)
css = re.findall(r'<link rel="stylesheet"[^>]*>', src)
pre = re.findall(r'<link rel="modulepreload"[^>]*>', src)
js = re.findall(r'<script type="module"[^>]*></script>', src)
metas = re.findall(r'<meta name="theme-color"[^>]*>', src)
out = "\n".join([f"<title>{title}</title>", *metas, theme, *css, *pre, '<div id="root"></div>', *js]) + "\n"
open("dist-artifact/journal.html", "w").write(out)
print(out)
