"use client";

import { useEffect, useState } from "react";

type Device = { id: number; name: string; type: string };
type Checkout = {
  id: number;
  playerName: string;
  accessoriesOk: boolean;
  conditionOk: boolean;
  checkedOutAt: string;
  returnedAt: string | null;
  device: Device;
};

export default function HistoryPage() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        setCheckouts(data);
        setLoading(false);
      });
  }, []);

  const filtered = checkouts.filter(
    (c) =>
      c.playerName.toLowerCase().includes(search.toLowerCase()) ||
      c.device.name.toLowerCase().includes(search.toLowerCase())
  );

  function duration(co: Checkout) {
    const end = co.returnedAt ? new Date(co.returnedAt) : new Date();
    const mins = Math.floor((end.getTime() - new Date(co.checkedOutAt).getTime()) / 60_000);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Checkout History</h1>
        <span className="text-sm text-gray-400">{filtered.length} records</span>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by player name or device..."
        className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
      />

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No records found.</p>
      ) : (
        <div className="rounded-xl border border-gray-800 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="text-left px-4 py-3">Device</th>
                <th className="text-left px-4 py-3">Player</th>
                <th className="text-left px-4 py-3">Accessories</th>
                <th className="text-left px-4 py-3">Condition</th>
                <th className="text-left px-4 py-3">Checked Out</th>
                <th className="text-left px-4 py-3">Returned</th>
                <th className="text-left px-4 py-3">Duration</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((co) => (
                <tr key={co.id} className="bg-gray-950 hover:bg-gray-900">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {co.device.type === "keyboard" ? "⌨️" : "🖱️"} {co.device.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{co.playerName}</td>
                  <td className="px-4 py-3">
                    {co.accessoriesOk ? (
                      <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full">OK</span>
                    ) : (
                      <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">Missing</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {co.conditionOk ? (
                      <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full">Good</span>
                    ) : (
                      <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">Damaged</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(co.checkedOutAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {co.returnedAt ? new Date(co.returnedAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{duration(co)}</td>
                  <td className="px-4 py-3">
                    {co.returnedAt ? (
                      <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full">Returned</span>
                    ) : (
                      <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">Out</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
