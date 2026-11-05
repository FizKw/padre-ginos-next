"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getOrderStatus, setOrderStatus, updatePizzaPrices } from "@/lib/admin-data";
import { pizzaExists } from "@/lib/data";
import { shouldFail, simulateLatency } from "@/lib/demo";
import { parsePrice } from "@/lib/format";
import {
  canTransition,
  isOrderStatus,
  STATUS_LABELS,
} from "@/lib/orders";
import type { PizzaSize } from "@/lib/types";

const SIZES: PizzaSize[] = ["S", "M", "L"];

export type PriceFormState = {
  errors: Partial<Record<PizzaSize | "form", string>>;
  // What the user typed, so the form can show it again after an error
  values: Record<PizzaSize, string>;
} | null;

export async function updatePricesAction(
  _prev: PriceFormState,
  formData: FormData,
): Promise<PriceFormState> {
  const id = formData.get("id");
  const values = {
    S: String(formData.get("S") ?? ""),
    M: String(formData.get("M") ?? ""),
    L: String(formData.get("L") ?? ""),
  };

  if (typeof id !== "string" || !(await pizzaExists(id))) {
    return { errors: { form: "Produk tidak dikenal." }, values };
  }

  const errors: NonNullable<PriceFormState>["errors"] = {};
  const prices = { S: 0, M: 0, L: 0 };
  for (const size of SIZES) {
    const price = parsePrice(values[size]);
    if (price === null) {
      errors[size] = "Masukkan angka 0.01–100, maksimal 2 desimal.";
    } else {
      prices[size] = price;
    }
  }
  if (Object.keys(errors).length === 0 && !(prices.S < prices.M && prices.M < prices.L)) {
    errors.form = "Harga harus naik sesuai ukuran: S < M < L.";
  }
  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  await simulateLatency("write");
  if (await shouldFail()) {
    return { errors: { form: "Gagal menyimpan. Coba lagi." }, values };
  }

  await updatePizzaPrices(id, prices);
  // The shop's menu and detail pages are cached with cacheTag("menu"):
  // expire them now so customers see the new price on their next request
  updateTag("menu");
  redirect(`/admin/products?updated=${id}`);
}

export type StatusFormState = { error: string } | null;

export async function updateOrderStatusAction(
  _prev: StatusFormState,
  formData: FormData,
): Promise<StatusFormState> {
  const rawId = formData.get("id");
  const next = formData.get("status");
  const orderId = typeof rawId === "string" ? Number(rawId) : NaN;

  if (!Number.isInteger(orderId) || orderId < 1) {
    return { error: "Order tidak dikenal." };
  }
  if (!isOrderStatus(next)) {
    return { error: "Status tidak dikenal." };
  }

  // The current status comes from the database, not from the form:
  // a button value can be changed in DevTools.
  const current = await getOrderStatus(orderId);
  if (!current) {
    return { error: "Order tidak ditemukan." };
  }
  if (!canTransition(current, next)) {
    return {
      error: `Perubahan dari ${STATUS_LABELS[current]} ke ${STATUS_LABELS[next]} tidak diizinkan.`,
    };
  }

  await simulateLatency("write");
  if (await shouldFail()) {
    return { error: "Gagal menyimpan. Coba lagi." };
  }

  await setOrderStatus(orderId, next);
  // Orders are not cached, so refreshing the current route is enough
  refresh();
  return null;
}