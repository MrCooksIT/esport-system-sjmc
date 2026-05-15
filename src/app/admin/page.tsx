"use client";

import { useEffect, useState } from "react";

type Device = { id: number; name: string; type: string; active: boolean; checkouts: { id: number }[] };

export default function AdminPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("keyboard");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [qrOpen, setQrOpen] = useState<number | null>(null);

  async function load() {
    try {
      const [active, all] = await Promise.all([
        fetch("/api/devices").then((r) => r.json()),
        fetch("/api/devices?all=true").then((r) => r.json()),
      ]);
      setDevices(Array.isArray(active) ? active : []);
      setAllDevices(Array.isArray(all) ? all : []);
    } catch {
      setError("Failed to load devices. Check the server is running.");
    }
  }

  useEffect(() => { load(); }, []);

  async function addDevice(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), type: newType }),
    });
    setAdding(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to add");
      return;
    }
    setNewName("");
    load();
  }

  async function toggleActive(id: number, active: boolean) {
    await fetch(`/api/devices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  function printQR(device: Device) {
    window.open(`/print/${device.id}`, "_blank");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin — Equipment Management</h1>

      {/* Add Device */}
      <section className="bg-gray-900 rounded-xl p-6 border border-gray-800 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add New Device</h2>
        <form onSubmit={addDevice} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="keyboard">⌨️ Keyboard</option>
              <option value="mouse">🖱️ Mouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`e.g. ${newType === "keyboard" ? "Keyboard #6" : "Mouse #6"}`}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={adding}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg text-sm"
          >
            {adding ? "Adding..." : "Add Device"}
          </button>
        </form>
      </section>

      {/* Device List */}
      <section>
        <h2 className="text-lg font-semibold mb-3">All Devices</h2>
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="text-left px-4 py-3">Device</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {allDevices.map((d) => (
                <tr key={d.id} className={`${d.active ? "bg-gray-950" : "bg-gray-900/50 opacity-60"}`}>
                  <td className="px-4 py-3 font-medium">
                    {d.type === "keyboard" ? "⌨️" : "🖱️"} {d.name}
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-400">{d.type}</td>
                  <td className="px-4 py-3">
                    {d.active ? (
                      d.checkouts.length > 0 ? (
                        <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded-full">Checked Out</span>
                      ) : (
                        <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full">Available</span>
                      )
                    ) : (
                      <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setQrOpen(qrOpen === d.id ? null : d.id)}
                        className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs"
                      >
                        QR Code
                      </button>
                      <button
                        onClick={() => printQR(d)}
                        className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => toggleActive(d.id, d.active)}
                        className={`px-3 py-1 rounded text-xs ${d.active ? "bg-red-900/50 hover:bg-red-800/50 text-red-400" : "bg-green-900/50 hover:bg-green-800/50 text-green-400"}`}
                      >
                        {d.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                    {qrOpen === d.id && (
                      <div className="mt-3 flex justify-end">
                        <div className="bg-white p-3 rounded-lg inline-block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/devices/${d.id}/qr`}
                            alt={`QR for ${d.name}`}
                            width={150}
                            height={150}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Instructions */}
      <section className="bg-gray-900 rounded-xl p-6 border border-gray-800 max-w-lg">
        <h2 className="text-lg font-semibold mb-3">QR Code Setup Instructions</h2>
        <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
          <li>Click <strong>Print</strong> next to each device to open the print dialog</li>
          <li>Print on label paper or regular paper and cut out</li>
          <li>Stick the QR code sticker on the <strong>bottom of each device</strong></li>
          <li>Players scan the QR code with their phone to check out or return</li>
        </ol>
        <p className="text-xs text-gray-500 mt-3">
          The QR code links directly to the checkout page for that specific device.
          No app install needed — just the camera app.
        </p>
      </section>
    </div>
  );
}
