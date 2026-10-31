import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useData } from "../context/DataContext";
import { getConnectedAccount } from "../tezos";
import {
  PlusCircle,
  Package,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  QrCode,
  MapPin,
  Calendar,
  FileText,
  ShieldCheck,
  UserCheck,
  Wallet,
  Download,
  ExternalLink
} from "lucide-react";
import { EventTypeBadge } from "../components/Badge";
import { WalletSetupGuide } from "../components/WalletSetupGuide";
import { getProductPath, getPublicProductUrl } from "../productUrl";

export function ProducerDashboard() {
  const navigate = useNavigate();
  const { batches, createNewBatch } = useData();
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    const syncWallet = (event) => setWalletConnected(Boolean(event.detail));
    window.addEventListener("tracetrail-wallet-session", syncWallet);
    getConnectedAccount().then((addr) => setWalletConnected(Boolean(addr)));
    return () => window.removeEventListener("tracetrail-wallet-session", syncWallet);
  }, []);

  // Form state
  const qrRef = useRef(null);

  const downloadNewBatchQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas || !createdBatch) return;
    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `TraceTrail-${createdBatch.id}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "Food & Beverage",
    origin: "",
    producer: "",
    quantity: "",
    productionDate: new Date().toISOString().split("T")[0],
    description: "",
    proofDoc: "",
    initialNote: ""
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [createdBatch, setCreatedBatch] = useState(null);
  const [serverError, setServerError] = useState("");

  const categories = [
    "Food & Beverage",
    "Agriculture & Natural Products",
    "Clothing & Textiles",
    "Electronics & Appliances",
    "Beauty & Personal Care",
    "Health & Wellness",
    "Home & Furniture",
    "Industrial & Building Materials",
    "Automotive & Machinery",
    "Arts, Crafts & Collectibles",
    "Packaging & Supplies",
    "Other / Custom"
  ];

  // Helper to auto-generate a sample batch ID
  const generateRandomId = () => {
    const prefix = formData.category.split(" ")[0].toUpperCase().substring(0, 5);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, id: `TT-${prefix}-${randomNum}` }));
    if (errors.id) setErrors((prev) => ({ ...prev, id: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.id.trim()) {
      errs.id = "Please enter or auto-generate a Product Code.";
    } else if (formData.id.trim().length < 3) {
      errs.id = "Product Code must be at least 3 characters.";
    }

    if (!formData.name.trim()) errs.name = "Please enter the Product Name.";
    if (!formData.origin.trim()) errs.origin = "Please enter the production origin or location.";
    if (!formData.producer.trim()) errs.producer = "Please enter the producer or brand name.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setCreatedBatch(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await createNewBatch(formData);
      setCreatedBatch(result);
      // Reset form
      setFormData({
        id: "",
        name: "",
        category: "Food & Beverage",
        origin: "",
        producer: "",
        quantity: "",
        productionDate: new Date().toISOString().split("T")[0],
        description: "",
        proofDoc: "",
        initialNote: ""
      });
    } catch (err) {
      setServerError(err.message || "Failed to register product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
          <UserCheck className="w-4 h-4 text-indigo-600" />
          <span>Producer Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Add a New Product
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Producers across industries can register products directly on Tezos and generate a scannable QR code for packaging, labels, or documentation.
        </p>
        {/* Blockchain status indicator */}
        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          walletConnected
            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
            : "bg-slate-50 border-slate-200 text-slate-500"
        }`}>
          <Wallet className="w-3.5 h-3.5" />
          <span>{walletConnected ? "✅ Wallet connected — registrations are written to Tezos" : "💡 Connect a wallet in the navbar to register products on Tezos"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!walletConnected ? (
            <WalletSetupGuide action="register a product" />
          ) : (
            <>
          {/* Success Banner with Generated QR Code */}
          {createdBatch && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 sm:p-6 text-emerald-950 shadow-sm animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Generated QR Code preview */}
                <div className="flex flex-col items-center bg-white p-3 rounded-xl border border-emerald-200 shadow-xs shrink-0 mx-auto sm:mx-0">
                  <div ref={qrRef}>
                    <QRCodeCanvas
                      value={getPublicProductUrl(createdBatch.id)}
                      size={140}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-700 mt-1">
                    {createdBatch.id}
                  </span>
                  <button
                    type="button"
                    onClick={downloadNewBatchQr}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download QR</span>
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h3 className="font-bold text-base text-emerald-900">
                      Batch Registered on Tezos &amp; QR Generated!
                    </h3>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1.5 leading-relaxed">
                    Batch <strong>{createdBatch.id}</strong> ({createdBatch.name}) is stored on Tezos. The QR code on the left opens its public on-chain record. Add journey stops from the handler portal.
                    {createdBatch.opHash && (
                      <span className="block mt-1.5 font-semibold">
                        ⛓️ Blockchain Tx:{" "}
                        <a href={`https://shadownet.tzkt.io/${createdBatch.opHash}`} target="_blank" rel="noopener noreferrer" className="font-mono underline bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                          {createdBatch.opHash.substring(0, 18)}...
                        </a>
                      </span>
                    )}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      to={getProductPath(createdBatch.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Customer Journey &amp; QR</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to="/handler"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 transition-colors"
                    >
                      <span>Add Next Stop (Lab / Transit)</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Server Error Alert */}
          {serverError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-800 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error: </span>
                <span>{serverError}</span>
              </div>
            </div>
          )}

          {/* Registration Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 transition-shadow duration-300 hover:shadow-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Batch ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Product Tracking Code <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomId}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Auto-Generate Code</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mb-1.5">
                  The unique code printed on your product's label or box
                </p>
                <input
                  type="text"
                  placeholder="e.g. SKU-2026-001 or BATCH-004"
                  value={formData.id}
                  onChange={(e) => {
                    setFormData({ ...formData, id: e.target.value.toUpperCase() });
                    if (errors.id) setErrors({ ...errors, id: "" });
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border font-mono transition-colors focus:outline-none focus:bg-white ${
                    errors.id ? "border-rose-400" : "border-slate-200 focus:border-indigo-600"
                  }`}
                />
                {errors.id && <p className="text-rose-600 text-xs mt-1">{errors.id}</p>}
              </div>

              {/* Product Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wireless Headphones or Organic Coffee"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border transition-colors focus:outline-none focus:bg-white ${
                      errors.name ? "border-rose-400" : "border-slate-200 focus:border-indigo-600"
                    }`}
                  />
                  {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Producer & Origin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Producer or Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-1.5">Your company, workshop, cooperative, or brand</p>
                  <input
                    type="text"
                    placeholder="e.g. Acme Manufacturing or Northstar Studio"
                    value={formData.producer}
                    onChange={(e) => {
                      setFormData({ ...formData, producer: e.target.value });
                      if (errors.producer) setErrors({ ...errors, producer: "" });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border transition-colors focus:outline-none focus:bg-white ${
                      errors.producer ? "border-rose-400" : "border-slate-200 focus:border-indigo-600"
                    }`}
                  />
                  {errors.producer && <p className="text-rose-600 text-xs mt-1">{errors.producer}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Production Origin / Location <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-1.5">City, region, and state</p>
                  <input
                    type="text"
                    placeholder="e.g. Coimbatore, India or Factory 2, Berlin"
                    value={formData.origin}
                    onChange={(e) => {
                      setFormData({ ...formData, origin: e.target.value });
                      if (errors.origin) setErrors({ ...errors, origin: "" });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border transition-colors focus:outline-none focus:bg-white ${
                      errors.origin ? "border-rose-400" : "border-slate-200 focus:border-indigo-600"
                    }`}
                  />
                  {errors.origin && <p className="text-rose-600 text-xs mt-1">{errors.origin}</p>}
                </div>
              </div>

              {/* Quantity & Production Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    Total Quantity / Pack Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500 Jars (500g each) or 100 Bags"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    Production / Packaging Date
                  </label>
                  <input
                    type="date"
                    value={formData.productionDate}
                    onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Product Description &amp; Story
                </label>
                <p className="text-[11px] text-slate-400 mb-1.5">Materials, ingredients, sourcing, manufacturing, or other relevant details</p>
                <textarea
                  rows={2}
                  placeholder="e.g. Designed and assembled in Berlin using recycled aluminum and tested to quality standard Q-12."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {/* Proof Doc & First Packing Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    Certificate / Inspection Reference <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Quality-Certificate-2026 or Inspection-Report-104"
                    value={formData.proofDoc}
                    onChange={(e) => setFormData({ ...formData, proofDoc: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    Initial Production / Preparation Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Batch assembled, inspected, and sealed for shipment."
                    value={formData.initialNote}
                    onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-indigo-300 disabled:to-blue-300 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{walletConnected ? "Saving to Blockchain..." : "Recording Product..."}</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      <span>{walletConnected ? "Register Product on Blockchain" : "Register Product & Start Tracking"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
            </>
          )}
        </div>

        {/* Existing Products Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Registered Products ({batches.length})</h3>
              <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                Live Catalog
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {batches.map((b) => (
                <div
                  key={b.id}
                  onClick={() => navigate(`/product/${encodeURIComponent(b.id)}`)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/40 hover:border-indigo-300 transition-all duration-200 cursor-pointer flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {b.id}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {b.events?.length || 0} stops
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{b.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{b.origin}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
