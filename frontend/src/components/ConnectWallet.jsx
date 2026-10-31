import React, { useState, useEffect } from "react";
import { connectWallet, getConnectedAccount, disconnectWallet } from "../tezos";
import { Wallet, LogOut, KeyRound } from "lucide-react";

export function ConnectWallet({ className = "", onConnect, onDisconnect }) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState("");

  // Check if wallet is already connected from a previous session
  useEffect(() => {
    let mounted = true;
    const syncAccount = (addr) => {
      if (!mounted) return;
      setAddress(addr || "");
      if (addr) onConnect?.(addr);
      else onDisconnect?.();
    };
    const handleWalletSession = (event) => syncAccount(event.detail);
    getConnectedAccount().then((addr) => {
      if (addr) {
        syncAccount(addr);
      }
    });
    window.addEventListener("tracetrail-wallet-session", handleWalletSession);
    return () => {
      mounted = false;
      window.removeEventListener("tracetrail-wallet-session", handleWalletSession);
    };
  }, [onConnect, onDisconnect]);

  async function connect() {
    setLoading(true);
    setError("");
    let timeoutId;

    try {
      // Keep the button recoverable if a wallet chooser closes without
      // settling its Beacon request. Disconnect also aborts that stale request.
      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Wallet request timed out. Choose Temple in the wallet chooser and approve the connection, or click Connect Wallet to retry."));
        }, 50_000);
      });
      const addr = await Promise.race([connectWallet(), timeout]);

      if (addr) {
        setAddress(addr);
        onConnect?.(addr);
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
      if (/timed out/i.test(err?.message || "")) {
        void disconnectWallet();
      }
      const message = err?.message || "Wallet connection was cancelled";
      setError(/aborted|cancelled|rejected/i.test(message)
        ? "Wallet connection was cancelled. Choose Temple in the wallet chooser and approve the request to connect."
        : message);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  async function disconnect() {
    setLoading(true);
    setError("");
    try {
      await disconnectWallet();
    } catch (err) {
      console.error("Wallet disconnect failed:", err);
      setError(err?.message || "Could not disconnect the wallet. Please retry.");
    } finally {
      setLoading(false);
    }
    setShowManualInput(false);
  }

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setError("A pasted address cannot authorize blockchain actions. Connect through Temple or Beacon.");
  };

  if (address) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-700/80 text-indigo-300 text-xs font-semibold shadow-xs ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span
          className="font-mono text-[11px]"
          title={`Full Address: ${address}`}
        >
          {address.slice(0, 8)}…{address.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          title="Disconnect wallet"
          className="p-1 rounded text-indigo-400 hover:text-white hover:bg-indigo-900 transition-colors cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <div className="flex items-center gap-1.5">
        <button
          onClick={connect}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
          title="Connect Temple or Beacon Wallet"
        >
          <Wallet className="w-3.5 h-3.5 text-indigo-400" />
          <span>{loading ? "Connecting..." : "Connect Wallet"}</span>
        </button>

        <button
          onClick={() => setShowManualInput(!showManualInput)}
          type="button"
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-700/80 text-xs transition-colors cursor-pointer"
          title="A wallet connection is required for blockchain actions"
        >
          <KeyRound className="w-3.5 h-3.5" />
        </button>
      </div>

      {showManualInput && (
        <form
          onSubmit={handleManualSubmit}
          className="absolute top-10 right-0 z-50 p-2.5 bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-64 space-y-2 text-xs animate-fade-in"
        >
          <span className="font-bold text-slate-200 block text-[11px]">
            Wallet address (view only):
          </span>
          <input
            type="text"
            placeholder="e.g. tz1V28F..."
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded font-mono text-[11px] text-white focus:outline-none focus:border-indigo-500"
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setShowManualInput(false)}
              className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded cursor-pointer"
            >
              Continue
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="text-[10px] text-rose-400 mt-1 max-w-[200px] text-center leading-tight">
          {error}
        </p>
      )}
    </div>
  );
}

export default ConnectWallet;
