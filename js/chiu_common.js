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
})();
