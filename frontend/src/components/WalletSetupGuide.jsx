import React from "react";
import { Wallet } from "lucide-react";
import { ConnectWallet } from "./ConnectWallet";

const templeChromeStore = "https://chromewebstore.google.com/detail/temple-wallet/ookjlbkiijinhpmnjffcofjonbfbgaoc";
const templeDownloads = "https://www.templewallet.com/tezos";
const shadownetGuide = "https://docs.tezos.com/developing/wallet-setup";
const shadownetFaucet = "https://faucet.shadownet.teztnets.com/";

export function WalletSetupGuide({ action = "make blockchain updates" }) {
  return (
    <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-slate-900 text-lg">Set up a wallet to {action}</h2>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            TraceTrail writes these changes to Tezos Shadownet. Follow these steps, then connect your wallet here.
          </p>

          <ol className="mt-4 space-y-2.5 text-sm text-slate-700 list-decimal pl-5">
            <li>
              Install Temple from the official{" "}
              <a href={templeChromeStore} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-700 underline">Chrome Web Store</a>.
              {" "}For another browser, choose its extension from the{" "}
              <a href={templeDownloads} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-700 underline">official Temple downloads</a>.
            </li>
            <li>Open Temple and create a wallet or import one you already control. Keep its recovery phrase private and offline; TraceTrail will never ask for it.</li>
            <li>In Temple, turn on <strong>Testnet Mode</strong>, then select <strong>Shadownet</strong> in the network list. See the <a href={shadownetGuide} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-700 underline">Tezos Shadownet wallet instructions</a>.</li>
            <li>Return to this page and choose <strong>Connect Wallet</strong>. Approve TraceTrail’s connection request in Temple.</li>
            <li>Before submitting a transaction, get Shadownet test XTZ from the <a href={shadownetFaucet} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-700 underline">Shadownet faucet</a> to cover network fees.</li>
          </ol>

          <div className="mt-5">
            <ConnectWallet />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Installed Temple just now? Refresh this page if the wallet is not detected, then connect. Public product journeys can still be viewed without a wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
