/* CHIU.FLORIST 共通互動：header、手機選單、回頂、視差、滑動列 */
(function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var body = document.body;
    var header = document.querySelector('.ch_header');
    var menu = document.querySelector('.ch_menu');
    var burger = document.querySelector('.ch_burger');
    var totop = document.querySelector('.ch_totop');

    /* ---------- Header 狀態 ---------- */
    var lastY = window.scrollY;
    function onScroll() {
        var y = window.scrollY;
        if (header) {
            header.classList.toggle('is-scrolled', y > 40);
            var goingDown = y > lastY && y > 320;
            if (!body.classList.contains('menu-open')) header.classList.toggle('is-hidden', goingDown);
        }
        if (totop) {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            totop.classList.toggle('is-show', y > 600);
            totop.style.setProperty('--p', max > 0 ? (y / max).toFixed(3) : 0);
        }
        lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- 手機選單 ---------- */
    function setMenu(open) {
        if (!menu || !burger) return;
        body.classList.toggle('menu-open', open);
        menu.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open);
        burger.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
        menu.inert = !open;
        if (open) { var first = menu.querySelector('a'); if (first) setTimeout(function () { first.focus(); }, 300); }
    }
    if (menu) menu.inert = true;
    if (burger) burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 992 && menu && menu.classList.contains('is-open')) setMenu(false); });

    /* ---------- 回頂 ---------- */
    if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

    /* ---------- 視差 data-parallax="0.15" ---------- */
    var pEls = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (pEls.length && !reduce) {
        var ticking = false;
        function para() {
            var vh = window.innerHeight;
            pEls.forEach(function (el) {
                var r = el.parentElement.getBoundingClientRect();
                if (r.bottom < -200 || r.top > vh + 200) return;
                var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
                var offset = (r.top + r.height / 2 - vh / 2) * -speed;
                el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
            });
            ticking = false;
        }
        window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(para); } }, { passive: true });
        window.addEventListener('resize', para);
        para();
    }

    /* ---------- 滑動列 .ch_slider ---------- */
    [].forEach.call(document.querySelectorAll('.ch_slider'), function (sl) {
        var track = sl.querySelector('.ch_slider_track');
        var prev = sl.querySelector('.ch_arw.prev');
        var next = sl.querySelector('.ch_arw.next');
        var bar = sl.querySelector('.ch_slider_bar i');
        if (!track) return;
        function step() { var c = track.children[0]; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 30) : 300; }
        function update() {
            var max = track.scrollWidth - track.clientWidth;
            var ratio = track.clientWidth / track.scrollWidth;
            if (bar) {
                var barW = bar.parentElement.clientWidth;
                bar.style.setProperty('--w', (ratio * 100) + '%');
                bar.style.setProperty('--x', (max > 0 ? (track.scrollLeft / max) * (barW - barW * ratio) : 0) + 'px');
            }
            if (prev) prev.disabled = track.scrollLeft <= 2;
            if (next) next.disabled = track.scrollLeft >= max - 2;
        }
        if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
        if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
        track.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();

        /* 滑鼠拖曳 */
        var down = false, sx = 0, sl0 = 0, moved = false;
        track.addEventListener('pointerdown', function (e) {
            if (e.pointerType !== 'mouse') return;
            down = true; moved = false; sx = e.clientX; sl0 = track.scrollLeft;
        });
        window.addEventListener('pointermove', function (e) {
            if (!down) return;
            var dx = e.clientX - sx;
            if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-drag'); }
            if (moved) track.scrollLeft = sl0 - dx;
        });
        window.addEventListener('pointerup', function () {
            if (!down) return; down = false;
            setTimeout(function () { track.classList.remove('is-drag'); }, 0);
        });
        track.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });

    /* ---------- 標題斷行：依「｜」分段，每段不從中間斷開（規格書 §6-1 的 <s> 做法） ---------- */
    window.chSegment = function (el) {
        if (!el || el.children.length || el.textContent.indexOf('｜') < 0) return;
        var parts = el.textContent.split('｜');
        el.textContent = '';
        parts.forEach(function (t, i) {
            var s = document.createElement('s'); s.textContent = t.trim() + (i < parts.length - 1 ? '｜' : '');
            el.appendChild(s);
        });
    };
    [].forEach.call(document.querySelectorAll('.hs_box h1, .hs_box h2, .hs_box h3'), window.chSegment);

    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- 捲動進度條 ---------- */
    var bar = document.createElement('div');
    bar.className = 'ch_progress'; bar.setAttribute('aria-hidden', 'true');
    body.appendChild(bar);
    function progress() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.setProperty('--sp', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    }
    window.addEventListener('scroll', progress, { passive: true });
    window.addEventListener('resize', progress);
    progress();

    /* ---------- 游標標籤：作品卡顯示 View、滑動列顯示 Drag ---------- */
    [].forEach.call(document.querySelectorAll('.ch_work a, .chw_grid button'), function (el) { if (!el.hasAttribute('data-cursor')) el.setAttribute('data-cursor', 'View'); });
    [].forEach.call(document.querySelectorAll('.ch_slider_track'), function (el) { if (!el.hasAttribute('data-cursor')) el.setAttribute('data-cursor', 'Drag'); });

    if (finePointer && !reduce) {
        /* ---------- 自訂游標 ---------- */
        var ring = document.createElement('div'); ring.className = 'ch_cursor'; ring.setAttribute('aria-hidden', 'true');
        var label = document.createElement('span'); ring.appendChild(label);
        var dot = document.createElement('div'); dot.className = 'ch_cursor_dot'; dot.setAttribute('aria-hidden', 'true');
        body.appendChild(ring); body.appendChild(dot);
        var mx = -100, my = -100, rx = -100, ry = -100;
        document.addEventListener('mousemove', function (e) {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
            body.classList.add('cursor-on');
        }, { passive: true });
        document.addEventListener('mouseleave', function () { body.classList.remove('cursor-on'); });
        (function follow() {
            rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
            ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
            requestAnimationFrame(follow);
        })();
        document.addEventListener('mouseover', function (e) {
            var lab = e.target.closest('[data-cursor]');
            var link = e.target.closest('a, button, label, summary, [role="button"], input, select, textarea');
            if (lab) { label.textContent = lab.getAttribute('data-cursor'); ring.classList.add('is-label'); ring.classList.remove('is-link'); }
            else { ring.classList.remove('is-label'); ring.classList.toggle('is-link', !!link); }
        });

        /* ---------- 磁吸按鈕 ---------- */
        [].forEach.call(document.querySelectorAll('.ch_btn, .ch_hd_btn, .ch_hd_ig, .ch_arw, .ch_totop'), function (el) {
            var k = el.classList.contains('ch_btn') || el.classList.contains('ch_hd_btn') ? 0.22 : 0.35;
            el.addEventListener('mousemove', function (e) {
                var r = el.getBoundingClientRect();
                el.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * k).toFixed(1) + 'px');
                el.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * k).toFixed(1) + 'px');
            });
            el.addEventListener('mouseleave', function () { el.style.removeProperty('--mx'); el.style.removeProperty('--my'); });
        });

        /* ---------- 3D 傾斜卡片 ---------- */
        [].forEach.call(document.querySelectorAll('[data-tilt]'), function (el) {
            el.addEventListener('mousemove', function (e) {
                var r = el.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
                el.classList.add('is-tilting');
                el.style.transform = 'perspective(1600px) rotateX(' + (-py * 1.6).toFixed(2) + 'deg) rotateY(' + (px * 2.2).toFixed(2) + 'deg) translateY(-4px)';
            });
            el.addEventListener('mouseleave', function () { el.classList.remove('is-tilting'); el.style.transform = ''; });
        });
    }

    /* ---------- 跑馬燈：跟著捲動加速，往上捲時反向 ---------- */
    [].forEach.call(document.querySelectorAll('.ch_marquee'), function (m) {
        var tr = m.querySelector('.ch_marquee_track');
        if (!tr || reduce) return;
        tr.style.animation = 'none';
        var x = 0, v = 0, dir = 1, lastY = window.scrollY, hover = false, onScreen = false;
        m.addEventListener('mouseenter', function () { hover = true; });
        m.addEventListener('mouseleave', function () { hover = false; });
        if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; }).observe(m);
        else onScreen = true;
        (function loop() {
            var y = window.scrollY, dy = y - lastY; lastY = y;
            v += (dy - v) * 0.12;
            if (Math.abs(dy) > 1) dir = dy > 0 ? 1 : -1;
            if (onScreen) {
                var half = tr.scrollWidth / 2;
                var speed = hover ? 0.15 : 0.6 + Math.min(Math.abs(v) * 0.35, 14);
                x -= speed * dir;
                if (x <= -half) x += half;
                if (x > 0) x -= half;
                tr.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
            }
            requestAnimationFrame(loop);
        })();
    });
    /* 聯絡浮動按鈕：點開 IG／FB */
    (function () {
        var chat = document.querySelector('.ch_chat');
        if (!chat) return;
        var btn = chat.querySelector('.ch_chat_btn');
        function set(open) { chat.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open); }
        btn.addEventListener('click', function () { set(!chat.classList.contains('is-open')); });
        document.addEventListener('click', function (e) { if (!chat.contains(e.target)) set(false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && chat.classList.contains('is-open')) { set(false); btn.focus(); } });
        [].forEach.call(chat.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { set(false); }); });
    })();

})();
