import React from "react";
import { EventTypeBadge, RoleBadge } from "./Badge";
import { MapPin, User, FileText, Hash, Clock, PackageCheck } from "lucide-react";

export function Timeline({ events = [], batchId }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        <PackageCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="font-semibold text-slate-700">No Journey Stops Logged Yet</p>
        <p className="text-xs text-slate-400 mt-1">
          Authorized handlers can record the initial Packed, Inspected, Shipped, or Delivered milestones.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8">
      {/* Vertical Timeline Guide Line */}
      <div className="absolute left-[15px] sm:left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-400 via-amber-400 via-indigo-500 to-emerald-500" />

      <div className="space-y-6">
        {events.map((evt, idx) => {
          const isLatest = idx === events.length - 1;

          return (
            <div key={evt.id || idx} className="relative group">
              {/* Timeline Node Icon Circle */}
              <div
                className={`absolute -left-[27px] sm:-left-[31px] top-1.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center shadow-xs z-10 transition-transform duration-300 group-hover:scale-125 ${
                  evt.type === "Packed"
                    ? "border-blue-500 text-blue-600"
                    : evt.type === "Inspected"
                    ? "border-amber-500 text-amber-600"
                    : evt.type === "Shipped"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-emerald-500 text-emerald-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    evt.type === "Packed"
                      ? "bg-blue-500"
                      : evt.type === "Inspected"
                      ? "bg-amber-500"
                      : evt.type === "Shipped"
                      ? "bg-indigo-500"
                      : "bg-emerald-500"
                  }`}
                />
              </div>

              {/* Event Card Content */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5">
                {/* Top Row: Type Badge, Role, Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <EventTypeBadge type={evt.type} />
                    {evt.role && <RoleBadge role={evt.role} />}
                    {isLatest && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                        Current Status
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.timestamp}</span>
                  </div>
                </div>

                {/* Location & Actor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3 text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-900">{evt.location}</span>
                  </div>
                  {evt.actor && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{evt.actor}</span>
                    </div>
                  )}
                </div>

                {/* Note / Remarks */}
                {evt.note && (
                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 border-l-2 border-indigo-500 mb-3 leading-relaxed">
                    “{evt.note}”
                  </div>
                )}

                {/* Cryptographic verification footer */}
                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md" title="Permanent digital signature">
                    <Hash className="w-3 h-3 text-indigo-600" />
                    <span>Digital Fingerprint: {evt.noteHash ? `${evt.noteHash.substring(0, 16)}...` : "0xVerified"}</span>
                  </div>

                  {evt.offchainProof && (
                    <div className="flex items-center gap-1 text-[11px] text-indigo-700 font-medium">
                      <FileText className="w-3 h-3" />
                      <span>{evt.offchainProof}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
