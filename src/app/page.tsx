"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Device = { id: number; name: string; type: string };
type Checkout = {
  id: number;
  playerName: string;
  checkedOutAt: string;
  device: Device;
};

function hoursAgo(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / 3_600_000;
}

function formatDuration(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function Dashboard() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [devices, setDevices] = useState<(Device & { checkouts: Checkout[] })[]>([]);
  const [pin, setPin] = useState("");
  const [returningId, setReturningId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [co, dev] = await Promise.all([
      fetch("/api/checkouts").then((r) => r.json()),
      fetch("/api/devices").then((r) => r.json()),
    ]);
    setCheckouts(co);
    setDevices(dev);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  async function returnDevice(checkoutId: number) {
    setError("");
    const res = await fetch(`/api/checkouts/${checkoutId}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to return");
      return;
    }
    setReturningId(null);
    setPin("");
    load();
  }

  const available = devices.filter((d) => d.checkouts.length === 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipment Dashboard</h1>
        <Link
          href="/checkout"
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Check Out Device
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="text-3xl font-bold text-red-400">{checkouts.length}</div>
          <div className="text-sm text-gray-400 mt-1">Currently Out</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="text-3xl font-bold text-green-400">{available.length}</div>
          <div className="text-sm text-gray-400 mt-1">Available</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="text-3xl font-bold text-gray-300">{devices.length}</div>
          <div className="text-sm text-gray-400 mt-1">Total Devices</div>
        </div>
      </div>

      {/* Checked Out */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
          Checked Out
        </h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : checkouts.length === 0 ? (
          <p className="text-gray-500 text-sm">No devices currently checked out.</p>
        ) : (
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3">Device</th>
                  <th className="text-left px-4 py-3">Player</th>
                  <th className="text-left px-4 py-3">Duration</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {checkouts.map((co) => {
                  const overdue = hoursAgo(co.checkedOutAt) >= 4;
                  return (
                    <tr key={co.id} className={overdue ? "bg-red-950/40" : "bg-gray-950"}>
                      <td className="px-4 py-3 font-medium">
                        {co.device.type === "keyboard" ? "⌨️" : "🖱️"} {co.device.name}
                      </td>
                      <td className="px-4 py-3">{co.playerName}</td>
                      <td className={`px-4 py-3 ${overdue ? "text-red-400 font-semibold" : "text-gray-400"}`}>
                        {formatDuration(co.checkedOutAt)}
                        {overdue && " ⚠️"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {returningId === co.id ? (
                          <div className="flex items-center gap-2 justify-end">
                            <input
                              type="password"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="Staff PIN"
                              value={pin}
                              onChange={(e) => setPin(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && returnDevice(co.id)}
                              className="w-28 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => returnDevice(co.id)}
                              className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm font-medium"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => { setReturningId(null); setPin(""); setError(""); }}
                              className="text-gray-400 hover:text-white px-2 py-1 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setReturningId(co.id); setError(""); }}
                            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
                          >
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </section>

      {/* Available */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
          Available
        </h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : available.length === 0 ? (
          <p className="text-gray-500 text-sm">All devices are currently checked out.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {available.map((d) => (
              <Link
                key={d.id}
                href={`/checkout?deviceId=${d.id}`}
                className="bg-gray-900 border border-gray-800 hover:border-cyan-500 rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors"
              >
                {d.type === "keyboard" ? "⌨️" : "🖱️"} {d.name}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
