(function() {
    if (document.getElementById('red-hud-panel')) document.getElementById('red-hud-panel').remove();

    const isMobile = window.innerWidth < 768;

    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&display=swap');

        #red-hud-panel {
            position: fixed; inset: 0; z-index: 2147483647;
            pointer-events: none;
            font-family: 'Share Tech Mono', 'Courier New', monospace;
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 15px; box-sizing: border-box;
        }

        #red-hud-panel .hud-frame {
            position: absolute; inset: 0; border: 3px solid #FF003C;
            box-shadow: inset 0 0 30px rgba(255, 0, 60, 0.4), 0 0 20px rgba(255, 0, 60, 0.6);
            pointer-events: none; animation: hud-pulse 2s infinite alternate;
        }
        @keyframes hud-pulse {
            0% { box-shadow: inset 0 0 20px rgba(255, 0, 60, 0.3), 0 0 10px rgba(255, 0, 60, 0.4); }
            100% { box-shadow: inset 0 0 50px rgba(255, 0, 60, 0.6), 0 0 30px rgba(255, 0, 60, 0.8); }
        }

        #red-hud-panel .hud-corner { position: absolute; width: 40px; height: 40px; border: 4px solid #FF003C; }
        #red-hud-panel .tc { top: 0; left: 0; border-right: none; border-bottom: none; }
        #red-hud-panel .tr { top: 0; right: 0; border-left: none; border-bottom: none; }
        #red-hud-panel .bc { bottom: 0; left: 0; border-right: none; border-top: none; }
        #red-hud-panel .br { bottom: 0; right: 0; border-left: none; border-top: none; }

        #red-hud-panel .hud-top-bar {
            display: flex; justify-content: space-between; align-items: flex-start;
            pointer-events: auto; gap: 10px; width: 100%; position: relative;
        }

        .hud-panel-box {
            background: rgba(10, 0, 0, 0.85); border: 1px solid #FF003C;
            padding: 8px; border-radius: 4px; backdrop-filter: blur(5px);
            box-shadow: 0 0 15px rgba(255, 0, 60, 0.4); color: #FF003C;
        }

        /* جستجو در صفحه */
        .hud-search-wrap { display: flex; gap: 5px; flex: 1; max-width: 450px; align-items: center; }
        .hud-search-input {
            flex: 1; background: #000; border: 1px solid #FF003C; color: #FF003C;
            padding: 8px 12px; font-family: inherit; outline: none; border-radius: 4px;
            min-width: 80px;
        }
        .hud-search-input::placeholder { color: rgba(255, 0, 60, 0.5); }
        
        .hud-search-count {
            color: #FF003C; font-size: 12px; min-width: 40px; text-align: center;
            font-weight: bold; text-shadow: 0 0 5px #FF003C;
        }

        .hud-btn {
            background: rgba(255, 0, 60, 0.1); color: #FF003C; border: 1px solid #FF003C;
            padding: 8px 12px; font-family: inherit; cursor: pointer; border-radius: 4px;
            font-weight: bold; transition: 0.2s; text-transform: uppercase;
            display: flex; align-items: center; justify-content: center;
        }
        .hud-btn:hover { background: #FF003C; color: #000; box-shadow: 0 0 15px #FF003C; }
        .hud-btn:active { transform: scale(0.95); }
        .hud-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* لیست لینک‌ها */
        .hud-links-box {
            display: none; flex-direction: column; max-height: 400px;
            width: ${isMobile ? '90vw' : '450px'}; position: absolute;
            top: 60px; right: 15px; z-index: 100;
        }
        .hud-links-box.open { display: flex; }
        .hud-links-list {
            overflow-y: auto; max-height: 300px; display: flex; flex-direction: column; gap: 5px;
            margin-top: 10px; padding-right: 5px;
        }
        
        /* لینک‌ها حالا قابل کلیک هستند و زیر پنل گیر نمی‌کنند */
        .hud-link-item {
            color: #ccc; text-decoration: none; font-size: 12px; padding: 8px;
            border-bottom: 1px dashed rgba(255, 0, 60, 0.3); word-break: break-all;
            transition: 0.2s; cursor: pointer; pointer-events: auto;
            display: block; background: rgba(0,0,0,0.5); border-radius: 3px;
        }
        .hud-link-item:hover { color: #FF003C; background: rgba(255, 0, 60, 0.2); border-bottom-color: #FF003C; }
        .hud-link-item::before { content: '> '; color: #FF003C; font-weight: bold; }

        /* ماشین حساب */
        #hud-calc {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: ${isMobile ? '320px' : '280px'}; background: rgba(5, 0, 0, 0.95);
            border: 2px solid #FF003C; border-radius: 8px; padding: 15px;
            pointer-events: auto; box-shadow: 0 0 30px rgba(255, 0, 60, 0.5);
            display: none; flex-direction: column; z-index: 50;
        }
        #hud-calc.open { display: flex; }
        .hud-calc-screen {
            background: #000; border: 1px solid #FF003C; color: #FF003C;
            font-size: 24px; text-align: right; padding: 10px; margin-bottom: 10px;
            font-family: 'Orbitron', monospace; border-radius: 4px;
            min-height: 50px; word-wrap: break-word; overflow-x: auto;
        }
        .hud-calc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .hud-calc-grid button {
            background: #1a0000; color: #FF003C; border: 1px solid rgba(255, 0, 60, 0.5);
            padding: 12px; font-size: 16px; font-family: 'Orbitron', sans-serif;
            border-radius: 4px; cursor: pointer; transition: 0.1s;
        }
        .hud-calc-grid button:hover { background: #FF003C; color: #000; }
        .hud-calc-grid .op { background: rgba(255, 0, 60, 0.2); }
        .hud-calc-grid .eq { background: #FF003C; color: #000; font-weight: bold; }

        .hud-bottom-bar {
            position: absolute; bottom: 10px; left: 20px; right: 20px;
            display: flex; justify-content: space-between; pointer-events: none;
            color: #FF003C; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
        }

        /* استایل هایلایت جستجو */
        mark.hud-highlight {
            background: rgba(255, 0, 60, 0.4); color: #fff; border-radius: 2px;
            font-weight: bold; transition: background 0.2s;
        }
        /* موردی که در حال حاضر انتخاب شده */
        mark.hud-highlight.active-match {
            background: #FF003C; color: #000; box-shadow: 0 0 10px #FF003C;
        }
    `;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.id = 'red-hud-panel';
    panel.innerHTML = `
        <div class="hud-frame"></div>
        <div class="hud-corner tc"></div>
        <div class="hud-corner tr"></div>
        <div class="hud-corner bc"></div>
        <div class="hud-corner br"></div>

        <div class="hud-top-bar">
            <div class="hud-search-wrap hud-panel-box">
                <input type="text" class="hud-search-input" id="hud-search-in" placeholder="جستجو در صفحه...">
                <span class="hud-search-count" id="hud-search-count">0/0</span>
                <button class="hud-btn" id="hud-search-prev" title="مورد قبلی" disabled>▲</button>
                <button class="hud-btn" id="hud-search-next" title="مورد بعدی" disabled>▼</button>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="hud-btn" id="hud-toggle-links">🔗 لینک‌ها</button>
                <button class="hud-btn" id="hud-toggle-calc">🧮 ماشین‌حساب</button>
            </div>
        </div>

        <div class="hud-panel-box hud-links-box" id="hud-links-box">
            <div style="font-weight:bold; margin-bottom:5px; font-size:12px;">لینک‌های صفحه (${document.querySelectorAll('a').length}):</div>
            <input type="text" class="hud-search-input" id="hud-link-filter" placeholder="فیلتر لینک‌ها..." style="margin-bottom:5px; padding:5px;">
            <div class="hud-links-list" id="hud-links-list"></div>
        </div>

        <div id="hud-calc">
            <div class="hud-calc-screen" id="hud-calc-screen">0</div>
            <div class="hud-calc-grid">
                <button onclick="hudCalc('C')" class="op">C</button>
                <button onclick="hudCalc('DEL')" class="op">⌫</button>
                <button onclick="hudCalc('(')">(</button>
                <button onclick="hudCalc(')')">)</button>
                <button onclick="hudCalc('7')">7</button>
                <button onclick="hudCalc('8')">8</button>
                <button onclick="hudCalc('9')">9</button>
                <button onclick="hudCalc('/')" class="op">÷</button>
                <button onclick="hudCalc('4')">4</button>
                <button onclick="hudCalc('5')">5</button>
                <button onclick="hudCalc('6')">6</button>
                <button onclick="hudCalc('*')" class="op">×</button>
                <button onclick="hudCalc('1')">1</button>
                <button onclick="hudCalc('2')">2</button>
                <button onclick="hudCalc('3')">3</button>
                <button onclick="hudCalc('-')" class="op">-</button>
                <button onclick="hudCalc('0')">0</button>
                <button onclick="hudCalc('.')">.</button>
                <button onclick="hudCalc('=')" class="eq">=</button>
                <button onclick="hudCalc('+')" class="op">+</button>
            </div>
            <div style="text-align:center; margin-top:10px;">
                <button class="hud-btn" style="width:100%;" onclick="document.getElementById('hud-calc').classList.remove('open')">بستن</button>
            </div>
        </div>

        <div class="hud-bottom-bar">
            <span>SYS: ACTIVE</span>
            <span>DEVICE: ${isMobile ? 'MOBILE' : 'DESKTOP'}</span>
            <span>HUD v1.1</span>
        </div>
    `;
    document.body.appendChild(panel);

    // === 1. ماشین حساب ===
    let hudExpr = "";
    const hudScreen = document.getElementById('hud-calc-screen');
    window.hudCalc = function(val) {
        if (val === 'C') { hudExpr = ""; hudScreen.innerText = "0"; return; }
        if (val === 'DEL') { hudExpr = hudExpr.slice(0, -1); hudScreen.innerText = hudExpr || "0"; return; }
        if (val === '=') {
            try {
                let res = new Function("return " + hudExpr)();
                if (!isFinite(res)) throw "Err";
                hudExpr = res.toString(); hudScreen.innerText = hudExpr;
            } catch {
                hudScreen.innerText = "ERROR"; hudExpr = "";
                setTimeout(() => hudScreen.innerText = "0", 1000);
            }
            return;
        }
        if (hudExpr === "0" && val !== ".") hudExpr = "";
        hudExpr += val;
        hudScreen.innerText = hudExpr;
    };

    document.getElementById('hud-toggle-calc').onclick = () => {
        document.getElementById('hud-calc').classList.toggle('open');
    };

    // === 2. استخراج لینک‌ها ===
    const linksBox = document.getElementById('hud-links-box');
    const linksList = document.getElementById('hud-links-list');
    const linkFilter = document.getElementById('hud-link-filter');
    
    const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim() || a.title || a.href,
        href: a.href
    })).filter(l => l.href.startsWith('http'));

    function renderLinks(filterText = '') {
        linksList.innerHTML = '';
        const filtered = allLinks.filter(l => 
            l.text.toLowerCase().includes(filterText.toLowerCase()) || 
            l.href.toLowerCase().includes(filterText.toLowerCase())
        );
        
        if (filtered.length === 0) {
            linksList.innerHTML = '<div style="color:#888; font-size:12px; text-align:center;">لینکی یافت نشد.</div>';
            return;
        }

        filtered.forEach(l => {
            const a = document.createElement('a');
            a.className = 'hud-link-item';
            a.href = l.href;
            a.target = '_blank'; // باز شدن در تب جدید
            a.innerText = l.text + ' (' + l.href + ')';
            linksList.appendChild(a);
        });
    }

    document.getElementById('hud-toggle-links').onclick = () => {
        linksBox.classList.toggle('open');
        if (linksBox.classList.contains('open')) renderLinks();
    };

    linkFilter.addEventListener('input', (e) => renderLinks(e.target.value));

    // === 3. جستجو و اسکرول هوشمند ===
    const searchIn = document.getElementById('hud-search-in');
    const searchCount = document.getElementById('hud-search-count');
    const btnPrev = document.getElementById('hud-search-prev');
    const btnNext = document.getElementById('hud-search-next');
    
    let matches = [];
    let currentMatchIndex = -1;

    function performSearch() {
        // پاکسازی نتایج قبلی
        document.querySelectorAll('mark.hud-highlight').forEach(m => {
            const parent = m.parentNode;
            parent.replaceChild(document.createTextNode(m.textContent), m);
            parent.normalize();
        });
        
        matches = [];
        currentMatchIndex = -1;
        const term = searchIn.value.trim();
        
        if (!term) {
            searchCount.innerText = '0/0';
            btnPrev.disabled = true;
            btnNext.disabled = true;
            return;
        }

        const regex = new RegExp(term, 'gi');
        const walker = document.createTreeWalker(
            document.body, NodeFilter.SHOW_TEXT, 
            { acceptNode: node => {
                if (node.parentElement.closest('#red-hud-panel') || 
                    ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT'].includes(node.parentElement.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }}
        );

        let node;
        const nodesToReplace = [];

        while (node = walker.nextNode()) {
            if (node.nodeValue.match(regex)) nodesToReplace.push(node);
        }

        nodesToReplace.forEach(n => {
            const frag = document.createDocumentFragment();
            let lastIndex = 0;
            n.nodeValue.replace(regex, (match, offset) => {
                frag.appendChild(document.createTextNode(n.nodeValue.substring(lastIndex, offset)));
                const mark = document.createElement('mark');
                mark.className = 'hud-highlight';
                mark.textContent = match;
                frag.appendChild(mark);
                matches.push(mark); // ذخیره در لیست نتایج
                lastIndex = offset + match.length;
            });
            frag.appendChild(document.createTextNode(n.nodeValue.substring(lastIndex)));
            n.parentNode.replaceChild(frag, n);
        });

        if (matches.length > 0) {
            currentMatchIndex = 0;
            goToMatch(currentMatchIndex);
            btnPrev.disabled = false;
            btnNext.disabled = false;
        } else {
            searchCount.innerText = '0/0';
            btnPrev.disabled = true;
            btnNext.disabled = true;
        }
    }

    function goToMatch(index) {
        // حذف حالت انتخاب شده از قبلی
        matches.forEach(m => m.classList.remove('active-match'));
        
        const match = matches[index];
        match.classList.add('active-match');
        
        // اسکرول به کلمه پیدا شده
        match.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // آپدیت کانتر
        searchCount.innerText = (index + 1) + '/' + matches.length;
    }

    // رویدادهای دکمه‌ها
    btnNext.onclick = () => {
        if (matches.length === 0) return;
        currentMatchIndex = (currentMatchIndex + 1) % matches.length;
        goToMatch(currentMatchIndex);
    };

    btnPrev.onclick = () => {
        if (matches.length === 0) return;
        currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
        goToMatch(currentMatchIndex);
    };

    // جستجو با زدن Enter (رفتن به مورد بعدی)
    searchIn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (matches.length === 0) {
                performSearch(); // اگه هنوز سرچ نشده بود
            } else {
                btnNext.click(); // برو به بعدی
            }
        }
    });

    // === 4. بستن با Escape ===
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (document.getElementById('hud-calc').classList.contains('open')) {
                document.getElementById('hud-calc').classList.remove('open');
            } else if (linksBox.classList.contains('open')) {
                linksBox.classList.remove('open');
            } else {
                document.querySelectorAll('mark.hud-highlight').forEach(m => {
                    const parent = m.parentNode;
                    parent.replaceChild(document.createTextNode(m.textContent), m);
                    parent.normalize();
                });
                panel.remove();
            }
        }
    });

    console.log('🔴 Red HUD Panel v1.1 (Clickable Links & Smart Search) Loaded.');
})();