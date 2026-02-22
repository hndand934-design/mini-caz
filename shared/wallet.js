(() => {
  const KEY = "mini_wallet_global";

  function read() {
    const v = localStorage.getItem(KEY);
    return v ? Number(v) : 1000;
  }
  function write(v) {
    localStorage.setItem(KEY, String(v));
  }
  function add(n) {
    write(read() + n);
  }

  window.Wallet = { read, write, add };
})();
