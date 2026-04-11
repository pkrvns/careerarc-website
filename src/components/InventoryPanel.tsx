"use client";

import { useState, useEffect, useCallback } from "react";

type InventoryItem = {
  id: number;
  item: string;
  stock_in: number;
  stock_out: number;
  current_stock: number;
  alert_threshold: number;
  last_updated: string;
};

export function InventoryPanel() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updateItem, setUpdateItem] = useState<string | null>(null);
  const [stockAction, setStockAction] = useState<"in" | "out">("out");
  const [stockAmount, setStockAmount] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inventory");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setLowStockCount(data.lowStockCount);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleUpdate = async () => {
    if (!updateItem || stockAmount <= 0) return;
    setSaving(true);
    try {
      await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: updateItem,
          ...(stockAction === "in" ? { stock_in: stockAmount } : { stock_out: stockAmount }),
        }),
      });
      setUpdateItem(null);
      setStockAmount(0);
      fetchInventory();
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) {
    return <div className="py-8 text-center text-sm text-muted">Loading inventory...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gold/20 bg-white p-4">
          <div className="text-2xl font-semibold text-chocolate">{items.length}</div>
          <div className="text-xs text-muted">Total Items</div>
        </div>
        <div className="rounded-xl border border-gold/20 bg-white p-4">
          <div className={`text-2xl font-semibold ${lowStockCount > 0 ? "text-red-600" : "text-green-600"}`}>
            {lowStockCount}
          </div>
          <div className="text-xs text-muted">Low Stock Alerts</div>
        </div>
        <div className="rounded-xl border border-gold/20 bg-white p-4">
          <div className="text-2xl font-semibold text-chocolate">
            {items.reduce((sum, i) => sum + i.stock_in, 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted">Total Stocked In</div>
        </div>
        <div className="rounded-xl border border-gold/20 bg-white p-4">
          <div className="text-2xl font-semibold text-chocolate">
            {items.reduce((sum, i) => sum + i.stock_out, 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted">Total Distributed</div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-xl border border-gold/20 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/10 bg-cream">
            <tr>
              <th className="px-4 py-3 font-medium text-chocolate">Item</th>
              <th className="px-4 py-3 font-medium text-chocolate text-right">Stock In</th>
              <th className="px-4 py-3 font-medium text-chocolate text-right">Stock Out</th>
              <th className="px-4 py-3 font-medium text-chocolate text-right">Current</th>
              <th className="px-4 py-3 font-medium text-chocolate text-right">Threshold</th>
              <th className="px-4 py-3 font-medium text-chocolate">Status</th>
              <th className="px-4 py-3 font-medium text-chocolate">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No inventory items. Data will be seeded on first load.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isLow = item.current_stock < item.alert_threshold;
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-gold/5 ${isLow ? "bg-red-50/50" : "hover:bg-ivory/50"}`}
                  >
                    <td className="px-4 py-3 font-medium text-chocolate">{item.item}</td>
                    <td className="px-4 py-3 text-right text-green-700">{item.stock_in.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-amber-700">{item.stock_out.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${isLow ? "text-red-600" : "text-chocolate"}`}>
                      {item.current_stock.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-muted">{item.alert_threshold}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isLow ? "bg-red-100 text-red-700" : "bg-green-50 text-green-700"
                        }`}
                      >
                        {isLow ? "LOW" : "OK"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {updateItem === item.item ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={stockAction}
                            onChange={(e) => setStockAction(e.target.value as "in" | "out")}
                            className="rounded border px-1 py-1 text-xs"
                          >
                            <option value="in">Add</option>
                            <option value="out">Remove</option>
                          </select>
                          <input
                            type="number"
                            value={stockAmount || ""}
                            onChange={(e) => setStockAmount(parseInt(e.target.value) || 0)}
                            className="w-16 rounded border px-2 py-1 text-xs"
                            placeholder="Qty"
                            min={1}
                          />
                          <button
                            onClick={handleUpdate}
                            disabled={saving || stockAmount <= 0}
                            className="text-xs text-green-600 hover:underline disabled:opacity-40"
                          >
                            {saving ? "..." : "Save"}
                          </button>
                          <button
                            onClick={() => { setUpdateItem(null); setStockAmount(0); }}
                            className="text-xs text-muted hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setUpdateItem(item.item); setStockAmount(0); setStockAction("out"); }}
                          className="text-xs text-gold hover:underline"
                        >
                          Update Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Stock Level Visual */}
      <div className="rounded-xl border border-gold/20 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-chocolate">Stock Levels</h3>
        <div className="space-y-2">
          {items.map((item) => {
            const pct = item.stock_in > 0 ? Math.round((item.current_stock / item.stock_in) * 100) : 0;
            const isLow = item.current_stock < item.alert_threshold;
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-40 truncate text-xs font-medium text-chocolate">{item.item}</div>
                <div className="flex-1">
                  <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-4 rounded-full transition-all ${isLow ? "bg-red-500" : "bg-green-500"}`}
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-xs text-muted">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
