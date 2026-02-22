(() => {
  const balEl = document.getElementById("bal");
  const bonusBtn = document.getElementById("bonusBtn");

  const soundBtn = document.getElementById("soundBtn");
  const soundTxt = document.getElementById("soundTxt");
  const soundDot = document.getElementById("soundDot");

  let soundOn = (localStorage.getItem("mini_caz_sound") ?? "1") === "1";
  let audioCtx = null;

  function updateBalance(){
    balEl.textContent = Math.round(window.wallet.get());
  }

  function beep(){
    if (!soundOn) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(520, t0);
    o.frequency.exponentialRampToValueAtTime(380, t0 + 0.08);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.10);
    o.start(t0);
    o.stop(t0 + 0.12);
  }

  function updateSoundUI(){
    soundTxt.textContent = soundOn ? "Звук on" : "Звук off";
    soundDot.style.opacity = soundOn ? "1" : ".35";
    soundDot.style.boxShadow = soundOn ? "0 0 0 3px rgba(38,212,123,.14)" : "none";
  }

  bonusBtn.addEventListener("click", () => {
    window.wallet.add(1000);
    updateBalance();
    beep();
  });

  soundBtn.addEventListener("click", async () => {
    soundOn = !soundOn;
    localStorage.setItem("mini_caz_sound", soundOn ? "1" : "0");
    updateSoundUI();
    beep();
    if (soundOn && audioCtx && audioCtx.state === "suspended") {
      try { await audioCtx.resume(); } catch {}
    }
  });

  updateSoundUI();
  updateBalance();

  // keep balance updated if some mode changes it and you return back
  window.addEventListener("focus", updateBalance);
})();