(() => {
  // НИЧЕГО не делаем с кликами по ссылкам — пусть работают нативно.

  const soundBtn = document.getElementById("soundBtn");
  const soundDot = document.getElementById("soundDot");
  const soundTxt = document.getElementById("soundTxt");
  const bonusBtn = document.getElementById("bonusBtn");
  const balEl = document.getElementById("bal");

  // wallet.js должен давать MiniWallet
  const W = window.MiniWallet;

  function render() {
    if (W && typeof W.getCoins === "function") balEl.textContent = String(W.getCoins());
  }

  // звук (только UI)
  let soundOn = localStorage.getItem("mini_sound_on");
  soundOn = (soundOn === null) ? true : (soundOn === "1");

  function renderSound() {
    soundTxt.textContent = soundOn ? "Звук on" : "Звук off";
    soundDot.style.background = soundOn ? "#26d47b" : "#ff5a6a";
    soundDot.style.boxShadow = soundOn
      ? "0 0 0 3px rgba(38,212,123,.14)"
      : "0 0 0 3px rgba(255,90,106,.14)";
  }

  soundBtn?.addEventListener("click", () => {
    soundOn = !soundOn;
    localStorage.setItem("mini_sound_on", soundOn ? "1" : "0");
    renderSound();
  });

  bonusBtn?.addEventListener("click", () => {
    if (!W || typeof W.addCoins !== "function") return;
    W.addCoins(1000);
    render();
  });

  // обновлять баланс если другие режимы меняли кошелёк
  window.addEventListener("focus", render);

  renderSound();
  render();
})();