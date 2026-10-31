import React, { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { Link, useNavigate } from "react-router-dom";
import { getConnectedAccount } from "../tezos";
import {
  CheckSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Package,
  Truck,
  Building2,
  FileCheck2,
  Hash,
  MapPin,
  Sparkles,
  QrCode,
  Wallet
} from "lucide-react";
import { EventTypeBadge, RoleBadge } from "../components/Badge";
import { WalletSetupGuide } from "../components/WalletSetupGuide";

export function HandlerDashboard() {
  const navigate = useNavigate();
  const { batches, logEvent, manageBatchHandler } = useData();
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    const syncWallet = (event) => setWalletConnected(Boolean(event.detail));
    window.addEventListener("tracetrail-wallet-session", syncWallet);
    getConnectedAccount().then((addr) => setWalletConnected(Boolean(addr)));
    return () => window.removeEventListener("tracetrail-wallet-session", syncWallet);
  }, []);

  // Search / Selection state
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [activeBatch, setActiveBatch] = useState(null);

  // Event form state
  const [eventType, setEventType] = useState("Inspected");
  const [handlerRole, setHandlerRole] = useState("Inspector");
  const [actorName, setActorName] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [offchainProof, setOffchainProof] = useState("");
  const [timestamp, setTimestamp] = useState("");

  // UI state
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [serverError, setServerError] = useState("");

  // Sync active batch when selectedBatchId or batches change
  useEffect(() => {
    if (selectedBatchId) {
      const found = batches.find((b) => b.id.toUpperCase() === selectedBatchId.toUpperCase());
      setActiveBatch(found || null);
    } else if (batches.length > 0 && !activeBatch) {
      // Default to first batch for quick demo convenience
      setSelectedBatchId(batches[0].id);
      setActiveBatch(batches[0]);
    }
  }, [selectedBatchId, batches]);

  // Adjust role suggestion when event type changes
  const handleEventTypeChange = (type) => {
    setEventType(type);
    if (type === "Packed") setHandlerRole("Producer");
    else if (type === "Inspected") setHandlerRole("Inspector");
    else if (type === "Shipped") setHandlerRole("Transporter");
    else if (type === "Delivered") setHandlerRole("Retailer");
  };

  const validate = () => {
    const errs = {};
    if (!selectedBatchId) errs.batchId = "Please select or enter a Product Code.";
    if (!actorName.trim()) errs.actor = eventType === "Authorize" || eventType === "Revoke"
      ? "Enter the handler's Tezos wallet address."
      : "Please enter your name, company, or lab name.";
    if (eventType !== "Authorize" && eventType !== "Revoke" && !location.trim()) {
      errs.location = "Please enter the current city or facility location.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessInfo(null);

    if (!walletConnected) {
      setServerError("Connect your Tezos wallet before writing a stop or changing handler access.");
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    try {
      if (eventType === "Authorize" || eventType === "Revoke") {
        const result = await manageBatchHandler(eventType.toLowerCase(), selectedBatchId, actorName.trim());
        setSuccessInfo(result);
      } else {
        const eventPayload = {
          type: eventType,
          role: handlerRole,
          actor: actorName.trim(),
          location: location.trim(),
          note: note.trim(),
          offchainProof: offchainProof.trim(),
          timestamp: timestamp.trim() || undefined
        };
        const result = await logEvent(selectedBatchId, eventPayload);
        setSuccessInfo(result);
      }

      // Reset form fields
      setLocation("");
      setNote("");
      setOffchainProof("");
      setTimestamp("");
    } catch (err) {
      setServerError(err.message || "Failed to add this stop.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper check: has a specific event type occurred already?
  const existingTypes = (activeBatch?.events || []).map((e) => e.type);
  const hasPacked = existingTypes.includes("Packed");
  const hasInspected = existingTypes.includes("Inspected");
  const hasShipped = existingTypes.includes("Shipped");
  const hasDelivered = existingTypes.includes("Delivered");
  const isAccessAction = eventType === "Authorize" || eventType === "Revoke";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
          <CheckSquare className="w-4 h-4 text-indigo-600" />
          <span>Supply Chain &amp; Inspection Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Add a Journey Stop
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Batch owners can authorize handler wallets; the owner and authorized wallets can record stops. Every change is written to Tezos.
        </p>
        {/* Blockchain status indicator */}
        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          walletConnected
            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
            : "bg-slate-50 border-slate-200 text-slate-500"
        }`}>
          <Wallet className="w-3.5 h-3.5" />
          <span>{walletConnected ? "✅ Wallet connected — changes are confirmed and recorded on Tezos" : "💡 Connect a wallet in the navbar to record stops or manage access on Tezos"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!walletConnected ? (
            <WalletSetupGuide action="update a product journey" />
          ) : (
            <>
          {/* Success Banner */}
          {successInfo && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 sm:p-6 text-emerald-950 shadow-sm animate-fade-in">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-base text-emerald-900">
                    {successInfo.action
                      ? `Handler ${successInfo.action === "authorize" ? "Authorized" : "Access Revoked"}`
                      : `"${successInfo.event?.type}" Stop Successfully Added!`}
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1">
                    {successInfo.action
                      ? <span><strong>{successInfo.address}</strong> access for <strong>{successInfo.batchId}</strong>.</span>
                      : <span>Added to <strong>{selectedBatchId}</strong> at {successInfo.event?.location}.</span>}
                    {successInfo.opHash && (
                      <span className="block mt-1.5 font-semibold">
                        ⛓️ Blockchain Tx:{" "}
                        <a href={`https://shadownet.tzkt.io/${successInfo.opHash}`} target="_blank" rel="noopener noreferrer" className="font-mono underline bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                          {successInfo.opHash.substring(0, 18)}...
                        </a>
                      </span>
                    )}
                  </p>
                  <div className="mt-3.5 flex items-center gap-3">
                    <Link
                      to={`/product/${encodeURIComponent(selectedBatchId)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Customer Timeline &amp; QR Code &rarr;</span>
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

          {/* Main Event Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 transition-shadow duration-300 hover:shadow-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Batch Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  1. Select Product to Update <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.id})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Or type a product code (e.g. SKU-2026-001)..."
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 text-sm font-mono uppercase bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                {errors.batchId && <p className="text-rose-600 text-xs mt-1">{errors.batchId}</p>}
              </div>

              {/* Step Sequence Advice Banner */}
              {activeBatch && !isAccessAction && (
                <div className="bg-slate-50 rounded-xl p-3 sm:p-3.5 border border-slate-200/90 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="font-bold text-slate-700">Journey Progress:</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] flex-wrap">
                    <span className={hasPacked ? "text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded" : "text-slate-400"}>
                      1. Packed {hasPacked ? "✓" : "○"}
                    </span>
                    <span className="text-slate-300">&rarr;</span>
                    <span className={hasInspected ? "text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded" : "text-slate-400"}>
                      2. Inspected {hasInspected ? "✓" : "○"}
                    </span>
                    <span className="text-slate-300">&rarr;</span>
                    <span className={hasShipped ? "text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded" : "text-slate-400"}>
                      3. Shipped {hasShipped ? "✓" : "○"}
                    </span>
                    <span className="text-slate-300">&rarr;</span>
                    <span className={hasDelivered ? "text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded" : "text-slate-400"}>
                      4. Delivered {hasDelivered ? "✓" : "○"}
                    </span>
                  </div>
                </div>
              )}

              {/* Event Type & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    2. What happened? <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => handleEventTypeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none font-semibold transition-colors"
                  >
                    <option value="Inspected">🔬 Inspected (Quality &amp; Lab Check)</option>
                    <option value="Shipped">🚚 Shipped (In Transit on Truck)</option>
                    <option value="Delivered">✅ Delivered (Reached Store or Customer)</option>
                    <option value="Packed">📦 Packed (First Packaging)</option>
                    <option value="Authorize">🔐 Authorize Handler Wallet</option>
                    <option value="Revoke">🔒 Revoke Handler Wallet</option>
                  </select>
                </div>

                {!isAccessAction && <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    Your Role in the Journey
                  </label>
                  <select
                    value={handlerRole}
                    onChange={(e) => setHandlerRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
                  >
                    <option value="Inspector">🔬 Quality Inspector (Testing Lab)</option>
                    <option value="Transporter">🚚 Transporter (Delivery Driver / Logistics)</option>
                    <option value="Retailer">🏪 Store / Retailer (Shop Manager)</option>
                    <option value="Producer">🏭 Producer / Brand</option>
                  </select>
                </div>}
              </div>

              {/* Actor Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={isAccessAction ? "sm:col-span-2" : ""}>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    {isAccessAction ? "Handler Tezos Wallet Address" : "Who is updating this?"} <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-1.5">{isAccessAction ? "The batch owner must approve this access change in the wallet." : "Your name, company, or lab name"}</p>
                  <input
                    type="text"
                    placeholder={isAccessAction ? "tz1…" : "e.g. Tamil Nadu Quality Lab, Fast Cargo, or John"}
                    value={actorName}
                    onChange={(e) => {
                      setActorName(e.target.value);
                      if (errors.actor) setErrors({ ...errors, actor: "" });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border transition-colors focus:outline-none focus:bg-white ${
                      errors.actor ? "border-rose-400" : "border-slate-200 focus:border-indigo-600"
                    }`}
                  />
                  {errors.actor && <p className="text-rose-600 text-xs mt-1">{errors.actor}</p>}
                </div>

                {!isAccessAction && <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Current Location <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-1.5">Where the product is right now</p>
                  <input
                    type="text"
                    placeholder="e.g. Coimbatore, Tamil Nadu or Mumbai Warehouse"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) setErrors({ ...errors, location: "" });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border transition-colors focus:outline-none focus:bg-white ${
                      errors.location ? "border-rose-400" : "border-slate-200 focus:border-indigo-600"
                    }`}
                  />
                  {errors.location && <p className="text-rose-600 text-xs mt-1">{errors.location}</p>}
                </div>}
              </div>

              {/* Remarks / Notes */}
              {!isAccessAction && <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Status Note or Quality Result
                </label>
                <p className="text-[11px] text-slate-400 mb-1.5">Test findings, storage conditions, or comments</p>
                <textarea
                  rows={2}
                  placeholder="e.g. Quality inspection passed; dimensions and serial numbers match the batch record."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
                />
              </div>}

              {/* Proof Doc & Optional Time */}
              {!isAccessAction && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    Certificate or Bill File <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                  placeholder="e.g. Inspection-Report-104 or Shipping-Document-2026"
                    value={offchainProof}
                    onChange={(e) => setOffchainProof(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    Date &amp; Time <span className="text-slate-400 font-normal">(Defaults to now)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD HH:MM (e.g. 2026-10-30 14:00)"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-amber-300 disabled:to-amber-400 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{walletConnected ? "Saving to Blockchain..." : "Saving Stop..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-5 h-5" />
                      <span>{isAccessAction ? `${eventType} on Tezos` : "Save Stop to Tezos"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
            </>
          )}
        </div>

        {/* Selected Batch Preview Sidebar (5 cols) - CLICKABLE TO VIEW QR */}
        <div className="lg:col-span-5 space-y-6">
          {activeBatch ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 transition-all duration-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {activeBatch.id}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{activeBatch.name}</h3>
                </div>
                <Link
                  to={`/product/${encodeURIComponent(activeBatch.id)}`}
                  className="px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View QR</span>
                </Link>
              </div>

              <div className="text-xs space-y-2 text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <strong className="text-slate-800">Production Origin:</strong> {activeBatch.origin}
                </div>
                <div>
                  <strong className="text-slate-800">Producer:</strong> {activeBatch.producer}
                </div>
                <div>
                  <strong className="text-slate-800">Batch Quantity:</strong> {activeBatch.quantity}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Recorded Stops ({activeBatch.events?.length || 0})
                </h4>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {(activeBatch.events || []).map((e, idx) => (
                    <div
                      key={e.id || idx}
                      onClick={() => navigate(`/product/${encodeURIComponent(activeBatch.id)}`)}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/40 hover:border-indigo-200 text-xs flex flex-col gap-1 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <EventTypeBadge type={e.type} />
                        <span className="font-mono text-[10px] text-slate-400">{e.timestamp}</span>
                      </div>
                      <div className="text-slate-800 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{e.location}</span>
                      </div>
                      {e.actor && (
                        <div className="text-slate-500 text-[11px]">
                          By: <span className="font-medium text-slate-700">{e.actor}</span>
                        </div>
                      )}
                      {e.note && <div className="text-slate-600 italic text-[11px] mt-0.5">“{e.note}”</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">Select a product on the left to view its stops.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
