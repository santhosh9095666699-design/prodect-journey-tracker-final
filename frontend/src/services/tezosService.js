/**
 * TraceTrail Tezos Blockchain & Wallet Integration Service
 * --------------------------------------------------------
 * Connects the frontend to the Tezos Shadownet smart contract using:
 * - @taquito/taquito: Tezos RPC client to read contract storage & call entrypoints.
 * - @taquito/beacon-wallet: Connects to Temple Wallet, Kukai, and Beacon dApp wallets.
 */

import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";

// 1. Read environment variables configured in Vercel or local fallback
export const TEZOS_RPC_URL =
  import.meta.env.VITE_TEZOS_RPC_URL || "https://rpc.shadownet.teztnets.com";

export const JOURNEY_CONTRACT_ADDRESS =
  import.meta.env.VITE_JOURNEY_CONTRACT || "KT1BLX472kVYa4xcpV6qYCZPBpCw8LL2B63C";

// 2. Initialize Singleton Tezos Toolkit
export const tezos = new TezosToolkit(TEZOS_RPC_URL);

let walletInstance = null;
let activeAccount = null;

/**
 * Initialize or get Beacon Wallet instance
 */
export function getWallet() {
  if (!walletInstance && typeof window !== "undefined") {
    walletInstance = new BeaconWallet({
      name: "TraceTrail Provenance",
      preferredNetwork: "custom",
    });
    tezos.setWalletProvider(walletInstance);
  }
  return walletInstance;
}

/**
 * Check if a wallet account is already connected
 */
export async function getConnectedAccount() {
  try {
    const wallet = getWallet();
    if (!wallet) return null;
    const account = await wallet.client.getActiveAccount();
    if (account) {
      activeAccount = account.address;
      return account.address;
    }
  } catch (err) {
    console.warn("No active wallet account found:", err);
  }
  return null;
}

/**
 * Connect to Temple Wallet / Beacon
 */
export async function connectWallet() {
  const wallet = getWallet();
  if (!wallet) throw new Error("Wallet not available in this environment.");

  await wallet.requestPermissions();

  const address = await wallet.getPKH();
  activeAccount = address;
  return address;
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet() {
  try {
    const wallet = getWallet();
    if (wallet) {
      await wallet.clearActiveAccount();
      activeAccount = null;
    }
  } catch (err) {
    console.warn("Wallet disconnect error:", err);
  }
}

/**
 * Fetch on-chain batch data from the smart contract
 */
export async function fetchOnChainBatch(batchId) {
  try {
    const contract = await tezos.contract.at(JOURNEY_CONTRACT_ADDRESS);
    const storage = await contract.storage();

    // Query batches big_map
    const batchData = await storage.batches.get(batchId.trim().toUpperCase());
    return batchData || null;
  } catch (err) {
    console.warn(`Could not read batch ${batchId} from smart contract:`, err);
    return null;
  }
}

/**
 * Register a new product batch directly on Tezos smart contract
 * Calls: register_batch(batch_id, origin, product)
 */
export async function registerBatchOnChain(batchId, name, origin) {
  const contract = await tezos.wallet.at(JOURNEY_CONTRACT_ADDRESS);
  const op = await contract.methods
    .register_batch(batchId.trim().toUpperCase(), origin.trim(), name.trim())
    .send();

  await op.confirmation(1);
  return op.opHash;
}

/**
 * Record a journey event directly on Tezos smart contract
 * Calls: add_event(batch_id, doc_hash, event_type, note)
 */
export async function addEventOnChain(batchId, eventType, note, docHash = "") {
  const contract = await tezos.wallet.at(JOURNEY_CONTRACT_ADDRESS);

  // Normalize event type to uppercase required by contract (PACKED, INSPECTED, SHIPPED, DELIVERED)
  const normalizedType = eventType.trim().toUpperCase();

  const op = await contract.methods
    .add_event(batchId.trim().toUpperCase(), docHash || "", normalizedType, note || "")
    .send();

  await op.confirmation(1);
  return op.opHash;
}
