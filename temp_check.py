import os, re
from pathlib import Path
pages = list(Path('src/pages').glob('*.tsx'))
for f in pages:
    print(f"{f.name}: {len(re.findall(r'<h1', f.read_text(encoding='utf-8'), re.I))}")
