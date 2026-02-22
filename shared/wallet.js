(() => {
  // ===== MASTER WALLET (one for all modes) =====
  const MASTER_KEY = "mini_caz_wallet_master_v1";

  // Known legacy keys from your modes (safe to expand)
  const LEGACY_KEYS = new Set([
    "mini_wallet_coinflip_v4",
    "mini_wallet_dice_v1",
    "mini_wallet_mines_v3",
    "mini_wallet_wheel_v1",
    "mini_wallet_penalty_v1",

    // if you used earlier versions anywhere:
    "mini_wallet_mines_v1",
    "mini_wallet_mines_v2",
    "mini_wallet_wheel_v0",
    "mini_wallet_rps_v1",
    "mini_wallet_crash_v1",
    "mini_wallet_tower_v1",
  ]);

  const isLegacyKey = (k) => {
    if (!k) return false;
    if (LEGACY_KEYS.has(k)) return true;
    // catch-all for your project naming
    if (k.startsWith("mini_wallet_")) return true;
    return false;
  };

  const toNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  function getMaster() {
    const raw = localStorage.getItem(MASTER_KEY);
    if (raw == null) {
      // first run default
      localStorage.setItem(MASTER_KEY, "1000");
      return 1000;
    }
    return toNumber(raw, 1000);
  }

  function setMaster(v) {
    const n = Math.max(0, Math.round(toNumber(v, 0)));
    localStorage.setItem(MASTER_KEY, String(n));
    // Keep legacy keys synced so old code that reads them still sees the master value
    syncLegacyKeys(n);
    return n;
  }

  function syncLegacyKeys(value) {
    const n = Math.max(0, Math.round(toNumber(value, 0)));
    try {
      // sync all known keys
      for (const k of LEGACY_KEYS) localStorage.setItem(k, String(n));

      // ALSO sync any existing mini_wallet_* keys already created by modes
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("mini_wallet_")) {
          localStorage.setItem(key, String(n));
        }
      }
    } catch {
      // ignore
    }
  }

  // Expose global API (handy for home page)
  window.wallet = {
    get: () => getMaster(),
    set: (v) => setMaster(v),
    add: (v) => setMaster(getMaster() + toNumber(v, 0)),
    take: (v) => setMaster(getMaster() - toNumber(v, 0)),
  };

  // ===== Monkey-patch localStorage to transparently unify all modes =====
  // Any mode that does localStorage.getItem(WALLET_KEY) gets master instead.
  const StorageProto = Object.getPrototypeOf(window.localStorage);

  const _getItem = StorageProto.getItem.bind(localStorage);
  const _setItem = StorageProto.setItem.bind(localStorage);
  const _removeItem = StorageProto.removeItem.bind(localStorage);

  StorageProto.getItem = function (key) {
    if (isLegacyKey(key)) return String(getMaster());
    return _getItem(key);
  };

  StorageProto.setItem = function (key, value) {
    if (isLegacyKey(key)) {
      const n = setMaster(value);
      // also write legacy key to keep code consistent
      try { _setItem(key, String(n)); } catch {}
      return;
    }
    return _setItem(key, value);
  };

  StorageProto.removeItem = function (key) {
    if (isLegacyKey(key)) {
      // do NOT allow a mode to delete wallet; reset to 0 instead
      setMaster(0);
      try { _removeItem(key); } catch {}
      return;
    }
    return _removeItem(key);
  };

  // initial sync: if any legacy key has value and master missing, absorb it
  try {
    const masterExists = localStorage.getItem(MASTER_KEY) != null;
    if (!masterExists) {
      let found = null;
      for (const k of LEGACY_KEYS) {
        const v = _getItem(k);
        if (v != null) { found = v; break; }
      }
      // scan mini_wallet_* keys
      if (found == null) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("mini_wallet_")) {
            const v = _getItem(key);
            if (v != null) { found = v; break; }
          }
        }
      }
      if (found != null) {
        localStorage.setItem(MASTER_KEY, String(toNumber(found, 1000)));
      }
    }

    // ensure everything synced right now
    syncLegacyKeys(getMaster());
  } catch {
    // ignore
  }

  // sync across tabs
  window.addEventListener("storage", (e) => {
    if (!e) return;
    if (e.key === MASTER_KEY) {
      const n = toNumber(e.newValue, 0);
      syncLegacyKeys(n);
    }
    if (isLegacyKey(e.key)) {
      // if any legacy key was changed somewhere, push to master
      const n = toNumber(e.newValue, getMaster());
      setMaster(n);
    }
  });
})();