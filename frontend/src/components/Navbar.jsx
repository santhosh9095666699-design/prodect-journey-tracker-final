import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useData } from "../context/DataContext";
import { QRScannerModal } from "./QRScannerModal";
import { ConnectWallet } from "./ConnectWallet";
import { contractAddress } from "../tezos";
import {
  RefreshCw,
  Menu,
  X,
  PlusCircle,
  CheckSquare,
  Search,
  Camera,
} from "lucide-react";

export function Navbar() {
  const { refreshBatches } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleRefresh = async () => {
    setResetting(true);
    try {
      await refreshBatches();
    } finally {
      setResetting(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-100"
        : "text-slate-300 hover:text-white hover:bg-slate-800/80 hover:-translate-y-0.5"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
      isActive ? "bg-indigo-600 text-white" : "text-slate-200 hover:bg-slate-800"
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md text-white border-b border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Identity */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 flex items-center justify-center text-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                    TraceTrail
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800">
                    Tezos Shadownet
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 -mt-0.5">Product Journey Tracker</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              <NavLink to="/" className={navLinkClass}>
                <Search className="w-4 h-4" />
                <span>Track Product</span>
              </NavLink>
              <NavLink to="/producer" className={navLinkClass}>
                <PlusCircle className="w-4 h-4" />
                <span>Add Product</span>
              </NavLink>
              <NavLink to="/handler" className={navLinkClass}>
                <CheckSquare className="w-4 h-4" />
                <span>Update Stop</span>
              </NavLink>
            </nav>

            {/* Right Action & Scanner Button */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Scan Product Box QR Button */}
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-sm hover:shadow-cyan-500/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                title="Scan QR code on a product box with your camera"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan Box QR</span>
              </button>

              {/* Wallet Connect – uses the reusable ConnectWallet component */}
              <ConnectWallet />

              {/* Connected Contract Badge */}
              <div
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-xs text-slate-300"
                title={`Tezos Contract: ${contractAddress}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-mono text-[11px] text-indigo-300">
                  {contractAddress.substring(0, 6)}...{contractAddress.substring(contractAddress.length - 4)}
                </span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={resetting}
                title="Refresh the public Tezos batch catalog"
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin text-indigo-400" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Mobile menu and Camera quick trigger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xs"
                title="Scan QR Code"
              >
                <Camera className="w-5 h-5" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-2 animate-fade-in">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setScannerOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>📷 Scan Product Box QR (Open Camera)</span>
            </button>

            {/* Wallet Connect in Mobile Menu */}
            <div className="flex justify-center py-1">
              <ConnectWallet className="w-full justify-center" />
            </div>

            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Track Product</span>
            </NavLink>
            <NavLink
              to="/producer"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <span>Add Product</span>
            </NavLink>
            <NavLink
              to="/handler"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <span>Update Stop</span>
            </NavLink>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] text-indigo-300">
                Contract: {contractAddress.substring(0, 10)}...
              </span>
              <button
                onClick={() => {
                  handleRefresh();
                  setMobileMenuOpen(false);
                }}
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded border border-slate-800"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh Catalog</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* In-app Camera QR Scanner Modal */}
      <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </>
  );
}
