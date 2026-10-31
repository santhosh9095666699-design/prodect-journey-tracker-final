import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Toast } from "./components/Toast";
import { LandingPage } from "./pages/LandingPage";
import { ProducerDashboard } from "./pages/ProducerDashboard";
import { HandlerDashboard } from "./pages/HandlerDashboard";
import { CustomerJourneyPage } from "./pages/CustomerJourneyPage";

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* 1. Landing Page: Explains TraceTrail and lets visitors search products */}
              <Route path="/" element={<LandingPage />} />

              {/* 2. Producer Dashboard: Form for farmers to register harvest */}
              <Route path="/producer" element={<ProducerDashboard />} />

              {/* 3. Handler Dashboard: Add Packed, Inspected, Shipped, Delivered events */}
              <Route path="/handler" element={<HandlerDashboard />} />

              {/* 4. Customer Page: Verified product timeline & scannable QR */}
              <Route path="/product/:productId" element={<CustomerJourneyPage />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <Toast />
        </div>
      </BrowserRouter>
    </DataProvider>
  );
}
