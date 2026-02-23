"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LocationAutocomplete from "@/components/LocationAutocomplete";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF", "SGD", "AED"];

export default function NewTrip() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    currency: "USD",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setLocation = useCallback(
    (val) => setForm((f) => ({ ...f, destination: val })),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create trip");
      }
      const trip = await res.json();
      router.push(`/trips/${trip._id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-blue-600">
          ← Back to trips
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">New Trip</h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
        <div>
          <label className="label">Trip Name *</label>
          <input
            className="input"
            required
            placeholder="e.g. Japan Spring 2025"
            value={form.name}
            onChange={set("name")}
          />
        </div>

        <div>
          <label className="label">Destination *</label>
          <LocationAutocomplete value={form.destination} onChange={setLocation} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Start Date *</label>
            <input
              type="date"
              className="input"
              required
              value={form.startDate}
              onChange={set("startDate")}
            />
          </div>
          <div>
            <label className="label">End Date *</label>
            <input
              type="date"
              className="input"
              required
              value={form.endDate}
              onChange={set("endDate")}
            />
          </div>
        </div>

        <div>
          <label className="label">Default Currency</label>
          <select className="input" value={form.currency} onChange={set("currency")}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Optional notes about this trip"
            value={form.notes}
            onChange={set("notes")}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
            {saving ? "Saving…" : "Create Trip"}
          </button>
          <Link href="/" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
