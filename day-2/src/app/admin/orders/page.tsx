import Form from "next/form";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import { getOrders } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";

function parsePage(value: string | string[] | undefined): number {
  const n = typeof value === "string" ? Number(value) : NaN;
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

function parseDate(value: string | string[] | undefined): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : null;
}

function pageHref(page: number, date: string | null): string {
  const query = new URLSearchParams({ page: String(page) });
  if (date) query.set("date", date);
  return `/admin/orders?${query.toString()}`;
}

export default async function OrdersPage({
  searchParams,
}: PageProps<"/admin/orders">) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const date = parseDate(params.date);
  const { orders, totalPages } = await getOrders({ page, date });

  return (
    <section>
      <h1 className="text-3xl font-black">Order</h1>
      <p className="mt-1 text-ink/70">
        {orders.length} order di halaman ini
        {date ? ` · ${date}` : ` · ${totalPages} halaman`}
      </p>

      <Form action="/admin/orders" className="mt-4 flex items-end gap-2">
        <label className="text-sm font-medium">
          <span className="block text-ink/60">Tanggal</span>
          <input
            type="date"
            name="date"
            defaultValue={date ?? ""}
            className="mt-1 rounded-lg border border-black/10 bg-white px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 font-semibold text-white"
        >
          Filter
        </button>
        {date && (
          <Link href="/admin/orders" className="px-2 py-2 text-sm underline">
            Reset
          </Link>
        )}
      </Form>

      <table className="mt-6 w-full overflow-hidden rounded-xl bg-white text-left text-sm shadow-sm">
        <thead className="bg-stone-50 text-xs uppercase text-ink/60">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Waktu</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Item</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-black/5">
              <td className="px-4 py-2 font-medium">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-brand hover:underline"
                >
                  #{order.id}
                </Link>
              </td>
              <td className="px-4 py-2">
                {order.date} · {order.time}
              </td>
              <td className="px-4 py-2">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-2 text-right">{order.items}</td>
              <td className="px-4 py-2 text-right">{formatPrice(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {orders.length === 0 && (
        <p className="mt-4 text-ink/60">Tidak ada order pada filter ini.</p>
      )}

      <div className="mt-4 flex items-center justify-between text-sm font-semibold">
        {page > 1 ? (
          <Link href={pageHref(page - 1, date)} className="text-brand hover:underline">
            ← Sebelumnya
          </Link>
        ) : (
          <span />
        )}
        <span className="text-ink/60">
          Halaman {page} dari {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={pageHref(page + 1, date)} className="text-brand hover:underline">
            Berikutnya →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </section>
  );
}