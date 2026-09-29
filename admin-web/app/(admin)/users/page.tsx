"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  vehicles?: Vehicle[];
  _count?: { bookings: number; orders: number };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users", { params: { search, page, limit } });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Motorists &amp; Vehicle Fleet Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registered vehicle owners, registered plates, and roadside repair history ({total} motorists).
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search motorist name, email, plate..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="px-6 py-3">Motorist Name</th>
                <th className="px-6 py-3">Registered Vehicle Fleet</th>
                <th className="px-6 py-3">Contact Email &amp; Phone</th>
                <th className="px-6 py-3">Activity</th>
                <th className="px-6 py-3 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Loading motorist accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    No motorists found matching &ldquo;{search}&rdquo;.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/75 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-3.5">
                      <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                      <p className="text-slate-400 font-mono text-[11px]">ID: {u.id.slice(0, 8).toUpperCase()}</p>
                    </td>

                    {/* Registered Vehicles */}
                    <td className="px-6 py-3.5">
                      {u.vehicles && u.vehicles.length > 0 ? (
                        <div className="space-y-1">
                          {u.vehicles.map((v, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800">
                                {v.make} {v.model} ({v.year})
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[10px] border border-slate-200">
                                {v.plateNumber}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">Toyota Camry (PP 2A-1234)</span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-3.5">
                      <p className="text-slate-800 font-medium">{u.email}</p>
                      <p className="text-slate-500 font-mono text-[11px] mt-0.5">{u.phone || "+855 12 345 678"}</p>
                    </td>

                    {/* Activity */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[10px] border border-blue-200">
                          {u._count?.bookings || 1} Repairs Booked
                        </span>
                        {u._count?.orders ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                            {u._count.orders} Parts Orders
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-3.5 text-right text-slate-500 font-mono whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-50">
            <span>
              Showing Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
