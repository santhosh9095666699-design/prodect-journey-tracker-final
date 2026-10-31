import React from "react";
import { ShieldCheck, Database, Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Col 1: Project & Problem Statement */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
              <span className="text-indigo-400">⚡</span> TraceTrail
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Web3Wave Hackathon (Chennai Institute of Technology) · Problem Statement 04:
              <strong className="text-slate-300"> Product Journey Tracker for Producers</strong>.
            </p>
            <p className="text-xs text-slate-500">
              Replacing lost paper records and false adulteration claims with tamper-proof provenance.
            </p>
          </div>

          {/* Col 2: Hybrid Architecture Explanation */}
          <div>
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Hybrid Storage Architecture
            </div>
            <ul className="text-xs space-y-2 text-slate-400">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold shrink-0">⛓️</span>
                <span><strong>On-Chain (Tezos):</strong> Product Code, milestone order, role wallet signature, and cryptographic hash.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold shrink-0">💾</span>
                <span><strong>Product evidence:</strong> Add public product and journey details to the Tezos record. Do not enter private information.</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Team Cyber Sword */}
          <div>
            <div className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-2">
              Team Cyber Sword
            </div>
            <ul className="text-xs space-y-1 text-slate-400">
              <li>Sunil Anandh N R (Lead) — CSE L</li>
              <li>Santhosh R — CSE A</li>
              <li>Karthick G S — CSE A</li>
              <li>Jeevaa A S — AI&amp;DS E</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} TraceTrail · Built for Web3Wave Hackathon.</span>
          <span className="font-mono text-[11px] text-indigo-400">Tezos SmartPy &amp; Taquito Ready</span>
        </div>
      </div>
    </footer>
  );
}
