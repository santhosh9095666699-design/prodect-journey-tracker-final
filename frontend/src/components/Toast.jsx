import React from "react";
import { useData } from "../context/DataContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function Toast() {
  const { toast } = useData();

  if (!toast) return null;

  const isError = toast.type === "error";
  const isInfo = toast.type === "info";

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce-in">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-sm ${
          isError
            ? "bg-red-50/95 border-red-200 text-red-900"
            : isInfo
            ? "bg-sky-50/95 border-sky-200 text-sky-900"
            : "bg-emerald-50/95 border-emerald-200 text-emerald-900"
        }`}
      >
        <div className="mt-0.5 flex-shrink-0">
          {isError ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : isInfo ? (
            <Info className="w-5 h-5 text-sky-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
        </div>
        <div className="flex-1 text-sm font-medium pr-2">{toast.message}</div>
      </div>
    </div>
  );
}
