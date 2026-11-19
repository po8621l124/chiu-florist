"""依 data/works.json 把作品卡直接寫進 HTML（讓 Google 不必跑 JS 就讀得到作品）。
只替換 <!--works:xxx--> 與 <!--/works:xxx--> 之間的內容。"""
import json
import re
from html import escape
from urllib.parse import quote

with open('data/works.json', encoding='utf-8') as f:
    data = json.load(f)
works = data['works']


def esc(s):
    return escape('' if s is None else str(s))


def img(w, sizes):
    """響應式圖片：原圖寬超過 1.15 倍才提供 480／960 縮圖（和 process_images.py 一致）"""
    n = re.sub(r'\.webp$', '', str(w['image']))
    W = int(w.get('width') or 0)
    srcset = [f'../image/chiu/{t}/{n}.webp {t}w' for t in (480, 960) if W > t * 1.15]
    attr = ''
    if srcset:
        srcset.append(f'../image/chiu/{n}.webp {W}w')
        attr = f' srcset="{esc(", ".join(srcset))}" sizes="{sizes}" onerror="this.onerror=null;this.removeAttribute(\'srcset\')"'
    return (f'<img src="../image/chiu/{esc(w["image"])}"{attr} alt="{esc(w["label"] + "｜" + w["title"])}"'
            f' width="{W or ""}" height="{w.get("height") or ""}" loading="lazy">')


def txt(w):
    return f'<div class="ch_work_txt"><i>{esc(w["label"])}</i><h3>{esc(w["title"])}</h3></div>'


def block(items, indent):
    pad = ' ' * indent
    return '\n' + ''.join(pad + i + '\n' for i in items) + pad[:-4] if items else ''


def put(path, parts):
    with open(path, encoding='utf-8', newline='') as f:
        src = f.read()
    out = src
    for key, html in parts.items():
        pat = re.compile(rf'(<!--works:{key}-->).*?(<!--/works:{key}-->)', re.S)
        if not pat.search(out):
            raise SystemExit(f'{path} 找不到 <!--works:{key}--> 標記')
        out = pat.sub(lambda m: m.group(1) + html + m.group(2), out, count=1)
    if out != src:
        with open(path, 'w', encoding='utf-8', newline='') as f:
            f.write(out)
        print('已更新', path)


# 作品頁：分類按鈕、數量、作品卡（故事放在 hidden 段落，燈箱打開時顯示）
filters = ['<li><button type="button" data-filter="all" aria-pressed="true"><span>全部</span><sup></sup></button></li>'] + [
    f'<li><button type="button" data-filter="{esc(c["id"])}" aria-pressed="false"><span>{esc(c["name"])}</span><sup></sup></button></li>'
    for c in data['categories']]
cards = [
    f'<li class="ch_work" data-cat="{esc(w["category"])}" data-ig="{esc(w.get("instagram"))}">'
    f'<button type="button" data-cursor="View"><figure>{img(w, "(max-width: 768px) 50vw, 33vw")}</figure>{txt(w)}</button>'
    f'<div class="chw_story" hidden>{esc(w.get("story"))}</div></li>'
    for w in works]
put('html/works.html', {'filter': ''.join(filters), 'count': str(len(works)), 'grid': block(cards, 16)})

# 首頁：作品精選
feat = [
    f'<article class="ch_work"><a href="works.html?cat={quote(str(w["category"]))}#portfolio" data-cursor="View">'
    f'<figure>{img(w, "(max-width: 768px) 70vw, 340px")}</figure>{txt(w)}</a></article>'
    for w in works if w.get('featured')]
put('html/index.html', {'featured': block(feat, 16)})
