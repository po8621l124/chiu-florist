/* 首頁主視覺：花瓣緩緩飄落（Canvas 2D，無外部套件）
   - 頁面載入完才啟動，不影響首屏速度
   - 系統設定「減少動態效果」時不執行
   - 主視覺捲出畫面時暫停 */
(function () {
    var hero = document.querySelector('.chi_a');
    if (!hero || !window.requestAnimationFrame) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* 花瓣顏色：柔粉、奶油杏、米白、古銅金（取自品牌色與作品色系） */
    var COLORS = [[232, 196, 190], [240, 214, 196], [244, 239, 230], [214, 178, 128]];

    function start() {
        var cv = document.createElement('canvas');
        cv.className = 'chi_a_petals';
        cv.setAttribute('aria-hidden', 'true');
        hero.insertBefore(cv, hero.querySelector('.chi_a01'));
        var ctx = cv.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        var W = 0, H = 0, petals = [], running = false, last = 0;
        var wind = 0, windTo = 0;

        /* 預先畫好各色花瓣（之後只做位移旋轉，省效能） */
        var sprites = COLORS.map(function (c) {
            var s = document.createElement('canvas'), S = 64;
            s.width = S; s.height = S;
            var g = s.getContext('2d');
            g.translate(S / 2, S / 2);
            g.beginPath();
            g.moveTo(0, -28);
            g.bezierCurveTo(18, -22, 20, 10, 0, 28);
            g.bezierCurveTo(-20, 10, -18, -22, 0, -28);
            var grd = g.createRadialGradient(-4, -6, 2, 0, 0, 30);
            grd.addColorStop(0, 'rgba(255,252,248,1)');
            grd.addColorStop(.55, 'rgb(' + c + ')');
            grd.addColorStop(1, 'rgba(' + c + ',.75)');
            g.fillStyle = grd;
            g.fill();
            /* 中央一條淡淡的葉脈 */
            g.beginPath(); g.moveTo(0, -20); g.quadraticCurveTo(2, 0, 0, 22);
            g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.stroke();
            return s;
        });

        function make(fromTop) {
            var z = .45 + Math.random() * .55;           /* 景深：越小越遠 */
            return {
                x: Math.random() * W,
                y: fromTop ? -40 - Math.random() * H * .3 : Math.random() * H,
                z: z,
                size: (13 + Math.random() * 11) * z,
                vy: (18 + Math.random() * 22) * z,        /* px/s */
                sway: 20 + Math.random() * 30,
                phase: Math.random() * Math.PI * 2,
                spin: (Math.random() - .5) * 1.4,
                rot: Math.random() * Math.PI * 2,
                flip: Math.random() * Math.PI * 2,
                flipV: .8 + Math.random() * 1.6,
                img: sprites[(Math.random() * sprites.length) | 0]
            };
        }

        function resize() {
            W = hero.clientWidth; H = hero.clientHeight;
            cv.width = W * dpr; cv.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var n = Math.round(Math.min(14, Math.max(6, W * H / 120000)));   /* 手機約 6 片、桌機約 14 片 */
            while (petals.length < n) petals.push(make(false));
            petals.length = n;
        }

        function frame(t) {
            if (!running) return;
            var dt = Math.min((t - (last || t)) / 1000, .05);
            last = t;
            wind += (windTo - wind) * .02;
            ctx.clearRect(0, 0, W, H);
            for (var i = 0; i < petals.length; i++) {
                var p = petals[i];
                p.phase += dt * .9;
                p.y += p.vy * dt;
                p.x += (Math.sin(p.phase) * p.sway * .6 + wind * 40 * p.z) * dt;
                p.rot += p.spin * dt;
                p.flip += p.flipV * dt;
                if (p.y > H + 40 || p.x < -60 || p.x > W + 60) { petals[i] = make(true); continue; }
                ctx.save();
                ctx.globalAlpha = .35 + p.z * .5;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.scale(1, .25 + Math.abs(Math.cos(p.flip)) * .75);   /* 翻面：看起來像在空中翻轉 */
                ctx.drawImage(p.img, -p.size, -p.size, p.size * 2, p.size * 2);
                ctx.restore();
            }
            requestAnimationFrame(frame);
        }

        function play(on) {
            if (on === running) return;
            running = on;
            if (on) { last = 0; requestAnimationFrame(frame); }
        }

        /* 滑鼠左右移動：花瓣跟著微微飄向那一側 */
        hero.addEventListener('pointermove', function (e) {
            if (e.pointerType !== 'mouse') return;
            windTo = (e.clientX / window.innerWidth - .5) * 2;
        });
        hero.addEventListener('pointerleave', function () { windTo = 0; });

        window.addEventListener('resize', resize);
        resize();
        new IntersectionObserver(function (en) { play(en[0].isIntersecting); }).observe(hero);
        requestAnimationFrame(function () { cv.classList.add('is-on'); });
    }

    function later() { setTimeout(start, 600); }
    if (document.readyState === 'complete') later();
    else window.addEventListener('load', later);
})();
