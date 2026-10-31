import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getBatchesOnChain,
  fetchOnChainBatch,
  getConnectedAccount,
  registerBatchOnChain,
  addEventOnChain,
  authorizeBatchHandlerOnChain,
  revokeBatchHandlerOnChain,
} from "../tezos";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 4500);
  }, []);

  const refreshBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBatchesOnChain();
      setBatches(data);
      return data;
    } catch (err) {
      setBatches([]);
      setError(err.message || "Failed to load Tezos batches");
      showToast(err.message || "Failed to load Tezos batches", "error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshBatches().catch(() => {});
  }, [refreshBatches]);

  const createNewBatch = async (batchData) => {
    const walletAddress = await getConnectedAccount();
    if (!walletAddress) throw new Error("Connect Temple or another Beacon wallet before registering a batch.");

    const normalizedId = batchData.id.trim().toUpperCase();
    if (batches.some((batch) => batch.id === normalizedId)) {
      throw new Error(`Batch ID "${normalizedId}" is already registered on Tezos.`);
    }

    const metadata = {
      version: 1,
      name: batchData.name.trim(),
      category: batchData.category || "Product",
      producer: batchData.producer.trim(),
      quantity: batchData.quantity || "",
      productionDate: batchData.productionDate || "",
      description: batchData.description || "",
      proofDoc: batchData.proofDoc || "",
      initialNote: batchData.initialNote || "",
    };
    if (JSON.stringify(metadata).length > 1800) {
      throw new Error("Product details are too long for this contract. Shorten the description or evidence reference.");
    }

    showToast(`Review the registration for "${normalizedId}" in your wallet.`, "info");
    const opHash = await registerBatchOnChain(normalizedId, metadata, batchData.origin);
    await refreshBatches().catch(() => {});
    showToast(`Batch registered on Tezos. Operation: ${opHash.slice(0, 14)}…`, "success");
    return { ...metadata, id: normalizedId, name: metadata.name, origin: batchData.origin, opHash, isOnChain: true };
  };

  const logEvent = async (batchId, eventData) => {
    const walletAddress = await getConnectedAccount();
    if (!walletAddress) throw new Error("Connect a wallet before recording a journey stop.");
    const batch = await fetchOnChainBatch(batchId);
    if (!batch) throw new Error(`Batch "${batchId}" was not found on Tezos.`);

    const eventMetadata = {
      version: 1,
      role: eventData.role || "Handler",
      actorName: eventData.actor || walletAddress,
      location: eventData.location || "",
      note: eventData.note || "",
      proofReference: eventData.offchainProof || "",
      reportedTimestamp: eventData.timestamp || "",
    };
    if (JSON.stringify(eventMetadata).length > 1400) {
      throw new Error("Journey details are too long for this contract. Shorten the note or evidence reference.");
    }

    showToast(`Review the ${eventData.type} stop in your wallet.`, "info");
    const opHash = await addEventOnChain(batchId, eventData.type, eventMetadata, "");
    await refreshBatches().catch(() => {});
    const refreshedBatch = await fetchOnChainBatch(batchId).catch(() => null);
    const event = {
      id: `pending-index-${opHash}`,
      type: eventData.type,
      role: eventMetadata.role,
      actor: walletAddress,
      actorName: eventMetadata.actorName,
      location: eventMetadata.location,
      note: eventMetadata.note,
      offchainProof: eventMetadata.proofReference,
      opHash,
      verified: true,
    };
    showToast(`Journey stop recorded on Tezos. Operation: ${opHash.slice(0, 14)}…`, "success");
    return { batch: refreshedBatch, event, opHash };
  };

  const manageBatchHandler = async (action, batchId, address) => {
    const walletAddress = await getConnectedAccount();
    if (!walletAddress) throw new Error("Connect the batch owner wallet before changing handler access.");
    if (!/^tz[1-4][1-9A-HJ-NP-Za-km-z]{33}$/.test(address.trim())) {
      throw new Error("Enter a valid Tezos wallet address (tz1–tz4).");
    }
    showToast(`Review the ${action} access request in your wallet.`, "info");
    const opHash = action === "revoke"
      ? await revokeBatchHandlerOnChain(batchId, address)
      : await authorizeBatchHandlerOnChain(batchId, address);
    await refreshBatches().catch(() => {});
    showToast(`Handler access ${action}d on Tezos. Operation: ${opHash.slice(0, 14)}…`, "success");
    return { opHash, action, batchId: batchId.trim().toUpperCase(), address: address.trim() };
  };

  const fetchBatch = useCallback((batchId) => fetchOnChainBatch(batchId), []);

  const value = {
    batches,
    loading,
    error,
    toast,
    showToast,
    refreshBatches,
    fetchBatch,
    createNewBatch,
    logEvent,
    manageBatchHandler,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}
