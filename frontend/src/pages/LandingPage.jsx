import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { QRScannerModal } from "../components/QRScannerModal";
import {
  Search,
  ArrowRight,
  PlusCircle,
  CheckSquare,
  QrCode,
  Package,
  Layers,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Camera
} from "lucide-react";
import { EventTypeBadge } from "../components/Badge";

export function LandingPage() {
  const navigate = useNavigate();
  const { batches, loading } = useData();
  const [searchId, setSearchId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const id = searchId.trim().toUpperCase();
    if (!id) {
      setErrorMsg("Please enter a product or batch code (e.g. SKU-2026-001).");
      return;
    }
    setErrorMsg("");
    navigate(`/product/${encodeURIComponent(id)}`);
  };

  const quickSamples = batches.slice(0, 4).map((batch) => ({
    id: batch.id,
    label: batch.name,
    icon: batch.category?.toLowerCase().includes("coffee") ? "☕"
      : batch.category?.toLowerCase().includes("oil") ? "🫒"
        : batch.category?.toLowerCase().includes("tea") ? "🍵" : "📦",
    tag: batch.id,
  }));

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white pt-12 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid and glow backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/60 border border-indigo-700/60 text-xs text-indigo-300 font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tamper-Proof Product Tracking · Web3 Verified</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Track Your Product{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-blue-400">
              From Source to Customer
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Follow products from their producer through each recorded supply-chain step. Every update is verified on Tezos and available to customers.
          </p>

          {/* Search Bar & Camera Trigger */}
          <div className="max-w-2xl mx-auto pt-2 space-y-3">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2.5 shadow-2xl rounded-2xl p-2 bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/40"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-indigo-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Type a product or batch code (e.g. SKU-2026-001)..."
                  value={searchId}
                  onChange={(e) => {
                    setSearchId(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-white/10 text-white placeholder-slate-400 rounded-xl text-sm sm:text-base focus:outline-none border border-transparent font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Direct Camera Scanner Button */}
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-cyan-500/25 hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0"
                  title="Scan physical QR code on product box with camera"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan Box QR</span>
                </button>

                {/* Track Product Button */}
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0"
                >
                  <span>Track</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {errorMsg && (
              <p className="text-rose-300 text-xs text-left pl-3 font-medium">{errorMsg}</p>
            )}

            {/* Quick Sample Batch Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs">
              {quickSamples.length > 0 && <span className="text-slate-400 font-medium">On-chain batches:</span>}
              {quickSamples.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate(`/product/${s.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 active:scale-95 cursor-pointer shadow-xs"
                >
                  <span>{s.icon}</span>
                  <span className="font-semibold">{s.label}</span>
                  <span className="text-cyan-300 text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded font-mono">
                    {s.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 Role Portals Navigation Cards - CLICKABLE BLOCKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Producer */}
          <div
            onClick={() => navigate("/producer")}
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                1. For Producers
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-3 mb-1.5 group-hover:text-indigo-600 transition-colors">
                Add New Product
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Register a product with its origin, production details, and a unique scannable QR code.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                Open Producer Portal
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center text-indigo-600 transition-all duration-200 group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: Handlers & Inspectors */}
          <div
            onClick={() => navigate("/handler")}
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-300 p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <CheckSquare className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                2. For Handlers &amp; Labs
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-3 mb-1.5 group-hover:text-amber-700 transition-colors">
                Add Journey Stop
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Record what happened along the way: <strong>Inspected</strong> in the lab, <strong>Shipped</strong> in transit, or <strong>Delivered</strong> to store.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 group-hover:text-amber-800 transition-colors">
                Open Handler Portal
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-amber-50 flex items-center justify-center text-amber-700 transition-all duration-200 group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 3: Consumer QR Verification */}
          <div
            onClick={() => navigate(batches[0] ? `/product/${encodeURIComponent(batches[0].id)}` : "/producer")}
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                3. For Buyers
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-3 mb-1.5 group-hover:text-blue-600 transition-colors">
                Customer View &amp; QR
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Scan a product QR code to view its recorded details and verified journey from producer to customer.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 group-hover:text-blue-800 transition-colors">
                {batches[0] ? "View Product Journey" : "Register a Product First"}
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-blue-600 transition-all duration-200 group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Batches Catalog - ENTIRE BLOCK CLICKABLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Explore Verified Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Touch or click any product card below to see its verified stops and QR code.
            </p>
          </div>
          <Link
            to="/producer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Product</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading products...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No Products Registered Yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Register the first product batch to create its record on Tezos Shadownet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((b) => {
              const latestEvent = b.events?.[b.events.length - 1];
              return (
                <div
                  key={b.id}
                  onClick={() => navigate(`/product/${encodeURIComponent(b.id)}`)}
                  className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Top row: Batch ID & Latest status */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                        {b.id}
                      </span>
                      {latestEvent && <EventTypeBadge type={latestEvent.type} />}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug mb-1.5 group-hover:text-indigo-600 transition-colors">
                      {b.name}
                    </h3>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{b.origin}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {b.description}
                    </p>
                  </div>

                  {/* Bottom action bar */}
                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{b.events?.length || 0} stop{b.events?.length === 1 ? "" : "s"} recorded</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 group-hover:text-indigo-800 group-hover:translate-x-1 transition-all duration-200">
                      <span>View Journey</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Simple Plain-English Explainer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Tamper-Proof Guarantee</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold mb-3 leading-snug">
              Why Blockchain is Better Than Paper Receipts
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Paper slips and chat messages can be faked or thrown away. TraceTrail uses a shared digital lock so nobody can change what happened:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                <span className="text-cyan-400 font-bold text-sm block mb-1">1. Correct Order</span>
                <span className="text-slate-300 leading-relaxed">A product cannot be marked as delivered before it has been inspected.</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                <span className="text-amber-400 font-bold text-sm block mb-1">2. No Fake Inspections</span>
                <span className="text-slate-300 leading-relaxed">Authorized supply-chain participants can record product checks and handoffs.</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                <span className="text-indigo-400 font-bold text-sm block mb-1">3. Instant Trust</span>
                <span className="text-slate-300 leading-relaxed">Customers can inspect the product details and recorded journey from its QR code.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Camera QR Scanner Modal */}
      <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
}
