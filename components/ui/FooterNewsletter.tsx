"use client";

import { useState } from "react";

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="2.5 7 5.5 10 11.5 4" />
    </svg>
  );
}

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  const isSuccess = status === "success";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2 whitespace-nowrap">
        {isSuccess && (
          <span className="flex items-center justify-center w-5 h-5 rounded border-2 border-black bg-black text-white">
            <CheckIcon />
          </span>
        )}
        <span className="font-body text-base text-black">
          {isSuccess ? "Subscribed!" : "Join the Newsletter"}
        </span>
      </div>

      {!isSuccess && (
        <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 px-3 rounded-md border border-black/15 bg-white text-black text-sm font-body placeholder:text-black/30 outline-none transition-colors focus:border-red w-full sm:w-[240px]"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-10 px-5 rounded-md bg-red text-white text-sm font-semibold font-body border-none cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] active:brightness-90 disabled:opacity-60 whitespace-nowrap"
          >
            {status === "loading" ? "..." : "Sign up"}
          </button>
        </form>
      )}

      {status === "error" && (
        <span className="font-body text-xs text-red">Try again</span>
      )}
    </div>
  );
}
