/* =========================================================
   CHIU.FLORIST 共用 menu / footer
   用法（同步插入，不需伺服器，file:// 也能用）：
     header 位置：<script src="../js/chiu_layout.js" data-part="header"></script>
     footer 位置：<script src="../js/chiu_layout.js" data-part="footer"></script>（放在 .hs_box 內）
   修改選單或頁尾只要改這支檔案，5 頁會一起更新。
   ========================================================= */
(function () {
    var IG = 'https://www.instagram.com/chiu.florist/';
    var FB = 'https://www.facebook.com/p/Chiuflorist-100071734697100/';
    var fbIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 3H17v3.5h-2.2a1 1 0 0 0-1 1V10H17l-.5 3.5h-2.7V21h-3.6v-7.5H8V10h2.2V7a4 4 0 0 1 4-4z"/></svg>';
    var igIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>';

    /* 選單項目：改這裡就好 */
    var NAV = [
        { href: 'index.html',   zh: '首頁',     en: 'Home',    inNav: false },
        { href: 'about.html',   zh: '關於',     en: 'About',   inNav: true },
        { href: 'works.html#portfolio', zh: '作品', en: 'Works',   inNav: true },
        { href: 'lessons.html', zh: '花藝課程', en: 'Lessons', inNav: true },
        { href: 'contact.html', zh: '聯絡',     en: 'Contact', inNav: true }
    ];

    var page = location.pathname.split('/').pop() || 'index.html';
    function cur(href) { return href.split('#')[0] === page ? ' aria-current="page"' : ''; }
    function pad(n) { return (n < 10 ? '0' : '') + n; }

    var navLinks = NAV.filter(function (n) { return n.inNav; }).map(function (n) {
        return '<li><a href="' + n.href + '"' + cur(n.href) + '><b>' + n.zh + '</b><i>' + n.en + '</i></a></li>';
    }).join('');

    var menuLinks = NAV.map(function (n, i) {
        return '<li><a href="' + n.href + '" style="--i:' + i + '"' + cur(n.href) + '><span class="ch_menu_num">' + pad(i + 1) + '</span><b>' + n.zh + '</b><i>' + n.en + '</i></a></li>';
    }).join('');

    var footerLinks = NAV.map(function (n) {
        return '<li><a href="' + n.href + '">' + n.zh + '</a></li>';
    }).join('');

    var HEADER =
        '<a class="ch_skip" href="#main">跳到主要內容</a>' +
        '<header class="ch_header">' +
            '<div class="ch_header_in">' +
                '<a class="ch_logo" href="index.html" aria-label="CHIU.FLORIST 首頁"><i>Chiu</i><span>FLORIST</span></a>' +
                '<nav class="ch_nav" aria-label="主選單"><ul>' + navLinks + '</ul></nav>' +
                '<div class="ch_hd_r">' +
                    '<a class="ch_hd_ig" href="' + IG + '" target="_blank" rel="noopener" aria-label="Instagram（另開視窗）">' + igIcon + '</a>' +
                    '<a class="ch_hd_ig" href="' + FB + '" target="_blank" rel="noopener" aria-label="Facebook（另開視窗）">' + fbIcon + '</a>' +
                    '<a class="ch_hd_btn" href="contact.html">預約諮詢</a>' +
                    '<button class="ch_burger" type="button" aria-expanded="false" aria-controls="ch_menu" aria-label="開啟選單"><span></span><span></span><span></span></button>' +
                '</div>' +
            '</div>' +
        '</header>' +
        '<div class="ch_menu" id="ch_menu">' +
            '<ul>' + menuLinks + '</ul>' +
            '<div class="ch_menu_info">' +
                '<p>台中・工作室採預約制</p>' +
                '<p>Instagram <a href="' + IG + '" target="_blank" rel="noopener">@chiu.florist</a></p>' +
                '<p>Facebook <a href="' + FB + '" target="_blank" rel="noopener">Chiuflorist</a></p>' +
            '</div>' +
        '</div>' +
        '<button class="ch_totop" type="button" aria-label="回到頂端"><svg class="ring" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="24"/></svg><svg class="arw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>' +
        '<div class="ch_chat">' +
            '<ul class="ch_chat_list" id="ch_chat_list">' +
                '<li><a href="https://ig.me/m/chiu.florist" target="_blank" rel="noopener"><span>Instagram 私訊</span><i class="ig">' + igIcon + '</i></a></li>' +
                '<li><a href="' + FB + '" target="_blank" rel="noopener"><span>Facebook 粉專</span><i class="fb">' + fbIcon + '</i></a></li>' +
            '</ul>' +
            '<button class="ch_chat_btn" type="button" aria-expanded="false" aria-controls="ch_chat_list" aria-label="聯絡我們：Instagram、Facebook">' +
                '<svg class="open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>' +
                '<svg class="close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
            '</button>' +
        '</div>';

    var FOOTER =
        '<footer class="ch_footer">' +
            '<div class="ch_footer_in">' +
                '<div class="ch_footer_a">' +
                    '<a class="ch_footer_logo" href="index.html" aria-label="CHIU.FLORIST 首頁"><i>Chiu</i><span>FLORIST</span></a>' +
                    '<p>The Art of Florals and Spaces.</p>' +
                '</div>' +
                '<div class="ch_footer_b">' +
                    '<div>' +
                        '<h3>About</h3>' +
                        '<p>台中花藝工作室。訂製花禮、婚慶活動視覺佈置、商業軟裝空間設計、企業商用週花與花藝課程。</p>' +
                        '<a class="ch_footer_ig" href="' + IG + '" target="_blank" rel="noopener">' + igIcon + '<span>@chiu.florist</span></a>' +
                        '<a class="ch_footer_ig" href="' + FB + '" target="_blank" rel="noopener">' + fbIcon + '<span>Chiuflorist</span></a>' +
                    '</div>' +
                    '<div><h3>Menu</h3><ul>' + footerLinks + '</ul></div>' +
                    '<div><h3>Services</h3><ul>' +
                        '<li>訂製花禮</li><li>婚慶活動視覺佈置</li><li>商業軟裝空間設計</li><li>企業商用週花</li><li>專屬黃銅家飾選品</li>' +
                    '</ul></div>' +
                    '<div><h3>Contact</h3><ul>' +
                        '<li>服務地區｜台中</li><li>工作室採預約制，地點請私訊詢問</li><li><a href="contact.html">線上諮詢表單</a></li>' +
                    '</ul></div>' +
                '</div>' +
                '<div class="ch_footer_c">' +
                    '<p>© ' + new Date().getFullYear() + ' CHIU.FLORIST. All rights reserved.</p>' +
                    '<p>Taichung, Taiwan</p>' +
                '</div>' +
            '</div>' +
        '</footer>';

    var me = document.currentScript;
    var part = me && me.getAttribute('data-part');
    if (part === 'header') me.insertAdjacentHTML('beforebegin', HEADER);
    if (part === 'footer') me.insertAdjacentHTML('beforebegin', FOOTER);
})();
