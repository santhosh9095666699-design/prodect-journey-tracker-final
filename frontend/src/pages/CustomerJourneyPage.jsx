import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Timeline } from "../components/Timeline";
import { QRCodeCard } from "../components/QRCodeCard";
import {
  MapPin,
  Calendar,
  Building,
  Package,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Search,
  ArrowLeft,
  Share2,
  FileText,
  Lock,
  Layers,
  Sparkles
} from "lucide-react";
import { EventTypeBadge } from "../components/Badge";
import { contractAddress } from "../tezos";

export function CustomerJourneyPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { fetchBatch, batches } = useData();

  // Local state
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [fallbackSearchId, setFallbackSearchId] = useState("");

  // Load product data when productId changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function loadProduct() {
      try {
        if (!productId) {
          throw new Error("No Product Code specified.");
        }
        const data = await fetchBatch(productId);
        if (isMounted) {
          if (!data) {
            setError(`No records found for Product Code "${productId}".`);
          } else {
            setBatch(data);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load product journey.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, fetchBatch]);

  const handleCopyId = () => {
    if (!batch) return;
    navigator.clipboard.writeText(batch.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleFallbackSearch = (e) => {
    e.preventDefault();
    if (fallbackSearchId.trim()) {
      navigate(`/product/${fallbackSearchId.trim().toUpperCase()}`);
      setFallbackSearchId("");
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Checking Product History...</h2>
        <p className="text-xs text-slate-500">
          Looking up verified records for <span className="font-mono font-bold text-slate-700">{productId}</span>
        </p>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !batch) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto text-2xl shadow-xs">
          🔍
        </div>
        <div>
        <h1 className="text-2xl font-bold text-slate-900">Product Not Found on Tezos</h1>
          <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
            {error || `Product Code "${productId}" does not match any registered product in our catalog.`}
          </p>
        </div>

        {/* Search Fallback */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm max-w-md mx-auto">
          <form onSubmit={handleFallbackSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter another product code (e.g. SKU-2026-001)..."
              value={fallbackSearchId}
              onChange={(e) => setFallbackSearchId(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs">
            {batches.length > 0 ? (
              <>
                <span className="text-slate-400">On-chain codes:</span>
                {batches.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/product/${encodeURIComponent(item.id)}`)}
                    className="underline text-indigo-600 hover:text-indigo-800 font-mono"
                  >
                    {item.id}
                  </button>
                ))}
              </>
            ) : (
              <Link to="/producer" className="underline text-indigo-600 hover:text-indigo-800">Register the first batch</Link>
            )}
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const latestEvent = batch.events?.[batch.events.length - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-700 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </Link>

        <div className="flex items-center gap-2">
          {batch.isOnChain ? (
            <a
              href={`https://shadownet.tzkt.io/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 font-semibold text-xs border border-indigo-200 hover:bg-indigo-100 transition-colors"
              title="Verified on Tezos Shadownet. Click to view on Explorer."
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Tezos On-Chain Verified ↗</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Verified Provenance
            </span>
          )}
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
            Public Buyer View
          </span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Details & Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Product Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:shadow-md">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400" />

            {/* Header: Category, Batch ID, and Status */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {batch.category || "Product"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 leading-tight">
                  {batch.name}
                </h1>
              </div>

              {/* Batch ID Tag */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block -mb-0.5 uppercase tracking-wider">
                    Tracking Code
                  </span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">
                    {batch.id}
                  </span>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Copy Tracking Code"
                >
                  {copiedId ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px]">Production Origin</span>
                <div className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">{batch.origin}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px]">Producer / Brand</span>
                <div className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{batch.producer}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px]">Batch Quantity</span>
                <div className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Package className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{batch.quantity}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                About this Product
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">{batch.description}</p>
            </div>

            {/* Proof Reference */}
            {batch.proofDoc && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-blue-800 bg-blue-50/70 px-3 py-2 rounded-xl border border-blue-200">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">
                  <strong>Product Evidence Reference:</strong> {batch.proofDoc}
                </span>
              </div>
            )}
          </div>

          {/* Journey Timeline Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Journey Timeline</h2>
                <p className="text-xs text-slate-500">
                  Every step recorded and digitally verified from the producer to the customer.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {batch.events?.length || 0} stops recorded
              </span>
            </div>

            {/* Timeline Component */}
            <Timeline events={batch.events} batchId={batch.id} />
          </div>

          {/* Trust Guarantee Card */}
          <div className="bg-indigo-50/60 border border-indigo-200/90 rounded-2xl p-6 text-indigo-950 text-xs space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
              <Lock className="w-4 h-4 text-indigo-700" />
              <span>How You Know This is Real</span>
            </div>
            <p className="leading-relaxed text-indigo-900/90">
              Unlike paper labels that can be altered, the records on this timeline are written to Tezos and cannot be deleted or edited. Each entry shows the wallet that submitted it; the blockchain verifies the record and its history, while the underlying product claims still depend on the participants who provide them.
            </p>
          </div>
        </div>

        {/* Right Column: Public QR Code & Verification Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          <QRCodeCard productId={batch.id} productName={batch.name} />

          {/* Quick Actions for Handlers */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Are you testing or delivering this?</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Lab inspectors and logistics handlers can add the next stop to this product directly from the handler portal.
            </p>
            <Link
              to="/handler"
              className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-sm"
            >
              <span>Add Next Stop to {batch.id}</span>
              <Share2 className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
