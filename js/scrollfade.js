/* =========================================================
   scrollfade.js（CHIU.FLORIST 本機改良版）
   與原版 API 相容：
     data-animate-in            進場動畫類型（CSS 依 .in-view 切換）
     data-animate-in-delay      延遲（毫秒）
     data-animate-mobile-size / data-animate-mobile-in-delay   小螢幕專用延遲
     data-detect-repeat="N"     只播一次，不再收回
   改良：
     1. 進入畫面 10% 才觸發，不在最底部就播完（以實際位置判斷，避免 perspective 造成誤判）
     2. 同一父層的多個動畫元素自動依序延遲（已手動指定延遲者不變）
     3. 離場依方向：捲過去的往上淡出（.sf-above），還沒到的往下收回
     4. 延遲寫在 --sf_delay，只作用在進場，離場不拖泥帶水
   ========================================================= */
(function () {
    var html = document.documentElement;
    html.classList.add('ontouchstart' in window ? 'isTouch' : 'noTouch');
    if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) html.classList.add('isSafari');

    var SEL = '[data-animate-in], [data-detect-viewport], [data-detect-repeat], [data-animate-mobile-size], [data-animate-mobile-in-delay]';
    var STEP = 0.09, MAX_STEP = 5;

    function init() {
        var items = [].slice.call(document.querySelectorAll(SEL));
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /* 延遲：手動指定優先，其次同層自動依序 */
        var groups = [];
        items.forEach(function (el) {
            var d = el.getAttribute('data-animate-in-delay');
            var mSize = el.getAttribute('data-animate-mobile-size');
            if (mSize && document.body.clientWidth <= +mSize && el.hasAttribute('data-animate-mobile-in-delay')) d = el.getAttribute('data-animate-mobile-in-delay');
            if (d !== null && d !== '') { el.style.setProperty('--sf_delay', (d / 1000) + 's'); return; }
            var p = el.parentElement, g = null;
            for (var i = 0; i < groups.length; i++) if (groups[i].p === p) { g = groups[i]; break; }
            if (!g) { g = { p: p, list: [] }; groups.push(g); }
            g.list.push(el);
        });
        groups.forEach(function (g) {
            if (g.list.length < 2) return;
            g.list.forEach(function (el, i) { el.style.setProperty('--sf_delay', (Math.min(i, MAX_STEP) * STEP).toFixed(2) + 's'); });
        });

        if (reduce) {
            items.forEach(function (el) { el.classList.add('in-view'); });
            return;
        }

        /* 以實際位置判斷（模板的 perspective 會讓 IntersectionObserver 誤判，故不用） */
        var ticking = false;
        function check() {
            ticking = false;
            var vh = window.innerHeight, enter = vh * 0.9;
            for (var i = 0; i < items.length; i++) {
                var el = items[i];
                if (!el.offsetParent && el.getClientRects().length === 0) continue;   /* display:none */
                var r = el.getBoundingClientRect();
                var repeat = el.getAttribute('data-detect-repeat') !== 'N';
                if (r.top < enter && r.bottom > 0) {
                    if (!el.classList.contains('in-view')) { el.classList.remove('sf-above'); el.classList.add('in-view'); }
                } else if (repeat && el.classList.contains('in-view')) {
                    el.classList.toggle('sf-above', r.bottom <= 0);
                    el.classList.remove('in-view');
                }
            }
        }
        function request() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', request);
        window.addEventListener('load', request);
        check();
        window.sfCheck = request;   /* 版面變動後（篩選、分頁）可手動重新檢查 */
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
