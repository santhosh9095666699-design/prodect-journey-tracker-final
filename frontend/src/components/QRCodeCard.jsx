import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { getProductPath, getPublicProductUrl } from "../productUrl";
import {
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Sparkles,
  Download,
  Printer
} from "lucide-react";

export function QRCodeCard({ productId, productName }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [manualId, setManualId] = useState("");
  const qrRef = useRef(null);

  const publicUrl = getPublicProductUrl(productId);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Create a temporary link to download high-res PNG
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `TraceTrail-${productId}-QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrint = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TraceTrail Label - ${productId}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 40px;
              text-align: center;
            }
            .label-box {
              border: 2px dashed #4f46e5;
              padding: 24px;
              border-radius: 16px;
              max-width: 320px;
            }
            h2 { margin: 0 0 4px 0; color: #1e1b4b; font-size: 20px; }
            p { margin: 4px 0 16px 0; color: #475569; font-size: 13px; }
            .code { font-family: monospace; font-size: 14px; font-weight: bold; color: #4f46e5; margin-top: 12px; }
            img { width: 220px; height: 220px; }
          </style>
        </head>
        <body>
          <div class="label-box">
            <h2>${productName || "Product Verification"}</h2>
            <p>Scan to view product details and its recorded journey</p>
            <img src="${dataUrl}" alt="Product QR Code" />
            <div class="code">${productId}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleManualLookup = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      navigate(getProductPath(manualId.trim().toUpperCase()));
      setManualId("");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-indigo-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shadow-xs">
          <QrCode className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">Product QR Code</h3>
          <p className="text-xs text-slate-500">Scan with your phone camera or Google</p>
        </div>
      </div>

      {/* QR Code Container with Canvas */}
      <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-50 to-indigo-50/40 rounded-xl border border-slate-200 my-4">
        <div
          ref={qrRef}
          className="p-3.5 bg-white rounded-xl shadow-md border border-slate-200/90 transition-transform duration-300 hover:scale-105"
        >
          <QRCodeCanvas
            value={publicUrl}
            size={200}
            level="H"
            includeMargin={true}
            fgColor="#0f172a"
            bgColor="#ffffff"
          />
        </div>

        <div className="mt-3 flex items-center gap-1.5 font-mono text-xs text-indigo-900 font-bold bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-200/70">
          <Sparkles className="w-3 h-3 text-indigo-600" />
          <span>{productId}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2 text-center">
          <Smartphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>Point any smartphone camera to open journey instantly</span>
        </div>

        {/* Action Buttons: Download PNG & Print */}
        <div className="mt-4 flex items-center gap-2 w-full">
          <button
            onClick={handleDownload}
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
            title="Download QR code image to print on packaging"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
            title="Print printable label"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Shareable Link and Copy Action */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 block">
            Direct Web Link
          </label>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>Open in Tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 truncate focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 active:scale-95 shadow-sm cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Manual Product ID Fallback Entry */}
      <div className="pt-4 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-700 block mb-1.5">
          Can't scan right now? Type ID:
        </span>
        <form onSubmit={handleManualLookup} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. SKU-2026-001"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className="flex-1 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  );
}
