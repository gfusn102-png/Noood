/* ============================================
   💀 ADB Panel v5.0 — تکه ۱
   Core + ۲ تم + API
   ============================================ */
(function() {
    window.ADB = window.ADB || {};
    const B = window.ADB;

    B.spamTexts = [];
    B.settings = {
        delay: 5, mode: "sequential", replyMode: false, infinite: true, maxCount: 100,
        burstMode: false, burstCount: 5, theme: "gold_black",
        turboMode: false, parallelMode: false, parallelCount: 10, parallelRest: 1,
        timerEnabled: false, timerSeconds: 30, timerAction: "stop",
        autoReportEnabled: false, autoReportInterval: 2000 // هر ۲ ثانیه ریپورت
    };

    B.spamRunning = false;
    B.spamToken = 0;
    B.spamCount = 0;
    B.spamStartTime = 0;
    B.spamTimer = null;
    B.countdownTimer = null;
    B.countdownEnd = 0;
    B.currentIndex = 0;
    B.reportRunning = false;
    B.reportTimer = null;

    B.getGlobal = null;
    B.getActions = null;
    B.sendMessage = null;
    B.isReady = false;

    B.THEMES = {
        "gold_black": {
            name: "🏆🖤 طلایی+مشکی",
            bg: "linear-gradient(135deg,#0A0A00 0%,#1A1505 50%,#0A0A00 100%)",
            border: "#DAA520", accent: "#FFD700", accent2: "#DAA520",
            header: "linear-gradient(90deg,#0A0A00 0%,#2A2205 50%,#0A0A00 100%)",
            title: "#FFD700", titleShadow: "0 0 8px #FFD700, 0 0 16px #DAA520",
            text: "#F5F0D0", textDim: "#998866", titleBar: "#FFE066",
            inputBg: "#0A0A00", inputBorder: "#3A3000",
            btnSave: "linear-gradient(135deg,#2A2205,#DAA520)",
            btnClear: "linear-gradient(135deg,#1A1505,#4A3A00)",
            btnStart: "linear-gradient(135deg,#1A1505,#DAA520)",
            btnStop: "linear-gradient(135deg,#0A0A00,#2A2205)",
            status: "#FFE066", footer: "#DAA520"
        },
        "red_black": {
            name: "🔥🖤 قرمز+مشکی",
            bg: "linear-gradient(135deg,#0A0000 0%,#1A0505 50%,#0A0000 100%)",
            border: "#DC143C", accent: "#FF1744", accent2: "#DC143C",
            header: "linear-gradient(90deg,#0A0000 0%,#2A0505 50%,#0A0000 100%)",
            title: "#FF1744", titleShadow: "0 0 8px #FF1744, 0 0 16px #DC143C",
            text: "#FFE8E8", textDim: "#AA7766", titleBar: "#FF6B6B",
            inputBg: "#0A0000", inputBorder: "#3A0000",
            btnSave: "linear-gradient(135deg,#2A0505,#DC143C)",
            btnClear: "linear-gradient(135deg,#1A0505,#4A0A0A)",
            btnStart: "linear-gradient(135deg,#1A0505,#DC143C)",
            btnStop: "linear-gradient(135deg,#0A0000,#2A0505)",
            status: "#FF6B6B", footer: "#DC143C"
        }
    };

    B.initAPI = async function(retries = 10) {
        for (let i = 0; i < retries; i++) {
            try {
                if (!window.webpackChunkSoroushPlus) { await new Promise(r => setTimeout(r, 1500)); continue; }
                let req;
                window.webpackChunkSoroushPlus.push([
                    ["__adb_panel__"], { "__adb_panel__": (m, e, r) => { req = r; } }, (r) => { r("__adb_panel__"); }
                ]);
                let stateModule = null;
                for (const id in req.m) {
                    try {
                        const src = req.m[id].toString();
                        if (!src.includes("getGlobal") || !src.includes("getActions")) continue;
                        const mod = req(id);
                        for (const key in mod) {
                            if (typeof mod[key] !== "function") continue;
                            try {
                                const instance = mod[key]();
                                if (instance && instance.getGlobal && instance.getActions) { stateModule = instance; break; }
                            } catch (_) {}
                        }
                        if (stateModule) break;
                    } catch (_) {}
                }
                if (!stateModule) throw new Error("API not found");
                B.getGlobal = stateModule.getGlobal;
                B.getActions = stateModule.getActions();
                B.sendMessage = B.getActions.sendMessage;
                if (typeof B.sendMessage !== "function") throw new Error("sendMessage not found");
                B.isReady = true;
                console.log("✅ تکه ۱ ADB — API آماده");
                return true;
            } catch (_) { await new Promise(r => setTimeout(r, 1500)); }
        }
        console.log("❌ تکه ۱ ADB — اتصال نشد");
        return false;
    };

    console.log("✅ تکه ۱ ADB v5.0 — Core + ۲ تم لود شد");
})();
/* ============================================
   💀 ADB Panel v5.0 — تکه ۲
   توابع ارسال + اتوریپورت
   ============================================ */
(function() {
    const B = window.ADB;
    if (!B) { console.log("❌ اول تکه ۱ رو اجرا کن"); return; }

    B.getActiveTabId = function(g) {
        if (!g || !g.byTabId) return null;
        const candidates = [g.activeTabId, g.selectedTabId, g.currentTabId, g.activeTab, g.selectedTab];
        for (const c of candidates) if (c != null && g.byTabId[c]) return String(c);
        if (Array.isArray(g.tabsOrder) && g.tabsOrder.length) {
            const last = String(g.tabsOrder[g.tabsOrder.length - 1]);
            if (g.byTabId[last]) return last;
        }
        const keys = Object.keys(g.byTabId);
        return keys.length ? keys[keys.length - 1] : null;
    };

    B.getCurrentChatInfo = function() {
        if (!B.isReady) return null;
        try {
            const g = B.getGlobal();
            if (!g || !g.byTabId) return null;
            const tabId = B.getActiveTabId(g);
            if (!tabId) return null;
            const tab = g.byTabId[tabId];
            if (!tab || !tab.messageLists || !tab.messageLists.length) return null;
            const ml = tab.messageLists[tab.messageLists.length - 1];
            let replyId = null;
            if (B.settings.replyMode) {
                const cs = [tab.replyToMessage, tab.replyMessage, tab.repliedTo, tab.selectedReply, tab.replyTo, g.replyToMessage];
                for (const c of cs) {
                    if (c == null) continue;
                    if (typeof c === "number" || typeof c === "string") { replyId = c; break; }
                    if (typeof c === "object") {
                        const v = c.id ?? c.messageId ?? c.msgId ?? null;
                        if (v != null) { replyId = v; break; }
                    }
                }
            }
            return {
                tabId: tabId,
                messageList: { chatId: String(ml.chatId), type: ml.type || "thread", threadId: ml.threadId || -1 },
                replyId: replyId
            };
        } catch (_) { return null; }
    };

    B.sendText = function(text) {
        const info = B.getCurrentChatInfo();
        if (!info) return false;
        try {
            const p = { messageList: info.messageList, text: String(text), tabId: info.tabId };
            if (info.replyId != null) { p.replyTo = info.replyId; p.replyToMessageId = info.replyId; }
            B.sendMessage(p);
            return true;
        } catch (_) { return false; }
    };

    B.pickNextText = function() {
        if (!B.spamTexts.length) return null;
        if (B.settings.mode === "random") return B.spamTexts[Math.floor(Math.random() * B.spamTexts.length)];
        const t = B.spamTexts[B.currentIndex % B.spamTexts.length];
        B.currentIndex++;
        return t;
    };

    B.sendRaw = function(info, text) {
        try {
            const p = { messageList: info.messageList, text: String(text), tabId: info.tabId };
            if (info.replyId != null) { p.replyTo = info.replyId; p.replyToMessageId = info.replyId; }
            B.sendMessage(p);
            return true;
        } catch (_) { return false; }
    };

    B.sendBurst = function(count) {
        const info = B.getCurrentChatInfo();
        if (!info) return 0;
        let allowed = count;
        if (!B.settings.infinite) { const remain = B.settings.maxCount - B.spamCount; if (remain <= 0) return 0; allowed = Math.min(count, remain); }
        let sent = 0;
        for (let i = 0; i < allowed; i++) {
            if (!B.spamRunning) break;
            const text = B.pickNextText();
            if (text == null) break;
            if (B.sendRaw(info, text)) { sent++; B.spamCount++; }
        }
        return sent;
    };

    B.sendParallel = function(count) {
        const info = B.getCurrentChatInfo();
        if (!info) return 0;
        let allowed = count;
        if (!B.settings.infinite) { const remain = B.settings.maxCount - B.spamCount; if (remain <= 0) return 0; allowed = Math.min(count, remain); }
        let sent = 0;
        const queue = [];
        for (let i = 0; i < allowed; i++) { const text = B.pickNextText(); if (text == null) break; queue.push(text); }
        for (const text of queue) { if (!B.spamRunning) break; if (B.sendRaw(info, text)) { sent++; B.spamCount++; } }
        return sent;
    };

    // 🚨 اتوریپورت — پیدا کردن دکمه گزارش توی DOM و کلیک روی اون
    B.triggerReport = function() {
        // جستجوی دکمه‌های "گزارش" یا "report" توی صفحه
        const reportBtns = Array.from(document.querySelectorAll('div, button, span, a')).filter(el => {
            const text = (el.innerText || el.getAttribute('aria-label') || '').trim();
            return (text === 'گزارش' || text.includes('گزارش') || text.toLowerCase().includes('report'));
        });
        
        if (reportBtns.length > 0) {
            // کلیک روی اولین دکمه پیدا شده
            reportBtns[0].click();
            return true;
        }
        return false;
    };

    // ===== ذخیره / بارگذاری =====
    B.saveTexts = function() { try { localStorage.setItem("adb_texts_v5", JSON.stringify(B.spamTexts)); } catch (_) {} };
    B.loadTexts = function() { try { const raw = localStorage.getItem("adb_texts_v5"); if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) B.spamTexts = p; } } catch (_) {} };
    B.saveSettings = function() { try { localStorage.setItem("adb_settings_v5", JSON.stringify(B.settings)); } catch (_) {} };
    B.loadSettings = function() { try { const raw = localStorage.getItem("adb_settings_v5"); if (raw) { const p = JSON.parse(raw); Object.assign(B.settings, p); } } catch (_) {} };

    // ===== ابزارها =====
    B.sleep = ms => new Promise(r => setTimeout(r, ms));
    B.escapeHTML = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    B.$ = id => document.getElementById(id);
    B.setStatus = text => { const el = B.$("adb-status"); if (el) el.textContent = text; console.log("[" + text + "]"); };

    console.log("✅ تکه ۲ ADB v5.0 — توابع + اتوریپورت لود شد");
})();
/* ============================================
   💀 ADB Panel v5.0 — تکه ۳
   ساخت پنل UI
   ============================================ */
(function() {
    const B = window.ADB;
    if (!B) { console.log("❌ اول تکه ۱ و ۲ رو اجرا کن"); return; }

    const oldPanel = document.getElementById("adb-panel");
    if (oldPanel) oldPanel.remove();
    const oldStyle = document.getElementById("adb-style");
    if (oldStyle) oldStyle.remove();

    const style = document.createElement("style");
    style.id = "adb-style";
    style.textContent = `
    #adb-panel{position:fixed;top:60px;right:12px;width:300px;max-width:92vw;max-height:84vh;border:2px solid #DAA520;border-radius:6px;z-index:999999;font-family:Tahoma,Arial,sans-serif;direction:rtl;user-select:none;overflow:hidden;font-size:11px;opacity:.95;transition:box-shadow .3s,border-color .3s,opacity .3s,transform .3s}
    #adb-panel.stealth-hidden{opacity:0;pointer-events:none;transform:scale(0.9)}
    .adb-header{display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:2px solid;cursor:grab;position:relative;overflow:hidden}
    .adb-header::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:var(--scan-color,#FFD700);animation:adb-scan 3s linear infinite;z-index:2}
    @keyframes adb-scan{0%{opacity:.3;transform:translateX(-100%)}50%{opacity:1;transform:translateX(0)}100%{opacity:.3;transform:translateX(100%)}}
    .adb-title{font-size:12px;font-weight:bold;display:flex;align-items:center;gap:4px;position:relative;z-index:3;letter-spacing:1px}
    .adb-top{display:flex;gap:4px;direction:ltr;position:relative;z-index:3}
    .adb-top button{width:22px;height:20px;padding:0;border-radius:3px;cursor:pointer;font-weight:bold;font-size:11px}
    .adb-info{display:flex;justify-content:space-around;padding:5px;font-size:10px;border-bottom:1px solid;position:relative;z-index:2}
    .adb-info b{font-size:11px}
    .adb-body{padding:8px;display:flex;flex-direction:column;gap:6px;max-height:68vh;overflow-y:auto;position:relative;z-index:2}
    .adb-title-bar{font-size:10px;font-weight:bold;padding:3px 5px;border-right:3px solid}
    #adb-text-input,#adb-delay,#adb-max-count,#adb-burst-count,#adb-parallel-count,#adb-parallel-rest,#adb-timer-seconds,#adb-report-interval{width:100%;border-radius:4px;outline:none;padding:5px 6px;font-family:Tahoma;font-size:11px}
    #adb-text-input{min-height:60px;resize:vertical}
    #adb-delay,#adb-max-count,#adb-burst-count,#adb-parallel-count,#adb-parallel-rest,#adb-timer-seconds,#adb-report-interval{direction:ltr;text-align:center;font-weight:bold}
    .adb-save,.adb-clear,.adb-actions button,.adb-speed-presets button,.adb-theme-btn,.adb-burst-presets button,.adb-parallel-presets button,.adb-timer-presets button{border-radius:4px;cursor:pointer;font-weight:bold;padding:5px 6px;font-size:10px}
    .adb-save,.adb-clear,.adb-actions button{flex:1}
    .adb-row{display:flex;gap:5px}
    .adb-saved-box{min-height:30px;max-height:100px;overflow-y:auto;border-radius:4px;padding:5px;font-size:9px}
    .adb-saved-box div{display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid}
    .adb-saved-box button{border-radius:3px;cursor:pointer;padding:1px 4px;font-size:9px}
    .adb-options{display:flex;flex-direction:column;gap:4px;padding:6px;border-radius:4px}
    .adb-options label,.adb-reply{display:flex;align-items:center;gap:6px;font-size:10px;cursor:pointer}
    .adb-speed-presets,.adb-burst-presets,.adb-parallel-presets,.adb-timer-presets{display:flex;gap:3px}
    .adb-speed-presets button,.adb-burst-presets button,.adb-parallel-presets button,.adb-timer-presets button{flex:1;font-size:10px;padding:4px 2px}
    .adb-status{text-align:center;border-radius:4px;padding:5px;font-size:9px;transition:all .3s}
    .adb-actions{display:flex;gap:5px;direction:ltr}
    .adb-actions button{padding:7px;font-size:11px}
    .adb-footer{text-align:center;font-size:8px;padding:4px;border-top:1px solid;letter-spacing:1px}
    .adb-toggle-row{display:flex;justify-content:space-between;align-items:center;padding:5px 8px;border-radius:4px;font-size:10px}
    .adb-switch{position:relative;display:inline-block;width:34px;height:18px}
    .adb-switch input{opacity:0;width:0;height:0}
    .adb-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#333;border-radius:18px;transition:.3s}
    .adb-slider:before{position:absolute;content:"";height:12px;width:12px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s}
    .adb-switch input:checked+.adb-slider{background:#DAA520}
    .adb-switch input:checked+.adb-slider:before{transform:translateX(16px)}
    .adb-warn-text{font-size:9px;color:#FFA500;text-align:center;padding:3px;background:rgba(255,165,0,.1);border-radius:3px;display:none}
    .adb-warn-text.show{display:block}
    .adb-countdown{text-align:center;font-size:18px;font-weight:bold;padding:6px;border-radius:4px;direction:ltr;font-family:monospace;letter-spacing:2px}
    .adb-countdown.adb-countdown-active{color:#FFD700;text-shadow:0 0 10px #DAA520}
    .adb-report-btn{background:#3a0505;color:#FF1744;border:1px solid #FF1744;flex:1;padding:7px;font-size:11px}
    .adb-report-btn:hover{background:#FF1744;color:#000}
    `;
    document.head.appendChild(style);

    const panel = document.createElement("div");
    panel.id = "adb-panel";
    panel.innerHTML = `
        <div class="adb-header" id="adb-header">
            <div class="adb-title">💀 ADB v5.0 💀</div>
            <div class="adb-top">
                <button id="adb-min">−</button>
                <button id="adb-close">✕</button>
            </div>
        </div>
        <div class="adb-info">
            <div>📤 <b id="adb-count">0</b></div>
            <div>⏱ <b id="adb-time">0s</b></div>
            <div>⚡ <b id="adb-speed">0/s</b></div>
        </div>
        <div class="adb-body">
            <div class="adb-title-bar">🎨 تم</div>
            <div style="display:flex;gap:5px;margin-bottom:5px;" id="adb-themes"></div>

            <div class="adb-title-bar">🩸 متن‌ها (<span id="adb-text-count">0</span>)</div>
            <textarea id="adb-text-input" placeholder="هر خط یه متن..."></textarea>
            <div class="adb-row">
                <button class="adb-save" id="adb-save">＋ ذخیره</button>
                <button class="adb-clear" id="adb-clear">🗑 پاک</button>
            </div>
            <div class="adb-saved-box" id="adb-saved-box">هنوز متنی نیست</div>

            <div class="adb-title-bar">🎯 حالت ارسال</div>
            <div class="adb-options">
                <label><input type="radio" name="adb-mode" value="sequential" checked> ترتیبی</label>
                <label><input type="radio" name="adb-mode" value="random"> تصادفی</label>
            </div>

            <div class="adb-title-bar">💥 حالت Burst</div>
            <label class="adb-reply"><input type="checkbox" id="adb-burst-check"> ارسال Burst</label>
            <input type="number" id="adb-burst-count" value="5" min="1">
            <div class="adb-burst-presets">
                <button data-burst="5">5</button><button data-burst="10">10</button>
                <button data-burst="20">20</button><button data-burst="50">50</button>
                <button data-burst="100">100</button><button data-burst="999999">∞</button>
            </div>

            <div class="adb-title-bar">⚡ سرعت (ms)</div>
            <input type="number" id="adb-delay" value="5" min="1" max="1000">
            <div class="adb-speed-presets">
                <button data-speed="1">🔥🔥🔥</button><button data-speed="5">🔥🔥</button>
                <button data-speed="20">🔥</button><button data-speed="50">⚡</button>
                <button data-speed="100">🐢</button>
            </div>

            <div class="adb-title-bar">🚀 موتور Turbo</div>
            <div class="adb-toggle-row">
                <span>⚡ Turbo Mode</span>
                <label class="adb-switch"><input type="checkbox" id="adb-turbo-check"><span class="adb-slider"></span></label>
            </div>
            <div class="adb-toggle-row">
                <span>💥 Parallel Send</span>
                <label class="adb-switch"><input type="checkbox" id="adb-parallel-check"><span class="adb-slider"></span></label>
            </div>
            <input type="number" id="adb-parallel-count" value="10" min="1" max="50">
            <div class="adb-parallel-presets">
                <button data-parallel="5">5</button><button data-parallel="10">10</button>
                <button data-parallel="20">20</button><button data-parallel="50">50</button>
            </div>
            <input type="number" id="adb-parallel-rest" value="1" min="0" max="100">
            <div class="adb-warn-text" id="adb-warn-parallel">⚠️ تعداد بالای Parallel ریسک بن شدن داره</div>

            <div class="adb-title-bar">⏱️ تایمر خودکار</div>
            <div class="adb-toggle-row">
                <span>⏱️ فعال‌سازی تایمر</span>
                <label class="adb-switch"><input type="checkbox" id="adb-timer-check"><span class="adb-slider"></span></label>
            </div>
            <input type="number" id="adb-timer-seconds" value="30" min="1" max="3600">
            <div class="adb-timer-presets">
                <button data-timer="10">10s</button><button data-timer="30">30s</button>
                <button data-timer="60">1m</button><button data-timer="300">5m</button>
                <button data-timer="600">10m</button><button data-timer="3600">1h</button>
            </div>
            <div class="adb-options">
                <label><input type="radio" name="adb-timer-action" value="stop" checked> بعد از تایمر: توقف</label>
                <label><input type="radio" name="adb-timer-action" value="restart"> بعد از تایمر: شروع مجدد</label>
            </div>
            <div class="adb-countdown" id="adb-countdown">--:--</div>

            <div class="adb-title-bar">🔢 تعداد کل</div>
            <div class="adb-options">
                <label><input type="radio" name="adb-count-mode" value="infinite" checked> بی‌نهایت</label>
                <label><input type="radio" name="adb-count-mode" value="limited"> محدود</label>
            </div>
            <input type="number" id="adb-max-count" value="100" min="1" disabled>

            <div class="adb-title-bar">↩️ ریپلای</div>
            <label class="adb-reply"><input type="checkbox" id="adb-reply-check"> ارسال ریپلای</label>

            <!-- 🚨 اتوریپورت -->
            <div class="adb-title-bar">🚨 اتوریپورت</div>
            <div class="adb-toggle-row">
                <span>فعال‌سازی اتوریپورت</span>
                <label class="adb-switch"><input type="checkbox" id="adb-report-check"><span class="adb-slider"></span></label>
            </div>
            <input type="number" id="adb-report-interval" value="2000" min="500" max="10000" placeholder="فاصله (ms)">
            <div class="adb-row">
                <button class="adb-report-btn" id="adb-report-start">▶ شروع اتوریپورت</button>
                <button class="adb-stop" id="adb-report-stop">⏹ توقف</button>
            </div>

            <div class="adb-status" id="adb-status">💀 در حال اتصال...</div>

            <div class="adb-row">
                <button class="adb-start" id="adb-start">▶ شروع اسپم</button>
                <button class="adb-stop" id="adb-stop">⏹ توقف</button>
            </div>

            <div class="adb-footer">💀 ADB v5.0 — Auto-Reporter 💀</div>
        </div>
    `;
    document.body.appendChild(panel);

    console.log("✅ تکه ۳ ADB v5.0 — پنل ساخته شد");
})();
/* ============================================
   💀 ADB Panel v5.0 — تکه ۴
   منطق اسپم + تم + اتوریپورت
   ============================================ */
(function() {
    const B = window.ADB;
    if (!B) { console.log("❌ اول تکه‌های ۱، ۲، ۳ رو اجرا کن"); return; }
    const $ = B.$;

    B.applyTheme = function(themeName) {
        const t = B.THEMES[themeName];
        if (!t) return;
        B.settings.theme = themeName;
        B.saveSettings();
        const panel = $("adb-panel");
        if (!panel) return;
        panel.dataset.theme = themeName;
        panel.style.background = t.bg; panel.style.borderColor = t.border;
        panel.style.color = t.text; panel.style.boxShadow = "0 0 20px " + t.accent + "99";
        panel.style.setProperty("--scan-color", t.accent);
        
        const header = panel.querySelector(".adb-header");
        if (header) { header.style.background = t.header; header.style.borderBottomColor = t.border; }
        const title = panel.querySelector(".adb-title");
        if (title) { title.style.color = t.title; title.style.textShadow = t.titleShadow; }
        
        panel.querySelectorAll(".adb-title-bar").forEach(el => { el.style.color = t.titleBar; el.style.borderRightColor = t.border; el.style.background = "linear-gradient(90deg," + t.accent2 + "44 0%, transparent 100%)"; });
        panel.querySelectorAll("input, textarea").forEach(el => { el.style.background = t.inputBg; el.style.borderColor = t.inputBorder; el.style.color = t.text; });
        panel.querySelectorAll(".adb-info").forEach(el => { el.style.background = t.inputBg + "88"; el.style.borderBottomColor = t.border; el.style.color = t.textDim; });
        panel.querySelectorAll(".adb-save").forEach(el => { el.style.background = t.btnSave; el.style.borderColor = t.border; el.style.color = t.text; });
        panel.querySelectorAll(".adb-clear").forEach(el => { el.style.background = t.btnClear; el.style.borderColor = t.border; el.style.color = t.accent; });
        panel.querySelectorAll(".adb-start").forEach(el => { el.style.background = t.btnStart; el.style.borderColor = t.border; el.style.color = t.accent; });
        panel.querySelectorAll(".adb-stop").forEach(el => { el.style.background = t.btnStop; el.style.borderColor = t.border; el.style.color = t.textDim; });
        panel.querySelectorAll(".adb-saved-box").forEach(el => { el.style.background = t.inputBg; el.style.borderColor = t.inputBorder; el.style.color = t.textDim; });
        panel.querySelectorAll(".adb-saved-box div").forEach(el => { el.style.borderBottomColor = t.inputBorder; });
        panel.querySelectorAll(".adb-options,.adb-reply,.adb-toggle-row").forEach(el => { el.style.background = t.inputBg + "88"; el.style.borderColor = t.inputBorder; });
        panel.querySelectorAll(".adb-options label,.adb-reply,.adb-toggle-row span").forEach(el => { el.style.color = t.textDim; });
        panel.querySelectorAll("input[type=radio],input[type=checkbox]").forEach(el => { el.style.accentColor = t.accent; });
        panel.querySelectorAll(".adb-speed-presets button,.adb-burst-presets button,.adb-parallel-presets button,.adb-timer-presets button").forEach(el => { el.style.background = t.btnStop; el.style.borderColor = t.border; el.style.color = t.text; });
        panel.querySelectorAll(".adb-status").forEach(el => { el.style.background = t.inputBg; el.style.borderColor = t.inputBorder; el.style.color = t.status; });
        panel.querySelectorAll(".adb-footer").forEach(el => { el.style.color = t.footer; el.style.borderTopColor = t.border; });
        panel.querySelectorAll(".adb-top button").forEach(el => { el.style.background = t.btnClear; el.style.borderColor = t.border; el.style.color = t.accent; });
        panel.querySelectorAll(".adb-theme-btn").forEach(btn => {
            const tt = B.THEMES[btn.dataset.theme];
            if (tt) { btn.style.background = tt.bg; btn.style.borderColor = tt.border; btn.style.color = tt.title; btn.style.textShadow = "0 0 4px " + tt.title; }
        });
        localStorage.setItem("adb_theme", themeName);
    };

    B.buildThemeButtons = function() {
        const container = $("adb-themes");
        if (!container) return;
        container.innerHTML = "";
        for (const key in B.THEMES) {
            const t = B.THEMES[key];
            const btn = document.createElement("button");
            btn.className = "adb-theme-btn"; btn.dataset.theme = key; btn.textContent = t.name;
            btn.style.cssText = "flex:1; padding:5px 3px; font-size:9px; border-radius:4px; cursor:pointer;";
            btn.onclick = () => B.applyTheme(key);
            container.appendChild(btn);
        }
    };

    B.updateStats = function() {
        const c = $("adb-count"); if (c) c.textContent = B.spamCount;
        const tc = $("adb-text-count"); if (tc) tc.textContent = B.spamTexts.length;
        if (B.spamStartTime > 0) {
            const e = (Date.now() - B.spamStartTime) / 1000;
            const t = $("adb-time"); if (t) t.textContent = e.toFixed(1) + "s";
            const s = $("adb-speed"); if (s) s.textContent = (e > 0 ? (B.spamCount / e).toFixed(1) : 0) + "/s";
        }
    };

    B.updateSavedList = function() {
        const box = $("adb-saved-box"); if (!box) return;
        if (!B.spamTexts.length) { box.textContent = "هنوز متنی نیست"; B.updateStats(); return; }
        box.innerHTML = B.spamTexts.map((t, i) => '<div><span>' + (i + 1) + '. ' + B.escapeHTML(t.substring(0, 25)) + '</span><button data-idx="' + i + '">✕</button></div>').join("");
        box.querySelectorAll("button[data-idx]").forEach(btn => {
            btn.onclick = () => { if (!confirm("حذف بشه؟")) return; B.spamTexts.splice(Number(btn.dataset.idx), 1); B.saveTexts(); B.updateSavedList(); };
        });
        B.updateStats();
    };

    B.getDelay = function() { let d = Number($("adb-delay").value); if (!isFinite(d)) d = 5; d = Math.max(1, Math.min(1000, Math.floor(d))); $("adb-delay").value = d; B.settings.delay = d; return d; };
    B.getBurstCount = function() { let c = Number($("adb-burst-count").value); if (!isFinite(c) || c < 1) c = 5; c = Math.floor(c); $("adb-burst-count").value = c; B.settings.burstCount = c; return c; };
    B.getMaxCount = function() { let c = Number($("adb-max-count").value); if (!isFinite(c) || c < 1) c = 100; c = Math.floor(c); $("adb-max-count").value = c; B.settings.maxCount = c; return c; };
    B.getParallelCount = function() { let c = Number($("adb-parallel-count").value); if (!isFinite(c) || c < 1) c = 10; c = Math.max(1, Math.min(50, Math.floor(c))); $("adb-parallel-count").value = c; B.settings.parallelCount = c; return c; };
    B.getParallelRest = function() { let r = Number($("adb-parallel-rest").value); if (!isFinite(r) || r < 0) r = 1; r = Math.max(0, Math.min(100, Math.floor(r))); $("adb-parallel-rest").value = r; B.settings.parallelRest = r; return r; };
    B.getTimerSeconds = function() { let s = Number($("adb-timer-seconds").value); if (!isFinite(s) || s < 1) s = 30; s = Math.max(1, Math.min(3600, Math.floor(s))); $("adb-timer-seconds").value = s; B.settings.timerSeconds = s; return s; };

    $("adb-save").onclick = () => {
        const input = $("adb-text-input"); const value = input.value.trim();
        if (!value) { B.setStatus("💀 اول متن رو وارد کن"); return; }
        const entries = value.split(/\n+/).map(x => x.trim()).filter(Boolean);
        for (const t of entries) B.spamTexts.push(t);
        input.value = ""; B.saveTexts(); B.updateSavedList(); B.setStatus("💀 " + entries.length + " متن اضافه شد");
    };

    $("adb-clear").onclick = () => {
        if (B.spamRunning) { B.setStatus("💀 هنگام اجرا نمی‌شه"); return; }
        if (!confirm("همه‌ی متن‌ها پاک شن؟")) return;
        B.spamTexts = []; B.saveTexts(); B.updateSavedList(); B.setStatus("🗑 پاک شد");
    };

    document.querySelectorAll('input[name="adb-mode"]').forEach(inp => { inp.onchange = () => { B.settings.mode = inp.value; B.saveSettings(); }; });
    document.querySelectorAll('input[name="adb-count-mode"]').forEach(inp => { inp.onchange = () => { B.settings.infinite = inp.value === "infinite"; $("adb-max-count").disabled = B.settings.infinite; B.saveSettings(); }; });
    document.querySelectorAll('input[name="adb-timer-action"]').forEach(inp => { inp.onchange = () => { B.settings.timerAction = inp.value; B.saveSettings(); }; });
    $("adb-reply-check").onchange = () => { B.settings.replyMode = $("adb-reply-check").checked; B.saveSettings(); };
    $("adb-burst-check").onchange = () => { B.settings.burstMode = $("adb-burst-check").checked; B.saveSettings(); };
    $("adb-turbo-check").onchange = () => { B.settings.turboMode = $("adb-turbo-check").checked; B.saveSettings(); };
    $("adb-parallel-check").onchange = () => { B.settings.parallelMode = $("adb-parallel-check").checked; B.saveSettings(); };
    $("adb-timer-check").onchange = () => { B.settings.timerEnabled = $("adb-timer-check").checked; B.saveSettings(); if (B.settings.timerEnabled && B.spamRunning) B.startCountdown(); else B.stopCountdown(); };
    $("adb-report-check").onchange = () => { B.settings.autoReportEnabled = $("adb-report-check").checked; B.saveSettings(); };

    document.querySelectorAll(".adb-speed-presets button").forEach(btn => { btn.onclick = () => { $("adb-delay").value = btn.dataset.speed; B.getDelay(); }; });
    document.querySelectorAll(".adb-burst-presets button").forEach(btn => { btn.onclick = () => { $("adb-burst-count").value = btn.dataset.burst; B.getBurstCount(); }; });
    document.querySelectorAll(".adb-parallel-presets button").forEach(btn => { btn.onclick = () => { $("adb-parallel-count").value = btn.dataset.parallel; B.getParallelCount(); }; });
    document.querySelectorAll(".adb-timer-presets button").forEach(btn => { btn.onclick = () => { $("adb-timer-seconds").value = btn.dataset.timer; B.getTimerSeconds(); }; });

    // === منطق اسپم ===
    B.getEffectiveDelay = function() { if (B.settings.turboMode) return 0; return B.settings.delay; };

    B.runSpam = async function(token) {
        while (B.spamRunning && token === B.spamToken) {
            if (!B.spamTexts.length) { B.setStatus("💀 متنی نداری"); break; }
            if (B.settings.parallelMode) {
                const perBatch = B.getParallelCount(); const rest = B.getParallelRest();
                const sent = B.sendParallel(perBatch); B.updateStats();
                B.setStatus((B.settings.turboMode ? "🚀 Turbo+Parallel" : "💥 Parallel") + ": " + sent + " پیام");
                if (!B.settings.infinite && B.spamCount >= B.settings.maxCount) { B.setStatus("💀 تمام شد — " + B.spamCount); break; }
                await B.sleep(rest); continue;
            }
            if (B.settings.burstMode) {
                const burst = B.getBurstCount(); const sent = B.sendBurst(burst); B.updateStats();
                B.setStatus("💥 Burst: " + sent + " پیام");
                if (!B.settings.infinite && B.spamCount >= B.settings.maxCount) { B.setStatus("💀 تمام شد — " + B.spamCount); break; }
                await B.sleep(B.getEffectiveDelay()); continue;
            }
            const text = B.pickNextText();
            if (text != null && B.sendText(text)) { B.spamCount++; B.updateStats(); }
            if (!B.settings.infinite && B.spamCount >= B.settings.maxCount) { B.setStatus("💀 تمام شد — " + B.spamCount); break; }
            await B.sleep(B.getEffectiveDelay());
        }
    };

    B.startSpam = async function() {
        if (B.spamRunning) return;
        if (!B.isReady) { B.setStatus("💀 اتصال آماده نیست"); return; }
        if (!B.spamTexts.length) { B.setStatus("💀 اول متن اضافه کن"); return; }
        B.getMaxCount(); B.getDelay(); B.getBurstCount(); B.getParallelCount(); B.getParallelRest(); B.getTimerSeconds();
        B.settings.burstMode = $("adb-burst-check").checked; B.settings.turboMode = $("adb-turbo-check").checked;
        B.settings.parallelMode = $("adb-parallel-check").checked; B.settings.timerEnabled = $("adb-timer-check").checked;
        if (B.settings.parallelMode && B.settings.parallelCount > 15) { if (!confirm("⚠️ تعداد Parallel بالاست. مطمئنی؟")) return; }
        B.spamRunning = true; B.spamToken++; const token = B.spamToken;
        B.spamCount = 0; B.currentIndex = 0; B.spamStartTime = Date.now();
        B.updateStats(); B.spamTimer = setInterval(B.updateStats, 500);
        if (B.settings.timerEnabled) B.startCountdown();
        let modeText = "🔥 عادی";
        if (B.settings.parallelMode) modeText = B.settings.turboMode ? "🚀 Turbo+Parallel" : "💥 Parallel";
        else if (B.settings.burstMode) modeText = "💥 Burst " + B.settings.burstCount + "×";
        else if (B.settings.turboMode) modeText = "⚡ Turbo";
        B.setStatus(modeText + " — " + (B.settings.infinite ? "بی‌نهایت" : B.settings.maxCount + " پیام"));
        await B.runSpam(token);
        B.spamRunning = false; if (B.spamTimer) clearInterval(B.spamTimer); B.spamTimer = null; B.stopCountdown(); B.updateStats();
    };

    B.stopSpam = function() {
        if (!B.spamRunning) return;
        B.spamRunning = false; B.spamToken++;
        if (B.spamTimer) clearInterval(B.spamTimer); B.spamTimer = null;
        B.stopCountdown(); B.setStatus("⏹ متوقف شد — " + B.spamCount + " پیام");
    };

    // 🚨 راه‌اندازی اتوریپورت
    $("adb-report-start").onclick = () => {
        if (B.reportRunning) return;
        const interval = Number($("adb-report-interval").value) || 2000;
        B.reportRunning = true;
        B.setStatus("🚨 اتوریپورت فعال شد...");
        B.reportTimer = setInterval(() => {
            if (!B.reportRunning) return;
            const success = B.triggerReport();
            if (success) console.log("🚨 ریپورت انجام شد");
        }, interval);
    };

    $("adb-report-stop").onclick = () => {
        B.reportRunning = false;
        if (B.reportTimer) clearInterval(B.reportTimer);
        B.reportTimer = null;
        B.setStatus("⏹ اتوریپورت متوقف شد");
    };

    console.log("✅ تکه ۴ ADB v5.0 — منطق اسپم + اتوریپورت لود شد");
})();
/* ============================================
   💀 ADB Panel v5.0 — تکه ۵
   انیمیشن Float + ذرات
   ============================================ */
(function() {
    const B = window.ADB;
    if (!B) { console.log("❌ اول تکه‌های ۱-۴ رو اجرا کن"); return; }
    const $ = B.$;

    const animStyle = document.createElement("style");
    animStyle.id = "adb-anim";
    animStyle.textContent = `
    @keyframes adb-float { 0%,100%{transform:translate(0,0)} 50%{transform:translate(2px,-3px)} }
    @keyframes adb-float-fast { 0%,100%{transform:translate(0,0)} 50%{transform:translate(3px,-4px)} }
    #adb-panel.adb-idle { animation: adb-float 6s infinite ease-in-out; }
    #adb-panel.adb-running { animation: adb-float-fast 2s infinite ease-in-out, adb-glow 1.5s infinite ease-in-out; }
    #adb-panel.adb-typing, #adb-panel.stealth-hidden { animation: none; }
    @keyframes adb-glow { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.15)} }
    .adb-particles { position:absolute; inset:0; pointer-events:none; overflow:hidden; border-radius:6px; opacity:0; transition:opacity .6s; z-index:1; }
    #adb-panel.adb-running .adb-particles { opacity:1; }
    .adb-particle { position:absolute; width:4px; height:4px; border-radius:50%; background:radial-gradient(circle,#FFD700 0%,#DAA520 60%,transparent 100%); box-shadow:0 0 6px #FFD700; animation: adb-p-float linear infinite; }
    @keyframes adb-p-float { 0%{transform:translate(0,0); opacity:0} 10%{opacity:.9} 100%{transform:translate(0,-110px); opacity:0} }
    #adb-panel[data-theme="red_black"] .adb-particle { background:radial-gradient(circle,#FF1744 0%,#DC143C 60%,transparent 100%); box-shadow:0 0 6px #FF1744; }
    `;
    document.head.appendChild(animStyle);

    const panel = $("adb-panel");
    if (!panel) return;

    let particlesBox = panel.querySelector(".adb-particles");
    if (!particlesBox) {
        particlesBox = document.createElement("div");
        particlesBox.className = "adb-particles";
        panel.insertBefore(particlesBox, panel.firstChild);
    }

    B.buildParticles = function(count = 14) {
        particlesBox.innerHTML = "";
        for (let i = 0; i < count; i++) {
            const p = document.createElement("div");
            p.className = "adb-particle";
            p.style.left = (Math.random() * 100) + "%";
            p.style.top = (40 + Math.random() * 60) + "%";
            p.style.width = p.style.height = (2 + Math.random() * 4) + "px";
            p.style.animationDuration = (3 + Math.random() * 4) + "s";
            p.style.animationDelay = (-Math.random() * 4) + "s";
            particlesBox.appendChild(p);
        }
    };
    B.buildParticles();
    panel.classList.add("adb-idle");

    panel.addEventListener("focusin", e => { if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") panel.classList.add("adb-typing"); });
    panel.addEventListener("focusout", () => panel.classList.remove("adb-typing"));

    console.log("✅ تکه ۵ ADB v5.0 — انیمیشن لود شد");
})();
/* ============================================
   💀 ADB Panel v5.0 — تکه ۶
   تایمر خودکار
   ============================================ */
(function() {
    const B = window.ADB;
    if (!B) return;
    const $ = B.$;

    B.startCountdown = function() {
        B.stopCountdown();
        const seconds = B.getTimerSeconds();
        B.countdownEnd = Date.now() + seconds * 1000;
        const display = $("adb-countdown");
        if (display) { display.classList.add("adb-countdown-active"); display.textContent = B.formatTime(seconds); }
        B.countdownTimer = setInterval(() => {
            const remain = Math.max(0, Math.ceil((B.countdownEnd - Date.now()) / 1000));
            const d = $("adb-countdown");
            if (d) {
                d.textContent = B.formatTime(remain);
                d.style.color = remain <= 5 ? "#FF1744" : "#FFD700";
            }
            if (remain <= 0) { B.stopCountdown(); B.onTimerFinish(); }
        }, 250);
        B.setStatus("⏱️ تایمر فعال — " + seconds + " ثانیه");
    };

    B.stopCountdown = function() {
        if (B.countdownTimer) clearInterval(B.countdownTimer);
        B.countdownTimer = null; B.countdownEnd = 0;
        const d = $("adb-countdown");
        if (d) { d.classList.remove("adb-countdown-active"); d.textContent = "--:--"; d.style.color = ""; }
    };

    B.formatTime = function(totalSec) {
        totalSec = Math.max(0, Math.floor(totalSec));
        const h = Math.floor(totalSec / 3600), m = Math.floor((totalSec % 3600) / 60), s = totalSec % 60;
        const pad = n => String(n).padStart(2, "0");
        return (h > 0 ? pad(h) + ":" : "") + pad(m) + ":" + pad(s);
    };

    B.onTimerFinish = function() {
        const action = B.settings.timerAction || "stop";
        if (action === "stop") { B.setStatus("⏱️ تایمر تمام شد — توقف"); try { B.beep(); } catch(_) {} B.stopSpam(); }
        else if (action === "restart") { B.setStatus("🔄 تایمر تمام شد — شروع مجدد"); try { B.beep(); } catch(_) {} B.stopSpam(); setTimeout(() => { if (!B.spamRunning) B.startSpam(); }, 500); }
    };

    B.beep = function() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator(); const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 900; osc.type = "sine";
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
        } catch (_) {}
    };

    console.log("✅ تکه ۶ ADB v5.0 — تایمر لود شد");
})();
/* ============================================
   💀 ADB Panel v5.0 — تکه ۷
   Drag + حالت مخفی + میانبرها
   ============================================ */
(function() {
    const B = window.ADB;
    if (!B) return;
    const $ = B.$;

    $("adb-start").onclick = B.startSpam;
    $("adb-stop").onclick = B.stopSpam;

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && B.spamRunning) B.stopSpam();
        if (e.ctrlKey && e.key === "\\") {
            e.preventDefault();
            const p = $("adb-panel");
            if (p) {
                p.classList.toggle("stealth-hidden");
                B.setStatus(p.classList.contains("stealth-hidden") ? "🕵️ حالت مخفی" : "🟢 پنل برگشت");
            }
        }
        if (e.key === "Escape" && e.ctrlKey) {
            B.stopSpam();
            $("adb-report-stop").click();
            const p = $("adb-panel"); if (p) p.remove();
            const s = $("adb-style"); if (s) s.remove();
            const a = $("adb-anim"); if (a) a.remove();
        }
    });

    $("adb-min").onclick = () => {
        const body = document.querySelector(".adb-body");
        const info = document.querySelector(".adb-info");
        const isHidden = body.style.display === "none";
        body.style.display = isHidden ? "" : "none";
        info.style.display = isHidden ? "" : "none";
        $("adb-min").textContent = isHidden ? "−" : "+";
    };

    $("adb-close").onclick = () => {
        B.stopSpam(); $("adb-report-stop").click();
        $("adb-panel").remove();
        const s = $("adb-style"); if (s) s.remove();
        const a = $("adb-anim"); if (a) a.remove();
    };

    let dragging = false, offsetX = 0, offsetY = 0;
    const panel = $("adb-panel");
    const header = $("adb-header");

    function startDrag(e) {
        if (e.target.closest("button")) return;
        dragging = true;
        const p = e.touches ? e.touches[0] : e;
        const rect = panel.getBoundingClientRect();
        offsetX = p.clientX - rect.left; offsetY = p.clientY - rect.top;
        panel.style.right = "auto"; panel.style.bottom = "auto";
        panel.style.left = rect.left + "px"; panel.style.top = rect.top + "px";
        panel.style.opacity = "1"; e.preventDefault();
    }
    function moveDrag(e) {
        if (!dragging) return;
        const p = e.touches ? e.touches[0] : e;
        let nx = p.clientX - offsetX, ny = p.clientY - offsetY;
        nx = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, nx));
        ny = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, ny));
        panel.style.left = nx + "px"; panel.style.top = ny + "px"; e.preventDefault();
    }
    function endDrag() {
        if (!dragging) return;
        dragging = false; panel.style.opacity = "0.95";
        try { const r = panel.getBoundingClientRect(); localStorage.setItem("adb_pos_v5", JSON.stringify({ left: r.left, top: r.top })); } catch (_) {}
    }
    header.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("mouseup", endDrag);
    header.addEventListener("touchstart", startDrag, { passive: false });
    document.addEventListener("touchmove", moveDrag, { passive: false });
    document.addEventListener("touchend", endDrag);

    try {
        const saved = localStorage.getItem("adb_pos_v5");
        if (saved) { const pos = JSON.parse(saved); panel.style.right = "auto"; panel.style.bottom = "auto"; panel.style.left = pos.left + "px"; panel.style.top = pos.top + "px"; }
    } catch (_) {}

    console.log("✅ تکه ۷ ADB v5.0 — Drag + مخفی لود شد");
})();
/* ============================================
   💀 ADB Panel v5.0 — تکه ۸
   راه‌اندازی نهایی
   ============================================ */
(function() {
    const B = window.ADB;
    if (!B) return;
    const $ = B.$;

    B.loadTexts(); B.loadSettings();

    $("adb-delay").value = B.settings.delay;
    $("adb-max-count").value = B.settings.maxCount;
    $("adb-burst-count").value = B.settings.burstCount;
    $("adb-parallel-count").value = B.settings.parallelCount || 10;
    $("adb-parallel-rest").value = B.settings.parallelRest ?? 1;
    $("adb-timer-seconds").value = B.settings.timerSeconds || 30;
    $("adb-report-interval").value = B.settings.autoReportInterval || 2000;

    $("adb-burst-check").checked = B.settings.burstMode;
    $("adb-reply-check").checked = B.settings.replyMode;
    $("adb-turbo-check").checked = B.settings.turboMode;
    $("adb-parallel-check").checked = B.settings.parallelMode;
    $("adb-timer-check").checked = B.settings.timerEnabled;
    $("adb-report-check").checked = B.settings.autoReportEnabled;
    $("adb-max-count").disabled = B.settings.infinite;

    document.querySelectorAll('input[name="adb-mode"]').forEach(inp => { inp.checked = inp.value === B.settings.mode; });
    document.querySelectorAll('input[name="adb-count-mode"]').forEach(inp => { inp.checked = (inp.value === "infinite") === B.settings.infinite; });
    document.querySelectorAll('input[name="adb-timer-action"]').forEach(inp => { inp.checked = inp.value === (B.settings.timerAction || "stop"); });

    B.updateSavedList(); B.updateStats(); B.buildThemeButtons();
    B.applyTheme(localStorage.getItem("adb_theme") || "gold_black");

    B.initAPI().then(() => { const st = $("adb-status"); if (st) st.textContent = B.isReady ? "💀 آماده — Auto-Reporter" : "💀 اتصال نشد"; });

    console.log("╔════════════════════════════════════════╗");
    console.log("║  💀 ADB Panel v5.0 آماده است          ║");
    console.log("║  ✅ اتوریپورت فعال (شبیه‌سازی کلیک)    ║");
    console.log("║  ✅ حالت مخفی (Ctrl+\\)                ║");
    console.log("║  ✅ ۲ تم (طلایی / قرمز)               ║");
    console.log("╚════════════════════════════════════════╝");
})();