"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Device = { id: number; name: string; type: string; checkouts: { id: number }[] };

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("deviceId");

  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState(preselectedId ?? "");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/devices")
      .then((r) => r.json())
      .then((data: Device[]) => {
        setDevices(data.filter((d) => d.checkouts.length === 0));
      });
  }, []);

  useEffect(() => {
    if (preselectedId) setDeviceId(preselectedId);
  }, [preselectedId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!deviceId || !playerName.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/checkouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId: Number(deviceId), playerName }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to check out");
      return;
    }
    router.push("/");
  }

  const selectedDevice = devices.find((d) => d.id === Number(deviceId));

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Check Out a Device</h1>
        <p className="text-gray-400 text-sm mt-1">
          Select the device you want to borrow and enter your name.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Device</label>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            required
          >
            <option value="">— Select a device —</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.type === "keyboard" ? "⌨️" : "🖱️"} {d.name}
              </option>
            ))}
          </select>
          {selectedDevice && (
            <p className="text-xs text-green-400 mt-1">✓ This device is available</p>
          )}
          {devices.length === 0 && (
            <p className="text-xs text-yellow-400 mt-1">No devices currently available</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            required
            autoComplete="name"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || devices.length === 0}
          className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? "Checking out..." : "Check Out Device"}
        </button>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  );
}
