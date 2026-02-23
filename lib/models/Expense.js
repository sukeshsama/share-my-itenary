import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "USD" },
    category: {
      type: String,
      enum: [
        "Food & Drink",
        "Transport",
        "Accommodation",
        "Activities",
        "Shopping",
        "Health",
        "Other",
      ],
      default: "Other",
    },
    location: { type: String, trim: true },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Expense ||
  mongoose.model("Expense", ExpenseSchema);
