import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { Camera, X, Upload, AlertCircle, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";

export function QRScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [scannerError, setScannerError] = useState("");
  const [isStarting, setIsStarting] = useState(true);
  const [scannedResult, setScannedResult] = useState(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Helper to extract Product / Batch ID from scanned text
  const extractProductId = (rawText) => {
    if (!rawText) return null;
    const trimmed = rawText.trim();

    // Accept absolute/relative journey URLs with encoded IDs, query strings,
    // or trailing slashes, as well as a plain batch code.
    try {
      const parsed = new URL(trimmed, window.location.origin);
      const segments = parsed.pathname.split("/").filter(Boolean);
      const productIndex = segments.findIndex((segment) => segment.toLowerCase() === "product");
      if (productIndex >= 0 && segments[productIndex + 1]) {
        return decodeURIComponent(segments[productIndex + 1]).trim().toUpperCase();
      }
    } catch {
      // Fall through to treating this as a plain code.
    }

    try {
      return decodeURIComponent(trimmed).toUpperCase();
    } catch {
      return trimmed.toUpperCase();
    }
  };

  const handleScanSuccess = async (decodedText) => {
    const id = extractProductId(decodedText);
    if (!id) return;

    setScannedResult(id);

    // Stop camera before navigating
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn("Stop scanner error:", e);
      }
    }

    setTimeout(() => {
      onClose();
      navigate(`/product/${encodeURIComponent(id)}`);
    }, 700);
  };

  useEffect(() => {
    if (!isOpen) {
      setScannerError("");
      setScannedResult(null);
      setIsStarting(true);
      return;
    }

    let isMounted = true;
    const scannerId = "interactive-qr-reader";

    const initScanner = async () => {
      setIsStarting(true);
      setScannerError("");

      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edgeSize = Math.floor(minEdge * 0.72);
            return { width: edgeSize, height: edgeSize };
          },
          aspectRatio: 1.0,
        };

        // Prefer rear camera on mobile phones
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (isMounted) {
              handleScanSuccess(decodedText);
            }
          },
          () => {
            // Frame scan miss; ignore silently
          }
        );

        if (isMounted) {
          setIsStarting(false);
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        if (isMounted) {
          setIsStarting(false);
          setScannerError(
            err?.message ||
              "Could not access camera. Please allow camera permissions or upload an image."
          );
        }
      }
    };

    // Small delay to ensure modal DOM element exists
    const timer = setTimeout(() => {
      initScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch((e) => console.warn("Cleanup stop error:", e));
        }
        try {
          scannerRef.current.clear();
        } catch (e) {}
      }
    };
  }, [isOpen]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;

    try {
      setScannerError("");
      const result = await scannerRef.current.scanFile(file, true);
      handleScanSuccess(result);
    } catch (err) {
      setScannerError("No readable QR code found in this image. Try another photo.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Scan Product Box QR</h3>
              <p className="text-xs text-slate-400">Point your camera at the packaging label</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Video Area */}
        <div className="relative bg-black flex items-center justify-center min-h-[320px] max-h-[380px] overflow-hidden">
          {/* HTML5 QR reader mount target */}
          <div id="interactive-qr-reader" className="w-full h-full" />

          {/* Loading Indicator */}
          {isStarting && !scannerError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/90 text-slate-300 z-20">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs font-semibold">Starting camera...</p>
            </div>
          )}

          {/* Success Flash Overlay */}
          {scannedResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-emerald-950/95 text-white z-30 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                  Product Detected!
                </p>
                <p className="font-mono text-base font-extrabold text-white mt-1">
                  {scannedResult}
                </p>
                <p className="text-xs text-slate-300 mt-1">Opening verified journey...</p>
              </div>
            </div>
          )}

          {/* Error View */}
          {scannerError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 text-slate-200 z-20 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <div>
                <p className="font-bold text-sm text-white">Camera Unavailable</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">{scannerError}</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload QR Image Instead</span>
              </button>
            </div>
          )}

          {/* Target Overlay Laser Graphic */}
          {!scannerError && !isStarting && !scannedResult && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-indigo-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                {/* Corner Accents */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-sm" />

                {/* Animated scan beam */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upload Photo / File</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
