"use client";

import { useActionState } from "react";
import { updateOrderStatusAction } from "@/app/admin/actions";
import {
  nextStatuses,
  STATUS_LABELS,
  type OrderStatus,
} from "@/lib/orders";

export default function StatusActions({
  orderId,
  status,
}: {
  orderId: number;
  status: OrderStatus;
}) {
  const [state, formAction, isPending] = useActionState(
    updateOrderStatusAction,
    null,
  );
  const next = nextStatuses(status);

  if (next.length === 0) {
    return (
      <p className="mt-4 text-sm text-ink/60">
        Status final, tidak bisa diubah lagi.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <form action={formAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="id" value={orderId} />
        {next.map((nextStatus) => (
          <button
            key={nextStatus}
            type="submit"
            name="status"
            value={nextStatus}
            disabled={isPending}
            className="rounded-lg bg-brand px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {isPending
              ? "Menyimpan…"
              : `Ubah ke ${STATUS_LABELS[nextStatus]}`}
          </button>
        ))}
      </form>
      {state?.error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </div>
  );
}