"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Device = { id: number; name: string; type: string };
type Checkout = { id: number; playerName: string; checkedOutAt: string; device: Device };

export default function DevicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<Checkout | null | undefined>(undefined);
  const [device, setDevice] = useState<Device | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [accessoriesOk, setAccessoriesOk] = useState(false);
  const [conditionOk, setConditionOk] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id }) => setDeviceId(id));
  }, [params]);

  useEffect(() => {
    if (!deviceId) return;
    Promise.all([
      fetch("/api/checkouts").then((r) => r.json()),
      fetch("/api/devices").then((r) => r.json()),
    ]).then(([checkouts, devices]: [Checkout[], Device[]]) => {
      const co = checkouts.find((c) => c.device.id === Number(deviceId));
      const dev = devices.find((d) => d.id === Number(deviceId));
      setCheckout(co ?? null);
      setDevice(dev ?? null);
    });
  }, [deviceId]);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!playerName.trim()) return;
    if (!accessoriesOk || !conditionOk) {
      setError("Please confirm both checkboxes before checking out.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/checkouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId: Number(deviceId), playerName, accessoriesOk, conditionOk }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed");
      return;
    }
    router.push("/");
  }

  async function handleReturn() {
    if (!checkout) return;
    setError("");
    setLoading(true);
    const res = await fetch(`/api/checkouts/${checkout.id}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed");
      return;
    }
    router.push("/");
  }

  if (checkout === undefined || !deviceId) {
    return <p className="text-gray-500 text-sm">Loading...</p>;
  }

  if (!device) {
    return <p className="text-red-400">Device not found.</p>;
  }

  const icon = device.type === "keyboard" ? "⌨️" : "🖱️";
  const canCheckout = playerName.trim().length > 0 && accessoriesOk && conditionOk;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
        <div className="text-5xl mb-3">{icon}</div>
        <h1 className="text-2xl font-bold">{device.name}</h1>
        <p className="text-gray-400 text-sm mt-1 capitalize">{device.type}</p>
      </div>

      {checkout ? (
        <div className="space-y-4">
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-4">
            <p className="text-sm text-red-300">Currently checked out by</p>
            <p className="text-xl font-bold mt-1">{checkout.playerName}</p>
            <p className="text-xs text-gray-400 mt-1">
              Since {new Date(checkout.checkedOutAt).toLocaleString()}
            </p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={32}
              placeholder="Staff PIN to return"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReturn()}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleReturn}
              disabled={loading || !pin}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? "Returning..." : "Return Device"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="space-y-4">
          <div className="bg-green-950/40 border border-green-800 rounded-xl p-3 text-sm text-green-300 text-center">
            ✓ This device is available
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Your full name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="First and last name"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              required
              autoFocus
              autoComplete="name"
            />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-gray-300">Before you take this device, confirm:</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accessoriesOk}
                onChange={(e) => setAccessoriesOk(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-cyan-500 cursor-pointer"
              />
              <span className="text-sm text-gray-200">
                All <strong>dongles and cables</strong> are present and accounted for
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={conditionOk}
                onChange={(e) => setConditionOk(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-cyan-500 cursor-pointer"
              />
              <span className="text-sm text-gray-200">
                The device is in <strong>good condition</strong> (no visible damage)
              </span>
            </label>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !canCheckout}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition-opacity"
          >
            {loading ? "Checking out..." : "Check Out Device"}
          </button>
          {!canCheckout && playerName.trim().length > 0 && (
            <p className="text-xs text-gray-500 text-center">Tick both boxes above to continue</p>
          )}
        </form>
      )}
    </div>
  );
}
