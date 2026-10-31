/**
 * TraceTrail Off-Chain Metadata & Proof Storage Server
 * ----------------------------------------------------
 * Built for Web3Wave Hackathon (Tezos) · Problem Statement 04
 *
 * Why this exists:
 * Storing large text, photos, lab reports, and farm records on the Tezos blockchain
 * is cost-prohibitive. This off-chain database stores the rich metadata and returns
 * a cryptographic SHA-256 hash that the Tezos SmartPy contract stores on-chain.
 */

const http = require('node:http');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'offchain_store.db');

// 1. Initialize SQLite Database
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');

// Create tables for rich off-chain storage
db.exec(`
  CREATE TABLE IF NOT EXISTS batch_metadata (
    batch_id TEXT PRIMARY KEY,
    producer_license TEXT,
    farm_gps TEXT,
    harvest_photos TEXT,
    lab_report_json TEXT,
    proof_doc_name TEXT,
    computed_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS event_proofs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    proof_document_name TEXT NOT NULL,
    inspector_credentials TEXT,
    lab_metrics_json TEXT,
    proof_hash TEXT NOT NULL,
    recorded_at TEXT NOT NULL,
    FOREIGN KEY (batch_id) REFERENCES batch_metadata(batch_id) ON DELETE CASCADE
  );
`);

// Seed sample off-chain data
function seedSampleOffchain() {
  const checkStmt = db.prepare('SELECT batch_id FROM batch_metadata WHERE batch_id = ?');

  if (!checkStmt.get('TT-HONEY-0904')) {
    const hash = crypto.createHash('sha256').update('TT-HONEY-0904-FSSAI-Cert').digest('hex');
    db.prepare(`
      INSERT INTO batch_metadata (batch_id, producer_license, farm_gps, harvest_photos, lab_report_json, proof_doc_name, computed_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'TT-HONEY-0904',
      'TN-FSSAI-LIC-1122334400',
      '11.4258° N, 76.8647° E (Kotagiri, Nilgiris)',
      JSON.stringify(['https://images.unsplash.com/photo-1587049352846-4a222e784d38']),
      JSON.stringify({ moisture: '17.6%', c4Sugar: 'Negative', hmf: '12 mg/kg', pollenCount: '92%' }),
      'FSSAI-Purity-Cert-9042.pdf',
      hash,
      '2026-10-15 09:30:00'
    );
    console.log('[OffChain DB] Seeded rich metadata for TT-HONEY-0904');
  }

  if (!checkStmt.get('TT-COFFEE-24018')) {
    const hash = crypto.createHash('sha256').update('TT-COFFEE-24018-ECX-Cert').digest('hex');
    db.prepare(`
      INSERT INTO batch_metadata (batch_id, producer_license, farm_gps, harvest_photos, lab_report_json, proof_doc_name, computed_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'TT-COFFEE-24018',
      'ECX-EXPORTER-ETH-8902',
      '6.0667° N, 38.2000° E (Kochere, Yirgacheffe)',
      JSON.stringify(['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd']),
      JSON.stringify({ cuppingScore: 88.25, screenGrade: 'Grade 1', process: 'Washed', moisture: '10.5%' }),
      'ECX-Specialty-Grade1-Cert.pdf',
      hash,
      '2026-10-12 10:00:00'
    );
    console.log('[OffChain DB] Seeded rich metadata for TT-COFFEE-24018');
  }
}

seedSampleOffchain();

// Helper: send JSON
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  try {
    // Health Check
    if (req.method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, { status: 'healthy', service: 'TraceTrail Off-Chain Metadata Store', database: 'SQLite' });
    }

    // GET /api/metadata/:batchId
    const matchGet = pathname.match(/^\/api\/metadata\/([^/]+)$/);
    if (req.method === 'GET' && matchGet) {
      const batchId = decodeURIComponent(matchGet[1]).toUpperCase().trim();
      const meta = db.prepare('SELECT * FROM batch_metadata WHERE batch_id = ?').get(batchId);
      if (!meta) {
        return sendJson(res, 404, { error: `No off-chain metadata found for batch '${batchId}'` });
      }
      const proofs = db.prepare('SELECT * FROM event_proofs WHERE batch_id = ? ORDER BY id ASC').all(batchId);
      return sendJson(res, 200, {
        metadata: {
          ...meta,
          harvest_photos: meta.harvest_photos ? JSON.parse(meta.harvest_photos) : [],
          lab_report_json: meta.lab_report_json ? JSON.parse(meta.lab_report_json) : null
        },
        proofs
      });
    }

    // POST /api/metadata/:batchId (Upload / Save Rich Off-Chain Metadata)
    const matchPost = pathname.match(/^\/api\/metadata\/([^/]+)$/);
    if (req.method === 'POST' && matchPost) {
      const batchId = decodeURIComponent(matchPost[1]).toUpperCase().trim();
      const body = await parseJsonBody(req);
      const { producer_license, farm_gps, harvest_photos, lab_report, proof_doc_name } = body;

      const rawString = `${batchId}-${producer_license || ''}-${proof_doc_name || ''}`;
      const computedHash = crypto.createHash('sha256').update(rawString).digest('hex');
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      db.prepare(`
        INSERT OR REPLACE INTO batch_metadata (batch_id, producer_license, farm_gps, harvest_photos, lab_report_json, proof_doc_name, computed_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        batchId,
        producer_license || 'N/A',
        farm_gps || 'N/A',
        JSON.stringify(harvest_photos || []),
        JSON.stringify(lab_report || {}),
        proof_doc_name || 'Generic-Proof.pdf',
        computedHash,
        now
      );

      return sendJson(res, 201, {
        success: true,
        message: 'Off-chain metadata stored successfully',
        batch_id: batchId,
        on_chain_hash: `0x${computedHash}`,
        note: 'Submit this on_chain_hash to the Tezos smart contract register_batch or add_event entrypoint.'
      });
    }

    // POST /api/hash-proof (Utility helper for Tezos Smart Contract developers)
    if (req.method === 'POST' && pathname === '/api/hash-proof') {
      const body = await parseJsonBody(req);
      const { data } = body;
      if (!data) return sendJson(res, 400, { error: 'data field required' });
      const hash = crypto.createHash('sha256').update(typeof data === 'string' ? data : JSON.stringify(data)).digest('hex');
      return sendJson(res, 200, { hash: `0x${hash}`, rawHash: hash });
    }

    sendJson(res, 404, { error: 'Route not found' });
  } catch (err) {
    console.error('[OffChain Server Error]:', err);
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`TraceTrail Off-Chain Metadata & Proof Service`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Database: ${DB_PATH}`);
  console.log(`Purpose: Stores heavy photos, certs & computes Tezos hashes`);
  console.log(`=======================================================`);
});
