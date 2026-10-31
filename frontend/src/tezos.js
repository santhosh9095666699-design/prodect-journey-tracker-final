/**
 * TraceTrail – Single Tezos / Wallet Configuration File
 * ======================================================
 * This is the ONE file every component imports for anything blockchain-related.
 *
 * Exports:
 *   rpcUrl, contractAddress          – network constants
 *   Tezos                            – TezosToolkit singleton (already wired to wallet)
 *   wallet                           – BeaconWallet instance
 *   connectWallet()                  – ask user to connect Temple / Beacon wallet
 *   disconnectWallet()               – clear current session
 *   getConnectedAccount()            – check if a wallet is already linked
 *   registerBatchOnChain(id, name, origin)  – call smart-contract register_batch
 *   addEventOnChain(batchId, eventType, note, docHash) – call smart-contract add_event
 *   fetchOnChainBatch(batchId)       – read batch data from contract storage
 */

import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { NetworkType } from "@airgap/beacon-sdk";
import { Buffer } from "buffer";

// Beacon's browser bundle uses Node's Buffer API to derive its dApp keypair.
// Vite does not add Node globals automatically, so initialize it before the
// BeaconWallet instance starts its asynchronous setup.
globalThis.Buffer ??= Buffer;

// ── 1. Network & Contract constants ──────────────────────────
export const rpcUrl =
  import.meta.env.VITE_TEZOS_RPC_URL || "https://rpc.shadownet.teztnets.com";

export const contractAddress =
  import.meta.env.VITE_JOURNEY_CONTRACT || "KT1BLX472kVYa4xcpV6qYCZPBpCw8LL2B63C";

export const indexerUrl =
  import.meta.env.VITE_TEZOS_INDEXER_URL || "https://api.shadownet.tzkt.io/v1";

// ── 2. Tezos Toolkit (RPC client) ───────────────────────────
export const Tezos = new TezosToolkit(rpcUrl);

// ── 3. Beacon Wallet ────────────────────────────────────────
function createWallet() {
  return new BeaconWallet({
    name: "TraceTrail",
    preferredNetwork: NetworkType.SHADOWNET,
    requestTimeoutMs: 45_000,
    network: {
      type: NetworkType.SHADOWNET,
      rpcUrl,
    },
  });
}

// `disconnect()` tears down Beacon's transports. Replace the instance after
// logout so future pairing and signing requests use a live DAppClient.
export let wallet = createWallet();

// Link the wallet to the Tezos toolkit
Tezos.setWalletProvider(wallet);

// ── 4. Wallet helpers ───────────────────────────────────────

/** Ask the user to connect their Temple / Beacon wallet on Shadownet */
export async function connectWallet() {
  try {
    // The network is configured on BeaconWallet/DAppClient at construction.
    // Beacon v4 rejects `network` in the permission request input.
    await wallet.requestPermissions();

    const address = await wallet.getPKH();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tracetrail-wallet-session", { detail: address }));
    }
    console.log("Connected wallet address:", address);
    return address;
  } catch (err) {
    console.error("connectWallet error:", err);
    throw err;
  }
}

/** Disconnect the current wallet session */
export async function disconnectWallet() {
  const previousWallet = wallet;
  wallet = createWallet();
  Tezos.setWalletProvider(wallet);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tracetrail-wallet-session", { detail: null }));
  }
  // Always let logout complete locally even if a wallet extension/relay stops
  // responding while Beacon sends its peer-disconnect message.
  try {
    await Promise.race([
      previousWallet.disconnect(),
      new Promise((resolve) => setTimeout(resolve, 5_000)),
    ]);
  } catch (err) {
    console.warn("Beacon peer disconnect did not complete cleanly:", err);
  }
}

/** Check whether a wallet session is already active (returns address or null) */
export async function getConnectedAccount() {
  try {
    const active = await wallet.client.getActiveAccount();
    return active ? active.address : null;
  } catch {
    return null;
  }
}

// ── 5. Smart-contract interaction ───────────────────────────

/**
 * Register a new product batch on-chain.
 * Calls entrypoint: register_batch({ batch_id, product, origin })
 * Uses methodsObject so each parameter is passed by name (not position).
 */
export async function registerBatchOnChain(batchId, product, origin) {
  const productValue = typeof product === "string" ? product : JSON.stringify(product);
  const contract = await Tezos.wallet.at(contractAddress);

  const operation = await contract.methodsObject
    .register_batch({
      batch_id: batchId.trim().toUpperCase(),
      product: productValue,
      origin: origin.trim(),
    })
    .send();

  await operation.confirmation();
  return operation.opHash;
}

/**
 * Record a journey event on-chain.
 * Calls entrypoint: add_event({ batch_id, event_type, note, doc_hash })
 * event_type must be one of: PACKED, INSPECTED, SHIPPED, DELIVERED
 */
export async function addEventOnChain(batchId, eventType, note, docHash = "") {
  const contract = await Tezos.wallet.at(contractAddress);

  const operation = await contract.methodsObject
    .add_event({
      batch_id: batchId.trim().toUpperCase(),
      event_type: eventType.trim().toUpperCase(),
      note: typeof note === "string" ? note : JSON.stringify(note || {}),
      doc_hash: docHash || "",
    })
    .send();

  await operation.confirmation();
  return operation.opHash;
}

export async function authorizeBatchHandlerOnChain(batchId, who) {
  const contract = await Tezos.wallet.at(contractAddress);
  const operation = await contract.methodsObject
    .authorize({ batch_id: batchId.trim().toUpperCase(), who: who.trim() })
    .send();
  await operation.confirmation();
  return operation.opHash;
}

export async function revokeBatchHandlerOnChain(batchId, who) {
  const contract = await Tezos.wallet.at(contractAddress);
  const operation = await contract.methodsObject
    .revoke({ batch_id: batchId.trim().toUpperCase(), who: who.trim() })
    .send();
  await operation.confirmation();
  return operation.opHash;
}

function safeParseObject(value) {
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function decodeEvent(row) {
  const value = row.value || {};
  const metadata = safeParseObject(value.note);
  return {
    id: row.key?.nat ?? row.id,
    type: String(value.event_type || "Event").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
    role: metadata.role || "Handler",
    actor: value.actor || "Unknown wallet",
    actorName: metadata.actorName || value.actor || "Unknown wallet",
    location: metadata.location || "",
    timestamp: value.timestamp || "",
    reportedTimestamp: metadata.reportedTimestamp || "",
    note: metadata.note ?? value.note ?? "",
    offchainProof: metadata.proofReference || "",
    docHash: value.doc_hash || "",
    noteHash: value.doc_hash || "",
    verified: true,
    opHash: row.operation?.hash || null,
  };
}

function decodeBatch(row, eventRows = []) {
  const value = row.value || {};
  const metadata = safeParseObject(value.product);
  const id = String(row.key || "").toUpperCase();
  const events = eventRows
    .filter((event) => String(event.key?.string || "").toUpperCase() === id)
    .sort((a, b) => Number(a.key?.nat || 0) - Number(b.key?.nat || 0))
    .map(decodeEvent);

  // Registration data comes from the contract's immutable batch record.
  events.unshift({
    id: "registered",
    type: "Registered",
    role: "Producer",
    actor: value.owner || "",
    actorName: metadata.producer || value.owner || "",
    location: value.origin || "",
    timestamp: value.created_at || "",
    note: metadata.initialNote || "Batch registration recorded on Tezos.",
    verified: true,
  });

  return {
    id,
    name: metadata.name || value.product || "Registered product",
    category: metadata.category || "Product",
    origin: value.origin || "",
    producer: metadata.producer || value.owner || "",
    owner: value.owner || "",
    quantity: metadata.quantity || "",
    productionDate: metadata.productionDate || value.created_at || "",
    description: metadata.description || "",
    proofDoc: metadata.proofDoc || "",
    events,
    eventCount: Number(value.event_count || 0),
    isOnChain: true,
  };
}

async function fetchBigMapKeys(name, filters = {}) {
  const rows = [];
  const limit = 10_000;
  let offset = 0;
  while (true) {
    const params = new URLSearchParams({ active: "true", limit: String(limit), offset: String(offset), ...filters });
    const response = await fetch(`${indexerUrl}/contracts/${contractAddress}/bigmaps/${name}/keys?${params}`);
    if (!response.ok) throw new Error(`Tezos indexer request failed (${response.status}) for ${name}.`);
    const page = await response.json();
    if (!Array.isArray(page)) throw new Error(`Unexpected Tezos indexer response for ${name}.`);
    rows.push(...page);
    if (page.length < limit) break;
    offset += page.length;
  }
  return rows;
}

/** List batches and their events from the contract's on-chain big maps. */
export async function getBatchesOnChain() {
  const [batchRows, eventRows] = await Promise.all([
    fetchBigMapKeys("batches", { "sort.asc": "id" }),
    fetchBigMapKeys("events", { "sort.asc": "id" }),
  ]);
  return batchRows
    .map((row) => decodeBatch(row, eventRows))
    .sort((a, b) => String(b.productionDate).localeCompare(String(a.productionDate)));
}

/**
 * Read batch data directly from the smart contract's storage.
 */
export async function fetchOnChainBatch(batchId) {
  const normalizedId = batchId.trim().toUpperCase();
  const params = new URLSearchParams({ active: "true", limit: "10000", "key.string": normalizedId, "sort.asc": "id" });
  const [batchResponse, eventsResponse] = await Promise.all([
    fetch(`${indexerUrl}/contracts/${contractAddress}/bigmaps/batches/keys/${encodeURIComponent(normalizedId)}`),
    fetch(`${indexerUrl}/contracts/${contractAddress}/bigmaps/events/keys?${params}`),
  ]);
  if (batchResponse.status === 204 || batchResponse.status === 404) return null;
  if (!batchResponse.ok || !eventsResponse.ok) throw new Error("Could not read this batch from the Shadownet indexer.");
  const [batchRow, eventRows] = await Promise.all([batchResponse.json(), eventsResponse.json()]);
  if (!batchRow?.active || !Array.isArray(eventRows)) return null;
  return decodeBatch(batchRow, eventRows);
}

export async function isBatchHandlerAuthorized(batchId, address) {
  const key = JSON.stringify({ string: batchId.trim().toUpperCase(), address: address.trim() });
  const response = await fetch(`${indexerUrl}/contracts/${contractAddress}/bigmaps/authorized/keys/${encodeURIComponent(key)}`);
  if (response.status === 204 || response.status === 404) return false;
  if (!response.ok) throw new Error("Could not verify handler authorization on Shadownet.");
  const row = await response.json();
  return Boolean(row?.active && row.value === true);
}
