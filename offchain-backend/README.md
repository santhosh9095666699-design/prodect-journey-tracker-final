# TraceTrail Off-Chain Metadata & Proof Service

Companion service to the **TraceTrail Tezos SmartPy Contract** (Problem Statement 04).

## Why This Service Exists

In blockchain architectures (especially Tezos), storing large text, photos, lab reports, and farm GPS logs directly on-chain is **expensive and impractical**. 

Instead, Web3 applications use a **hybrid pattern**:
1. **Off-Chain Database (This Service)**: Stores high-resolution certificates, photos, lab metrics, and full harvest descriptions in SQLite.
2. **On-Chain Smart Contract (Tezos)**: Stores only the **cryptographic SHA-256 hash** (`note_hash`), the `batch_id`, the milestone state, and the signing wallet address.
3. **Verification**: Any auditor or buyer can take the off-chain document, hash it, and verify that it matches the immutable hash on Tezos.

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and service status |
| `GET` | `/api/metadata/:batchId` | Retrieve off-chain photos, lab JSON & proof doc names |
| `POST` | `/api/metadata/:batchId` | Store rich off-chain metadata & receive on-chain hash |
| `POST` | `/api/hash-proof` | Utility endpoint: returns SHA-256 hash for contract entrypoints |

---

## How to Run

```powershell
cd d:\web3hackathon\offchain-backend
node server.js
```
Runs on `http://localhost:5000`. Uses native Node.js v24 SQLite (`node:sqlite`). Zero npm install needed.
