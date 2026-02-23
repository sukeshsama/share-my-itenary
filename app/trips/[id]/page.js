"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LocationAutocomplete from "@/components/LocationAutocomplete";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF", "SGD", "AED"];
const CATEGORIES = [
  "Food & Drink", "Transport", "Accommodation",
  "Activities", "Shopping", "Health", "Other",
];
const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥",
  AUD: "A$", CAD: "C$", CHF: "Fr", SGD: "S$", AED: "د.إ",
};
const CATEGORY_ICONS = {
  "Food & Drink": "🍽",
  Transport: "🚌",
  Accommodation: "🏨",
  Activities: "🎭",
  Shopping: "🛍",
  Health: "💊",
  Other: "📌",
};

const EMPTY_FORM = {
  description: "",
  amount: "",
  currency: "USD",
  category: "Other",
  location: "",
  date: new Date().toISOString().split("T")[0],
  notes: "",
};

function SummaryBar({ expenses }) {
  const byCurrency = expenses.reduce((acc, e) => {
    acc[e.currency] = (acc[e.currency] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(byCurrency).map(([cur, total]) => (
        <div key={cur} className="card px-4 py-3 flex flex-col items-center min-w-[100px]">
          <span className="text-xs text-slate-400 font-medium">{cur}</span>
          <span className="text-lg font-bold text-slate-800">
            {CURRENCY_SYMBOLS[cur] || cur}
            {total.toFixed(2)}
          </span>
        </div>
      ))}
      {expenses.length > 0 && (
        <div className="card px-4 py-3 flex flex-col items-center min-w-[100px] bg-blue-50 border-blue-200">
          <span className="text-xs text-blue-500 font-medium">Expenses</span>
          <span className="text-lg font-bold text-blue-700">{expenses.length}</span>
        </div>
      )}
    </div>
  );
}

function ExpenseRow({ expense, onDelete }) {
  const sym = CURRENCY_SYMBOLS[expense.currency] || expense.currency;
  const date = new Date(expense.date).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <span className="text-2xl w-8 text-center shrink-0">
        {CATEGORY_ICONS[expense.category] || "📌"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 truncate">{expense.description}</p>
        <p className="text-xs text-slate-400">
          {expense.category}
          {expense.location ? ` · 📍 ${expense.location}` : ""}
          {" · "}
          {date}
        </p>
      </div>
      <span className="font-semibold text-slate-800 shrink-0">
        {sym}{Number(expense.amount).toFixed(2)}
      </span>
      <button
        onClick={() => onDelete(expense._id)}
        className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [filter, setFilter] = useState("All");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setLocation = useCallback((val) => setForm((f) => ({ ...f, location: val })), []);

  useEffect(() => {
    Promise.all([
      fetch(`/api/trips/${id}`).then((r) => r.json()),
      fetch(`/api/trips/${id}/expenses`).then((r) => r.json()),
    ])
      .then(([t, e]) => {
        setTrip(t);
        setExpenses(e);
        if (t?.currency) setForm((f) => ({ ...f, currency: t.currency }));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/trips/${id}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add expense");
      }
      const newExpense = await res.json();
      setExpenses((prev) => [newExpense, ...prev]);
      setForm((f) => ({ ...EMPTY_FORM, currency: f.currency }));
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (expId) => {
    if (!confirm("Remove this expense?")) return;
    await fetch(`/api/expenses/${expId}`, { method: "DELETE" });
    setExpenses((prev) => prev.filter((e) => e._id !== expId));
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Loading…</div>;
  }

  if (!trip || trip.error) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Trip not found.</p>
        <Link href="/" className="text-blue-600 text-sm mt-2 inline-block">← Back to trips</Link>
      </div>
    );
  }

  const categories = ["All", ...CATEGORIES];
  const filtered = filter === "All" ? expenses : expenses.filter((e) => e.category === filter);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-blue-600">
          ← All Trips
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{trip.name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              📍 {trip.destination} &nbsp;·&nbsp;
              🗓{" "}
              {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" – "}
              {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => { setShowForm((s) => !s); setFormError(null); }}
          >
            {showForm ? "Cancel" : "+ Add Expense"}
          </button>
        </div>
      </div>

      {/* Summary */}
      {expenses.length > 0 && (
        <div className="mb-6">
          <SummaryBar expenses={expenses} />
        </div>
      )}

      {/* Add Expense Form */}
      {showForm && (
        <form onSubmit={handleAddExpense} className="card p-5 mb-6 flex flex-col gap-4">
          <h2 className="font-semibold text-slate-700">Add Expense</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label">Description *</label>
              <input
                className="input"
                required
                placeholder="e.g. Dinner at Sakura"
                value={form.description}
                onChange={set("description")}
              />
            </div>

            <div>
              <label className="label">Amount *</label>
              <input
                type="number"
                className="input"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={set("amount")}
              />
            </div>

            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={set("currency")}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={set("category")}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={set("date")}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Location</label>
              <LocationAutocomplete
                value={form.location}
                onChange={setLocation}
                placeholder="Search city or place…"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <input
                className="input"
                placeholder="Optional note"
                value={form.notes}
                onChange={set("notes")}
              />
            </div>
          </div>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
          )}

          <button type="submit" className="btn-primary justify-center" disabled={saving}>
            {saving ? "Saving…" : "Save Expense"}
          </button>
        </form>
      )}

      {/* Expenses List */}
      <div className="card">
        {/* Category filter tabs */}
        <div className="px-4 pt-4 flex gap-2 flex-wrap border-b border-slate-100 pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                filter === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat !== "All" && CATEGORY_ICONS[cat] ? `${CATEGORY_ICONS[cat]} ` : ""}
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            {expenses.length === 0
              ? "No expenses yet. Add your first one!"
              : "No expenses in this category."}
          </div>
        ) : (
          <div className="px-4">
            {filtered.map((expense) => (
              <ExpenseRow key={expense._id} expense={expense} onDelete={handleDeleteExpense} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
