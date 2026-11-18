"""
Subsets the site's variable fonts to the characters Taren uses (Latin + Latin-1 incl. Swedish
å ä ö, typographic punctuation and arrows). Keeps the weight axis and the OpenType features the
design uses. Output is committed, so builds do not need Python.

Run from site/:  python3 -m pip install fonttools brotli && python3 scripts/subset-fonts.py
"""
from pathlib import Path
from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules/@fontsource-variable"
OUT = ROOT / "src/assets/fonts"
UNICODES = (
    "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,"
    "U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,"
    "U+20AC,U+2122,U+2190-2193,U+2197,U+2212,U+00D7"
)
FEATURES = "kern,liga,calt,ccmp,locl,mark,mkmk,ss01,cv11,tnum,lnum,case"

for src, dst in [
    ("inter/files/inter-latin-wght-normal.woff2", "inter-subset.woff2"),
    ("sora/files/sora-latin-wght-normal.woff2", "sora-subset.woff2"),
]:
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = FEATURES.split(",")
    opts.unicodes = subset.parse_unicodes(UNICODES)
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    font = subset.load_font(str(SRC / src), opts)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=opts.unicodes)
    sub.subset(font)
    subset.save_font(font, str(OUT / dst), opts)
    before = (SRC / src).stat().st_size
    after = (OUT / dst).stat().st_size
    print(f"{dst}: {before} -> {after} bytes")
