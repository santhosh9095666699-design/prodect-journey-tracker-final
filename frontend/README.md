# TraceTrail Frontend (React + Vite)

TraceTrail is a Tezos-backed product journey tracker built for **Web3Wave Hackathon** (Chennai Institute of Technology), Problem Statement 04, by **Team Cyber Sword**.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public catalog and batch lookup. |
| `/producer` | Connect a Shadownet wallet and register a batch on the contract. |
| `/handler` | Record journey events or manage authorized handler wallets. |
| `/product/:productId` | Public, read-only batch timeline. |

## Blockchain data flow

- Wallet pairing and signed operations use Beacon through Temple or another compatible Tezos wallet.
- Writes call the deployed SmartPy contract at `KT1BLX472kVYa4xcpV6qYCZPBpCw8LL2B63C` on Tezos Shadownet.
- Public reads use the Shadownet TzKT indexer. The application does not save batches or events to browser localStorage or a conventional database.
- Product and event fields beyond the contract's fixed fields are encoded as JSON inside the on-chain `product` and `note` strings. Keep these values short: blockchain data is public and permanent.
- Event timestamps shown as verified are the timestamps assigned by the chain. Any user-entered reported timestamp is preserved separately as descriptive metadata.
- Evidence references are text only. The app does not upload documents or calculate a file hash; do not enter secrets or private personal information.
- Connecting a wallet only establishes an account session. Registration, event logging, authorization, and revocation each require a separate wallet confirmation and incur Shadownet transaction fees (test tokens).

## Contract entrypoints

- `register_batch({ batch_id, product, origin })`
- `add_event({ batch_id, event_type, note, doc_hash })`
- `authorize({ batch_id, who })`
- `revoke({ batch_id, who })`

The contract's owner and event records are authoritative. The UI marks data verified when it has been read from the contract's indexed big maps; a transaction is not reported successful until its confirmation is received.

## Development

```powershell
cd d:\web3hackathon\frontend
npm install
npm run dev
```

Production build and local preview:

```powershell
npm run build
npm run preview
```

## Configuration

Optional Vite environment variables:

- `VITE_TEZOS_RPC_URL` (defaults to Shadownet RPC)
- `VITE_TEZOS_INDEXER_URL` (defaults to Shadownet TzKT API v1)
- `VITE_JOURNEY_CONTRACT` (defaults to the deployed TraceTrail contract above)
