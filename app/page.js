"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥",
  AUD: "A$", CAD: "C$", CHF: "Fr", SGD: "S$", AED: "د.إ",
};

function TripCard({ trip, onDelete }) {
  const sym = CURRENCY_SYMBOLS[trip.currency] || trip.currency;
  const start = new Date(trip.startDate).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const end = new Date(trip.endDate).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-slate-800 text-lg leading-tight">{trip.name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">📍 {trip.destination}</p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-1 rounded-full whitespace-nowrap">
          {trip.currency}
        </span>
      </div>

      <p className="text-xs text-slate-400">
        🗓 {start} → {end}
      </p>

      {trip.notes && (
        <p className="text-sm text-slate-500 italic truncate">{trip.notes}</p>
      )}

      <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100">
        <Link href={`/trips/${trip._id}`} className="btn-primary flex-1 justify-center">
          View Expenses
        </Link>
        <button
          onClick={() => onDelete(trip._id)}
          className="btn-danger"
          title="Delete trip"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrips = async () => {
    try {
      const res = await fetch("/api/trips");
      if (!res.ok) throw new Error("Failed to load trips");
      setTrips(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this trip and all its expenses?")) return;
    await fetch(`/api/trips/${id}`, { method: "DELETE" });
    setTrips((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Trips</h1>
          <p className="text-sm text-slate-500 mt-1">
            {trips.length} trip{trips.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Link href="/trips/new" className="btn-primary">
          + New Trip
        </Link>
      </div>

      {loading && (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      )}

      {error && (
        <div className="card p-4 bg-red-50 border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">🌍</p>
          <p className="font-medium text-slate-700">No trips yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">
            Create your first trip to start tracking expenses.
          </p>
          <Link href="/trips/new" className="btn-primary inline-flex">
            + Create Trip
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map((trip) => (
          <TripCard key={trip._id} trip={trip} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
