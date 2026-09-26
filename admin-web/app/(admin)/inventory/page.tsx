"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: string;
  category?: { id: string; name: string };
}

interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  _count?: { products: number };
}

interface OrderItem {
  id: string;
  quantity: number;
  priceAtBuy: number;
  product?: { name: string; price: number };
}

interface Order {
  id: string;
  customerId: string;
  customer?: { name: string; email: string; phone?: string };
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchInventoryData = useCallback(async () => {
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.get("/admin/products"),
        api.get("/admin/orders"),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(prodRes.data.categories || []);
      setOrders(orderRes.data || []);
      if (prodRes.data.categories?.length > 0 && !formCategoryId) {
        setFormCategoryId(prodRes.data.categories[0].id);
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [formCategoryId]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInventoryData();
  };

  // ─── Stock & Product Management ──────────────────────────────────────────
  const handleQuickStockAdjust = async (productId: string, delta: number) => {
    const current = products.find((p) => p.id === productId);
    if (!current) return;
    const newStock = Math.max(0, current.stock + delta);

    try {
      await api.patch(`/admin/products/${productId}`, { stock: newStock });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
      showToast(`Updated stock for ${current.name} to ${newStock}`);
    } catch (err) {
      console.error("Failed to update stock:", err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormStock("50");
    if (categories.length > 0) setFormCategoryId(categories[0].id);
    setProductModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDescription(p.description || "");
    setFormPrice(String(p.price));
    setFormStock(String(p.stock));
    setFormCategoryId(p.categoryId);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const priceNum = parseFloat(formPrice);
    const stockNum = parseInt(formStock, 10);

    try {
      if (editingProduct) {
        const res = await api.patch(`/admin/products/${editingProduct.id}`, {
          name: formName,
          description: formDescription,
          price: priceNum,
          stock: stockNum,
          categoryId: formCategoryId,
        });
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? res.data : p))
        );
        showToast("Product updated successfully");
      } else {
        const res = await api.post("/admin/products", {
          name: formName,
          description: formDescription,
          price: priceNum,
          stock: stockNum,
          categoryId: formCategoryId,
        });
        setProducts((prev) => [res.data, ...prev]);
        showToast("New product added to inventory catalog");
      }
      setProductModalOpen(false);
    } catch (err) {
      console.error("Failed to save product:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from inventory?`)) return;

    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Product "${name}" deleted`);
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      showToast(`Order #${orderId.slice(-6).toUpperCase()} status set to ${status}`);
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  // ─── Filtered Data & Metrics ─────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === "All" || p.category?.name === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  const totalValuation = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price * p.stock, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock < 30).length;
  }, [products]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-mono">Loading inventory catalog and parts orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Notification Toast ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Header & Sync ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Auto Parts &amp; Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Centralized stock control for e-commerce auto parts, category catalogs, and customer purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{refreshing ? "Refreshing..." : "Sync Stock"}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-2xs cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Part</span>
          </button>
        </div>
      </div>

      {/* ─── 4 Standard KPI Overview Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Catalog SKUs</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{products.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across {categories.length} categories</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock Threshold</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{lowStockCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Fewer than 30 units remaining</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Asset Value</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Retail inventory valuation</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Orders</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{orders.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total fulfilled &amp; pending orders</p>
        </div>
      </div>

      {/* ─── Tabs (Catalog vs Orders) ──────────────────────────────────────── */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex space-x-6 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 border-b-2 font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "catalog"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Products &amp; Stock Levels</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 border-b-2 font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Customer Parts Orders</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
              {orders.length}
            </span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: PRODUCT CATALOG & STOCK ────────────────────────────────── */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Controls: Categories & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-2xl">
              {["All", ...categories.map((c) => c.name)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded text-xs font-semibold border transition cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search part name, OEM..."
                className="w-full sm:w-64 px-3 py-1.5 pl-8 rounded text-xs border border-slate-300 focus:outline-none focus:border-slate-900 bg-white"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    <th className="px-5 py-3">Part Details</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Retail Price</th>
                    <th className="px-5 py-3">Stock On Hand</th>
                    <th className="px-5 py-3">Quick Adjust</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        No products match current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isLowStock = p.stock < 30;
                      const isCritical = p.stock < 10;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                          <td className="px-5 py-3.5 max-w-xs">
                            <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                            <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{p.description || "OEM replacement part"}</p>
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {p.category?.name || "General"}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                            ${p.price.toFixed(2)}
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-slate-900">{p.stock}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                  isCritical
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : isLowStock
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                }`}
                              >
                                {isCritical ? "CRITICAL" : isLowStock ? "LOW STOCK" : "IN STOCK"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="inline-flex items-center border border-slate-300 rounded overflow-hidden">
                              <button
                                onClick={() => handleQuickStockAdjust(p.id, -10)}
                                className="px-2 py-1 bg-slate-50 hover:bg-slate-200 text-slate-700 font-mono font-bold transition cursor-pointer"
                                title="Reduce stock by 10"
                              >
                                -10
                              </button>
                              <button
                                onClick={() => handleQuickStockAdjust(p.id, -1)}
                                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-mono font-bold border-x border-slate-300 transition cursor-pointer"
                                title="Reduce stock by 1"
                              >
                                -1
                              </button>
                              <button
                                onClick={() => handleQuickStockAdjust(p.id, 1)}
                                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-mono font-bold border-r border-slate-300 transition cursor-pointer"
                                title="Add 1 to stock"
                              >
                                +1
                              </button>
                              <button
                                onClick={() => handleQuickStockAdjust(p.id, 25)}
                                className="px-2 py-1 bg-slate-50 hover:bg-slate-200 text-slate-700 font-mono font-bold transition cursor-pointer"
                                title="Add 25 to stock (Restock batch)"
                              >
                                +25
                              </button>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold mr-2 transition cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="px-2 py-1 rounded text-red-600 hover:bg-red-50 font-semibold transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: CUSTOMER PARTS ORDERS ──────────────────────────────────── */}
      {activeTab === "orders" && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3">Order #</th>
                  <th className="px-5 py-3">Customer &amp; Phone</th>
                  <th className="px-5 py-3">Items Purchased</th>
                  <th className="px-5 py-3">Total Amount</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Order Status</th>
                  <th className="px-5 py-3 text-right">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      No customer parts orders placed yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        #{o.id.slice(-6).toUpperCase()}
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{o.customer?.name || "Motorist"}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{o.customer?.phone || o.customer?.email}</p>
                      </td>

                      <td className="px-5 py-3.5 max-w-xs">
                        {o.items?.length > 0 ? (
                          <div className="space-y-0.5">
                            {o.items.map((it, idx) => (
                              <p key={idx} className="text-slate-800">
                                {it.quantity}x {it.product?.name || "Auto Part"} &bull;{" "}
                                <span className="text-slate-500 font-mono">${it.priceAtBuy.toFixed(2)}</span>
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">Standard Parts Order</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900 text-sm">
                        ${o.totalAmount.toFixed(2)}
                      </td>

                      <td className="px-5 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            o.status === "PAID"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : o.status === "DELIVERED"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-semibold cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Modal: Add/Edit Product ────────────────────────────────────────── */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              {editingProduct ? "Edit Auto Part SKU" : "Add New Part to Catalog"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter part title, category, pricing, and initial warehouse stock level.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Part Name &amp; Spec</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Mobil 1 Full Synthetic 5W-30 (1L)"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-900 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="29.99"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stock on Hand</label>
                <input
                  type="number"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="50"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="OEM compatibility, manufacturer specifications..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingProduct ? "Update Part" : "Add Part"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
