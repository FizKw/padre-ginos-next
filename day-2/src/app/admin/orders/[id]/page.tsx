import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import { getOrder } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";

export default async function OrderDetailPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId < 1) notFound();

  const order = await getOrder(orderId);
  if (!order) notFound();

  return (
    <section className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm text-brand hover:underline">
        ← Semua order
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Order #{order.id}</h1>
          <p className="text-ink/60">
            {order.date} · {order.time}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <table className="mt-6 w-full overflow-hidden rounded-xl bg-white text-left text-sm shadow-sm">
        <thead className="bg-stone-50 text-xs uppercase text-ink/60">
          <tr>
            <th className="px-4 py-3">Pizza</th>
            <th className="px-4 py-3">Ukuran</th>
            <th className="px-4 py-3 text-right">Qty</th>
            <th className="px-4 py-3 text-right">Harga</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((line, index) => (
            <tr
              key={`${line.pizzaId}-${line.size}-${index}`}
              className="border-t border-black/5"
            >
              <td className="px-4 py-2 font-medium">
                <Link
                  href={`/admin/products/${line.pizzaId}`}
                  className="text-brand hover:underline"
                >
                  {line.name}
                </Link>
              </td>
              <td className="px-4 py-2">{line.size}</td>
              <td className="px-4 py-2 text-right">{line.quantity}</td>
              <td className="px-4 py-2 text-right">{formatPrice(line.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between text-lg font-bold">
        <span>Total</span>
        <span data-testid="order-total">{formatPrice(order.total)}</span>
      </div>
    </section>
  );
}