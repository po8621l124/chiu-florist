"""後台存檔後整理作品照片：轉 webp、限制長邊、產生 480/960 縮圖、回填 width/height。"""
import json
import os
from PIL import Image, ImageOps

DATA = 'data/works.json'
DIR = 'image/chiu'
MAX_SIDE = 2000
THUMBS = (480, 960)  # 原圖寬超過 1.15 倍才做，和前台 rs() 的判斷一致

with open(DATA, encoding='utf-8') as f:
    data = json.load(f)
before = json.dumps(data, ensure_ascii=False)
cats = {c['id']: c['name'] for c in data.get('categories', [])}

for w in data['works']:
    name = os.path.basename(str(w.get('image') or ''))
    if not name:
        continue
    stem, ext = os.path.splitext(name)
    src = os.path.join(DIR, name)
    webp = os.path.join(DIR, stem + '.webp')
    fresh = False

    if os.path.exists(src):
        im = Image.open(src)
        if ext.lower() != '.webp' or max(im.size) > MAX_SIDE:
            im = ImageOps.exif_transpose(im).convert('RGB')
            im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
            im.save(webp, 'WEBP', quality=82, method=6)
            fresh = True
    if not os.path.exists(webp):
        print(f'::warning::找不到照片 {name}（作品：{w.get("title")}）')
        continue

    im = Image.open(webp)
    W, H = im.size
    w['image'], w['width'], w['height'] = stem + '.webp', W, H
    # shortcut: 用同檔名覆蓋上傳 webp 時不會重做縮圖，遇到再手動刪縮圖
    for t in THUMBS:
        out = os.path.join(DIR, str(t), stem + '.webp')
        if W > t * 1.15 and (fresh or not os.path.exists(out)):
            os.makedirs(os.path.dirname(out), exist_ok=True)
            im.convert('RGB').resize((t, round(H * t / W)), Image.LANCZOS).save(out, 'WEBP', quality=80, method=6)
            print('縮圖', out)

    if not w.get('label'):
        w['label'] = cats.get(w.get('category'), '')

if json.dumps(data, ensure_ascii=False) != before:
    with open(DATA, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('已更新', DATA)
