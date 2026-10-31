"""Erzeugt den PhysicsTrainer aus den Quellen im Ordner src/.

Aufruf im Ordner quellcode:   python3 build_website.py
  -> ../index.html            Startseite (Adresse der Claude-Version steht in src/app.js: CLAUDE_URL)
  -> ../ohne-tutor/index.html  Version ohne KI-Tutor für GitHub Pages (Schriften und KaTeX lokal)
  -> claude/index.html         Claude-Version mit KI-Tutor (zum Veröffentlichen auf claude.ai)

Aufgaben stehen in src/tasks.js, das Demo-Skript in src/skript.js, die Einheiten in src/units.js.
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def build(src, out_root, out_claude):
    rd = lambda f: open(os.path.join(src, f), encoding="utf-8").read()
    js = "\n".join(rd(f) for f in ["skript.js", "tasks.js", "units.js", "app.js"]).replace("</script", "<\\/script")
    claude_url = re.search(r'const CLAUDE_URL = "([^"]+)"', js).group(1)
    css = rd("ct.css") + "\n" + rd("pt.css")
    body = rd("body.html")
    fonts_google = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
                    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Barlow:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;600&display=swap">\n')
    katex = '<link rel="stylesheet" href="katex/katex.min.css">\n<script src="katex/katex.min.js"></script>\n'
    inner = "<style>\n" + css + "\n</style>\n" + body + "\n<script>\n" + js + "\n</script>\n"
    # Claude-Version: die Plattform ergänzt das HTML-Grundgerüst
    claude = '<title>PhysicsTrainer</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n' + fonts_google + katex + inner
    # Version ohne Tutor: vollständige Seite, Schriften lokal (keine Anfragen an Google)
    standalone = ('<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
                  '<title>PhysicsTrainer (ohne KI-Tutor)</title>\n<link rel="stylesheet" href="fonts/fonts.css">\n' + katex +
                  '<style>body{margin:0}[hidden]{display:none!important}</style>\n</head>\n<body>\n' + inner + '</body>\n</html>\n')
    landing = rd("landing.html").replace("/*LANDING_CSS*/", rd("landing.css")).replace("/*CLAUDE_URL*/", claude_url)
    os.makedirs(out_claude, exist_ok=True); os.makedirs(os.path.join(out_root, "ohne-tutor"), exist_ok=True)
    open(os.path.join(out_claude, "index.html"), "w", encoding="utf-8").write(claude)
    open(os.path.join(out_root, "ohne-tutor", "index.html"), "w", encoding="utf-8").write(standalone)
    open(os.path.join(out_root, "index.html"), "w", encoding="utf-8").write(landing)
    return claude, standalone, landing


if __name__ == "__main__":
    build(os.path.join(HERE, "src"), os.path.join(HERE, ".."), os.path.join(HERE, "claude"))
    print("Startseite, ohne-tutor/index.html und quellcode/claude/index.html geschrieben")
