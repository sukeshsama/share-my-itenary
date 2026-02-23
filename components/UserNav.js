"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (!session) return null;

  const { name, email, image } = session.user;
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email?.[0].toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="flex items-center gap-2">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
        )}
        <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">
          {name || email}
        </span>
      </div>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-xs text-slate-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-slate-100"
      >
        Sign out
      </button>
    </div>
  );
}
