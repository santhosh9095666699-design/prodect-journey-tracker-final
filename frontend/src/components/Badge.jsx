import React from "react";
import { Package, ShieldCheck, Truck, CheckCircle2, AlertCircle } from "lucide-react";

export function EventTypeBadge({ type, className = "" }) {
  switch (type) {
    case "Packed":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs ${className}`}
        >
          <Package className="w-3.5 h-3.5 text-blue-600" />
          Packed
        </span>
      );
    case "Inspected":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          Inspected
        </span>
      );
    case "Shipped":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs ${className}`}
        >
          <Truck className="w-3.5 h-3.5 text-indigo-600" />
          Shipped
        </span>
      );
    case "Delivered":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Delivered
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 shadow-xs ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {type || "Unknown"}
        </span>
      );
  }
}

export function RoleBadge({ role }) {
  const styles = {
    Producer: "bg-blue-50 text-blue-800 border-blue-200",
    Inspector: "bg-amber-50 text-amber-800 border-amber-200",
    Transporter: "bg-indigo-50 text-indigo-800 border-indigo-200",
    Retailer: "bg-emerald-50 text-emerald-800 border-emerald-200"
  };

  const style = styles[role] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${style}`}>
      Role: {role}
    </span>
  );
}
