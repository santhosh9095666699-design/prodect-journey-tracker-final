# TraceTrail

TraceTrail is a Tezos Shadownet prototype for registering products and presenting a public, QR-linked journey from producer to customer.

## Live website

[https://fronten-of-trace-trail.vercel.app/](https://fronten-of-trace-trail.vercel.app/)

## Project structure

- `frontend/` — React and Vite application. Product batches and journey stops are written to the deployed Tezos contract; public pages read from the Shadownet TzKT indexer.
- `offchain-backend/` — Companion prototype service retained from earlier development. It is not required by the current frontend's on-chain product and journey flow.

## Main prototype flow

1. A producer connects a Tezos wallet on Shadownet and registers a product batch.
2. The producer prints or downloads a QR code that links to that product's public TraceTrail page.
3. Handlers record journey stops through wallet-approved Tezos transactions.
4. Customers scan the QR or open the product link to view the product record and timeline without a wallet.

Blockchain records are public and persistent. The chain preserves submitted claims and identifies the submitting wallet; it does not independently prove that product claims are true. Do not submit private information. Shadownet is a test network, not Tezos mainnet.

## Run the frontend locally

```powershell
cd frontend
npm install
npm run dev
```

Optional frontend environment variables are `VITE_TEZOS_RPC_URL`, `VITE_TEZOS_INDEXER_URL`, and `VITE_JOURNEY_CONTRACT`. Keep local `.env` files out of Git.

## Build

```powershell
cd frontend
npm run build
```

## Contract

- Network: Tezos Shadownet
- Contract: `KT1BLX472kVYa4xcpV6qYCZPBpCw8LL2B63C`
- Explorer: [Shadownet TzKT](https://shadownet.tzkt.io/KT1BLX472kVYa4xcpV6qYCZPBpCw8LL2B63C)
