import { Suspense } from "react";
import WidgetError from "@/components/admin/WidgetError";
import { getLatestDay, getStatusCounts, getTopPizzas } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/orders";

// Decisions:
// - Hari terakhir: cache it with cacheLife("hours") because the latest
//   business day changes at most once a day and should appear immediately.
// - Status order: stream it inside its own error boundary so a failing status
//   query cannot take down the other widgets and status stays live.
// - Terlaris sepanjang masa: cache it with cacheLife("hours") because the
//   all-time aggregate is expensive and changes slowly.
export default function AdminHome() {
  return (
    <section>
      <h1 className="text-3xl font-black">Overview</h1>
      <p className="mt-1 text-ink/70">Ringkasan operasional Padre Gino&apos;s.</p>

      <div className="mt-6 grid gap-4">
        <Suspense fallback={<WidgetSkeleton title="Hari terakhir" />}>
          <LatestDayWidget />
        </Suspense>

        <WidgetError title="Status order">
          <Suspense fallback={<WidgetSkeleton title="Status order" />}>
            <StatusWidget />
          </Suspense>
        </WidgetError>

        <Suspense fallback={<WidgetSkeleton title="Terlaris sepanjang masa" />}>
          <TopPizzasWidget />
        </Suspense>
      </div>
    </section>
  );
}

function WidgetSkeleton({ title }: { title: string }) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 animate-pulse text-ink/60">Memuat…</p>
    </section>
  );
}

async function LatestDayWidget() {
  const day = await getLatestDay();
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">Hari terakhir</h2>
      <p className="text-sm text-ink/60">{day.date}</p>
      <p className="mt-2 text-3xl font-black">{formatPrice(day.revenue)}</p>
      <p className="text-sm text-ink/60">{day.orders} order</p>
    </section>
  );
}

async function StatusWidget() {
  const counts = await getStatusCounts();
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">Status order</h2>
      <ul className="mt-2 grid grid-cols-5 gap-2 text-center">
        {ORDER_STATUSES.map((status) => (
          <li key={status} className="rounded-lg bg-stone-50 px-2 py-2">
            <span className="block text-xs font-semibold uppercase text-ink/60">
              {STATUS_LABELS[status]}
            </span>
            <span className="text-xl font-black">{counts[status]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function TopPizzasWidget() {
  const topPizzas = await getTopPizzas();
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">Terlaris sepanjang masa</h2>
      <ol className="mt-2 space-y-1">
        {topPizzas.map((pizza, index) => (
          <li
            key={pizza.id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="font-medium">
              {index + 1}. {pizza.name}
            </span>
            <span className="text-ink/60">
              {pizza.sold.toLocaleString("en-US")} terjual ·{" "}
              {formatPrice(pizza.revenue)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}