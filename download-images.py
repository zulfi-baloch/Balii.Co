"""
Balli.Co: download all website photos into the /images folder.

Run this ONCE on your own computer (needs internet), from inside the website folder:
    python download-images.py

It reads the photo list from js/config.js, saves each photo as images/<id>.jpg,
and switches the site to local mode (useLocalImages: true).
"""
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONFIG = ROOT / "js" / "config.js"
OUT = ROOT / "images"
OUT.mkdir(exist_ok=True)

text = CONFIG.read_text(encoding="utf-8")
photos = re.findall(r'provider:\s*"(pexels|unsplash)",\s*id:\s*"([^"]+)"', text)
seen, failed = set(), []

def url_for(provider, pid, width=1200):
    if provider == "pexels":
        return f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&w={width}"
    return f"https://images.unsplash.com/{pid}?auto=format&fit=crop&q=75&w={width}"

for provider, pid in photos:
    if pid in seen:
        continue
    seen.add(pid)
    dest = OUT / f"{pid}.jpg"
    if dest.exists() and dest.stat().st_size > 5000:
        print("have", dest.name)
        continue
    temp = dest.with_suffix(".jpg.part")
    for attempt in range(3):
        try:
            req = urllib.request.Request(url_for(provider, pid), headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as response:
                if not response.headers.get_content_type().startswith("image/"):
                    raise ValueError("server did not return an image")
                with temp.open("wb") as out:
                    while True:
                        chunk = response.read(64 * 1024)
                        if not chunk:
                            break
                        out.write(chunk)
            if temp.stat().st_size <= 5000:
                raise ValueError("downloaded file is too small")
            temp.replace(dest)
            print("saved", dest.name)
            break
        except Exception as e:
            temp.unlink(missing_ok=True)
            if attempt == 2:
                failed.append(pid)
                print("FAILED", pid, "-", e)
            else:
                print("retry", dest.name, "-", e)
                time.sleep(attempt + 1)

if failed:
    print(f"\n{len(failed)} photo(s) failed. Site left in live mode. Check your internet and run again.")
    sys.exit(1)

new = re.sub(r"useLocalImages:\s*false", "useLocalImages: true", text)
CONFIG.write_text(new, encoding="utf-8")
print(f"\nDone: {len(seen)} photos saved. Site now uses the local /images folder.")
