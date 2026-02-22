(() => {
  const KEY = "mini_caz_wallet_v1";

  function safeParse(raw){
    try { return JSON.parse(raw); } catch { return null; }
  }

  function load(){
    const w = safeParse(localStorage.getItem(KEY));
    if (w && typeof w.coins === "number") return { coins: Math.floor(w.coins) };
    return { coins: 1000 };
  }

  function save(w){
    localStorage.setItem(KEY, JSON.stringify({ coins: Math.floor(w.coins) }));
  }

  const api = {
    _w: load(),
    get coins(){ return api._w.coins; },
    setCoins(v){
      api._w.coins = Math.max(0, Math.floor(Number(v) || 0));
      save(api._w);
      api._emit();
    },
    addCoins(d){
      api.setCoins(api._w.coins + Math.floor(Number(d) || 0));
    },
    on(fn){
      api._subs.add(fn);
      fn(api._w.coins);
      return () => api._subs.delete(fn);
    },
    _subs: new Set(),
    _emit(){
      for (const fn of api._subs) {
        try { fn(api._w.coins); } catch {}
      }
    }
  };

  // синхронизация между вкладками/страницами
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    api._w = load();
    api._emit();
  });

  window.MiniCazWallet = api;
})();
