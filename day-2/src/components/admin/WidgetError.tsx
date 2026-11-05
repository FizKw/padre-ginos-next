"use client";

import { catchError, type ErrorInfo } from "next/error";

function WidgetErrorFallback(
  { title }: { title: string },
  { retry }: ErrorInfo,
) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-red-700">Gagal memuat data ini.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
      >
        Coba lagi
      </button>
    </section>
  );
}

export default catchError(WidgetErrorFallback);