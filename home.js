(() => {
  const $ = (id) => document.getElementById(id);

  const balEl = $("bal");
  const bonusBtn = $("bonusBtn");

  const soundBtn = $("soundBtn");
  const soundDot = $("soundDot");
  const soundTxt = $("soundTxt");

  // ---- wallet safe ----
  const W = window.MiniCazWallet;
  if (!W) {
    // если вдруг wallet.js не подключился — хотя бы не ломаем страницу
    balEl.textContent = "0";
    return;
  }

  // ---- sound ----
  const SOUND_KEY = "mini_caz_sound_v1";
  let soundOn = localStorage.getItem(SOUND_KEY) !== "0";

  let audioCtx = null;
  function ctx(){
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    return audioCtx;
  }
  function beep(freq=520, ms=55, vol=0.03){
    if(!soundOn) return;
    const c = ctx();
    if(!c) return;
    try{
      const o = c.createOscillator();
      const g = c.createGain();
      o.type="sine"; o.frequency.value=freq;
      const t = c.currentTime;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + ms/1000);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + ms/1000);
    }catch{}
  }

  function renderSound(){
    soundTxt.textContent = soundOn ? "Звук on" : "Звук off";
    soundDot.style.background = soundOn ? "#26d47b" : "#ff5a6a";
    soundDot.style.boxShadow = soundOn
      ? "0 0 0 3px rgba(38,212,123,.14)"
      : "0 0 0 3px rgba(255,90,106,.14)";
  }
  renderSound();

  soundBtn.addEventListener("click", async () => {
    soundOn = !soundOn;
    localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
    renderSound();
    beep(soundOn ? 640 : 240, 70, 0.03);
    if (soundOn && audioCtx && audioCtx.state === "suspended") {
      try { await audioCtx.resume(); } catch {}
    }
  });

  // ---- wallet render ----
  W.on((coins) => { balEl.textContent = String(coins); });

  bonusBtn.addEventListener("click", () => {
    W.addCoins(1000);
    beep(760, 70, 0.03);
  });

  // ---- IMPORTANT: клики по карточкам НЕ ломаем ----
  // но добавим “клик” звук и мягкий переход
  document.querySelectorAll('a.card[href]').forEach((a) => {
    a.addEventListener("click", (e) => {
      // если человек открыл в новой вкладке/с модификатором — не мешаем
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // обычный клик: сделаем звук и перейдём сами
      e.preventDefault();
      const href = a.getAttribute("href");
      beep(520, 45, 0.02);
      setTimeout(() => { window.location.href = href; }, 80);
    });
  });
})();
