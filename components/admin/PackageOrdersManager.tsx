"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PackageOrder, PackageOrderStatus } from "@/types";
import { formatDate } from "@/lib/utils";
import { 
  Crown, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  Tag, 
  Phone, 
  Car, 
  FileText,
  AlertCircle
} from "lucide-react";

export default function PackageOrdersManager() {
  const [orders, setOrders] = useState<PackageOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PackageOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [staffNotes, setStaffNotes] = useState("");

  const fetchOrders = () => {
    setLoading(true);
    let url = `/api/packages/orders?_t=${Date.now()}`;
    if (filterStatus !== "ALL") url += `&status=${filterStatus}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

    fetch(url, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch package orders error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: PackageOrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/packages/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus,
          staff_notes: staffNotes || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getTierColor = (tier: string) => {
    if (tier === "emerald") return "text-emerald-400 bg-emerald-950/40 border-emerald-500/40";
    if (tier === "gold") return "text-amber-400 bg-amber-950/40 border-amber-500/40";
    return "text-slate-300 bg-slate-800/60 border-slate-600/40";
  };

  const getStatusBadge = (status: PackageOrderStatus) => {
    switch (status) {
      case "delivered":
      case "active":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> DELIVERED
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" /> REJECTED
          </span>
        );
      case "pending":
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 animate-pulse" /> PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-card border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by character, discord, plate..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["ALL", "pending", "delivered", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
                  filterStatus === st
                    ? "bg-cyan-500 text-black shadow-neon-cyan-sm"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Orders Grid / Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-mono text-slate-400">Loading supporter package orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 space-y-3">
          <Crown className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="font-heading font-bold text-lg text-white">No Package Orders Found</h4>
          <p className="text-xs text-slate-400">There are no donor orders matching your current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-3">
            {orders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setStaffNotes(order.staff_notes || "");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900/90 border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                      : "bg-surface-card border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-cyan-500/40 flex-shrink-0">
                        <Image
                          src={order.discord_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                          alt={order.discord_username}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate flex items-center gap-2">
                          <span>{order.character_name}</span>
                          <span className="text-xs text-slate-400 font-normal">(@{order.discord_username})</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${getTierColor(order.package_tier)}`}>
                        {order.package_name} ({order.price})
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Summary of customized items */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300 font-mono">
                    {order.custom_plate && (
                      <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-cyan-300">
                        <Tag className="w-3 h-3 text-cyan-400" /> Plate: {order.custom_plate}
                      </span>
                    )}
                    {order.custom_phone && (
                      <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-300">
                        <Phone className="w-3 h-3 text-amber-400" /> Phone: {order.custom_phone}
                      </span>
                    )}
                    {order.vehicle_preference && (
                      <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300 truncate max-w-[220px]">
                        <Car className="w-3 h-3 text-emerald-400" /> {order.vehicle_preference}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Details & Actions Drawer */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 sticky top-28 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                      Order Management
                    </span>
                    <h3 className="font-heading font-black text-xl text-white">
                      {selectedOrder.character_name}
                    </h3>
                  </div>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                {/* Details Breakdown */}
                <div className="space-y-3 text-xs text-slate-300 font-mono">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Package:</span>
                      <span className="text-white font-bold">{selectedOrder.package_name} ({selectedOrder.price})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Discord User:</span>
                      <span className="text-cyan-300">{selectedOrder.discord_username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Discord ID:</span>
                      <span className="text-slate-400">{selectedOrder.discord_id}</span>
                    </div>
                  </div>

                  {selectedOrder.custom_plate && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">REQUESTED PLATE(S):</span>
                      <span className="text-white font-bold text-sm tracking-wider">{selectedOrder.custom_plate}</span>
                    </div>
                  )}

                  {selectedOrder.custom_phone && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">REQUESTED PHONE #:</span>
                      <span className="text-amber-300 font-bold">{selectedOrder.custom_phone}</span>
                    </div>
                  )}

                  {selectedOrder.vehicle_preference && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">VEHICLE PREFERENCE:</span>
                      <span className="text-slate-200">{selectedOrder.vehicle_preference}</span>
                    </div>
                  )}

                  {selectedOrder.notes && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">PLAYER NOTES:</span>
                      <p className="text-slate-300 font-sans">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>

                {/* Staff Notes Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Staff Internal Notes / Delivery Memo:
                  </label>
                  <textarea
                    rows={2}
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    placeholder="e.g. Car spawned in garage, custom plate set in database, role assigned."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none resize-none font-sans"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}
                    disabled={updatingId === selectedOrder.id}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-heading font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    MARK AS DELIVERED / ACTIVE
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "rejected")}
                    disabled={updatingId === selectedOrder.id}
                    className="w-full py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 text-xs font-bold transition-all"
                  >
                    REJECT ORDER
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="font-heading font-bold text-sm text-white">No Order Selected</h4>
                <p className="text-xs text-slate-400">Click on any supporter request on the left to view details and process delivery.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
